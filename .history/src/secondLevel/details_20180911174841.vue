<template>
  <div>
    <div class="testDetails">
      <div class="testDetails_item">
        <!--基本信息-->
        <div v-if="getIsSave" style="float: left;position: fixed">
          <Button type="success" icon="folder" @click.native="saveDetails">保存</Button>
        </div>
        <div>
          <span class="spanTitle">基本信息</span>
          <div class="testDetails_item_content" style="position: relative">
            <strong>实验人员&nbsp:</strong><span>&nbsp{{userName}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验时间&nbsp:</strong><span>&nbsp{{nowTime}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验名称&nbsp:</strong>&nbsp<Input size="small"
                                                   placeholder="请输入实验名称"
                                                   style="width: 300px;display: inline-block;color: green"
                                                   v-model="testName"
                                                   :readonly="!getIsSave"
          />
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>是否公开本次实验详情&nbsp:</strong>&nbsp
            <RadioGroup v-model="radio">
              <Radio label="yes" :disabled="!getIsSave">是</Radio>
              <Radio label="no" :disabled="!getIsSave">否</Radio>
            </RadioGroup>
          </div>
          <!--样本信息-->
          <span class="spanTitle">样本信息</span>
          <div class="testDetails_item_content">
            <strong class="r">日期&nbsp:</strong><span>&nbsp{{testDate}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">站点&nbsp:</strong><span>&nbsp{{chooseStation}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">模式&nbsp:</strong><span>&nbsp{{type}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">预报量&nbsp:</strong><span>&nbsp{{predictionMsg}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r"> 起报时间&nbsp:</strong><span>&nbsp{{newspaper}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">预报时效&nbsp:</strong><span>&nbsp{{timeliness}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <div v-if="real.length">
              <strong class="r">观测因子&nbsp:</strong><span style="white-space:pre;">&nbsp{{real}}</span>
              <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            </div>
            <div v-if="nwp.length">
              <strong class="r">模式因子&nbsp:</strong><span style="white-space:pre;">&nbsp{{nwp}}</span>
              <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            </div>

          </div>
          <!--分析结果-->
          <span class="spanTitle">分析结果</span>
          <div class="testDetails_item_content">
            <Table border :columns="columns2" :data="data2" width="100%"></Table>
          </div>
           <!--评估结果-->
          <span class="spanTitle">评估结果</span>
           <div class="testDetails_item_content">
            <Table border :columns="getJypg.cols" :data="getJypg.row" width="100%"></Table>
          </div>
          <!--预报方案-->
          <span class="spanTitle">预报方案</span>
          <div class="testDetails_item_content">
            <strong>实验方法&nbsp:</strong><span>&nbsp{{captionMethod}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验方案&nbsp:</strong><span>&nbsp{{getCaption.label}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>建模样本&nbsp:</strong><span>&nbsp{{getTrainTime.trainStartYear +' 至 '+getTrainTime.trainEndYear}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验样本&nbsp:</strong><span>&nbsp{{getTrainTime.forecastStartYear +' 至 '+getTrainTime.forecastEndYear}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
          </div>
          <!--实验备注及核心代码-->
          <span class="spanTitle">实验备注及核心代码</span>
          <Input v-if="mark.length" :value="mark" type="textarea" :readonly="true" :rows="1"
                 style="width: 80%;margin: auto"/>
          <Input v-if="getPython.length" :value="getPython" type="textarea" :readonly="true" :rows="20"
                 style="width: 80%;margin-top: 10px"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import { Input ,Radio ,RadioGroup ,Table ,Button ,Message } from 'iview';

  export default {
    data(){
      return {
        radio: 'yes',
        testName: '',
        isSave: true
      }
    },
    components: {
      Input,
      Radio,
      RadioGroup,
      Table,
      Button,
      Message
    },
    created(){
      if (this.getTestName.length) {
        this.testName = this.getTestName;
      }
      console.log(this.columns2)
    },
    methods: {
      //保存实验详情
      saveDetails(){
        //判断是否输入实验名称
        if (this.testName == '') {
          return Message.warning({
            content: '请输入实验名称',
            duration: 8,
            closable: true
          })
        }
        //提交实验名称
        this.$store.commit('testName', this.testName);
        let flag = 0;
        if (this.radio == 'yes') {
          flag = 1
        }
        let param = {
          name: this.testName,
          dateTime: this.nowTime,
          testUser: this.userName,
          sampleStartYear: this.$store.state.firstCache.ycTimeStart.split('-')[0],
          sampleEndYear: this.$store.state.firstCache.ycTimeEnd.split('-')[0],
          sampleStartMonth: this.$store.state.firstCache.ycTimeStart.split('-')[1],
          sampleEndMonth: this.$store.state.firstCache.ycTimeEnd.split('-')[1],
          sampleStartDate: this.$store.state.firstCache.ycTimeStart.split('-')[2],
          sampleEndDate: this.$store.state.firstCache.ycTimeEnd.split('-')[2],
          forecastStationName: this.$store.state.firstCache.chooseStation,
          forecastElement: this.$store.state.firstCache.predictionMsg.value,
          forecastElementCaption: this.$store.state.firstCache.predictionMsg.caption,
          forecastHour: Number(this.$store.state.firstCache.newspaper[0]),
          forecastHourSpan: Number(this.$store.state.firstCache.timeliness[0]),
          typeNWP: this.$store.state.firstCache.type,
          cols: this.$store.state.firstCache.cols2,
          row: this.$store.state.firstCache.rows2,
          factorAll: [],
          selectFactorAll: [],
          importStation: [],
          factorNWPCaption: this.nwp,
          factorRealCaption: this.real,
          forecastMethodCaption: this.$store.state.firstCache.caption.label.split('_')[0],
          forecastSchemeName: this.$store.state.firstCache.caption.value,
          forecastSchemeCaption: this.$store.state.firstCache.caption.label,
          trainStartYear: this.$store.state.firstCache.trainTime.trainStartYear.split('-')[0],
          trainEndYear: this.$store.state.firstCache.trainTime.trainStartYear.split('-')[1],
          forecastStartYear: this.$store.state.firstCache.trainTime.forecastStartYear.split('-')[0],
          forecastEndYear: this.$store.state.firstCache.trainTime.forecastStartYear.split('-')[1],
          sourceCode: this.unicodePython,
          flag: flag,
          remark: this.mark.length ? this.encodeUnicode(this.mark) : ''
        };
        $.post('http://101.200.12.178:8090/OFTPService/services/Project/insertProject', {para: JSON.stringify(param)})
          .done(data => {
            if (data) {
              this.isSave = false;
              this.$store.commit('isSave',false);
              Message.success({
                content: '保存成功',
                duration: 8,
                closable: true
              });
              this.$router.push('/item5/Catalogue')
            }
          }).fail((a, b, c) => {
          Message.error({
            content: c,
            duration: 8,
            closable: true
          })
        })

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

      }
    },
    computed: {
      //获取保存按钮的状态
      getIsSave(){
        return this.$store.state.firstCache.isSave;
      },
      userName(){
        return this.$store.state.firstCache.userName;
      },
      //获取实验名称
      getTestName(){
        return this.$store.state.firstCache.testName;
      },
      nowTime(){
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
          month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
          strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + date.getMinutes()
          + seperator2 + date.getSeconds();
        return currentdate;
      },
      testDate(){
        let start = this.$store.state.firstCache.ycTimeStart;
        let end = this.$store.state.firstCache.ycTimeEnd;
        return start + ' 至 ' + end;

      },
      //获取站点
      chooseStation(){
        let station = this.$store.state.firstCache.chooseStation;
        let stationName = '';
        station.forEach(item => {
          stationName += item.stationName;
        });
        return stationName
      },
      //获取模式
      type(){
        return this.$store.state.firstCache.type[0];
      },
      //获取预报量
      predictionMsg(){
        return this.$store.state.firstCache.predictionMsg.caption;
      },
      //获取起报时间
      newspaper(){
        return this.$store.state.firstCache.newspaper[0] + '时'
      },
      //获取预报时效
      timeliness(){
        return this.$store.state.firstCache.timeliness[0] + '小时';
      },
      //获取选择的因子
      real(){
        let factors = this.$store.state.firstCache.chooseFactors;
        let real = '';
        factors.forEach(item => {
          if (item.type == 'real') {
            real += (item.value + '(' + item.hourSpan + ')  ')
          }
        });
        return real;
      },
      //获取选择的因子
      nwp(){
        let factors = this.$store.state.firstCache.chooseFactors;
        let nwp = '';
        factors.forEach(item => {
          if (item.type == 'nwp') {
            nwp += (item.value + '(' + item.hourSpan + ')  ')
          }
        });
        return nwp;
      },
      //获取表二因子相关系数数据
      columns2(){
        return this.$store.state.firstCache.cols2;
      },
      data2(){
        return this.$store.state.firstCache.rows2;
      },
      //获取预报方法备注
      mark(){
        return this.$store.state.firstCache.mark;
      },
      //获取核心代码
      getPython(){
        return this.$store.state.firstCache.pythonCode;
      },
      //获取预报方法
      getCaption(){
        return this.$store.state.firstCache.caption;
      },
      //处理预报方法
      captionMethod(){
        return this.getCaption.label.split('_')[0];
      },
      //获取建模样本时间
      getTrainTime(){
        return this.$store.state.firstCache.trainTime;
      },
      //unicode转码python代码
      unicodePython(){
        return this.encodeUnicode(this.$store.state.firstCache.pythonCode)
      },
      //获取检验评估结果
      getJypg(){
        return this.$store.state.firstCache.jypgdata;
      }

    }
  }
</script>
<style>
  h3 {
    font-size: 24px;
    margin: 20px 0 10px 0;
  }

  .testDetails_item_content {
    color: white;
    width: 80%;
    padding: 10px 100px;
    margin: 10px auto;
    text-align: left;
    font-size: 14px;
    background-color: rgba(33, 36, 43, .6);
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  }

  .testDetails_item .spanTitle {
    font-size: 16px;
    background: rgb(53, 53, 53);
    height: 37px;
    display: block;
    color: white;
    line-height: 36px;
    padding-left: 12px;
    text-align: left;
    width: 80%;
    margin: 10px auto;
  }

  .testDetails_item_content input {
    color: #1c2438;
    font-weight: bold;
  }

  .testDetails_item_content strong {
    color: #ff9900;
  }

  .testDetails_item .textarea.ivu-input {
    padding: 5px 9%;
  }
</style>
