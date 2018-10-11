<template>
  <div class="assess clearfix">
    <div class="assessLeft">
      <toolbarItem title="时段">
        <div class="dateBox">
          <span>开始:&nbsp</span>
          <Input :readonly="true" :value="startTime" style="width: 180px;"/>
        </div>
        <div class="dateBox">
          <span>结束:&nbsp</span>
          <Input :readonly="true" :value="endTime" style="width: 180px;"/>
        </div>
      </toolbarItem>
       <toolbarItem title="方法">
        <div class="dateBox">
          <Button
            v-for="item,index of methods.list"
            :key="index"
            :type="methods.index === index ? 'warning' : 'primary'"
            :value="item.value"
            @click.native="methodsHandle(index,item.value)"
          >
          {{item.title}}
          </Button>
        </div>
      </toolbarItem>
      <Button long type="success" @click.native="runData">评估</Button>
    </div>
    <div class="assessRight">
      <div class="assessRight-tools">
        <ButtonGroup vertical>
           <Button type="primary" title="样本导出" icon="ios-cloud-download-outline" @click.native="exportResult"></Button>
          <Button type="primary" title="样本构建表" icon="ios-list-outline" @click.native="factorsSample"></Button>
           <Upload 
          :action="this.$host + 'Sample/upload/'"
          :show-upload-list="false"
          :on-success="upload"
          :data="uploadData"
          >
           <Button type="primary" title="上传样本" icon="ios-cloud-upload-outline" style="border-top:none;border-top-left-radius: 0;border-top-right-radius: 0;"></Button>
         </Upload>
        </ButtonGroup>
      </div>
      <div class="assessRight-content">
        <span class="spanTitle">评估结果</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border  :columns="cols" :data="rows" width="100%"></Table>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import toolbarItem from "@/secondLevel/toolbarItem";
