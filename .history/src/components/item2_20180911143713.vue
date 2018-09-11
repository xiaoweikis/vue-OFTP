<template>
  <div class="analysis">
    <div class="analysis-tools">
      <ButtonGroup size="large">
        <Button type="ghost" icon="ios-redo-outline" @click.native="factorsCommit">提交因子</Button>
        <Button type="ghost" icon="ios-cloud-upload-outline">上传样本</Button>
        <Button type="ghost" icon="ios-cloud-download-outline" @click.native="exportResult">分析结果导出</Button>
        <Button type="ghost" icon="ios-list-outline" @click.native="factorsSample">样本构建表</Button>
      </ButtonGroup>
    </div>
    <div class="analysis-factor">
      <div class="analysis-factor-table1">
        <span class="spanTitle">样本因子</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border :loading="loading" :columns="columns1" :data="data1" width="100%"></Table>
      </div>
      <div class="analysis-factor-table1">
        <span class="spanTitle">预报量[ <strong style="color: red">{{this.predictionMsg}}</strong> ]与各因子相关系数</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border :loading="loading" :columns="columns2" :data="data2" width="100%"></Table>
      </div>
      <div class="analysis-factor-table1">
        <span class="spanTitle">
          <Select v-model="model" size="small" :label-in-value="true" @on-change="stationChoose" style="width:100px">
            <Option v-for="item,index in station" :value="item.value" :key="item.value">{{item.label}}</Option>
          </Select>
          各因子相关系数
        </span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border stripe :loading="loading" :columns="columns3" :data="data3" width="100%" height="382"></Table>
      </div>
      <div class="analysis-factor-table1">
        <span class="spanTitle"></span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <div class="echartsContainer">
          <div id="myEcharts" :style="{width:'1333px',height:'450px'}" ref="myEcharts"></div>
        </div>
      </div>
    </div>
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
      columns1: [
        {
          title: "type",
          key: "name",
          width: 320,
          align: "center",
          render: (h, params) => {
            return h("div", [h("strong", params.row.name)]);
          }
        }
      ],
      data1: [
        {
          name: "观测因子"
        },
        {
          name: "模式因子"
        }
      ],
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
      loading: true,
      RealCheckBoxValue: [],
      nwpCheckBoxValue: []
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
    this.chooseFactorsRow();
    this.getCorrelation();
  },
  methods: {
    chooseFactorsRow() {
      let self = this;
      let a = {
        title: "factorsName",
        key: "factorsData",
        align: "center",
        render: (h, params) => {
          let self = this;
          let real = this.realFactors;
          let nwp = this.nwpFactors;
          let selectReal = this.selectReal;
          let selectNwp = this.selectNwp;
          let factors = "real";
          if (selectReal.length || selectNwp.length) {
            if (params.row.name == "观测因子") {
              return h(
                CheckboxGroup,
                {
                  props: {
                    value: selectReal
                  },
                  nativeOn: {
                    change: e => {
                      self.$store.commit("selectReal", e.target.value);
                    }
                  }
                },
                this.chooseFactorsRowCheckbox(h, real, factors)
              );
            } else {
              return h(
                CheckboxGroup,
                {
                  props: {
                    value: selectNwp
                  },
                  nativeOn: {
                    change: e => {
                      self.$store.commit("selectNwp", e.target.value);
                    }
                  }
                },
                this.chooseFactorsRowCheckbox(h, nwp)
              );
            }
          } else {
            if (params.row.name == "观测因子") {
              return h(
                CheckboxGroup,
                {
                  props: {
                    value: this.chooseFactors
                  },
                  nativeOn: {
                    change: (e, v) => {
                      self.$store.commit("selectReal", e.target.value);
                    }
                  }
                },
                this.chooseFactorsRowCheckbox(h, real, factors)
              );
            } else {
              return h(
                CheckboxGroup,
                {
                  nativeOn: {
                    change: e => {
                      self.$store.commit("selectNwp", e.target.value);
                    }
                  }
                },
                this.chooseFactorsRowCheckbox(h, nwp)
              );
            }
          }
        }
      };
      this.columns1.push(a);
    },
    chooseFactorsRowCheckbox(h, data, factors) {
      let a = [];
      data.forEach((item, index) => {
        a.push(
          h(Checkbox, {
            props: {
              label: item
            }
          })
        );
      });
      return a;
    },
    //提交需要预测的因子
    factorsCommit() {
      let tabelBody = $(".ivu-table-body")
        .eq(0)
        .find("input.ivu-checkbox-input");
      let value = [];
      for (let i = 0; i < tabelBody.length; i++) {
        if ($(tabelBody[i].offsetParent).hasClass("ivu-checkbox-checked")) {
          value.push(tabelBody[i].value);
        }
      }
      if (!value.length) {
        Message.warning({
          content: "请先选择因子",
          duration: 3,
          closable: true
        });
        return;
      }
      let a = {
        factors: value
      };
      $.post(
        "http://101.200.12.178:8090/OFTPService/services/Sample/selectFactor",
        { para: JSON.stringify(a) }
      )
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
    getCorrelation() {
      axios
        .post(
          "http://101.200.12.178:8090/OFTPService/services/Analysis/correlation"
        )
        .then(response => {
          this.CorrelationUrl =
            "http://101.200.12.178:8090" + response.data.url;
          this.CorrelationData = response.data.result;
          this.initTableTwo();
          this.initTableThree();
          this.loading = !this.loading;
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
      if (this.CorrelationUrl !== "") {
        let url = this.CorrelationUrl;
        this.$local.funDownload(url, "样本抽取数据");
      } else {
        Message.warning({
          content: "nothing data",
          duration: 8,
          closable: true
        });
      }
    },
    //渲染表格二
    initTableTwo() {
      let factors = this.factors;
      let station = this.stationSelect;
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
      factors.forEach((item, index) => {
        let b = {
          title: item.value,
          key: "item" + index,
          maxWidth: ''
          align: "center"
        };
        a.push(b);
      });
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
            factors.forEach((option, val) => {
              a["item" + val] = data[key][val + 1].toFixed(2);
            });
            c.push(a);
          }
        }
      });
      this.columns2 = a;
      this.data2 = c;
      this.$store.commit("CorrelationData", c);
      this.getCorrelationData();
      this.initEchart();
    },
    //渲染表格三
    initTableThree() {
      let factors = this.factors;
      let data = this.CorrelationData;
      let model = this.model;
      let chooseValue = [];
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
      factors.forEach((item, index) => {
        let b = {
          title: item.value,
          key: "item" + (index + 1),
          align: "center"
        };
        let y = {
          factor: item.value
        };
        a.push(b);
        c.push(y);
      });
      let len = Math.sqrt(chooseValue.length);
      console.log(len)
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
     
      console.log(c)
    },
    //站点选择事件
    stationChoose(a) {
      this.initTableThree();
      //站点改变、手动重新获取数据
      this.getCorrelationData();
      this.myChart.setOption(this.chartsOption(), true);
    },
    //处理echart数据的方法，必须在站点有值之后
    getCorrelationData() {
      let data = this.$store.state.firstCache.CorrelationData;
      let model = this.model;
      let factors = this.factors;
      let cache = {
        chooseStationCorrelationValue: [],
        chooseStationCorrelationText: []
      };
      data.forEach(item => {
        if (item.stationNum == Number(model)) {
          for (var key in item) {
            if (key.search("item") !== -1) {
              if (item[key] === '-9999.00') {
                cache.chooseStationCorrelationValue.push(0);
              } else {
                cache.chooseStationCorrelationValue.push(item[key]);
              }
            }
          }
        }
      });
      factors.forEach(item => {
        cache.chooseStationCorrelationText.push(item.value);
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
      this.$store.commit("modelIsShow", true);
    }
  },
  computed: {
    //获取选择的因子
    factors() {
      return this.$store.state.firstCache.chooseFactors;
    },
    realFactors() {
      let factors = this.factors;
      let realFactors = [];
      factors.forEach(item => {
        if (item.hourSpan) {
          if (item.type == "real") {
            realFactors.push(item.name);
          }
        }
      });
      return realFactors;
    },
    nwpFactors() {
      let factors = this.factors;
      let nwpFactors = [];
      factors.forEach(item => {
        if (item.hourSpan) {
          if (item.type == "nwp") {
            nwpFactors.push(item.name);
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
      //        let real = this.$store.state.firstCache.real;
      //        let predictionText = '';
      //        real.forEach((item) => {
      //          if (item.name == prediction) {
      //            predictionText = item.caption
      //          }
      //        });
      //        return predictionText;
    }
  },
  beforeDestroy() {
    //提交表二数据
    this.$store.commit("table2data", { a: this.columns2, b: this.data2 });
  },
  mounted() {}
};
</script>
<style>
.analysis-tools {
  height: 80px;
  line-height: 80px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
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
  color: #495060;
  background: rgba(255, 255, 255, 0.4);
}

.analysis-factor {
  padding: 0px 5px 0 5px;
}

.ivu-table-header .center {
  text-align: center;
}
</style>
