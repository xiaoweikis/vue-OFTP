<template>
  <div class="rightContent-body">
    <div class="rightContent-body-header">
      <ButtonGroup size="large" vertical>
        <Button type="ghost" title="新建实验" icon="ios-refresh" @click.native="test"></Button>
        <Button type="ghost" title="样本构建表" icon="ios-paper" @click.native="factorsSample"></Button>
        <Button type="ghost" title="下载样本(不含无效值)" icon="ios-cloud-download" @click.native="exportSample('no')"></Button>
        <Button type="ghost" title="下载样本(含无效值)" icon="android-download" @click.native="exportSample('yes')"></Button>
        <Button type="ghost" title="查看样本详情" icon="ios-search-strong" @click.native="checkSample"></Button>
       </ButtonGroup>
    </div>
    <div class="rightContent-body-content" style="position: relative">
        <article class="contente_type">
            <span class="title" style="position:relative;top:2px;">类型：</span>
              <Button 
              size="small" 
              v-for="item,index of item1Data.rightHtmlData.type.list" 
              :type="item1Data.rightHtmlData.type.index === index ? 'info' : 'text'" 
              @click.native="typeHandle(index,item)"
              :value="item.value" 
              :key="index"
              >
              {{item.text}}</Button>
        </article>
        
        <article class="contente_moshi">
            <span class="title" style="position:relative;top:2px;">模式：</span>
            <Button
              size="small" 
              v-for="item,index of item1Data.rightHtmlData.schema.list" 
              :value="item.value" 
              :key="index"
              :disabled="item.disabled"
              :type="item1Data.rightHtmlData.schema.index === index? 'info' : 'text'"
              @click.native="schemaHandle(index,item)"
              >
              {{item.text}}
            </Button>
        </article>

        <article class="contente_yinzi">
            <span class="title" style="display:inline-block">因子：</span>
            <div class="contente_yinzi_inlineContainer">
              <div class="inline_box" v-for="item,index of factorHtml">
                <span v-show="item.text" class="Stitle">({{item.text}}):</span>
                 <div class="btn-group">
                   <Button 
                   size="small" 
                   v-for="option,listindex of item.list"
                   :value="option.value"
                   :key="option.text"
                   :class="option.weight === '时段量'? 'bold' : ''"
                   :type="option.active ? 'info' : 'text'"
                   @click.native="factorHandle(item,listindex,option)"
                   >
                   {{option.text}}
                   </Button>
                 </div>
              </div>
          </div>
        </article>

        <article class="contente_cengci">
            <span class="title">层次：</span>
            <Button 
            size="small"
            v-for="item,index of item1Data.rightHtmlData.level.list"
            :value="item.value"
            :key="index"
            :type="item1Data.rightHtmlData.level.index === index?'info':'text'"
            :disabled="item.disabled"
            @click.native="lelevHandle(index,item)"
            >
            {{item.text}}
            </Button>
        </article>
      
        <article class="contente_cengci">
            <span class="title">日期差：</span>
            <Button 
            size="small"
            v-for="item,index of item1Data.rightHtmlData.datePoor.list"
            :value="item.value"
            :key="index"
            :type="item1Data.rightHtmlData.datePoor.index === index?'info':'text'"
            @click.native="datePoorHandle(index,item)"
            >
            {{item.text}}
            </Button>
        </article>

          
        <article class="contente_shici">  
            <span class="title">时次：</span>
            <div class="btn-group">
              <Button 
                size="small"
                v-for="item,index of item1Data.rightHtmlData.whenTime.list"
                :value="item.value"
                :key="index"
                :type="item1Data.rightHtmlData.whenTime.index === index ? 'info':'text'"
                @click.native="whenTimeHandle(index,item)"
                :disabled="item.disabled"
                >
                {{item.text}}
              </Button>
            </div>
        </article>

        <article class="contente_shicha">
            <span class="title">时效：</span>
            <Button 
            size="small"
            v-for="item,index of item1Data.rightHtmlData.jetLag.list"
            :value="item.value"
            :key="index"
            :type="item1Data.rightHtmlData.jetLag.index === index ? 'info' :'text'"
            :disabled="item.disabled"
            @click.native="jetLagHandle(index,item)"
            >
           
            {{item.text}}
            </Button>
        </article>  
        <Button @click.native="addFactorTable" size="small" long type="info" style="margin-top:5px;">
         <Icon type="android-add"></Icon>
          添加因子
        </Button>

        <div class="tableBox"  v-if="Table1.length" >
          <h4 style="text-align:center;font-weight:bold">观测因子列表</h4>
           <Table stripe border :columns="columns1" :data="Table1"></Table>
        </div>
        <div class="tableBox"  v-if="Table2.length" >
          <h4 style="text-align:center;font-weight:bold">模式因子列表</h4>
           <Table stripe border :columns="columns2"  :data="Table2"></Table>
        </div>
      </div>
      <!-- <Progress :percent="25"></Progress> -->
      <Modal
        title="样本详情"
        v-model="modalShow"
        width="1200"
        ok-text="关闭"
        cancel-text=""
      >
     <Table stripe border :columns="makeUpDataclos"  :data="makeUpDatarows"></Table>
      </Modal>
    </div>


