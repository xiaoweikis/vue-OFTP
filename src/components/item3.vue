<template>
  <div class="objectiveForecast clearfix">
    <div class="forecastLeft">
      <toolbarItem title="方法:">
        <div class="methods" v-for="item,index in Methods" :key="index">
          <span>{{item.caption}}:</span>
          <Select style="width: 170px" @on-change.self="caption(item,$event)"
                  :value="getCaption.value"
                  :label-in-value="true">
            <Option 
            v-for="t,n in item.projects" 
            :value="t.name" 
            :key="n" 
            :label="t.caption"
            v-show="t.isshow"
            >{{t.caption}}</Option>
          </Select>
        </div>
      </toolbarItem>
      <toolbarItem title="样本选取:">
        <div class="ybTimeContainer">
          <span>建模样本</span>
          <DatePicker 
          type="date" 
          placeholder="Select date"
          style="width: 103px"
          :value="ycStartTime"
           @on-change="jmstartTime"
           ></DatePicker>
          至
           <DatePicker 
          type="date" 
          placeholder="Select date"
          style="width: 103px"
          @on-change="jmendTime"
          :value="ycEndTime"

           ></DatePicker>
        </div>
        <div class="ybTimeContainer">
          <span>实验样本</span>
          <DatePicker 
          type="date" 
          placeholder="Select date"
          style="width: 103px"
          :value="startTime"
          @on-change="syStartTime"
           ></DatePicker>
          至
          <DatePicker 
          type="date" 
          placeholder="Select date"
          style="width: 103px"
          :value="endTime"
          @on-change="syEndTime"
         ></DatePicker>
        </div>
        <Button type="success" :long="true" @click.native="modeling">建模实验</Button>
      </toolbarItem>
      <toolbarItem title="运行情况:" className="modeText" :autosize="true" >
        <Spin fix v-if="spin" size="small"></Spin>
        <Input 
        type="textarea" 
        v-model="modeing"  
        readonly 
        :autosize="{ minRows: 6.5 }"
         />
      </toolbarItem>
    </div>
    <div class="forecastRight">
      <div class="forecast-tools">
         <ButtonGroup vertical>
          <Button title="预报结果导出" type="ghost" icon="ios-cloud-download" @click.native="exportResult"></Button>
          <Button title="样本构建表" type="ghost" icon="ios-list" @click.native="factorsSample"></Button>
          <Button type="ghost" title="查看预报详情" icon="ios-search-strong" @click.native="checkSample"></Button>
           <Upload 
          :action="this.$host + 'Sample/upload/'"
          :show-upload-list="false"
          :on-success="upload"
          :data="uploadData"
          >
           <Button title="上传样本" type="ghost" icon="ios-cloud-upload" style="border-top:none;border-top-left-radius: 0;border-top-right-radius: 0;"></Button>
         </Upload>
         </ButtonGroup>
      </div>
      <div class="markBox">
        <h4 style="text-align: left;margin: 10px 0;color: #1c2438">备注信息</h4>
        <Input placeholder="Enter something..."
               v-model="mark" icon="edit"
               clearable style="width: 100%"
               @on-change="markChange"
        />
      </div>
      <div class="code">
        <Input :readonly="isReadonly" ref="code"
               v-model="pythonCode"
               type="textarea" :autofocus="!isReadonly"
               placeholder="Enter something..."
               :rows="25" style="width: 100%;"
               @on-blur="blurEvent"
        />
      </div>
      <div style="text-align: right;margin-top: 10px">
        <Button :type="this.isReadonly ? 'primary' :'success' " @click.native="editorialEvent" long>编辑</Button>
      </div>
    </div>
     <Modal
        title="预报详情"
        v-model="modalShow"
        width="1000"
        ok-text="关闭"
        cancel-text=""
      >
      <!-- <pre>
         {{item3UrlData}}
      </pre> -->
     <Table stripe border :columns="columns1"  :data="data1"></Table>
      </Modal>
  </div>
