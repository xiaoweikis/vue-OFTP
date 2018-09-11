<template>
  <div class="objectiveForecast clearfix">
    <div class="forecastLeft">
      <toolbarItem title="方法:">
        <div class="methods" v-for="item,index in Methods" :key="index">
          <span>{{item.caption}}:</span>
          <Select style="width: 170px" @on-change.self="caption"
                  :value="getCaption.value"
                  :label-in-value="true">
            <Option v-for="t,n in item.projects" :value="t.name" :key="n" :label="t.caption">{{t.caption}}</Option>
          </Select>
        </div>
      </toolbarItem>
      <toolbarItem title="样本选取:">
        <div class="ybTimeContainer">
          <span>建模样本</span>
          <myDatepicker
            field="jmStart"
            :value.sync="ycStartTime"
          >
          </myDatepicker>
          至
          <myDatepicker
            field="jmEnd"
            :value.sync="ycEndTime"
          ></myDatepicker>
        </div>
        <div class="ybTimeContainer">
          <span>实验样本</span>
          <myDatepicker
            field="syStart"
            :value.sync="syStartTime"
          >
          </myDatepicker>
          至
          <myDatepicker
            field="xyEnd"
            :value.sync="endTime"
          ></myDatepicker>
        </div>
        <Button type="success" :long="true" @click.native="modeling">建模实验</Button>
      </toolbarItem>
      <toolbarItem title="运行情况:" className="modeText" :autosize="true" >
        <Spin fix v-if="spin" size="small"></Spin>
        <Input type="textarea" v-model="modeing" />
      </toolbarItem>
    </div>
    <div class="forecastRight">
      <div class="forecast-tools">
        <ButtonGroup size="large">
          <Button type="ghost" icon="ios-cloud-upload-outline">上传样本</Button>
          <Button type="ghost" icon="ios-cloud-download-outline" @click.native="exportResult">分析结果导出</Button>
          <Button type="ghost" icon="ios-list-outline" @click.native="factorsSample">显示样本构建表</Button>
        </ButtonGroup>
      </div>
      <div class="markBox">
        <h4 style="text-align: left;margin: 10px 0;color: #1c2438">备注信息</h4>
        <Input placeholder="Enter something..."
               v-model="mark" icon="edit"
               clearable style="width: 100%"
               @on-blur="blurEvent"
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
        <Button type="success" @click.native="editorialEvent" long>编辑</Button>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import toolbarItem from '@/secondLevel/toolbarItem';
  import { Select , Option ,Input ,ButtonGroup ,Button,Message,Spin,Modal } from 'iview';
  import myDatepicker from 'vue-datepicker-simple/datepicker-2.vue';
  export default{
    data(){
      return {
        Methods: null,//后台获取的方法数据
        methodsValue: '',
        pythonCode:'',//
        isReadonly: true,//编辑框是否只读
        mark: '',//备注信息
        modeing: '',//运行情况
        predictURL: '',//输出预测结果地址
        spin:false//load组件
      }
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
    beforeCreate(){
      if(!this.$store.state.firstCache.commitFactors){
        Message.warning({
          content: '请在因子分析页面提交所选因子',
          duration: 8,
          closable: true
        });
      }
    },
    created(){
      this.Methods = this.getYxMethods;

    },
    methods: {
      caption(a){
        let b = null;
        b = a;
        this.$store.commit('caption', b);
        this.getPythonCode();
        return false;
      },
      //python代码编辑框失去焦点事件
      blurEvent(ev){
        if(ev.target.value !== this.initPythonCode){
          Modal.confirm({
            title: '',
            content: '<p><strong>内容已改变</strong></p><p><strong>是否保存</strong></p>',
            okText:'保存',
            width:300,
            onOk: () => {
              this.savePython()
            }
          });
        }
      },
      //日期加减
      addDate(date, days){
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
            res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
          }
          return "\\u" + res.join("\\u");
        } else {
          return ''
        }

      },
      //显示数据构建样本
      factorsSample(){
        this.$store.commit('modelIsShow', true);
      },
      //获取客观方法python源代码
      getPythonCode(){
        let a = {
          projName: this.getCaption.value
        };
        $.post('http://101.200.12.178:8090/OFTPService/services/Model/read', {para: JSON.stringify(a)})
          .done(data => {
            let unicodeToString = this.decodeUnicode(data);
            this.pythonCode = unicodeToString;
            this.$store.commit('pythonCode', unicodeToString)
          })
      },
      //解码函数
      decodeUnicode(str) {
        if (str !== undefined) {
          str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
            return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
          });
          str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
            return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
          });
          str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
            return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
          });

          return str;
        }

      },
      //转unicode编码
      encodeUnicode(str) {
        var res = [];
        for (var i = 0; i < str.length; i++) {
          res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
        }
        return "\\u" + res.join("\\u");
      },
      //编辑按钮事件
      editorialEvent(){
        this.isReadonly = !this.isReadonly;
      },
      //保存事件
      savePython(){
        this.$store.commit('pythonCode', this.pythonCode);
        this.$store.commit('mark', this.mark);
        let a = {
          projName: this.getCaption.value,
          script:this.encodeUnicode(this.pythonCode)
        };
        $.post('http://101.200.12.178:8090/OFTPService/services/Model/save',{para:JSON.stringify(a)})
        .done( data => {
          if(data){
            Message.success({
              content: '保存成功',
              duration: 8,
              closable: true
            });
          }
        }).fail((a,b,c) =>{
          Message.error({
            content: '保存失败' + c,
            duration: 8,
            closable: true
          })
        })
      },
      //开始建模实验
      modeling(){
        this.spin = !this.spin;
        let a = {
          trainStartYear: this.ycStartTime,
          trainEndYear: this.ycEndTime,
          forecastStartYear: this.syStartTime,
          forecastEndYear: this.endTime
        };
        this.$store.commit('trainTime',a);
        $.post('http://101.200.12.178:8090/OFTPService/services/Predict/predict', {para: JSON.stringify(a)})
          .done(data => {
            this.spin = !this.spin;
            if (data.url) {
               this.predictURL = 'http://101.200.12.178:8090'+data.url;
              if(data.content == ""){
                this.modeing = 'NO CONTENT'
              }else {
                this.modeing = data.content;
              }
              Message.error({
              content: '建模实验失败'+error,
              duration: 8,
              closable: true
            })
            }else {
              this.modeing = data
            }

          })
          .fail(error => {
            Message.error({
              content: '建模实验失败'+error,
              duration: 8,
              closable: true
            })
          })
      },
      //客观预报结果导出
      exportResult(){
        if (this.predictURL !== '') {
          let url = this.predictURL;
          this.$local.download(url, '预测结果');
        } else {
          Message.warning({
            content: '请先进行建模实验',
            duration: 8,
            closable: true
          });
        }
      }

    },
    computed: {
      //计算初始化的预测方法
      initCaptionValue(){

      },
      getYxMethods()
      {
        return this.$store.state.firstCache.ycMethod;
      }
      ,
      //建模开始时间
      ycStartTime()
      {
        return this.$store.state.firstCache.ycTimeStart;
      }
      ,
      //建模结束时间
      ycEndTime()
      {
        let day = parseInt(this.getDays * 0.7);
        let time = this.addDate(this.ycStartTime, day);
        return time;
      }
      ,
      //实验样本开始时间
      syStartTime()
      {
        let time = this.addDate(this.ycEndTime, 1);
        return time;
      }
      ,
      endTime()
      {
        return this.$store.state.firstCache.ycTimeEnd;
      }
      ,
      //开始日期减去结束日期得到天数，按8 2比例分配
      getDays()
      {
        var sArr = this.ycStartTime.split("-");
        var eArr = this.endTime.split("-");
        var sRDate = new Date(sArr[0], sArr[1], sArr[2]);
        var eRDate = new Date(eArr[0], eArr[1], eArr[2]);
        var days = (eRDate - sRDate) / (24 * 60 * 60 * 1000);
        return days
      }
      ,
      //从VueX中获取选择的客观预报方法,初始化选择数据
      getCaption()
      {
        return this.$store.state.firstCache.caption;
      },
      //初始化客观预报方法phtyon代码
      initPythonCode(){
        return this.$store.state.firstCache.pythonCode;
      },
      //初始化mark信息
      initMark(){
        return this.$store.state.firstCache.mark;
      }
    },
    mounted: function () {
      this.$nextTick(()=> {
        this.pythonCode = this.initPythonCode;
        this.mark = this.initMark;
      });
    }
  }
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
  .forecastRight input ,textarea.ivu-input{
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

  .ybTimeContainer #jmStart, #xyEnd {
    pointer-events: none;
  }

  .ybTimeContainer #jmStart, #jmEnd, #syStart, #xyEnd {
    width: 105px;
    border: solid 1px #9ac3f3;
    border-radius: 4px;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
    text-align: center;
    padding-left: 0;
  }

  .objectiveForecast .forecastLeft .vue-datepicker .vue-datepicker-panels {
    width: auto;
    left: -42px;
  }

  .forecast-tools {
    height: 80px;
    line-height: 80px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    width: 100%;
  }

  .forecast-tools button {
    font-size: 15px;
    color: #495060;
    background: rgba(255, 255, 255, .4);
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
</style>