</template>
<script type="text/ecmascript-6">
import vueBtn from "@/secondLevel/BUTTON";
import axios from "axios";
import {
  Table,
  RadioGroup,
  Radio,
  Icon,
  Button,
  Spin,
  Alert,
  Message,
  Modal,
  ButtonGroup,
  Checkbox,
  CheckboxGroup
} from "iview";
import "iview/dist/styles/iview.css";
import $ from "jquery";

export default {
  data() {
    return {
      loading: false, //表单Loading
      modalShow: false, //因子抽取页面loading
      isChecked: true,
      modal2: false, //建模样本模态框
      columns1: [
        {
          title: "序号",
          type: "index",
          width: 90,
          align: "center"
        },
        {
          title: "因子",
          align: "center",
          key: "factor"
        },
        {
          title: "层次",
          align: "center",
          key: "level"
        },
        {
          title: "日期差",
          align: "center",
          key: "datePoor"
        },
        {
          title: "时次",
          align: "center",
          key: "whenTime"
        },
        {
          title: "操作",
          align: "center",
          key: "handle",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "0px"
                  },
                  on: {
                    click: () => {
                      this.remove1(params.index, params);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ], //实况因子
      columns2: [
        {
          title: "序号",
          type: "index",
          width: 90,
          align: "center"
        },
        {
          title: "因子",
          align: "center",
          key: "factor"
        },
        {
          title: "模式",
          align: "center",
          key: "type"
        },
        {
          title: "层次",
          align: "center",
          key: "level"
        },
        {
          title: "日期差",
          align: "center",
          key: "datePoor"
        },
        {
          title: "起报时间",
          align: "center",
          key: "newspaperTime"
        },
        {
          title: "时效",
          align: "center",
          key: "jetLag"
        },
        {
          title: "操作",
          align: "center",
          key: "handle",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "0px"
                  },
                  on: {
                    click: () => {
                      this.remove2(params.index, params);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ], //模式因子
      Table2: [],
      Table1: [],
      data1: {
        type: "real",
        factor: {
          name: "平均气温",
          value: "AvgTEM"
        },
        level: {
          name: "地面",
          value: "地面"
        },
        whenTime: {
          name: "/",
          value: "0"
        },
        datePoor: {
          name: "-1天",
          value: "-1"
        }
      }, //实况因子
      data2: {
        type: "nwp",
        factor: {
          name: "2米露点温度",
          value: "ec_2d_999"
        },
        schema: {
          name: "ECMWF",
          value: "ec"
        },
        level: {
          name: "地面",
          value: "地面"
        },
        whenTime: {
          name: "08",
          value: "8"
        },
        datePoor: {
          name: "-1天",
          value: "-1"
        },
        jetLag: {
          name: "6H",
          value: "6"
        }
      }, //模式因子
      columns3: [
        {
          title: "条件名称",
          key: "name",
          width: 140
        },
        {
          title: "选择信息",
          key: "information"
        }
      ], //样本构建表
      data3: [], //样本构建表
      text: [], //选中因子数据,
      exportUrl: "", //含无效值样本导出地址
      exportUrl1: "",//不含无效值的样本导出地址
      hourSpan: "",
      guanceyinzi: [], //选中的观测因子数据
      item1Data: {
        //因子抽取页面数据配置，需请求后台的数据需初始化数据
        rightHtmlData: {
          //类型数据配置
          type: {
            index: 1,
            list: [
              {
                text: "观测因子",
                value: "real"
              },
              {
                text: "模式因子",
                value: "nwp"
              }
            ]
          },
          //模式数据配置
          schema: {
            index: 0,
            list: []
          },

          //层次配置数据
          level: {
            index: 0,
            list: [
              {
                text: "地面",
                value: "地面",
                disabled: false
              },
              {
                text: "1000hPa",
                value: "1000",
                disabled: true
              },
              {
                text: "925hPa",
                value: "925",
                disabled: true
              },
              {
                text: "850hPa",
                value: "850",
                disabled: true
              },
              {
                text: "700hPa",
                value: "700",
                disabled: true
              },
              {
                text: "600hPa",
                value: "600",
                disabled: true
              },
              {
                text: "500hPa",
                value: "500",
                disabled: true
              },
              {
                text: "400hPa",
                value: "400",
                disabled: true
              },
              {
                text: "300hPa",
                value: "300",
                disabled: true
              },
              {
                text: "200hPa",
                value: "200",
                disabled: true
              },
              {
                text: "100hPa",
                value: "100",
                disabled: true
              }
            ]
          },
          //时次配置数据
          whenTime: {
            index: 0,
            list: [
              {
                text: "08",
                value: "08",
                disabled: false
              },
              {
                text: "20",
                value: "20",
                disabled: false
              }
            ]
          },
          //时差
          jetLag: {
            index: 2,
            list:[]
          },
          //日期差
          datePoor: {
            index: 1,
            list: [
              {
                text: "0天",
                value: "0"
              },
              {
                text: "-1天",
                value: "-1"
              },
              {
                text: "-2天",
                value: "-2"
              },
              {
                text: "-3天",
                value: "-3"
              },
              {
                text: "-4天",
                value: "-4"
              },
              {
                text: "-5天",
                value: "-5"
              }
            ]
          }
        }
      },
      //模式因子ec数据配置
      nwpfactor: [],
      //模式因子grapes数据配置
      nwpbabjfactor: [],
      //模式因子wrf数据配置
      nwpwrffactor: [],
       //模式因子bcgz数据配置
      nwpbcgzfactor: [],
      //观测因子数据配置
      realfactor: [],
      //切换类型使用因子数据
      factorHtml: [],
      //切换模式使用的时次数据
      whenTimeHtml: [],
      //面板初始化因子数据
      initFactor: "模式因子",
      //记录所选因子
      chooseFactors: [],
      //存储数据请求后的模式因子
      nwp: [],
      //存储数据请求后的观测因子
      real: [],
      //记录层次的点击数字,
      levelNum: 0,
      //记录样本抽取的值
      item1UrlData: "",
      //切换模式使用的数据模板
      typeHtml: [],
      //计算选择因子的位置
      chooseFactorsnums:[]
    };
  },
  components: {
    vueBtn,
    Table,
    RadioGroup,
    Radio,
    Icon,
    Button,
    Spin,
    Alert,
    Message,
    Modal,
    ButtonGroup,
    Checkbox,
    CheckboxGroup
  },
  created() {
    const self = this;
    function Http1() {
      return axios.post(self.$host + "Sample/getSampleInfoNWP");
    }
    function Http2() {
      return axios.post(self.$host + "Sample/getSampleInfoReal");
    }

    axios.all([Http1(), Http2()]).then(
      axios.spread((a, b) => {
        this.real = b.data;
        this.nwp = a.data;
        this.disposeData();
        this.$store.commit("realCommit", this.real);
        this.$store.commit("nwpCommit", this.nwp);
        /**
         * 处理数据的模式种类
         */
        let schemaList = [];
        let type = [];
        this.nwp.forEach( item => {
          type.push(item.nwpType)
        })
        //去重
        type = Array.from(new Set(type));
        //初始化序列
        type.forEach( item => {
          let a = {}
          let b = {};
          b.model = item;
          this.chooseFactorsnums.push(b)
          a.value = item;
          a.disabled = false;
          for( let i = 0 ; i < this.nwp.length; i++){
            if(this.nwp[i].nwpType === item){
              if(a.text) continue
              a.text = this.nwp[i].nwpAlias;
              a.activeNum = i;
              
            }
          }
          schemaList.push(a)
        })
      
       this.item1Data.rightHtmlData.schema.list = schemaList;
       let jetLag = this.nwp[0].hourSpanList.split(',');
      
       this.item1Data.rightHtmlData.jetLag.list = this.hourSpanList(jetLag);
       console.log(this.item1Data.rightHtmlData.jetLag.list)
      })
    );

    this.chooseFactors = this.getFactors;

    if (this.chooseFactors.length) {
      this.chooseFactors.forEach(item => {
        if (item.model === "nwp") {
          this.Table2.push(item);
        } else {
          this.Table1.push(item);
        }
      });
    }
  },
  methods: {
    //表格删除
    remove1(index, opt) {
      this.Table1.splice(index, 1);
      //同时删除选择因子数据
      this.chooseFactors.forEach((item, i) => {
        if (
          item.factor === opt.row.factor &&
          item.levelValue === opt.row.levelValue &&
          item.jetLagValue === opt.row.jetLagValue &&
          item.typeValue === opt.row.typeValue
        ) {
          this.chooseFactors.splice(i, 1);
          this.$store.commit("factors", this.chooseFactors);
        }
      });
    },
    remove2(index, opt) {
      this.Table2.splice(index, 1);
      //同时删除选择因子数据
      this.chooseFactors.forEach((item, i) => {
        if (
          item.factor === opt.row.factor &&
          item.levelValue === opt.row.levelValue &&
          item.jetLagValue === opt.row.jetLagValue &&
          item.typeValue === opt.row.typeValue
        ) {
          this.chooseFactors.splice(i, 1);

          this.$store.commit("factors", this.chooseFactors);
        }
      });
    },
    //初始化处理数据模型
    disposeData(re, nw) {
      //处理观测因子
      let real1 = {
        text: "地面因子",
        index: 0,
        list: []
      };
      let real2 = {
        text: "高空因子",
        index: 0,
        list: []
      };

      this.real.forEach((item, index) => {
        if (item.type === "SURF") {
          let b = {};
          b.text = item.caption;
          b.value = item.name;
          b.weight = item.timeFlag;
          b.height = item.height;
          b.hourSpan = item.hourSpan;

          if (index === 0) {
            b.active = true;
          } else {
            b.active = false;
          }
          real1.list.push(b);
        } else {
          let b = {};
          b.text = item.caption;
          b.value = item.name;
          b.weight = item.timeFlag;
          b.height = item.height;
          b.hourSpan = item.hourSpan;
          b.active = false;

          real1.list.push(b);
        }
      });
      this.realfactor.push(real1, real2);
      this.$store.commit("realData", this.realfactor);
     //处理模式因子
      this.makeFactorData('ec',0)
    },
    //因子类型选择事件
    typeHandle(index, opt) {
    
      //设置选中状态
      this.item1Data.rightHtmlData.type.index = index;

      this.initFactor = opt.text;

      //设置因子类型的因子面板数据
      if (index) {
        let type = this.$store.state.firstCache.type;
        if (type.value === "ec") {
          this.factorHtml = this.nwpfactor;
        } else {
          if (type.value === "babj") {
            this.factorHtml = this.nwpbabjfactor;
          } else {
            this.factorHtml = this.nwpwrffactor;
          }
        }

        this.nwpfactor.forEach(item => {
          item.list.forEach((op, opindex) => {
            if (op.active) {
              //查找选中因子的高度 设置高度可选项

              if (op.type == "SURF" || op.height == 999) {
                this.item1Data.rightHtmlData.level.list.forEach(
                  (item, index) => {
                    if (index) {
                      item.disabled = true;
                    } else {
                      item.disabled = false;
                    }
                  }
                );
                this.item1Data.rightHtmlData.level.index = 0;
              } else {
                this.item1Data.rightHtmlData.level.list.forEach(
                  (item, index) => {
                    if (index) {
                      item.disabled = false;
                    } else {
                      item.disabled = true;
                    }
                  }
                );

                this.item1Data.rightHtmlData.level.index = this.levelNum;
              }
            }
          });
        });
        //设置模式因子类型  模式改变可选状态
        this.item1Data.rightHtmlData.schema.list.forEach(item => {
          item.disabled = false;
        });

        //设置时差为可选状态
        this.item1Data.rightHtmlData.jetLag.list.forEach(item => {
          item.disabled = false;
        });

        //切换模式设置时次

        let a = [
          {
            text: "08",
            value: "08",
            disabled: false
          },
          {
            text: "20",
            value: "20",
            disabled: false
          }
        ];
        this.item1Data.rightHtmlData.whenTime.list = a;
       
        if(this.data2.whenTime.name == '08'){
          this.item1Data.rightHtmlData.whenTime.index = 0;
        }else{
          this.item1Data.rightHtmlData.whenTime.index = 1;
        }
        
      } else {
        this.factorHtml = this.realfactor;

        //设置观测因子类型 模式改变为不可选状态
        this.item1Data.rightHtmlData.schema.list.forEach(item => {
          item.disabled = true;
        });
       
        //切换模式设置时次
        this.item1Data.rightHtmlData.whenTime.list = this.whenTimeMd;
        this.item1Data.rightHtmlData.whenTime.index = 1;
        this.data1.whenTime.name = '01时';
        this.data1.whenTime.value = '01'

        //切换模式的时候找选中的因子 如果高度为999 默认层次为地面
        this.realfactor.forEach(item => {
          item.list.forEach((op, opindex) => {
            if (op.active && op.weight === "时段量") {
              this.item1Data.rightHtmlData.whenTime.list.forEach(p => {
                p.disabled = true;
              });
               this.data1.whenTime.name = '/';
               this.data1.whenTime.value = '0'
            }
          });
        });

        //设置时差为不可选状态
        this.item1Data.rightHtmlData.jetLag.list.forEach(item => {
          item.disabled = true;
        });

        //设置层次为不可选状态
        this.item1Data.rightHtmlData.level.list.forEach((item, index) => {
          if (index) {
            item.disabled = true;
          } else {
            item.disabled = false;
            this.item1Data.rightHtmlData.level.index = 0;
          }
        });
      }
    },
    //返回初始化时效
    hourSpanList(hourSpan){
       var hours = [];
       var h = 0;
       hourSpan.forEach( item => {
         if(item !=''){
           let g = {};
          (g.text = item + "H"), (g.value = item), (g.disabled = false);
          hours.push(g);
         }
         
       })
       
        return hours
    },
    //因子选择事件
    factorHandle(a, b, c) {
      this.chooseFactorsnums.forEach( option => {
        if(option.model === c.model){
          option.type = c.type;
          option.text = c.text;
        }
      })
      a.index = b;
      let height = c.height;
      let hourSpan = [];
      if(c.hourSpanList){
        hourSpan = c.hourSpanList.split(',');
      }
      let type = c.type;

      //记录选择值
      if (this.initFactor == "模式因子") {
        this.data2.factor.name = c.text;
        this.data2.factor.value = c.value;
        this.item1Data.rightHtmlData.jetLag.list = this.hourSpanList(hourSpan);
        this.item1Data.rightHtmlData.jetLag.list.forEach((item,index) => {
          if(index === this.item1Data.rightHtmlData.jetLag.index){
            this.data2.jetLag.name = item.text;
            this.data2.jetLag.value = item.value;
          }
        })

      } else {
        this.data1.factor.name = c.text;
        this.data1.factor.value = c.value;
       
        if (c.weight === "时段量") {
          this.item1Data.rightHtmlData.whenTime.list.forEach((item, index) => {
            item.disabled = true;
          });
          this.data1.whenTime.name = "/";
          this.data1.whenTime.value = "0";
        } else {
          this.item1Data.rightHtmlData.whenTime.list.forEach((item, index) => {
            item.disabled = false;
          });
         
          this.data1.whenTime.name = this.item1Data.rightHtmlData.whenTime.list[this.item1Data.rightHtmlData.whenTime.index].text+'时'
          this.data1.whenTime.value = this.item1Data.rightHtmlData.whenTime.list[this.item1Data.rightHtmlData.whenTime.index].value
         
        }
      }

      //增加选中标识
      this.factorHtml.forEach((item, index) => {
        item.list.forEach(opt => {
          opt.active = false;
        });
      });
      c.active = true;

      if (type === "SURF") {
        this.item1Data.rightHtmlData.level.list.forEach((item, index) => {
          if (index) {
            item.disabled = true;
          } else {
            item.disabled = false;
            this.item1Data.rightHtmlData.level.index = 0;
          }
        });
        this.data2.level = {
          name: "地面",
          value: "地面"
        };
      } else {
        if (height === 999) {
          this.item1Data.rightHtmlData.level.list.forEach((item, index) => {
            if (index) {
              this.item1Data.rightHtmlData.level.index = 0;
              item.disabled = true;
            } else {
              item.disabled = false;
            }
          });
          this.data2.level = {
            name: "地面",
            value: "地面"
          };
        } else {
          this.item1Data.rightHtmlData.level.list.forEach((item, index) => {
            if (index) {
              this.item1Data.rightHtmlData.level.index = 4;

              item.disabled = false;
            } else {
              item.disabled = true;
            }
          });
          this.data2.level = {
            name: "700hpa",
            value: "700"
          };
        }
      }
    },
    //模式选择事件
    schemaHandle(index, opt) {
      let active = null;
      this.chooseFactorsnums.forEach( option => {
        if(opt.value === option.model){
          if(option.text){
            active = option;
          }
        }
      })
      this.item1Data.rightHtmlData.schema.index = index;
      if (this.initFactor == "模式因子") {
        this.data2.schema.name = opt.text;
        this.data2.schema.value = opt.value;
      }
      let a = {
        name: opt.text,
        value: opt.value
      };
      this.$store.commit("typeCommit", a);
      this.factorHtml = this.nwpfactor = [];
      this.item1Data.rightHtmlData.schema.list.forEach( (item,index) => {
        if(opt.value === item.value){
          if(active == null){
            this.makeFactorData(item.value,opt.activeNum);
          }else {
            this.makeFactorData(item.value,active);
          }
          
        }
      })
      
    },
    //层次选择事件
    lelevHandle(index, opt) {
      this.levelNum = index;
      this.item1Data.rightHtmlData.level.index = index;
      if (this.initFactor == "模式因子") {
        this.data2.level.name = opt.text;
        this.data2.level.value = opt.value;
      } else {
        this.data1.level.name = opt.text;
        this.data1.level.value = opt.value;
      }
    },
    //时次选择事件
    whenTimeHandle(index, opt) {
      this.item1Data.rightHtmlData.whenTime.index = index;
      if (this.initFactor == "模式因子") {
        this.data2.whenTime.name = opt.text;
        this.data2.whenTime.value = opt.value;
      } else {
        this.data1.whenTime.name = opt.text +'时';
        this.data1.whenTime.value = opt.value;
      }

      this.$store.commit("whenTimecommit", opt.value);
    },
    //时差选择事件
    jetLagHandle(index, opt) {
      this.item1Data.rightHtmlData.jetLag.index = index;
      if (this.initFactor == "模式因子") {
        this.data2.jetLag.name = opt.text;
        this.data2.jetLag.value = opt.value;
      }
    },
    //日期差选择事件
    datePoorHandle(index, opt) {
      this.item1Data.rightHtmlData.datePoor.index = index;
      if (this.initFactor == "模式因子") {
        this.data2.datePoor.name = opt.text;
        this.data2.datePoor.value = opt.value;
      } else {
        this.data1.datePoor.name = opt.text;
        this.data1.datePoor.value = opt.value;
      }
    },
    //重置实验
    test() {
      window.location.reload();
    },
    //添加因子
    addFactorTable() {
      let type = this.initFactor;
      let chooseFactors = [];
      if (type == "模式因子") {
        let a = {};
        let dataCopy = {};
        a.factor = this.data2.factor.name;
        a.factorValue = this.data2.factor.value;
        a.type = this.data2.schema.name;
        a.typeValue = this.data2.schema.value;
        a.level = this.data2.level.name;
        a.levelValue = this.data2.level.value;
        a.datePoor = this.data2.datePoor.name;
        a.datePoorValue = this.data2.datePoor.value;
        a.newspaperTime = this.data2.whenTime.name + "时";
        a.newspaperTimeValue = this.data2.whenTime.value;
        a.jetLag = this.data2.jetLag.name;
        a.jetLagValue = this.data2.jetLag.value;
        a.model = "nwp";
        this.Table2.push(a);
        this.$store.commit("table2commit", this.Table2);
        this.chooseFactors.push(a);
      } else {
        let a = {};
        a.factor = this.data1.factor.name;
        a.factorValue = this.data1.factor.value;
        a.level = this.data1.level.name;
        a.levelValue = this.data1.level.value;
        a.whenTime = this.data1.whenTime.name;
        a.whenTimeValue = this.data1.whenTime.value;
        a.datePoor = this.data1.datePoor.name;
        a.datePoorValue = this.data1.datePoor.value;
        a.model = "real";
        this.Table1.push(a);
        this.$store.commit("table1commit", this.Table1);
        this.chooseFactors.push(a);
      }

      this.sample();
      this.$store.commit("factors", this.chooseFactors);
    },
    //处理各类型数据
    makeFactorData(type,num){
      let nwp1 = {
        text: "地面因子",
        index: 0,
        list: []
      };
      let nwp2 = {
        text: "气压层因子",
        index: -1,
        list: []
      };
      let nwp3 = {
        text: "计算量因子",
        index: -1,
        list: []  
      };

      this.nwp.forEach((item, index) => {
        if (item.type === "SURF" && item.nwpType === type) {
          let onOff = true;
          if (nwp1.list.length) {
            for (let i = 0; i < nwp1.list.length; i++) {
              if (nwp1.list[i].text === item.elementCaption) {
                onOff = false;
              }
            }
          }
          if (onOff) {
            let b = {};
            b.text = item.elementCaption;
            b.value = item.name;
            b.height = item.height;
            b.weight = item.timeFlag;
            b.hourSpan = item.hourSpan;
            b.hourSpanList = item.hourSpanList;
            b.type = "SURF";
            b.element = item.element;
            b.model = type;
            if (index === num) {
              b.active = true;
            } else {
              b.active = false;
            }
            nwp1.list.push(b);
          }
        } else if (item.type === "UPAR" && item.nwpType === type) {
          let onOff = true;
          if (nwp2.list.length) {
            for (let i = 0; i < nwp2.list.length; i++) {
              if (nwp2.list[i].text === item.elementCaption) {
                onOff = false;
              }
            }
          }
          if (onOff) {
            let b = {};
            b.text = item.elementCaption;
            b.value = item.name;
            b.height = item.height;
            b.weight = item.timeFlag;
            b.active = false;
            b.hourSpan = item.hourSpan;
            b.hourSpanList = item.hourSpanList;
            b.type = "UPAR";
            b.element = item.element;
            b.model = type;
            nwp2.list.push(b);
          }
        } else if (item.type === "CALC" && item.nwpType === type) {
          let onOff = true;
          if (nwp3.list.length) {
            for (let i = 0; i < nwp3.list.length; i++) {
              if (nwp3.list[i].text === item.elementCaption) {
                onOff = false;
              }
            }
          }
          if (onOff) {
            let b = {};
            b.text = item.elementCaption;
            b.value = item.name;
            b.weight = item.timeFlag;
            b.height = item.height;
            b.active = false;
            b.hourSpan = item.hourSpan;
            b.hourSpanList = item.hourSpanList;
            b.type = "CALC";
            b.element = item.element;
            b.model = type;
            nwp3.list.push(b);
          }
        }
      });
      
      this.nwpfactor = [];
      this.nwpfactor.push(nwp1, nwp2, nwp3);
      this.$store.commit("nwpData", this.nwpfactor);
      this.factorHtml = this.nwpfactor;
      //设置默认值
      this.data2.factor.name = this.nwpfactor[0].list[0].text;
      this.data2.factor.value = this.nwpfactor[0].list[0].value;;

      //根据因子选择记录 恢复选择记录
      if(typeof num === 'object'){ 
        if(this.factorHtml[0].list[0].model)
       
          this.chooseFactorsnums.forEach( cOpt => {
            if(this.factorHtml[0].list[0].model === cOpt.model){
              this.factorHtml.forEach( opt => {
                if(opt.list[0].type == cOpt.type){
                  opt.list.forEach( ai => {
                    if(ai.text == cOpt.text){
                      ai.active = true;
                      //默认值
                      this.data2.factor.name = ai.text;
                      this.data2.factor.value = ai.value;
                    }
                  })
                }
              })
            }
          })
        }
  
      //根据默认因子设置不同时效
      
      this.item1Data.rightHtmlData.jetLag.list = this.hourSpanList( this.nwpfactor[0].list[0].hourSpanList.split(','));
      this.data2.jetLag.name = this.item1Data.rightHtmlData.jetLag.list[this.item1Data.rightHtmlData.jetLag.index].text;
      this.data2.jetLag.value = this.item1Data.rightHtmlData.jetLag.list[this.item1Data.rightHtmlData.jetLag.index].value;
    },
   
    //样本导出
    exportSample(type) {
      let exportUrl = '';
      if(type === 'no'){
        exportUrl = this.$store.state.firstCache.item1Url;
      }else{
        exportUrl = this.$store.state.firstCache.item1Url1;
      }
       
      if (exportUrl !== "") {
        let url = exportUrl;
        this.$local.download(url, "样本抽取数据");
      } else {
        Message.warning({
          content: "请先进行因子抽取",
          duration: 8,
          closable: true
        });
      }
    },

    //查看样本详情
    checkSample() {
      let url = this.$store.state.firstCache.item1Url;
      let self = this;
      if (url) {
        $.ajax({
          type: "POST",
          url: url,
          beforeSend: function(xhr) {
            //beforeSend定义全局变量
            xhr.overrideMimeType("text/plain;charset=gb18030");
          },
          success: function(data) {
            if (data) {
              if (data.split("\n").length > 1000) {
                Modal.confirm({
                  title: "提醒",
                  okText: "下载",
                  cancelText: "继续打开",
                  content: `
                    <p style="font-size:16px">样本量太大，加载等待时间较长，建议下载到本地查看.</p>
                  `,
                  onCancel: function() {
                    self.item1UrlData = data;
                    self.modalShow = true;
                  },
                  onOk: function() {
                    self.exportSample('no');
                  }
                });
              } else {
                self.item1UrlData = data;
                self.modalShow = true;
              }
            }
          }
        });
      } else {
        Message.warning({
          content: "请先进行因子抽取",
          duration: 8,
          closable: true
        });
      }
    },
    checkSample() {
      let url = this.$store.state.firstCache.item1Url;
      let self = this;
      if (url) {
        $.ajax({
          type: "POST",
          url: url,
          beforeSend: function(xhr) {
            //beforeSend定义全局变量
            xhr.overrideMimeType("text/plain;charset=gb18030");
          },
          success: function(data) {
            if (data) {
              if (data.split("\n").length > 1000) {
                Modal.confirm({
                  title: "提醒",
                  okText: "下载",
                  cancelText: "继续打开",
                  content: `
                    <p style="font-size:16px">样本量太大，加载等待时间较长，建议下载到本地查看.</p>
                  `,
                  onCancel: function() {
                    self.item1UrlData = data;
                    self.modalShow = true;
                  },
                  onOk: function() {
                    self.exportSample();
                  }
                });
              } else {
                self.item1UrlData = data;
                self.modalShow = true;
              }
            }
          }
        });
      } else {
        Message.warning({
          content: "请先进行因子抽取",
          duration: 8,
          closable: true
        });
      }
    },
    //收集建模样本信息
    sample() {
      let tabe1 = this.$store.state.firstCache.table1;
      let tabe2 = this.$store.state.firstCache.table2;
      //拼接预报时间
      let dateYear =
        "样本周期:" +
        this.$store.state.firstCache.yearStart +
        "年-" +
        this.$store.state.firstCache.yearEnd +
        "年" +
        " , " +
        "预报时段:" +
        this.$store.state.firstCache.timeFrameStart +
        "至" +
        this.$store.state.firstCache.timeFrameEnd;
      //拼接站点信息
      let station = this.$store.state.firstCache.chooseStation;
      let stationName = "";
      station.forEach(item => {
        stationName += item.stationName;
      });
      //拼接所选因子
      let chooseFactors = this.$store.state.firstCache.chooseFactors;
      let factorsName = "";
      chooseFactors.forEach(item => {
        factorsName += item.factor + "(" + item.level + "),";
      });
      let a1 = {
        name: "样本时间",
        information: dateYear
      };
      let a2 = {
        name: "站点",
        information: stationName
      };
      let a3 = {
        name: "模式",
        information: this.$store.state.firstCache.type.name
      };
      let a4 = {
        name: "预报量",
        information: this.$store.state.firstCache.predictionMsg.caption
      };
      let a5 = {
        name: "建模时间",
        information: ""
      };
      let a6 = {
        name: "预报时间",
        information: ""
      };
      let a7 = {
        name: "选择的因子",
        information: factorsName
      };
      //this.data3 = [];
      let dataArr = [];

      dataArr.push(a1, a5, a6, a2, a4);
      this.$store.commit("sample", dataArr);
    },
    //建模样本
    factorsSample() {
      $.post(this.$host + "Sample/getSampleCount")
        .done(data => {
          if (data) {
            this.$store.commit("sampleCount", data);
          } else {
            this.$Notice.warning({
              title: "站点样本为空"
            });
          }
        })
        .fail(error => {
          this.$Notice.warning({
            title: "请先进行样本抽取"
          });
        });
      let sample = this.$store.state.firstCache.sample;
      this.sample();
      this.$store.commit("modelIsShow", true);
      // if(sample.length){
      //   this.$store.commit("modelIsShow", true);
      // }  else{

      //   this.$store.commit("modelIsShow", true);
      // }
    }
  },
  computed: {
    //因子抽取参数获取，全部参数都以store状态里的参数为准
    getExtractionParam() {
      let station = this.$store.state.firstCache.chooseStation;
      let Factors = this.getFactors;

      let FactorsArr = [];
      let stationArr = [];
      station.forEach(item => {
        stationArr.push(item.stationNum);
      });

      Factors.forEach(item => {
        if (item.model === "nwp") {
          let a = {};
          a.type = "nwp";
          a.forecastTime = Number(item.newspaperTimeValue);
          a.daySpan = Number(item.datePoorValue);
          a.hourSpan = Number(item.jetLagValue);

          if (item.level !== "地面") {
            this.nwp.forEach(opt => {
              if (
                Number(item.levelValue) === opt.height &&
                item.factor === opt.elementCaption
              ) {
                a.name = opt.name;
              }
            });
          } else {
            a.name = item.factorValue;
          }

          FactorsArr.push(a);
        } else {
          let a = {};
          a.type = "real";
          a.name = item.factorValue;
          a.hour = Number(item.whenTimeValue);
          a.daySpan = Number(item.datePoorValue);
          // a.hourSpan = Number(item.jetLag.value)
          FactorsArr.push(a);
        }
      });

      return {
        startYear: Number(this.$store.state.firstCache.yearStart),
        endYear: Number(this.$store.state.firstCache.yearEnd),
        startMonth: Number(
          this.$store.state.firstCache.timeFrameStart.split("-")[0]
        ),
        endMonth: Number(
          this.$store.state.firstCache.timeFrameEnd.split("-")[0]
        ),
        startDate: Number(
          this.$store.state.firstCache.timeFrameStart.split("-")[1]
        ),
        endDate: Number(
          this.$store.state.firstCache.timeFrameEnd.split("-")[1]
        ),
        elementForecast: $.trim(
          this.$store.state.firstCache.predictionMsg.value
        ),
        timeFlag: this.$store.state.firstCache.predictionMsg.timeFlag,
        hour: Number(this.$store.state.firstCache.whenTime),
        stations: stationArr,
        forecastHour: Number(this.$store.state.firstCache.newspaper),
        forecastHourSpan: Number(this.$store.state.firstCache.timeliness),
        factors: FactorsArr
      };
    },
    //时次模板数据
    whenTimeMd() {
      let a = [];
      for (let i = 0; i < 24; i++) {
        let b = {};
        b.text = sum(i);
        b.value = sum(i);
        b.disabled = false;
        a.push(b);
      }
      function sum(num) {
        if (num < 10) return "0" + num;
        return num;
      }
      return a;
    },
   
    //获取vux的factors
    getFactors() {
      return this.$store.state.firstCache.chooseFactors;
    },
    //处理grapes数据
    grapes() {
      let nwp = this.nwp;
    },
    //处理上传样本数据
    makeUpDataclos() {
      let updata = this.item1UrlData;
      if (updata) {
        let cols = [];
        let rowOne = updata.split("\n")[0].split(",");
        rowOne.forEach(item => {
          cols.push({
            title: item,
            key: item,
            align: "center"
          });
        });
        return cols;
      }
      return [];
    },
    makeUpDatarows() {
      let updata = this.item1UrlData;
      if (updata) {
        let rowOne = updata.split("\n")[0].split(",");
        let rowSplit = updata.split("\n");
        rowSplit.splice(0, 1);
        rowSplit.splice(rowSplit.length - 1, 1);
        let rows = [];
        rowSplit.forEach((item, index) => {
          let arr = item.split(",");
          let a = {};
          arr.forEach((o, i) => {
            a[rowOne[i]] = o;
          });
          rows.push(a);
        });
        return rows;
      }
      return [];
    }
  }
};
</script>
<style>
.rightContent-body {
  width: 100%;
  height: 100%;
}

.ivu-table-header .test {
  font-size: 16px;
}
.rightContent-body-header button {
  font-size: 15px;
  color: #ffffff;
}
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}

@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.demo-spin-col {
  height: 100px;
  position: relative;
  border: 1px solid #eee;
}

.rightContent-body-header {
  /* width: 100%;
  height: 73px;
  padding: 10px; */
  /* webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2); */
  /* margin-bottom: 10px; */
  position: absolute;
  right: -54px;
  z-index: 9;
}

.headBtn {
  width: 125px;
  margin-left: 10px;
}

.rightContent-body-content {
  webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  height: calc(100% - 83px);
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 40px 20px;
  text-align: left;
  min-height: 800px;
}
.rightContent-body-content .title {
  color: #17233d;
  font-size: 15px;
  font-weight: bold;
  vertical-align: top;
  margin-top: 3px;
}
body .ivu-btn {
  font-size: 14px;
}
.tabe1,
.tabe2 {
  padding-top: 10px;
}
.contente_type {
  padding: 0px 0;
}
.contente_yinzi .inline_box {
  display: inline-block;
  width: calc(100% - 50px);
  padding: 0 0 5px 0;
}
.contente_yinzi .Stitle {
  color: chocolate;
  display: inline-block;
  vertical-align: top;
  margin-top: 2px;
  width: 85px;
  text-align: center;
}
body .contente_yinzi .bold button {
  font-weight: bold;
}
.contente_yinzi .btn-group {
  max-width: calc(100% - 90px);
}
.contente_yinzi_inlineContainer {
  display: inline-block;
  max-width: calc(100% - 51px);
  padding-right: 10px;
}
/* .rightContent-body-content .ivu-btn {
  padding: 6px 10px;
} */
.rightContent-body-content article {
  padding: 3px 0;
}
.inline_box .bold {
  font-weight: bold;
}
.rightContent-body-content .ivu-table-wrapper {
  margin-top: 10px;
}
.rightContent-body-header button {
  font-size: 16px;
}
.tableHead {
  color: red;
}
.tableBox {
  padding-top: 10px;
}
</style>
