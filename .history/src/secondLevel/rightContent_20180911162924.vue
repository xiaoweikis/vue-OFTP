<template>
  <div class="rightContent-body">
    <div class="rightContent-body-header">
      <ButtonGroup size="large">
        <Button type="ghost" icon="ios-refresh" @click.native="resetFactors">重置因子选择</Button>
        <Button type="ghost" icon="ios-list-outline" @click.native="factorsSample">显示构建样本</Button>
        <Button type="ghost" icon="ios-redo-outline" @click.native="extraction">因子抽取</Button>
        <Button type="ghost" icon="ios-cloud-upload-outline">上传样本</Button>
        <Button type="ghost" icon="ios-cloud-download-outline" @click.native="exportSample">样本导出</Button>
        <Button type="ghost" icon="ios-refresh-outline" @click.native="test">重置实验</Button>
      </ButtonGroup>
    </div>
    <div class="rightContent-body-content" style="position: relative">
      <div class="tabe1">
        <Table :loading="loading" highlight-row stripe border :columns="columns1" :data="data1"
               @on-current-change="handler1" height="335"></Table>
      </div>
      <div class="tabe2">
        <Table :loading="loading" highlight-row stripe border :columns="columns2" :data="data2" height="335"
               @on-current-change="handler2"></Table>
      </div>
      <Spin fix v-if="spinShow">
        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
        <div>因子抽取中 Loading</div>
      </Spin>
    </div>
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
  ButtonGroup
} from "iview";
import "iview/dist/styles/iview.css";
import $ from "jquery";

