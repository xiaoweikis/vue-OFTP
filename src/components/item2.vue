<template>
  <div class="analysis">
    <div class="analysis-tools">
       <ButtonGroup vertical>
        
        <Button title="分析结果导出" type="ghost" icon="ios-cloud-download" @click.native="exportResult"></Button>
        <Button title="样本构建表" type="ghost" icon="ios-list" @click.native="factorsSample"></Button>
        <Button type="ghost" title="查看样本详情" icon="ios-search-strong" @click.native="checkSample"></Button>
        <Upload 
        :show-upload-list="false"
        :on-success="upload"
        :data="uploadData"
        :action="this.$host + 'Sample/upload/'"
        >
         <Button type="ghost" icon="ios-cloud-upload" style="border-top:none;border-top-left-radius: 0;border-top-right-radius: 0;"></Button>
        </Upload>
       </ButtonGroup>
         
    </div>
    <div class="analysis-toolshead">
      
        <Button title="因子分析"  type="ghost" icon="connection-bars" @click.native="factorscorrelation">因子分析</Button>
        <Button title="提交因子"  type="ghost" icon="ios-redo" @click.native="factorsCommit">提交因子</Button>
      
    </div>
    <div class="analysis-factor">
      <div class="analysis-factor-table1">
        <span class="spanTitle">因子筛选</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table v-if="table1Show" border :loading="loading" :columns="columns1" :data="data1" width="100%"></Table>
        <div v-if="!table1Show" class="importFactorBox">
          <Button
           v-for="item,index of importFactors"
           :value="item.factor"
           :key="index"
           type="primary"
           @click.native="CheckboxHandle"
          >{{item.factor}}
          </Button>
        </div>
      </div>
      <div class="analysis-factor-table1">
        <span class="spanTitle">预报量[ <strong style="color: red">{{this.predictionMsg}}</strong> ]与各因子相关系数</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border :loading="loading" :columns="columns2" :data="data2" width="100%"></Table>
      </div>
      <div class="analysis-factor-table1">
        <span class="spanTitle">
          <Select 
          v-model="model" size="small" 
          :label-in-value="true" 
          @on-change="stationChoose" 
          style="width:100px"
          
          >
            <Option v-for="item,index in CorrelationStation" :value="item.value" :key="item.value">{{item.label}}</Option>
          </Select>
          各因子相关系数
        </span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border stripe :loading="loading" :columns="columns3" :data="data3" width="100%" ></Table>
      </div>
      <div class="analysis-factor-table1">
        <span class="spanTitle"></span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <div class="echartsContainer">
          <div id="myEcharts" :style="{width:'1333px',height:'450px'}" ref="myEcharts"></div>
        </div>
      </div>
    </div>
    <Modal
        title="因子分析结果"
        v-model="modalShow"
        width="1100"
        okText="关闭"
        cancelText=""
      >
      <pre>
         {{item2UrlData}}
      </pre>
      <!-- <Input 
        type="textarea" 
        v-model="item2UrlData"  
        readonly 
        :autosize="{ minRows: 6.7 }"
       /> -->
      </Modal>
  </div>
</template>
<script type="text/ecmascript-6">
import vueBtn from "@/secondLevel/BUTTON";
import axios from "axios";
import $ from "jquery";
import {
  ButtonGroup,
  Button,
  Table,
  CheckboxGroup,
  Checkbox,
  Message,
  Icon,
  Select,
  Option
} from "iview";
import Echarts from "echarts";