import { Input, ButtonGroup, Button, Table, Message } from "iview";
import $ from "jquery";
export default {
  data() {
    return {
      colsAcc: [
        {
          title: "站号",
          key: "stationNum",
          align: "center"
        },
        {
          title: "平方绝对误差",
          key: "MAE",
          align: "center"
        },
        {
          title: "均方根误差",
          key: "RMSE",
          align: "center"
        },
        {
          title: "<1℃准确率",
          key: "Tk1",
          align: "center"
        },
        {
          title: "<2℃准确率",
          key: "Tk2",
          align: "center"
        }
      ],
      colsTs: [
        {
          title: "站号",
          key: "stationNum",
          minWidth: 80,
          align: "center"
        },
        {
          title: "晴雨准确率",
          key: "PC",
          minWidth: 100,
          align: "center"
        },
        {
          title: "小雨空报率",
          key: "FAR01",
          minWidth: 100,
          align: "center"
        },
        {
          title: "中雨空报率",
          key: "FAR10",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大雨空报率",
          key: "FAR25",
          minWidth: 100,
          align: "center"
        },
        {
          title: "暴雨空报率",
          key: "FAR50",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大暴雨空报率",
          key: "FAR100",
          minWidth: 100,
          align: "center"
        },
        {
          title: "小雨漏报率",
          key: "PO01",
          minWidth: 100,
          align: "center"
        },
        {
          title: "中雨漏报率",
          key: "PO10",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大雨漏报率",
          key: "PO25",
          minWidth: 100,
          align: "center"
        },
        {
          title: "暴雨漏报率",
          key: "PO50",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大暴雨漏报率",
          key: "PO100",
          minWidth: 100,
          align: "center"
        },
        {
          title: "小雨TS评分",
          key: "TS01",
          minWidth: 100,
          align: "center"
        },
        {
          title: "中雨TS评分",
          key: "TS10",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大雨TS评分",
          key: "TS25",
          minWidth: 100,
          align: "center"
        },
        {
          title: "暴雨TS评分",
          key: "TS50",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大暴雨TS评分",
          key: "TS100",
          minWidth: 100,
          align: "center"
        },
        {
          title: "小雨误差",
          key: "deviation01",
          minWidth: 100,
          align: "center"
        },
        {
          title: "中雨误差",
          key: "deviation10",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大雨误差",
          key: "deviation25",
          minWidth: 100,
          align: "center"
        },
        {
          title: "暴雨误差",
          key: "deviation50",
          minWidth: 100,
          align: "center"
        },
        {
          title: "大暴雨误差",
          key: "deviation100",
          minWidth: 100,
          align: "center"
        }
      ],
      colsDiv: [
        {
          title: "站号",
          key: "stationNum",
          align: "center"
        },
        {
          title: "平均误差",
          key: "AE",
          align: "center"
        },
        {
          title: "平均绝对误差",
          key: "MAE",
          align: "center"
        },
        {
          title: "均方根误差",
          key: "RMSE",
          align: "center"
        }
      ],
      cols: [],
      rows: [],

      exportUrl: "", //评估结果地址，
      methods: {
        index: -1,
        list: [
          {
            title: "通用误差检验",
            value: "dev"
          },
          {
            title: "气温准确率检验",
            value: "acc"
          },
          {
            title: "降水TS评分",
            value: "ts"
          }
        ]
      },
      methodsVal: "" ,//存储选择的方法
      uploadData:{
        para:JSON.stringify({
          fileNames:["predict.csv"]
        })
      }
    };
  },
  components: {
    toolbarItem,
    Input,
    Button,
    ButtonGroup,
    Table,
    Message
  },
  created() {
    this.methods.list.forEach((item, index) => {
      if (item.value === this.test) {
        this.methods.index = index;
        this.methodsVal = this.test;
      }
    });
  },
  methods: {
    //请求数据
    runData() {
     
      let a = {
        test: this.methodsVal
      };
    
      $.post("http://101.200.12.178:8090/OFTPServiceV2/services/Test/run", {
        para: JSON.stringify(a)
      })
        .done(data => {
          if (data) {
            this.exportUrl = "http://101.200.12.178:8090" + data.url;

            switch (a.test) {
              case "acc":
                this.rows = this.getCols(data);
                this.cols = this.colsAcc;
                let Tabledata1 = {
                  row: this.rows,
                  cols: this.cols
                };
                this.$store.commit("jypgcommit", Tabledata1);
                break;
              case "ts":
                this.rows = this.tsCols(data);
                this.cols = this.colsTs;
                let Tabledata2 = {
                  row: this.rows,
                  cols: this.cols
                };
                this.$store.commit("jypgcommit", Tabledata2);
                break;
              case "dev":
                this.rows = this.divCols(data);
                this.cols = this.colsDiv;
                let Tabledata3 = {
                  row: this.rows,
                  cols: this.cols
                };
                this.$store.commit("jypgcommit", Tabledata3);
                break;
            }
          } else {
            Message.error({
              content: "无数据，请求成功",
              duration: 8,
              closable: true
            });
          }
        })
        .fail(error => {
          Message.error({
            content: "无数据，请求失败" + error,
            duration: 8,
            closable: true
          });
        });
    },
    //处理表格数据rows  acc数据
    getCols(data) {
      let result = data.result;
      let b = [];
      for (var key in result) {
        let a = {};
        a.stationNum = key;
        for (var item in result[key]) {
          if (item == "MAE") {
            a.MAE = result[key][item];
          } else if (item == "RMSE") {
            a.RMSE = result[key][item];
          } else if (item == "Tk1") {
            a.Tk1 = result[key][item];
          } else if (item == "Tk2") {
            a.Tk2 = result[key][item];
          }
        }
        b.push(a);
      }
      return b;
    },
    //ts数据
    tsCols(data) {
      let result = data.result;
      let b = [];
      for (var key in result) {
        let a = {};
        a.stationNum = key;
        for (var item in result[key]) {
          switch (item) {
            case "PC":
              a.PC = result[key][item];
              break;
            case "PO01":
              a.PO01 = result[key][item];
              break;
            case "PO10":
              a.PO10 = result[key][item];
              break;
            case "PO25":
              a.PO25 = result[key][item];
              break;
            case "PO50":
              a.PO50 = result[key][item];
              break;
            case "PO100":
              a.PO100 = result[key][item];
              break;
            case "TS01":
              a.TS01 = result[key][item];
              break;
            case "TS10":
              a.TS10 = result[key][item];
              break;
            case "TS25":
              a.TS25 = result[key][item];
              break;
            case "TS50":
              a.TS50 = result[key][item];
              break;
            case "TS100":
              a.TS100 = result[key][item];
              break;
            case "FAR01":
              a.FAR01 = result[key][item];
              break;
            case "FAR10":
              a.FAR10 = result[key][item];
              break;
            case "FAR25":
              a.FAR25 = result[key][item];
              break;
            case "FAR50":
              a.FAR50 = result[key][item];
              break;
            case "FAR100":
              a.FAR100 = result[key][item];
              break;

            case "deviation01":
              a.deviation01 = result[key][item];
              break;
            case "deviation10":
              a.deviation10 = result[key][item];
              break;
            case "deviation25":
              a.deviation25 = result[key][item];
              break;
            case "deviation50":
              a.deviation50 = result[key][item];
              break;
            case "deviation100":
              a.deviation100 = result[key][item];
              break;
          }
        }
        b.push(a);
      }
      return b;
    },
    //div数据
    divCols(data) {
      let result = data.result;
      let b = [];
      for (var key in result) {
        let a = {};
        a.stationNum = key;
        
        for (var item in result[key]) {
          if (item == "AE") {
            a.AE = result[key][item];
          } else if (item == "MAE") {
            a.MAE = result[key][item];
          } else if (item == "RMSE") {
            a.RMSE = result[key][item];
          }
        }
        b.push(a);
      }
      return b;
    },
    //导出评估结果
    exportResult() {
      if (this.exportUrl !== "") {
        let url = this.exportUrl;
        this.$local.download(url, "预测结果");
      } else {
        Message.warning({
          content: "无评估数据",
          duration: 8,
          closable: true
        });
      }
    },
    //显示构建样本
    factorsSample() {
      this.$store.commit("modelIsShow", true);
    },
    //检验方法事件
    methodsHandle(index,val) {
      this.methods.index = index;
      this.methodsVal = val;
    },
    //上传样本
    upload(response, file, fileList){
       let self = this;
      $.ajax({
        type: "POST",
        url: "http://101.200.12.178:8090" + response,
        beforeSend: function(xhr) {
          //beforeSend定义全局变量
          xhr.overrideMimeType("text/plain;charset=gb18030");
        },
        success: function(data) {
         
          self.$Notice.success({
                    title: '上传成功',
                    // desc: nodesc ? '' : 'Here is the notification description. Here is the notification description. '
                });
        },
        error:function(){
           this.$Notice.error({
                    title: '上传失败，请重新尝试',
                    //desc: nodesc ? '' : 'Here is the notification description. Here is the notification description. '
                });
        }
      });
    }

  },
  computed: {
    startTime() {
      let startYear = this.$store.state.firstCache.yearStart;
      let startMonth = this.$store.state.firstCache.timeFrameStart;
      return startYear + "-" + startMonth;
    },
    endTime() {
      let endYear = this.$store.state.firstCache.yearEnd;
      let endMonth = this.$store.state.firstCache.timeFrameEnd;
      return endYear + "-" + endMonth;
    },
    test() {
      return this.$store.state.firstCache.predictionMsg.test;
    }
  }
};
</script>
<style>
.assessLeft {
  width: 342px;
  height: 100%;
  padding: 10px;
  color: white;
  float: left;
}

.assessRight {
  width: calc(100% - 342px);
  height: 100%;
  color: white;
  float: left;
  padding: 10px;
}

.ivu-input {
  text-align: center;
}

.dateBox {
  margin-top: 10px;
}
.dateBox button {
  margin: 5px;
}

.assessRight-tools {
  /* height: 80px;
  line-height: 80px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%; */
  position: absolute;
  z-index: 9;
  right: -46px;
}
/* .assessRight-tools .ivu-upload {
  display: inline-block;
} */

.assessRight-tools button {
  font-size: 15px;
  color: #495060;
  background: rgba(255, 255, 255, 0.4);
}

.spanTitle {
  font-size: 16px;
  background: rgb(53, 53, 53);
  height: 37px;
  display: block;
  color: white;
  line-height: 36px;
  padding-left: 12px;
  margin-top: 10px;
  text-align: center;
}
</style>