</template>
<script type="text/ecmascript-6">
import toolbarItem from "@/secondLevel/toolbarItem";
import {
  Select,
  Option,
  Input,
  ButtonGroup,
  Button,
  Message,
  Spin,
  Modal
} from "iview";
import myDatepicker from "vue-datepicker-simple/datepicker-2.vue";
export default {
  data() {
    return {
      Methods: null, //后台获取的方法数据
      methodsValue: "",
      pythonCode: "", //
      isReadonly: true, //编辑框是否只读
      mark: "", //备注信息
      modeing: "", //运行情况
      predictURL: "", //输出预测结果地址
      spin: false, //load组件

      d: "2017-12-31",
      uploadData: {
        para: JSON.stringify({
          fileNames: ["sample_selected.csv"]
        })
      },
      item3UrlData: "",
      modalShow: false,
      columns1:[],
      data1:[]
    };
  },
  components: {
    toolbarItem,
    Select,
    Option,
    myDatepicker,
    Input,
    ButtonGroup,
    Button,
    Message,
    Spin,
    Modal
  },
  beforeCreate() {},
  created() {
    //处理模型处理，在DOM加载之前
    $.post(this.$host + "Model/getModels").done(data => {
      let valid = [];
      $.post(this.$host + "Model/getModelList").done(data1 => {
        if (data1) {
          data1.forEach(item => {
            if (!item.valid) {
              valid.push(item.id);
            }
          });
          for (let i = 0; i < data.length; i++) {
            for (let y = 0; y < data[i].projects.length; y++) {
              if (valid.includes(data[i].projects[y].id)) {
                data[i].projects[y].isshow = false;
              } else {
                data[i].projects[y].isshow = true;
              }
            }
          }
          this.Methods = data;
        }
      });
    });
  },
  methods: {
    caption(a, b) {
      let c = Object.assign({}, b);
      c.name = a.name;
      this.$store.commit("caption", c);
      this.getPythonCode();
      return false;
    },
    //建模开始时间选择
    jmstartTime(e) {
      this.$store.commit("jmstartTime", e);
    },
    //建模结束时间选择
    jmendTime(e) {
      let date = this.addDate(e,1)
      this.$store.commit("syStartTime", date);
      this.$store.commit("jmendTime", e);

    },
    //实验开始时间选择
    syStartTime(e) {
      this.$store.commit("syStartTime", e);
    },
    //实验结束时间选择
    syEndTime(e) {
      this.$store.commit("syEndTime", e);
    },
    //python代码编辑框失去焦点事件
    blurEvent(ev) {
      if (ev.target.value !== this.initPythonCode) {
        Modal.confirm({
          title: "",
          content:
            "<p><strong>内容已改变</strong></p><p><strong>是否保存</strong></p>",
          okText: "保存",
          width: 300,
          onOk: () => {
            this.savePython();
          }
        });
      }
    },
    //备注改变信息
    markChange(e){
      this.$store.commit('mark',e)
    },
    //日期加减
    addDate(date, days) {
      var d = new Date(date);
      d.setDate(d.getDate() + days);
      var month = d.getMonth() + 1;
      var day = d.getDate();
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }
      var val = d.getFullYear() + "-" + month + "-" + day;
      return val;
    },
    //转码函数
    encodeUnicode(str) {
      if (str) {
        var res = [];
        for (var i = 0; i < str.length; i++) {
          res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
        }
        return "\\u" + res.join("\\u");
      } else {
        return "";
      }
    },
    //显示数据构建样本
    factorsSample() {
      this.$store.commit("modelIsShow", true);
    },
    //获取客观方法python源代码
    getPythonCode() {
      let a = {
        projName: this.getCaption.value
      };
      $.post(this.$host + "Model/read", {
        para: JSON.stringify(a)
      }).done(data => {
        let unicodeToString = this.decodeUnicode(data);
        this.pythonCode = unicodeToString;
        this.$store.commit("pythonCode", unicodeToString);
      });
    },
    //解码函数
    decodeUnicode(str) {
      if (str !== undefined) {
        str = str.replace(/(\\u)(\w{1,4})/gi, function($0) {
          return String.fromCharCode(
            parseInt(escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2"), 16)
          );
        });
        str = str.replace(/(&#x)(\w{1,4});/gi, function($0) {
          return String.fromCharCode(
            parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16)
          );
        });
        str = str.replace(/(&#)(\d{1,6});/gi, function($0) {
          return String.fromCharCode(
            parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2"))
          );
        });

        return str;
      }
    },
    //转unicode编码
    encodeUnicode(str) {
      var res = [];
      for (var i = 0; i < str.length; i++) {
        res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
      }
      return "\\u" + res.join("\\u");
    },
    //编辑按钮事件
    editorialEvent() {
      this.isReadonly = !this.isReadonly;
    },
    //上传文件
    upload(response, file, fileList) {
      let self = this;
      $.ajax({
        type: "POST",
        url: this.$hostIp + response,
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
    //保存事件
    savePython() {
      this.$store.commit("pythonCode", this.pythonCode);
      this.$store.commit("mark", this.mark);
      let a = {
        projName: this.getCaption.value,
        script: this.encodeUnicode(this.pythonCode)
      };
      $.post(this.$host + "Model/save", {
        para: JSON.stringify(a)
      })
        .done(data => {
          if (data) {
            Message.success({
              content: "保存成功",
              duration: 8,
              closable: true
            });
          }
        })
        .fail((a, b, c) => {
          Message.error({
            content: "保存失败" + c,
            duration: 8,
            closable: true
          });
        });
    },
    //开始建模实验
    modeling() {
      this.spin = !this.spin;
      let a = {
        trainStartYear: this.ycStartTime,
        trainEndYear: this.$store.state.firstCache.jmendTime,
        forecastStartYear: this.$store.state.firstCache.syStartTime,
        forecastEndYear: this.endTime
      };
      this.$store.commit("trainTime", a);
      $.post(this.$host + "Predict/predict", { para: JSON.stringify(a) })
        .done(data => {
          this.spin = !this.spin;
          if (data.url) {
            this.predictURL = this.$hostIp + data.url;
            this.$store.commit("item3Url", this.predictURL);
            if (data.content == "") {
              this.modeing = "NO CONTENT";
            } else {
              this.modeing = this.decodeUnicode(data.content);
            }

           let sample = this.$store.state.firstCache.sample;
           sample.forEach( item => {
             if(item.name === '建模时间'){
               item.information = this.ycStartTime+'至'+this.ycEndTime;
             }
             if(item.name === '预报时间'){
               item.information = this.startTime+'至'+this.endTime;
             }
           })
           this.$store.commit('sample',sample)
            Message.success({
              content: "建模实验完成",
              duration: 3,
              closable: true
            });
          } else {
            this.modeing = data;
          }
        })
        .fail(error => {
          Message.error({
            content: "建模实验失败" + error,
            duration: 8,
            closable: true
          });
        });
    },
    //客观预报结果导出
    exportResult() {
      if (this.item3Url !== "") {
        let url = this.item3Url;
        this.$local.download(url, "预测结果");
      } else {
        Message.warning({
          content: "请先进行建模实验",
          duration: 8,
          closable: true
        });
      }
    },
    checkSample() {
      let self = this;
      if (this.item3Url !== "") {
        $.ajax({
          type: "POST",
          url: this.item3Url,
          beforeSend: function(xhr) {
            //beforeSend定义全局变量
            xhr.overrideMimeType("text/plain;charset=gb18030");
          },
          success: function(data) {
            if (data) {
              self.item3UrlData = data;
              if (data.split("\n").length > 1000) {
                Modal.confirm({
                  title: "提醒",
                  okText: "下载",
                  cancelText: "继续打开",
                  content: `
                    <p style="font-size:16px">样本量太大，加载等待时间较长，建议下载到本地查看.</p>
                  `,
                  onCancel: function() {
                    self.item3UrlData = data;
                    self.makeUpDataclos();
                    self.makeUpDatarows();
                    self.modalShow = true;
                  },
                  onOk: function() {
                    self.exportResult();
                  }
                });
              } else {
                self.item1UrlData = data;
                self.makeUpDataclos();
                self.makeUpDatarows();
                self.modalShow = true;
              }
              

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
   
    //解码函数
    decodeUnicode(str) {
      str = str.replace(/(\\u)(\w{1,4})/gi, function($0) {
        return String.fromCharCode(
          parseInt(escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2"), 16)
        );
      });
      str = str.replace(/(&#x)(\w{1,4});/gi, function($0) {
        return String.fromCharCode(
          parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16)
        );
      });
      str = str.replace(/(&#)(\d{1,6});/gi, function($0) {
        return String.fromCharCode(
          parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2"))
        );
      });

      return str;
    },
     makeUpDataclos(){
      let data = this.item3UrlData;
      let rows = [];
      if(data){
        let [rowOne] = data.split('\n');
        rowOne.split(',').forEach( item => {
          rows.push({
              title: item,
              key: item,
              align: "center"
            });
        })
        this.columns1 = rows;
      }
    },
     //处理上传数据
    makeUpDatarows(){
      let data = this.item3UrlData.split('\n');
      let [rowOne] = data;
      if(data){
        data.splice(0,1);
        data.splice(data.length - 1, 1);
        data.forEach( item => {
          let a = {};
          let row = item.split(',');
          row.forEach( (o,i) => {
           if(o.toString().split(".")[1] &&o.toString().split(".")[1].length>4){
              o = Number(o).toFixed(2)
            }
            a[rowOne.split(',')[i]] = o;
            })
          this.data1.push(a)
        })
        
      }
     
     
    },
  },
  computed: {
   
    getYxMethods() {
      return this.$store.state.firstCache.ycMethod;
    },
    //建模开始时间
    ycStartTime() {
      let Y = this.$store.state.firstCache.yearStart;
      let S = this.$store.state.firstCache.timeFrameStart;
      return Y +'-'+ S
    },
    //建模结束时间
    ycEndTime() {
      return this.$store.state.firstCache.jmendTime;
      // let day = parseInt(this.getDays * 0.7);
      // let time = this.addDate(this.ycStartTime, day);
      // return time;
    },
    //实验样本开始时间
    startTime() {
      //let time = this.addDate(this.ycEndTime, 1);
      return this.$store.state.firstCache.syStartTime;
      //return time;
    },
    endTime() {
       let Y = this.$store.state.firstCache.yearEnd;
      let S = this.$store.state.firstCache.timeFrameEnd;
      return Y +'-'+ S
    },
    //开始日期减去结束日期得到天数，按8 2比例分配
    getDays() {
      var sArr = this.ycStartTime.split("-");
      var eArr = this.endTime.split("-");
      var sRDate = new Date(sArr[0], sArr[1], sArr[2]);
      var eRDate = new Date(eArr[0], eArr[1], eArr[2]);
      var days = (eRDate - sRDate) / (24 * 60 * 60 * 1000);
      return days;
    },
    //从VueX中获取选择的客观预报方法,初始化选择数据
    getCaption() {
      return this.$store.state.firstCache.caption;
    },
    //初始化客观预报方法phtyon代码
    initPythonCode() {
      return this.$store.state.firstCache.pythonCode;
    },
    //初始化mark信息
    initMark() {
      return this.$store.state.firstCache.mark;
    },
    //获取预报值
    item3Url() {
      return this.$store.state.firstCache.item3Url;
    },
    //过滤模型方法数据
    newMehtods() {
      let valid = [];
      $.post(this.$host + "Model/getModelList").done(data => {
        if (data) {
          data.forEach(item => {
            if (!item.valid) {
              valid.push(item.id);
            }
          });
          this.Methods.forEach((opt, index, arr) => {
            opt.projects.forEach((p, i, a) => {
              if (valid.includes(p.id)) {
                a.splice(i, 1);
              }
            });
          });
          return this.Methods;
        }
      });
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.pythonCode = this.initPythonCode;
      this.mark = this.initMark;
    });
  }
};
</script>
<style>
.forecastLeft {
  width: 342px;
  height: 100%;
  padding: 10px;
  color: white;
  float: left;
}

.forecastRight {
  width: calc(100% - 342px);
  height: 100%;
  color: white;
  float: left;
  padding: 10px;
}
.forecastLeft .ivu-select-dropdown {
  color: #2c3e50;
}
.forecastRight input,
textarea.ivu-input {
  text-align: left;
}
.methods {
  height: 50px;
  line-height: 50px;
  text-align: center;
  margin-top: 5px;
}

.methods span {
  display: inline-block;
  width: 106px;
}

.methods .ivu-select-selected-value {
  padding-right: 0;
  width: 140px;
}

.ybTimeContainer {
  margin: 15px 0;
}

.ybTimeContainer .vue-datepicker {
  display: inline-block;
}

/* .ybTimeContainer #jmStart, #xyEnd {
    pointer-events: none;
  } */

.ybTimeContainer #jmStart,
#jmEnd,
#syStart,
#xyEnd {
  width: 105px;
  border: solid 1px #9ac3f3;
  border-radius: 4px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  text-align: center;
  padding-left: 0;
}

.objectiveForecast .forecastLeft .vue-datepicker .vue-datepicker-panels {
  width: auto;
  left: -42px;
}

.forecast-tools {
  /* height: 80px;
  line-height: 80px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%; */
  position: absolute;
  z-index: 9;
  right: -54px;
}

.forecast-tools button {
  font-size: 15px;
  color: #ffffff;
  
}

.code {
  max-height: calc(100% - 173px);
  margin-top: 15px;
}

.markBox h3 {
}
.modeText .project-content {
  position: relative;
}
.ivu-upload {
  display: inline-block;
}
</style>