export default {
  name: "analysis",
  data() {
    return {
      columns1: [],
      data1: [],
      columns2: [], //表二
      data2: [], //表二
      columns3: [], //表三
      data3: [], //表三
      chooseFactors: [],
      CorrelationUrl: "", //相关分析结果导出地址
      CorrelationData: [], //相关分析数据
      model: "", //站点选中数据
      station: [], //相关分析站点数据
      myChart: null,
      CorrelationFactors: null, //预报量与因子相关系数
      exportUrl: "", //相关分析结果导出地址
      loading: false,
      RealCheckBoxValue: [],
      nwpCheckBoxValue: [],
      num1: -1, //记录观测因子提交状态
      num2: -1, //记录模式因子提交状态
      table1Show: true, //记录表一的显示状态
      importFactors: [], //记录上传样本的因子
      uploadData: {
        para: JSON.stringify({
          fileNames: ["sample.csv", "sampleEXP.csv"]
        })
      },
      importFactorsData:'',//存储上传数组
      modalShow:false,
      item2UrlData:'',
    };
  },
  components: {
    vueBtn,
    ButtonGroup,
    Button,
    Table,
    CheckboxGroup,
    Checkbox,
    Message,
    Select,
    Option,
    Echarts
  },
  created() {
    //获取接口数据必须在created生命周期函数里面
    //this.factorscorrelation()
    /**
     * 此页面，如果有历史数据，就直接用历史数据
     */
   // 获取历史记录生成表一

    let realfactorTitle = this.$store.state.firstCache.realTitle;
    let nwpfactorTitle = this.$store.state.firstCache.nwpTitle;
    if(realfactorTitle.length || nwpfactorTitle.length){
    this.columns1 = []; 
    this.data1 = [];
      let a = {
        title:'因子名称',
        key:"factorsData",
        align:'center',
        render: (h, params) => {
          if (params.row.name == "观测因子") {
            let a = [];

            realfactorTitle.forEach((item, index) => {
              item.onOff = false;
              a.push(
                h(
                  Button,
                  {
                    props: {
                      type: "dashed",
                      size: "small"
                    },
                    attrs: {
                      dataS: item.value
                    },
                    style: {
                      marginRight: "8px"
                    },
                    on: {
                      click: e => {
                        this.$store.commit("selectReal", item.value);

                        if (e.target.localName == "span") {
                          if (
                            $(e.target)
                              .parent()
                              .hasClass("ivu-btn-warning")
                          ) {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        } else {
                          if ($(e.target).hasClass("ivu-btn-warning")) {
                            $(e.target)
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        }
                      }
                    }
                  },
                  item.name
                )
              );
            });
            return a;
          } else {
            let b = [];
            nwpfactorTitle.forEach((item, index) => {
              b.push(
                h(
                  Button,
                  {
                    props: {
                      type: "dashed",
                      size: "small"
                    },
                    style: {
                      marginRight: "8px"
                    },
                    attrs: {
                      dataS: item.value
                    },
                    on: {
                      click: e => {
                        this.$store.commit("selectNwp", item.value);
                        if (e.target.localName == "span") {
                          if (
                            $(e.target)
                              .parent()
                              .hasClass("ivu-btn-warning")
                          ) {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        } else {
                          if ($(e.target).hasClass("ivu-btn-warning")) {
                            $(e.target)
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        }
                      }
                    }
                  },
                  item.name
                )
              );
            });
            return b;
          }
        }
      }
      this.columns1.push({
        title: "因子类型",
        key: "name",
        width: 320,
        align: "center",
        render: (h, params) => {
          return h("div", [h("span", params.row.name)]);
        }
      },a);
      this.data1.push(
        {
          name: "观测因子"
        },
        {
          name: "模式因子"
        }
      )
    }
    //有历史记录就取vux数据生成表二
     this.data2 = this.$store.state.firstCache.rows2;
     this.columns2 = this.$store.state.firstCache.cols2;
    //有历史记录就取vux数据生成表三
     let table3data = this.$store.state.firstCache.table3data;
     if(table3data){
       this.columns3 = table3data.cols;
       this.data3 = table3data.data;
     }
     this.stationSelect.forEach( item => {
       this.model = item.stationNum
     })
    
     //处理echart数据
     if(JSON.stringify(this.$store.state.firstCache.CorrelationData) != '{}'){
        this.getCorrelationData();
     }
    
     //获取相关分析原返回数据
     this.CorrelationData = this.$store.state.firstCache.Correlations;
     
    
  },
  methods: {
    //开始因子分析
    factorscorrelation() {
      this.loading = !this.loading;
      this.data1 = [];
      this.columns1 = [];
      this.data1.push(
        {
          name: "观测因子"
        },
        {
          name: "模式因子"
        }
      );
      this.columns1.push({
        title: "因子类型",
        key: "name",
        width: 320,
        align: "center",
        render: (h, params) => {
          return h("div", [h("span", params.row.name)]);
        }
      });

      this.chooseFactorsRow();
      this.getCorrelation();
    },
    chooseFactorsRow() {
      let self = this;
      let a = {
        title: "因子名称",
        key: "factorsData",
        align: "center",
        render: (h, params) => {
          let self = this;
          // let real = this.realFactors;
          // let nwp = this.nwpFactors;
          let nwpData = this.$store.state.firstCache.nwpData;
          let realData = this.$store.state.firstCache.realData;
          let realresult = this.$store.state.firstCache.real;
        
          let nwp = [],real = [];
          let factorTile = [];
          let factors = this.factorData;
         
          factors.forEach( item => {
              
              let type = item.split('_')[0];
              if(type === 'nwp'){
                let a = {};
                a.value = item;
                
                let t1 = item.split('_')[1];
                let t2 = item.split('_')[2];
                let t3 = item.split('_')[3];
                let t4 = item.split('_')[4];
                let t5 = item.split('_')[5];
                let t6 = item.split('_')[6];
                //处理日期差
                if(t4 == '-1'){
                  t4 = '前一天'
                }else if(t4 == '-2'){
                  t4 = '前2天'
                }else {
                  t4 = '当天'
                }

                //处理起报时间
                t5 = t5 + '点起报'

                //处理时效
                t6 ='未来'+ t6 +'小时的';

                //处理高度
                if(t3 == '999'){
                  t3 = '';
                }else {
                  t3 = t3 + 'hPa'

                }
                
                //处理要素名称
               
                nwpData.forEach( opt => {
                  opt.list.forEach( rst => {
                    if(rst.element === t2){
                        t2 = rst.text;
                    }
                  })
                })

               a.name = t4 + t5 + t6 +t1 + t3 + t2 ;
              factorTile.push(a)
              nwp.push(a)
              }else {
                let b = {};
                b.value = item;

                let t1 = item.split('_')[1];
                let t2 = item.split('_')[2];
                let t3 = item.split('_')[3];
                let t4 = item.split('_')[4];
                let t5 = item.split('_')[5];
                let t6 = item.split('_')[6];

                //处理高度
                if(t1 == 'SURF'){
                  t3 = '';
                }else {
                  t3 = t3 + 'hPa';
                }
                //处理日期差
                 if(t4 == '-1'){
                  t4 = '前一天'
                }else if(t4 == '-2'){
                  t4 = '前2天'
                }else {
                  t4 = '当天'
                }

                //起报时间
                realresult.forEach( item => {
                  if(item.name === t2){
                    if(item.timeFlag === '整点量'){
                      t5 = t5 + '时的';
                    }else {
                      t5 = ''
                    }
                      
                  }
                })

                //处理要素名称
               
                realData.forEach( opt => {
                  opt.list.forEach( rst => {
                    if(rst.value === t2){
                        t2 = rst.text;
                    }
                  })
                })
                

                b.name = t4 + t5 + t3 + t2 ;
                factorTile.push(b);
                real.push(b); 
              }
          })

          this.$store.commit('factorTitle',factorTile)
          this.$store.commit('realTitle',real)
          this.$store.commit('nwpTitle',nwp)

         
          if (params.row.name == "观测因子") {
            let a = [];

            real.forEach((item, index) => {
              item.onOff = false;
              a.push(
                h(
                  Button,
                  {
                    props: {
                      type: "dashed",
                      size: "small"
                    },
                    attrs: {
                      dataS: item.value
                    },
                    style: {
                      marginRight: "8px"
                    },
                    on: {
                      click: e => {
                        self.$store.commit("selectReal", item.value);

                        if (e.target.localName == "span") {
                          if (
                            $(e.target)
                              .parent()
                              .hasClass("ivu-btn-warning")
                          ) {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        } else {
                          if ($(e.target).hasClass("ivu-btn-warning")) {
                            $(e.target)
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        }
                      }
                    }
                  },
                  item.name
                )
              );
            });
            return a;
          } else {
            let b = [];
            nwp.forEach((item, index) => {
              b.push(
                h(
                  Button,
                  {
                    props: {
                      type: "dashed",
                      size: "small"
                    },
                    style: {
                      marginRight: "8px"
                    },
                    attrs: {
                      dataS: item.value
                    },
                    on: {
                      click: e => {
                        self.$store.commit("selectNwp", item.value);
                        if (e.target.localName == "span") {
                          if (
                            $(e.target)
                              .parent()
                              .hasClass("ivu-btn-warning")
                          ) {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .parent()
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        } else {
                          if ($(e.target).hasClass("ivu-btn-warning")) {
                            $(e.target)
                              .removeClass("ivu-btn-warning")
                              .addClass("ivu-btn-dashed");
                          } else {
                            $(e.target)
                              .removeClass("ivu-btn-dashed")
                              .addClass("ivu-btn-warning");
                          }
                        }
                      }
                    }
                  },
                  item.name
                )
              );
            });
            return b;
          }
        }
      };

      this.columns1.push(a);
    },
    //上传样本因子的点击事件
    CheckboxHandle(e) {
      if (e.target.localName == "span") {
        if (
          $(e.target)
            .parent()
            .hasClass("ivu-btn-warning")
        ) {
          $(e.target)
            .parent()
            .removeClass("ivu-btn-warning")
            .addClass("ivu-btn-primary");
        } else {
          $(e.target)
            .parent()
            .removeClass("ivu-btn-primary")
            .addClass("ivu-btn-warning");
        }
      } else {
        if ($(e.target).hasClass("ivu-btn-warning")) {
          $(e.target)
            .removeClass("ivu-btn-warning")
            .addClass("ivu-btn-primary");
        } else {
          $(e.target)
            .removeClass("ivu-btn-primary")
            .addClass("ivu-btn-warning");
        }
      }
    },
    //提交需要预测的因子
    factorsCommit() {
      let value = [];
      let text = [];
      let button = $(".analysis-factor-table1").find("button.ivu-btn-warning");
      for (let i = 0; i < button.length; i++) {
        if ($(button[i]).attr("dataS")) {
          value.push($(button[i]).attr("dataS"));
        } else {
          value.push($.trim($(button[i]).text()));
        }
        text.push($.trim($(button[i]).text()))
      }

      if (!value.length) {
        Message.warning({
          content: "请先选择因子",
          duration: 3,
          closable: true
        });
        return;
      }
      this.$store.commit('factorScreen',text);
      let a = {
        factors: value
      };
      $.post(this.$host + "Sample/selectFactor", { para: JSON.stringify(a) })
        .done(data => {
          if (data && data !== "") {
            Message.success({
              content: "success for commit",
              duration: 8,
              closable: true
            });
            this.$store.commit("commitFactors", true);
          } else {
            Message.error({
              content: "fail commit",
              duration: 8,
              closable: true
            });
          }
        })
        .fail(error => {
          Message.error({
            content: "fail commit for" + error,
            duration: 8,
            closable: true
          });
        });
    },
    //获取相关分析接口数据
    getCorrelation(data) {
      let self = this;
      axios
        .post(this.$host + "Analysis/correlation")
        .then(response => {
          this.CorrelationUrl =
            "http://101.200.12.178:8090" + response.data.url;
          self.$store.commit('item2Url',self.CorrelationUrl)
          self.CorrelationData = response.data.result;
          self.$store.commit('Correlations',self.CorrelationData)
          self.loading = !self.loading;
          
          if (data) {
            self.table1Show = false;

            let re = data.split("\n");

            let re0 = re[0].split(",").splice(2);

            let factor = re0.splice(1); //获取因子

            factor.forEach(item => {
              let a = {};
              a.factor = item;
              a.factorValue = item;
              self.importFactors.push(a);
            });
            self.initTableTwo(data);
            self.initTableThree(data);
            self.$store.commit("importFactors", self.importFactors);
            self.getCorrelationData();
            self.initEchart();
          }else {
            self.initTableTwo();
            self.initTableThree();
          }
        })
        .catch(error => {
          Message.error({
            content: "获取相关分析数据失败" + error,
            duration: 20,
            closable: true
          });
        });
    },
    //相关分析结果导出
    exportResult() {
      if (this.item2Url !== "") {
        let url = this.item2Url;
        this.$local.funDownload(url, "因子分析结果.txt");
      } else {
        Message.warning({
          content: "nothing data",
          duration: 8,
          closable: true
        });
      }
    },
    checkSample(){
      let self = this;
      if (this.item2Url !== "") {
           $.ajax({
          type: "POST",
          url: this.item2Url,
          beforeSend: function(xhr) {
            //beforeSend定义全局变量
            xhr.overrideMimeType("text/plain;charset=gb18030");
          },
          success: function(data) {
            if(data){
              self.item2UrlData = data;
              self.modalShow = true;
            }
          }
      });
      } else {
        Message.warning({
          content: "nothing data",
          duration: 8,
          closable: true
        });
      }
    },
    //渲染表格二
    initTableTwo(rs) {
      let factors = [],
        station = [];
      let self = this;
      let title = [];
      if (rs) {
        //rs 为上传数据

        let re = rs.split("\n");

        let re0 = re[0].split(",").splice(2);

        let predictand = re0[0]; //获取预报量

        //预报量信息存入vux
        let b = {
          value: predictand,
          caption: predictand
        };
        self.$store.commit("prediction", b);
        let factor = re0.splice(1); //获取因子
       
        factor.forEach(item => {
          let a = {};
          a.factor = item;
          a.factorValue = item;
          title.push(a);
        });
        //获取上传 样本的站点
        let stationArr = [];
        let factore = re.splice(1, re.length - 2);
      
        factore.forEach(opt => {
          stationArr.push(opt.split(",").shift());
        });

        let newStationArr = new Set(stationArr);
        stationArr = [...newStationArr];
        self.$store.commit('chooseStation',stationArr)
        stationArr.forEach(opts => {
          let a = {};
          a.stationName = opts;
          a.stationNum = opts;
          station.push(a);
        });
      } else {
        factors = this.factors;
        station = this.stationSelect;
        title = this.$store.state.firstCache.factorTitle;
      }
      
      let data = this.CorrelationData;
      
      let a = [
        {
          title: "站号",
          key: "stationNum",
          align: "center",
          fixed: "left",
          width: 100
        },
        {
          title: "站名",
          key: "stationName",
          align: "center",
          fixed: "left",
          width: 100
        }
      ];
      let c = [];
      
      title.forEach((item, index) => {
        let b = {};
        if(item.name){
          b.title = item.name;
        }else {
          b.title = item.factor;
        }
          b.key = "item" + index;
          b.align = "center";
          b.minWidth = 120;
        a.push(b);
      });
       this.station = [];
      station.forEach((item, index) => {
        for (var key in data) {
          if (Number(key) == item.stationNum && data[key].length) {
            let a = {
              stationName: $.trim(item.stationName),
              stationNum: item.stationNum
            };
            let u = {
              label: $.trim(item.stationName),
              value: item.stationNum
            };
            //有数据的站点
           
            this.station.push(u);
            //默认选中站点
            this.model = item.stationNum;
            title.forEach((option, val) => {
              a["item" + val] = data[key][val + 1].toFixed(2);
            });
            c.push(a);
          }
        }
      });
      this.columns2 = a;
      this.data2 = c;
      this.$store.commit('CorrelationStation',this.station)
      this.$store.commit("CorrelationData", c);
      this.getCorrelationData();
      this.initEchart();
    },
    //渲染表格三
    initTableThree(rs) {
      let factors = [],
        station = [];
      let data = this.CorrelationData;
      let model = this.model;
      let self = this;
      let chooseValue = [];
      let title = [];
      if (rs) {
        //rs 为上传数据
        let re = rs.split("\n");

        let re0 = re[0].split(",").splice(2);

        let predictand = re0[0]; //获取预报量

        let factor = re0.splice(1); //获取因子

        factor.forEach(item => {
          let a = {};
          a.factor = item;
          a.factorValue = item;
          factors.push(a);
        });
        title = factors;
      } else {
        factors = this.factors;
        title = this.$store.state.firstCache.factorTitle;
      }

      for (var key in data) {
        if (key == model) {
          chooseValue = data[key];
        }
      }
      let a = [
        {
          title: "",
          key: "factor",
          align: "center",
          width: 120,
          fixed: "left"
        },
        {
          title: this.predictionMsg,
          key: "item0",
          align: "center",
          width: 120
        }
      ];
      let c = [
        {
          factor: this.predictionMsg
        }
      ];
     
      title.forEach((item, index) => {
       
        let b = {},y={};
        if(item.name){
          b.title = item.name;
          y.factor = item.name;
        }else {
          b.title = item.factor;
          y.factor = item.factor;
        }
        b.key = "item" + (index + 1);
        b.align = "center";
        b.minWidth = 200;
        a.push(b);
        c.push(y);
      });
      let len = Math.sqrt(chooseValue.length);

      let newChooseValue = [];
      for (let i = 0; i < len; i++) {
        let start = i * len;
        let end = start + len;
        newChooseValue.push(chooseValue.slice(start, end));
      }
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
          c[i]["item" + j] = newChooseValue[i][j].toFixed(2);
        }
      }
      this.columns3 = a;
      this.data3 = c;
    },
    //站点选择事件
    stationChoose(a) {
      if(this.importFactorsData.length){
          this.initTableThree(this.importFactorsData);
      }else {
         this.initTableThree();
      }
      
      //站点改变、手动重新获取数据
      this.getCorrelationData();
      this.myChart.setOption(this.chartsOption(), true);
    },
    //处理echart数据的方法，必须在站点有值之后
    getCorrelationData() {
      let data = this.$store.state.firstCache.CorrelationData;
      let model = this.model;
      let factors = this.$store.state.firstCache.factorTitle;
      let importFactors = this.$store.state.firstCache.importFactors;
      let t = [];
      if(importFactors.length){
        t = importFactors;
      }else {
        t = factors;
      }
      let cache = {
        chooseStationCorrelationValue: [],
        chooseStationCorrelationText: []
      };
      data.forEach(item => {
        if (item.stationNum == Number(model)) {
          for (var key in item) {
            if (key.search("item") !== -1) {
              if (item[key] === "-9999.00") {
                cache.chooseStationCorrelationValue.push(0);
              } else {
                cache.chooseStationCorrelationValue.push(item[key]);
              }
            }
          }
        }
      });
    
      t.forEach(item => {
        if(item.factor){
          cache.chooseStationCorrelationText.push(item.factor);
        }else {
          cache.chooseStationCorrelationText.push(item.name);
        }
        
      });
      this.correlationFactors = cache;
      
    },
    //获取因子与预报量相关系数
    chartsOption() {
    
      let option = {
        title: {
          text: this.predictionMsg + "与各因子相关系数",
          textStyle: {
            color: "#fff"
          }
        },
        color: ["#3398DB"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ["相关分析系数"],
          textStyle: {
            color: "#fff"
          }
        },
        toolbox: {
          show: true,
          // orient: 'vertical',
          left: "right",
          top: "top",
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            data: this.correlationFactors.chooseStationCorrelationText,
            axisTick: {
              alignWithLabel: true
            },
            axisLabel: {
              show: true,
              interval: 0,
              rotate: 30,
              textStyle: {
                color: "#fff"
              }
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: {
              formatter: "{value}",
              textStyle: {
                color: "#fff"
              }
            }
          }
        ],
        series: [
          {
            name: "相关分析系数",
            type: "bar",
            barWidth: "60%",
            data: this.correlationFactors.chooseStationCorrelationValue
          }
        ]
      };

      return option;
    },
    //初始化图表
    initEchart() {
      let dom = this.$refs.myEcharts;
      this.myChart = Echarts.init(dom);
      this.myChart.setOption(this.chartsOption(), true);
    },
    //显示数据构建样本
    factorsSample() {
      let sample = this.$store.state.firstCache.sample;
      let importFactors = this.$store.state.firstCache.importFactors;
      if (importFactors.length) {
        sample.forEach(item => {
          if (item.name === "选择的因子") {
            let a = "";
            importFactors.forEach(opt => {
              a += opt.factor + ",";
            });
            item.information = a;
          }
        });
      }

      this.$store.commit("modelIsShow", true);
    },
    //上传文件
    upload(response, file, fileList) {
      let self = this;
      $.ajax({
        type: "POST",
        url: "http://101.200.12.178:8090" + response,
        beforeSend: function(xhr) {
          //beforeSend定义全局变量
          xhr.overrideMimeType("text/plain;charset=gb18030");
        },
        success: function(data) {
          if (data) {
            self.loading = !self.loading;
            self.$Notice.success({
              title: "上传成功"
              // desc: nodesc ? '' : 'Here is the notification description. Here is the notification description. '
            });
            self.getCorrelation(data);
            self.importFactorsData = data;
            
          }
        }
      });
    }
  },
  computed: {
    //获取选择的因子
    factors() {
      return this.$store.state.firstCache.chooseFactors;
    },
    //获取因子抽取返回的数据
    factorData(){
      return this.$store.state.firstCache.alias
    },
    //获取相关分析数据
    item2Url(){
      return this.$store.state.firstCache.item2Url;
    },
    realFactors() {
      let factors = this.factors;
      let realFactors = [];

      factors.forEach(item => {
        if (item.model == "real") {
          let a = {
            name: item.factor,
            value: item.factorValue
          };
          realFactors.push(a);
        }
      });
      return realFactors;
    },
    nwpFactors() {
      let factors = this.factors;
      let nwpFactors = [];
      factors.forEach(item => {
        if (item.model == "nwp") {
          if (item.level !== "地面") {
            let arr = item.factorValue.split("_");
            arr.pop();
            let a = {
              name: item.factor + "(" + item.level + ")",
              value: arr.join("_") + "_" + item.levelValue
            };
            nwpFactors.push(a);
          } else {
            let a = {
              name: item.factor,
              value: item.factorValue
            };
            nwpFactors.push(a);
          }
        }
      });
      return nwpFactors;
    },
    //初始化选择的因子
    selectReal() {
      return this.$store.state.firstCache.selectReal;
    },
    //初始化选择因子
    selectNwp() {
      return this.$store.state.firstCache.selectNwp;
    },
    //获取vueX的站点选择信息
    stationSelect() {
      return this.$store.state.firstCache.chooseStation;
    },
    //获取预报量
    predictionMsg() {
      return this.$store.state.firstCache.predictionMsg.caption;
    },
    //获取相关分析站点数据
    CorrelationStation(){
      return this.$store.state.firstCache.CorrelationStation;
    }
  },
  beforeDestroy() {
    //提交表二数据
    this.$store.commit("table2data", { a: this.columns2, b: this.data2 });
    this.$store.commit("table3data", { cols: this.columns3, data: this.data3 });
  },
  mounted() {
    if(JSON.stringify(this.$store.state.firstCache.CorrelationData) != '{}'){
        this.initEchart()
     }
     
  }
};
</script>
<style>
.analysis-tools {
  /* height: 80px;
  line-height: 80px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2); */
    position: absolute;
    right: -54px;
}
.analysis-toolshead {
   height: 80px;
  line-height: 80px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
}
.analysis-toolshead button {
  width: 120px;
  font-size: 16px;
  color: white;
}
.analysis-factor .spanTitle {
  font-size: 16px;
  background: rgb(53, 53, 53);
  height: 37px;
  display: block;
  color: white;
  line-height: 36px;
  padding-left: 12px;
  margin-top: 10px;
  text-align: left;
}
.analysis-tools button {
  font-size: 15px;
  color: #ffffff;
}

.analysis-factor {
  padding: 0px 5px 0 5px;
}

.ivu-table-header .center {
  text-align: center;
}

.analysis-tools .ivu-upload {
  display: inline-block;
}
.importFactorBox button {
  margin: 10px;
}
.ivu-table-cell {
  padding: 5px;
}
.ivu-table-cell button {
  margin-top: 5px;
}

</style>