export default {
  data() {
    return {
      loading: true, //表单Loading
      spinShow: false, //因子抽取页面loading
      isChecked: true,
      modal2: false, //建模样本模态框
      columns1: [
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "观测因子",
          width: 220,
          align: "center",
          key: "name",
          className: "test",
          render: (h, params) => {
            return h("div", [h("strong", params.row.name)]);
          }
        }
      ], //实况因子
      columns2: [
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "模式因子",
          className: "test",
          width: 220,
          align: "center",
          key: "name",
          render: (h, params) => {
            return h("div", [h("strong", params.row.name)]);
          }
        }
      ], //模式因子
      data1: [], //实况因子
      data2: [], //模式因子
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
      exportUrl: "", //样本导出地址
      hourSpan: ""
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
    ButtonGroup
  },
  created() {
    function Http1() {
      return axios.post(
        "http://101.200.12.178:8090/OFTPService/services/Sample/getSampleInfoNWP"
      );
    }

    function Http2() {
      return axios.post(
        "http://101.200.12.178:8090/OFTPService/services/Sample/getSampleInfoReal"
      );
    }

    let tabe1 = [];
    let tabe2 = [];
    let self = this;
    axios
      .all([Http1(), Http2()])
      .then(
        axios.spread((a, b) => {
          tabe1 = b.data;
          tabe2 = a.data;
        })
      )
      .then(() => {
        //表一
        tabe1.forEach((item, index) => {
          let a = {
            name: item.caption,
            text: item.name
          };
          self.data1.push(a);
        });
        //表二
        tabe2.forEach((item, index) => {
          let a = {
            name: item.caption,
            text: item.name
          };
          self.data2.push(a);
        });
        self.realRadioCustom(); //real表单
        self.nwpRadioCustom(tabe2); //nwp表单
        self.loading = false;
      });
    self.text = self.chooseFactors;
  },
  methods: {
    test() {
      window.location.reload();
    },
    realRadioCustom() {
      let self = this;
      let a = {
        title: "提前时间",
        key: "action",
        align: "center",
        className: "test",
        props: [""],
        //基于vue的render函数渲染模板
        render: (h, params) => {
          let factors = self.chooseFactors;
          let isChecked = false;
          if (factors.length) {
            //这里不能forEach,否则渲染不出RadioGroup组件，我也不知道为什么 = =!
            for (let i = 0; i < factors.length; i++) {
              if (factors[i].name == params.row.text) {
                isChecked = true;
                return h(
                  RadioGroup,
                  {
                    props: {
                      value: Number(factors[i].hourSpan) //这里定义默认选中的radio，注意值要===(全等)
                    },
                    nativeOn: {
                      //触发组件事件名
                      change: e => {
                        self.text.forEach(item => {
                          if (
                            item.value ==
                            $.trim(e.path[6].children[1].innerText)
                          ) {
                            item.hourSpan = $.trim(e.path[2].innerText);
                          }
                        });
                        self.$store.commit("factors", self.text);
                      }
                    }
                    //render event h函数的第三个参数，是数组类型的组件集合
                  },
                  this.realRadioNum(h, self)
                );
              }
            }
            if (!isChecked) {
              return h(
                RadioGroup,
                {
                  props: {},
                  nativeOn: {
                    change: e => {
                      self.text.forEach(item => {
                        if (
                          item.value == $.trim(e.path[6].children[1].innerText)
                        ) {
                          item.hourSpan = $.trim(e.path[2].innerText);
                        }
                      });
                      self.$store.commit("factors", self.text);
                    }
                  }
                },
                this.realRadioNum(h, self)
              );
            }
          } else {
            return h(
              RadioGroup,
              {
                props: {
                  value: ""
                },
                nativeOn: {
                  change: e => {
                    self.text.forEach(item => {
                      if (
                        item.value == $.trim(e.path[6].children[1].innerText)
                      ) {
                        item.hourSpan = $.trim(e.path[2].innerText);
                      }
                    });
                    self.$store.commit("factors", self.text);
                  }
                }
              },
              this.realRadioNum(h, self)
            );
          }
        }
      };
      this.columns1.push(a);
    },
    realRadioNum(h) {
      let a = [];
      let b = [-48, -24, 0, 24, 48];
      b.forEach(item => {
        a.push(
          h(Radio, {
            props: {
              label: item,
              trueValue: item,
              falseValue: item
            },
            style: {
              marginRight: "20px",
              marginBottom: 0
            }
          })
        );
      });
      return a;
    },
    nwpRadioCustom(data) {
      let a = {
        title: "提前时间",
        key: "action",
        align: "center",
        className: "test",
        props: [],
        //基于vue的render函数渲染模板
        render: (h, params) => {
          var self = this;
          let index = Number(params.index);
          if (data[index].hourSpan <= 6) {
            data[index].hourSpan = 12;
          }
          let factors = self.chooseFactors;
          let isChecked = false;
          if (factors.length) {
            //这里不能forEach,否则渲染不出RadioGroup组件，我也不知道为什么 = =!
            for (let i = 0; i < factors.length; i++) {
              if (factors[i].name == params.row.text) {
                isChecked = true;
                return h(
                  RadioGroup,
                  {
                    props: {
                      value: Number(factors[i].hourSpan) //这里定义默认选中的radio，注意值要===(全等)
                    },
                    nativeOn: {
                      change: e => {
                        self.text.forEach(item => {
                          if (
                            item.value ==
                            $.trim(e.path[6].children[1].innerText)
                          ) {
                            item.hourSpan = $.trim(e.path[2].innerText);
                          }
                        });
                        self.$store.commit("factors", self.text);
                      }
                    }
                  },
                  self.nwpRadioNum(h, data[index].hourSpan, self, params)
                );
              }
            }
            if (!isChecked) {
              return h(
                RadioGroup,
                {
                  props: {},
                  nativeOn: {
                    change: e => {
                      self.text.forEach(item => {
                        if (
                          item.value == $.trim(e.path[6].children[1].innerText)
                        ) {
                          item.hourSpan = $.trim(e.path[2].innerText);
                        }
                      });
                      self.$store.commit("factors", self.text);
                    }
                  }
                },
                self.nwpRadioNum(h, data[index].hourSpan, self, params)
              );
            }
          } else {
            return h(
              RadioGroup,
              {
                props: {},
                nativeOn: {
                  change: e => {
                    self.text.forEach(item => {
                      if (
                        item.value == $.trim(e.path[6].children[1].innerText)
                      ) {
                        item.hourSpan = $.trim(e.path[2].innerText);
                      }
                    });
                    this.$store.commit("factors", self.text);
                  }
                }
              },
              this.nwpRadioNum(h, data[index].hourSpan, self, params)
            );
          }
        }
      };
      this.columns2.push(a);
    },
    nwpRadioNum(h, hourSpan, self, params) {
      //根据预报间隔时效显示有多少个radio
      let a = [];
      let radioNum = 96 / hourSpan;
      let c = [];
      for (let i = 0; i < radioNum + 1; i++) {
        if (i == 0) {
          c.push(-48);
        } else {
          c.push(-48 + hourSpan * (i - 1) + hourSpan);
        }
      }
      let value = self.predictedValue;
      c.forEach(item => {
        if (value + item <= 0) {
          a.push(
            h(Radio, {
              props: {
                label: item,
                trueValue: item,
                disabled: true
              },
              style: {
                marginRight: "20px",
                marginBottom: 0
              }
            })
          );
        } else {
          a.push(
            h(Radio, {
              props: {
                label: item,
                trueValue: item,
                disabled: false
              },
              style: {
                marginRight: "20px",
                marginBottom: 0
              }
            })
          );
        }
      });

      return a;
    },
    handler1(e) {
      let hasObj = false;
      if (this.text.length) {
        this.text.forEach(item => {
          if (item.name == e.text) {
            hasObj = true;
            item.name = e.text;
          }
        });
        if (!hasObj) {
          let a = {
            value: e.name,
            type: "real",
            name: e.text
          };
          this.text.push(a);
        }
      } else {
        let a = {
          value: e.name,
          type: "real",
          name: e.text
        };
        this.text.push(a);
      }
    },
    handler2(e) {
      let hasObj = false;
      if (this.text.length) {
        this.text.forEach(item => {
          if (item.name == e.text) {
            hasObj = true;
            item.name = e.text;
          }
        });
        if (!hasObj) {
          let a = {
            value: e.name,
            type: "nwp",
            name: e.text
          };
          this.text.push(a);
        }
      } else {
        let a = {
          value: e.name,
          type: "nwp",
          name: e.text
        };
        this.text.push(a);
      }
    },
    //因子抽取
    extraction() {
      if (!this.$store.state.firstCache.chooseStation.length) {
        Message.warning({
          content: "还没有选择站点",
          duration: 8,
          closable: true
        });
        return;
      }
      if (!this.$store.state.firstCache.type.length) {
        Message.warning({
          content: "还没有选择预报模式",
          duration: 8,
          closable: true
        });
        return;
      }
      if (!this.$store.state.firstCache.newspaper.length) {
        Message.warning({
          content: "还没有选择起报时间",
          duration: 8,
          closable: true
        });
        return;
      }
      if (!this.$store.state.firstCache.chooseFactors.length) {
        Message.warning({
          content: "还没有选择因子",
          duration: 8,
          closable: true
        });
        return;
      }
      this.spinShow = !this.spinShow;
      let para = JSON.stringify(this.getExtractionParam);
      $.post("http://101.200.12.178:8090/OFTPService/services/Sample/extract", {
        para: para
      })
        .done(data => {
          //处理没有数据的因子，在vueX里面删除对应数据
          if (data && data.url) {
            if (data.noDataFactors.length) {
              let noDataFactors = data.noDataFactors;
              this.$store.commit("noDataFactors", noDataFactors);
            }
            this.spinShow = !this.spinShow;
            Message.success({
              content: "因子抽取成功",
              duration: 8,
              closable: true
            });
            this.exportUrl = "http://101.200.12.178:8090" + data.url;
            //提交样本数据
            this.sample();
          } else {
            this.exportUrl = "";
            this.spinShow = !this.spinShow;
            Message.error({
              content: "因子抽取失败，请重新尝试",
              duration: 8,
              closable: true
            });
          }
        })
        .fail(error => {
          this.spinShow = !this.spinShow;
          this.exportUrl = "";
          Message.error({
            content: error,
            duration: 8,
            closable: true
          });
        });
    },
    //重置因子选择
    resetFactors() {
      this.$store.commit("factors", []);
      this.text = [];
    },
    //建模样本
    factorsSample() {
      this.$store.commit("modelIsShow", true);
    },
    //样本导出
    exportSample() {
      if (this.exportUrl !== "") {
        let url = this.exportUrl;
        this.$local.download(url, "样本抽取数据");
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
      //拼接预报时间
      let dateYear =
        "样本周期：" +
        this.$store.state.firstCache.yearStart +
        "年-" +
        this.$store.state.firstCache.yearEnd +
        "年" ,
        dateYearend ="预报时段:" +
        this.$store.state.firstCache.timeFrameStart +
        "至" +
        this.$store.state.firstCache.timeFrameEnd;
      let dateinfo = dateYear+'  '+dateYearend; 
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
        if (item.hourSpan) {
          factorsName += item.value + "(" + item.hourSpan + "),";
        }
      });
      let a1 = {
        name: "预报时间",
        information: dateYear
      };
      let a2 = {
        name: "站点",
        information: stationName
      };
      let a3 = {
        name: "模式",
        information: this.$store.state.firstCache.type[0]
      };
      let a4 = {
        name: "预报量",
        information: this.$store.state.firstCache.predictionMsg.caption
      };
      let a5 = {
        name: "预报时效",
        information: this.$store.state.firstCache.timeliness[0]
      };
      let a6 = {
        name: "起报时间",
        information: this.$store.state.firstCache.newspaper[0]
      };
      let a7 = {
        name: "选择的因子",
        information: factorsName
      };
      //this.data3 = [];
      let dataArr = [];
      dataArr.push(a1, a2, a3, a4, a5, a6, a7);
      this.$store.commit("sample", dataArr);
    }
  },
  computed: {
    predictedValue() {
      return Number(this.$store.state.firstCache.timeliness[0]);
    },
    chooseFactors() {
      return this.$store.state.firstCache.chooseFactors;
    },
    //因子抽取参数获取，全部参数都以store状态里的参数为准
    getExtractionParam() {
      let station = this.$store.state.firstCache.chooseStation;
      let Factors = this.chooseFactors;
      let FactorsArr = [];
      let stationArr = [];
      station.forEach(item => {
        stationArr.push(item.stationNum);
      });
      /*
         注意此处是vue的巨坑，即便是改变复制的数据，也会同步改变vueX的数据，
         例如 这样：
         //        FactorsArr.forEach((item) => {
         //          if(Number(item.hourSpan) <= 0){
         //            item.hourSpan = Number(item.hourSpan) + this.predictedValue
         //          }
         //        });
         不能直接改变复制的数据，必须使用新的变量在去接收一次
         */
      Factors.forEach(item => {
        let a = {};
        if (item.hourSpan) {
          if (item.type == "nwp" && Number(item.hourSpan) <= 0) {
            a.hourSpan = Number(item.hourSpan) + this.predictedValue;
            a.name = item.name;
            a.type = item.type;
            a.value = item.value;
            FactorsArr.push(a);
          } else {
            a.hourSpan = item.hourSpan;
            a.name = item.name;
            a.type = item.type;
            a.value = item.value;
            FactorsArr.push(a);
          }
        }
      });
      return {
        startYear: this.$store.state.firstCache.yearStart,
        endYear: this.$store.state.firstCache.yearEnd,
        startMonth: this.$store.state.firstCache.timeFrameStart.split("-")[0],
        endMonth: this.$store.state.firstCache.timeFrameEnd.split("-")[0],
        startDate: this.$store.state.firstCache.timeFrameStart.split("-")[1],
        endDate: this.$store.state.firstCache.timeFrameEnd.split("-")[1],
        elementForecast: $.trim(
          this.$store.state.firstCache.predictionMsg.value
        ),
        stations: stationArr,
        factors: FactorsArr,
        forecastHour: $.trim(this.$store.state.firstCache.newspaper[0])
      };
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
  color: #495060;
  background: rgba(255, 255, 255, 0.4);
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
  width: 100%;
  height: 73px;
  padding: 10px;
  webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
}

.headBtn {
  width: 125px;
  margin-left: 10px;
}

.rightContent-body-content {
  padding: 10px;
  webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  height: calc(100% - 83px);
}

.tabe1,
.tabe2 {
  padding-top: 10px;
}
</style>
