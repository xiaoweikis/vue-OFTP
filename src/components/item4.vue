<template>
  <div class="assess clearfix">
    <div class="assessLeft">
      <toolbarItem title="预报时段">
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
      
    </div>
    <div class="assessRight">
      <div class="assessRight-tools">
        <ButtonGroup vertical>
           <Button type="ghost" title="评估结果导出" icon="ios-cloud-download" @click.native="exportResult"></Button>
           <Button type="ghost" title="样本构建表" icon="ios-list" @click.native="factorsSample"></Button>
           <Button type="ghost" title="查看评估详情" icon="ios-search-strong" @click.native="checkSample"></Button>
           <Upload 
          :action="this.$host + 'Sample/upload/'"
          :show-upload-list="false"
          :on-success="upload"
          :data="uploadData"
          >
           <Button type="ghost" title="上传样本" icon="ios-cloud-upload" style="border-top:none;border-top-left-radius: 0;border-top-right-radius: 0;"></Button>
         </Upload>
        </ButtonGroup>
      </div>
      <div class="assessRight-content">
        <span class="spanTitle">评估结果</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border  :columns="cols" :data="rows" width="100%"></Table>
      </div>
    </div>
     <Modal
        title="评估详情"
        v-model="modalShow"
        width="800"
      >
      <!-- <pre>
         {{item4UrlData}}
      </pre> -->
     <Table stripe border :columns="columns1"  :data="data1"></Table>
      </Modal>
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
          align: "center",
          width: 100,
        },
         {
          title: "站名",
          key: "stationName",
          width: 100,
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
          width: 100,
          align: "center"
        },
        {
          title: "站名",
          key: "stationName",
          width: 100,
          align: "center"
        },
        {
          title: "晴雨准确率",
          key: "PC",
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
        }

      ],
      colsDiv: [
        {
          title: "站号",
          key: "stationNum",
          width: 100,
          align: "center"
        },
          {
          title: "站名",
          key: "stationName",
          width: 100,
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
      methodsVal: "", //存储选择的方法
      uploadData: {
        para: JSON.stringify({
          fileNames: ["predict.csv"]
        })
      },
      modalShow: false, //评估结果modal
      item4UrlData: "", //评估结果数据
      station: [
        {
          region: "mainCity",
          areaCode: "500106",
          stationCode: "57516",
          stationName: "沙坪坝",
          latitude: "29.58",
          longitude: "106.47",
          altitude: "26"
        },
        {
          region: "mainCity",
          areaCode: "500113",
          stationCode: "57518",
          stationName: "巴南",
          latitude: "29.34",
          longitude: "106.49",
          altitude: "51"
        },
        {
          region: "mainCity",
          areaCode: "500109",
          stationCode: "57511",
          stationName: "北碚",
          latitude: "29.85",
          longitude: "106.45",
          altitude: "24"
        },
        {
          region: "mainCity",
          areaCode: "500112",
          stationCode: "57513",
          stationName: "渝北",
          latitude: "29.73",
          longitude: "106.62",
          altitude: "46"
        },
        {
          region: "west",
          areaCode: "500223",
          stationCode: "57409",
          stationName: "潼南",
          latitude: "30.18",
          longitude: "105.8",
          altitude: "30"
        },
        {
          region: "west",
          areaCode: "500111",
          stationCode: "57502",
          stationName: "大足",
          latitude: "29.7",
          longitude: "105.7",
          altitude: "39"
        },
        {
          region: "west",
          areaCode: "500226",
          stationCode: "57505",
          stationName: "荣昌",
          latitude: "29.42",
          longitude: "105.58",
          altitude: "34"
        },
        {
          region: "west",
          areaCode: "500118",
          stationCode: "57506",
          stationName: "永川",
          latitude: "29.37",
          longitude: "105.9",
          altitude: "35"
        },
        {
          region: "west",
          areaCode: "500224",
          stationCode: "57510",
          stationName: "铜梁",
          latitude: "29.51",
          longitude: "106.04",
          altitude: "33"
        },
        {
          region: "west",
          areaCode: "500117",
          stationCode: "57512",
          stationName: "合川",
          latitude: "29.97",
          longitude: "106.28",
          altitude: "23"
        },
        {
          region: "west",
          areaCode: "500227",
          stationCode: "57514",
          stationName: "璧山",
          latitude: "29.58",
          longitude: "106.22",
          altitude: "33"
        },
        {
          region: "westSouth",
          areaCode: "500110",
          stationCode: "57509",
          stationName: "万盛",
          latitude: "28.95",
          longitude: "106.93",
          altitude: "33"
        },
        {
          region: "westSouth",
          areaCode: "500116",
          stationCode: "57517",
          stationName: "江津",
          latitude: "29.28",
          longitude: "106.25",
          altitude: "26"
        },
        {
          region: "westSouth",
          areaCode: "500119",
          stationCode: "57519",
          stationName: "南川",
          latitude: "29.16",
          longitude: "107.11",
          altitude: "70"
        },
        {
          region: "westSouth",
          areaCode: "500222",
          stationCode: "57612",
          stationName: "綦江",
          latitude: "29.02",
          longitude: "106.65",
          altitude: "47"
        },
        {
          region: "middle",
          areaCode: "500231",
          stationCode: "57425",
          stationName: "垫江",
          latitude: "30.33",
          longitude: "107.33",
          altitude: "43"
        },
        {
          region: "middle",
          areaCode: "500115",
          stationCode: "57520",
          stationName: "长寿",
          latitude: "29.83",
          longitude: "107.07",
          altitude: "38"
        },
        {
          region: "middle",
          areaCode: "500102",
          stationCode: "57522",
          stationName: "涪陵",
          latitude: "29.75",
          longitude: "107.42",
          altitude: "37"
        },
        {
          region: "middle",
          areaCode: "500230",
          stationCode: "57523",
          stationName: "丰都",
          latitude: "29.85",
          longitude: "107.73",
          altitude: "29"
        },
        {
          region: "eastSouth",
          areaCode: "500232",
          stationCode: "57525",
          stationName: "武隆",
          latitude: "29.32",
          longitude: "107.75",
          altitude: "28"
        },
        {
          region: "eastSouth",
          areaCode: "500114",
          stationCode: "57536",
          stationName: "黔江",
          latitude: "29.53",
          longitude: "108.78",
          altitude: "61"
        },
        {
          region: "eastSouth",
          areaCode: "500243",
          stationCode: "57537",
          stationName: "彭水",
          latitude: "29.3",
          longitude: "108.17",
          altitude: "32"
        },
        {
          region: "eastSouth",
          areaCode: "500242",
          stationCode: "57633",
          stationName: "酉阳",
          latitude: "28.82",
          longitude: "108.77",
          altitude: "83"
        },
        {
          region: "eastSouth",
          areaCode: "500241",
          stationCode: "57635",
          stationName: "秀山",
          latitude: "28.45",
          longitude: "108.98",
          altitude: "36"
        },
        {
          region: "eastSouth",
          areaCode: "500240",
          stationCode: "57438",
          stationName: "石柱",
          latitude: "29.98",
          longitude: "108.12",
          altitude: "63"
        },
        {
          region: "eastNorth",
          areaCode: "500229",
          stationCode: "57333",
          stationName: "城口",
          latitude: "31.95",
          longitude: "108.67",
          altitude: "80"
        },
        {
          region: "eastNorth",
          areaCode: "500234",
          stationCode: "57338",
          stationName: "开州",
          latitude: "31.18",
          longitude: "108.42",
          altitude: "22"
        },
        {
          region: "eastNorth",
          areaCode: "500235",
          stationCode: "57339",
          stationName: "云阳",
          latitude: "30.95",
          longitude: "108.68",
          altitude: "30"
        },
        {
          region: "eastNorth",
          areaCode: "500238",
          stationCode: "57345",
          stationName: "巫溪",
          latitude: "31.4",
          longitude: "109.62",
          altitude: "34"
        },
        {
          region: "eastNorth",
          areaCode: "500236",
          stationCode: "57348",
          stationName: "奉节",
          latitude: "31.02",
          longitude: "109.53",
          altitude: "30"
        },
        {
          region: "eastNorth",
          areaCode: "500237",
          stationCode: "57349",
          stationName: "巫山",
          latitude: "31.01",
          longitude: "109.87",
          altitude: "28"
        },
        {
          region: "eastNorth",
          areaCode: "500228",
          stationCode: "57426",
          stationName: "梁平",
          latitude: "30.68",
          longitude: "107.8",
          altitude: "45"
        },
        {
          region: "eastNorth",
          areaCode: "500101",
          stationCode: "57432",
          stationName: "万州",
          latitude: "30.77",
          longitude: "108.4",
          altitude: "19"
        },
        {
          region: "eastNorth",
          areaCode: "500233",
          stationCode: "57437",
          stationName: "忠县",
          latitude: "30.3",
          longitude: "108.03",
          altitude: "33"
        }
      ],
      columns1:[],//样本详情表格数据
      data1:[],//样本详情表格数据
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
    this.runData();
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
         this.station.forEach( item => {
          if(item.stationCode === key){
            a.stationName = item.stationName
          }
        })
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
        this.station.forEach( item => {
          if(item.stationCode === key){
            a.stationName = item.stationName
          }
        })
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
         this.station.forEach( item => {
          if(item.stationCode === key){
            a.stationName = item.stationName
          }
        })
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
    methodsHandle(index, val) {
      this.methods.index = index;
      this.methodsVal = val;
      this.runData();
    },
    //上传样本
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
          self.$Notice.success({
            title: "上传成功"
            // desc: nodesc ? '' : 'Here is the notification description. Here is the notification description. '
          });
        },
        error: function() {
          this.$Notice.error({
            title: "上传失败，请重新尝试"
            //desc: nodesc ? '' : 'Here is the notification description. Here is the notification description. '
          });
        }
      });
    },
    //查看评估详情
    checkSample() {
      let self = this;
      if (this.exportUrl !== "") {
        $.ajax({
          type: "POST",
          url: this.exportUrl,
          beforeSend: function(xhr) {
            //beforeSend定义全局变量
            xhr.overrideMimeType("text/plain;charset=gb18030");
          },
          success: function(data) {
            if (data) {
              
              self.columns1 = [];
              self.data1 = [];
              self.item4UrlData = data;
              let result = data.split('\n');
              let [rowOne] = result;
              rowOne.split(',').forEach( item => {
                self.columns1.push({
                   title: item,
                   key: item,
                   align: "center",
                   minWidth:100
                })
              })
              result.splice(0,1);
              result.splice(result.length-1,1);
              result.forEach( (opt) => {
                let a = {};
                let row = opt.split(',');
                row.forEach( (o,i) => {
                  a[rowOne.split(',')[i]] = o;
                })
                self.data1.push(a)
              })
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
    }
  },
  computed: {
    startTime() {
      // let startYear = this.$store.state.firstCache.yearStart;
      // let startMonth = this.$store.state.firstCache.timeFrameStart;
      return this.$store.state.firstCache.syStartTime;
    },
    endTime() {
      // let endYear = this.$store.state.firstCache.yearEnd;
      // let endMonth = this.$store.state.firstCache.timeFrameEnd;
      return this.$store.state.firstCache.syEndTime;
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
  right: -54px;
}
/* .assessRight-tools .ivu-upload {
  display: inline-block;
} */

.assessRight-tools button {
  font-size: 15px;
  color: #ffffff;
  
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
