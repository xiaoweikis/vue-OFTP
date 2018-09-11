<template>
  <div class="leftToolbar-body">
    <!--年份选择-->
    <toolbarItem title="年份:" :startTime="yearStart" :endTime="yearEnd" ></toolbarItem>
    <!--时段选择-->
    <toolbarItem title="时段:">
      <div class="datePick">
        <label for="myDate1">开始&nbsp</label>
        <myDatepicker
          field="myDate1"
          v-model="date1"
          format="mm-dd"
          :backward="false"
          :no-today="true"
          :forward="false"
          @click.native ="timeFrameS"
        >

        </myDatepicker>
      </div>
      <div class="datePick">
        <label for="myDate2">结束&nbsp</label>
        <myDatepicker
          field="myDate2"
          v-model="date2"
          format="mm-dd"
          :backward="false"
          :no-today="true"
          :forward="false"
          @click.native="timeFrameE"
          ref="FrameE"
        >
        </myDatepicker>
      </div>
    </toolbarItem>
    <!--站点选择-->
    <toolbarItem title="站点:">
      <div class="chooseStation">
        <vueBtn v-for="m,k,d in initstationcode" :btnText="m.stationName" :key="d" btnType="warning"></vueBtn>
      </div>
      <div class="chooseBtn">
        <vueBtn btnText="选择" btnType="info" @click.native="modalIsShow"></vueBtn>
      </div>
    </toolbarItem>
    <!--模式选择-->
    <toolbarItem title="模式:"  className="model">
      <vueBtn btnText="EC" :btnType="initType == 'EC' ? 'warning' : 'info' "  value="EC" @click.native="isRadio"></vueBtn>
      <vueBtn btnText="GRAPES" :btnType="initType == 'GRAPES' ? 'warning' : 'info'" value="GRAPES" @click.native="isRadio"></vueBtn>
      <vueBtn btnText="WRF" :btnType="initType == 'WRF' ? 'warning' : 'info'" value="WRF" @click.native="isRadio"></vueBtn>
    </toolbarItem>
    <!--预报量选择-->
    <toolbarItem title="预报量:"  className="select">
      <Select clearable  style="width:200px;margin: 10px 0" @on-change="prediction" :value="initPrediction" ref="ybl" :label-in-value="true">
        <Option  v-for="a in Real" :value="a.value" :key="a.value" :label="a.caption"></Option>
      </Select>
    </toolbarItem>
    <!--预报时效-->
    <toolbarItem title="预报时效:"  className="timeliness" >
      <Select clearable  style="width:200px;margin: 10px 0" @on-change="timeliness" :value="initTimeliness" ref="ybxs">
        <Option v-for="Span in hourSpan" :value="Span" :key="Span">{{ Span }}小时</Option>
      </Select>
    </toolbarItem>
    <!--起报时间-->
    <toolbarItem title="起报时间:" className="stTime">
      <vueBtn  btnText="08"  :btnType="initNewspaper == '08' ? 'warning' : 'info'" @click.native="newspaper" value="08"></vueBtn>
      <vueBtn  btnText="20"  :btnType="initNewspaper == '20' ? 'warning' : 'info'" @click.native="newspaper" value="20"></vueBtn>
    </toolbarItem>
    <!--模态框组件 站点选择-->
    <modal title="Fade Modal" effect="zoom" width="1000" :show.sync="isShow" :backdrop="false">
      <div slot="modal-header" class="modal-header">
        <h4 class="modal-title" style="text-align: left;color:black">
          站点选择
        </h4>
      </div>
      <div slot="modal-body" class="modal-body">
        <div class="stationName">
          <vueBtn v-for="item,index in stationCode.station"
                  :btnText="item.stationName"
                  :key="index"
                  :data-stationCode="item.stationCode"
                  :data-region="item.region"
                  btn-type="default"
                  @click.native="checkboxHandle"
          >

          </vueBtn>
        </div>
        <div class="stationArea">
          <vueBtn v-for="a,b in stationCode.region"
                  :btn-text="a.name"
                  :key="b"
                  btn-type="info"
                  :data-id="a.id"
                  @click.native="areaHandle"
          >

          </vueBtn>
        </div>
        <div class="chooseCtr">
          <vueBtn btn-text="全选" btn-type="info" @click.native="allSelection"></vueBtn>
          <vueBtn btn-text="反选" btn-type="info" @click.native="InvertSelection"></vueBtn>
          <vueBtn btn-text="全不选" btn-type="info" @click.native="allNotSelection"></vueBtn>
        </div>
      </div>
      <div slot="modal-footer" class="modal-footer">
        <button type="button" class="btn btn-warning" @click="allNotSelection">重置</button>
        <button type="button" class="btn btn-success" @click="saveChooseStation">确定</button>
      </div>
    </modal>

  </div>
</template>
<script type="text/ecmascript-6">
  import toolbarItem from '@/secondLevel/toolbarItem';
  import myDatepicker from 'vue-datepicker-simple/datepicker-2.vue';
  import vueBtn from '@/secondLevel/BUTTON';
  import modal from 'vue-strap/src/modal';
  import alert from 'vue-strap/src/alert';
  import $ from 'jquery';
  import { Select , Option } from 'iview';
  import 'iview/dist/styles/iview.css';
  import axios from 'axios';

  Date.prototype.format = function (fmt) {
    var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  };

  export default {
    name: 'tool',
    data (){
      return {
        date1: '',
        date2: '',
        isShow: false,
        default: 'default',
        chooseStation: [],
        chooseStationText: [],
        coms: [],
        Real: [],
        hourSpan: '',
        stationCode:{
          region: [{
            id: 'mainCity',
            name: '主城',
            stations: ['57511', '57513', '57516', '57518']
          }, {
            id: 'west',
            name: '西部',
            stations: ['57409', '57512', '57510', '57502', '57514', '57505', '57506']
          }, {
            id: 'westSouth',
            name: '西南',
            stations: ['57517', '57612', '57509', '57519']
          }, {
            id: 'middle',
            name: '中部',
            stations: ['57520', '57522', '57523', '57425']
          }, {
            id: 'eastSouth',
            name: '东南',
            stations: ['57525', '57635', '57633', '57537', '57536', '57438']
          }, {
            id: 'eastNorth',
            name: '东北',
            stations: ['57437', '57426', '57432', '57339', '57338', '57348', '57349', '57345', '57333', '57431']
          }],
          station: [{
            region: 'mainCity',
            areaCode: '500106',
            stationCode: '57516',
            stationName: '沙坪坝',
            latitude: '29.58',
            longitude: '106.47',
            altitude: '26'
          }, {
            region: 'mainCity',
            areaCode: '500113',
            stationCode: '57518',
            stationName: '巴南',
            latitude: '29.34',
            longitude: '106.49',
            altitude: '51'
          }, {
            region: 'mainCity',
            areaCode: '500109',
            stationCode: '57511',
            stationName: '北碚',
            latitude: '29.85',
            longitude: '106.45',
            altitude: '24'
          }, {
            region: 'mainCity',
            areaCode: '500112',
            stationCode: '57513',
            stationName: '渝北',
            latitude: '29.73',
            longitude: '106.62',
            altitude: '46'
          }, {
            region: 'west',
            areaCode: '500223',
            stationCode: '57409',
            stationName: '潼南',
            latitude: '30.18',
            longitude: '105.8',
            altitude: '30'
          }, {
            region: 'west',
            areaCode: '500111',
            stationCode: '57502',
            stationName: '大足',
            latitude: '29.7',
            longitude: '105.7',
            altitude: '39'
          }, {
            region: 'west',
            areaCode: '500226',
            stationCode: '57505',
            stationName: '荣昌',
            latitude: '29.42',
            longitude: '105.58',
            altitude: '34'
          }, {
            region: 'west',
            areaCode: '500118',
            stationCode: '57506',
            stationName: '永川',
            latitude: '29.37',
            longitude: '105.9',
            altitude: '35'
          }, {
            region: 'west',
            areaCode: '500224',
            stationCode: '57510',
            stationName: '铜梁',
            latitude: '29.51',
            longitude: '106.04',
            altitude: '33'
          }, {
            region: 'west',
            areaCode: '500117',
            stationCode: '57512',
            stationName: '合川',
            latitude: '29.97',
            longitude: '106.28',
            altitude: '23'
          }, {
            region: 'west',
            areaCode: '500227',
            stationCode: '57514',
            stationName: '璧山',
            latitude: '29.58',
            longitude: '106.22',
            altitude: '33'
          }, {
            region: 'westSouth',
            areaCode: '500110',
            stationCode: '57509',
            stationName: '万盛',
            latitude: '28.95',
            longitude: '106.93',
            altitude: '33'
          }, {
            region: 'westSouth',
            areaCode: '500116',
            stationCode: '57517',
            stationName: '江津',
            latitude: '29.28',
            longitude: '106.25',
            altitude: '26'
          }, {
            region: 'westSouth',
            areaCode: '500119',
            stationCode: '57519',
            stationName: '南川',
            latitude: '29.16',
            longitude: '107.11',
            altitude: '70'
          }, {
            region: 'westSouth',
            areaCode: '500222',
            stationCode: '57612',
            stationName: '綦江',
            latitude: '29.02',
            longitude: '106.65',
            altitude: '47'
          }, {
            region: 'middle',
            areaCode: '500231',
            stationCode: '57425',
            stationName: '垫江',
            latitude: '30.33',
            longitude: '107.33',
            altitude: '43'
          }, {
            region: 'middle',
            areaCode: '500115',
            stationCode: '57520',
            stationName: '长寿',
            latitude: '29.83',
            longitude: '107.07',
            altitude: '38'
          }, {
            region: 'middle',
            areaCode: '500102',
            stationCode: '57522',
            stationName: '涪陵',
            latitude: '29.75',
            longitude: '107.42',
            altitude: '37'
          }, {
            region: 'middle',
            areaCode: '500230',
            stationCode: '57523',
            stationName: '丰都',
            latitude: '29.85',
            longitude: '107.73',
            altitude: '29'
          }, {
            region: 'eastSouth',
            areaCode: '500232',
            stationCode: '57525',
            stationName: '武隆',
            latitude: '29.32',
            longitude: '107.75',
            altitude: '28'
          }, {
            region: 'eastSouth',
            areaCode: '500114',
            stationCode: '57536',
            stationName: '黔江',
            latitude: '29.53',
            longitude: '108.78',
            altitude: '61'
          }, {
            region: 'eastSouth',
            areaCode: '500243',
            stationCode: '57537',
            stationName: '彭水',
            latitude: '29.3',
            longitude: '108.17',
            altitude: '32'
          }, {
            region: 'eastSouth',
            areaCode: '500242',
            stationCode: '57633',
            stationName: '酉阳',
            latitude: '28.82',
            longitude: '108.77',
            altitude: '83'
          }, {
            region: 'eastSouth',
            areaCode: '500241',
            stationCode: '57635',
            stationName: '秀山',
            latitude: '28.45',
            longitude: '108.98',
            altitude: '36'
          }, {
            region: 'eastSouth',
            areaCode: '500240',
            stationCode: '57438',
            stationName: '石柱',
            latitude: '29.98',
            longitude: '108.12',
            altitude: '63'
          }, {
            region: 'eastNorth',
            areaCode: '500229',
            stationCode: '57333',
            stationName: '城口',
            latitude: '31.95',
            longitude: '108.67',
            altitude: '80'
          }, {
            region: 'eastNorth',
            areaCode: '500234',
            stationCode: '57338',
            stationName: '开州',
            latitude: '31.18',
            longitude: '108.42',
            altitude: '22'
          }, {
            region: 'eastNorth',
            areaCode: '500235',
            stationCode: '57339',
            stationName: '云阳',
            latitude: '30.95',
            longitude: '108.68',
            altitude: '30'
          }, {
            region: 'eastNorth',
            areaCode: '500238',
            stationCode: '57345',
            stationName: '巫溪',
            latitude: '31.4',
            longitude: '109.62',
            altitude: '34'
          }, {
            region: 'eastNorth',
            areaCode: '500236',
            stationCode: '57348',
            stationName: '奉节',
            latitude: '31.02',
            longitude: '109.53',
            altitude: '30'
          }, {
            region: 'eastNorth',
            areaCode: '500237',
            stationCode: '57349',
            stationName: '巫山',
            latitude: '31.01',
            longitude: '109.87',
            altitude: '28'
          }, {
            region: 'eastNorth',
            areaCode: '500228',
            stationCode: '57426',
            stationName: '梁平',
            latitude: '30.68',
            longitude: '107.8',
            altitude: '45'
          }, {
            region: 'eastNorth',
            areaCode: '500101',
            stationCode: '57432',
            stationName: '万州',
            latitude: '30.77',
            longitude: '108.4',
            altitude: '19'
          }, {
            region: 'eastNorth',
            areaCode: '500233',
            stationCode: '57437',
            stationName: '忠县',
            latitude: '30.3',
            longitude: '108.03',
            altitude: '33'
          }]
        }
      }
    },
    components: {
      toolbarItem,
      myDatepicker,
      vueBtn,
      modal,
      alert,
      Select,
      Option
    },
    watch: {

    },
    methods: {
      timer(){
        this.date2 = this.$store.state.firstCache.timeFrameEnd;//当前时间
        this.date1 = this.$store.state.firstCache.timeFrameStart;//获取当前时间前一天
      },
      modalIsShow(){
        this.isShow = true;
        let Btn = $('.stationName button');
        let i = 0;
        while (Btn[i])
        {
          if(this.chooseStation.includes(Number($(Btn[i]).data('stationcode'))))
          {
            $(Btn[i]).removeClass('btn-default').addClass('btn-danger');
          }
          i++;
        }
      },
      //站点多选按钮
      checkboxHandle(ev){
        let stationcode = $(ev.target).data('stationcode');
        if (ev.target.className.indexOf('btn-danger') == -1) {
          ev.target.className = 'btn btn-danger';
          if (!this.chooseStation.includes(stationcode)) {
            this.chooseStation.push(stationcode);
            this.pushStationText();
          }
        } else {
          ev.target.className = 'btn btn-default';
          let index = this.chooseStation.indexOf(stationcode);
          if (index > -1) {
            this.chooseStation.splice(index, 1);
            this.pushStationText();
          }
        }
        this.isAll();
      },
      //城市区域选择
      areaHandle(ev){
        let self = $(ev.target);
        let id = self.data('id');
        let station = $('.stationName button');
        if (ev.target.className.indexOf('btn-danger') == -1) {
          ev.target.className = 'btn btn-danger';
          for (let i = 0; i < station.length; i++) {
            let region = $(station[i]).data('region');
            if (id === region) {
              let areaCode = $(station[i]).data('stationcode');
              $(station[i]).removeClass('btn-default').addClass('btn-danger');
              if (!this.chooseStation.includes(areaCode)) {
                this.chooseStation.push(areaCode);
                this.pushStationText();
              }
            }
          }
        } else {
          ev.target.className = 'btn btn-info';
          for (let i = 0; i < station.length; i++) {
            let region = $(station[i]).data('region');
            if (id === region) {
              $(station[i]).removeClass('btn-danger').addClass('btn-default');
              let areaCode = $(station[i]).data('stationcode');
              let index = this.chooseStation.indexOf(areaCode);
              if( index > -1 ){
                this.chooseStation.splice(index,1)
                this.pushStationText();
              }
            }
          }
        }
      },
      //全选按钮
      allSelection(){
        let station = $('.stationName button');
        let stationArea = $('.stationArea button');
        let i = 0,
            n = 0;
        while (station[i]) {
          let areaCode = Number($(station[i]).data('stationcode'));
          $(station[i]).removeClass('btn-default').addClass('btn-danger');
          if (!this.chooseStation.includes(areaCode)) {
            this.chooseStation.push(areaCode);
            this.pushStationText();
          }
          i++;
        }
        while (stationArea[n]) {
          $(stationArea[n]).removeClass('btn-default').addClass('btn-danger');
          n++;
        }
        this.isAll();
      },
      //反选按钮
      InvertSelection(){
        let station = $('.stationName button');
        let i = 0;
        while (station[i]) {
          let areaCode = Number($(station[i]).data('stationcode'));
          if ($(station[i]).hasClass('btn-danger')) {
            $(station[i]).removeClass('btn-danger').addClass('btn-default');
            let index = this.chooseStation.indexOf(areaCode);
            if( index > -1 ){
              this.chooseStation.splice(index,1)
              this.pushStationText();
            }

          } else {
            $(station[i]).removeClass('btn-default').addClass('btn-danger');
            if (!this.chooseStation.includes(areaCode)) {
              this.chooseStation.push(areaCode)
              this.pushStationText();
            }
          }
          i++;
        }
        this.isAll();
      },
      //全不选
      allNotSelection(){
        let station = $('.stationName button');
        let stationArea = $('.stationArea button');
        let i = 0,
            n = 0;
        while (station[i]) {
          $(station[i]).removeClass('btn-danger').addClass('btn-default');
          this.chooseStation = [];
          this.chooseStationText = [];
          i++;
        }
        this.isAll();
      },
      //判断单选区域是否在全部在分区按钮里，在就点亮分区按钮
      isAll(){
        let stationArea = $('.stationArea button');
        let region = this.stationCode.region;
        for (let i = 0; i < region.length; i++) {
          if (this.isContain(this.chooseStation, region[i].stations)) {
            for (let n = 0; n < stationArea.length; n++) {
              if ($.trim($(stationArea[n]).text()) == region[i].name) {
                $(stationArea[n]).removeClass('btn-info').addClass('btn-danger');
              }
            }
          } else {
            for (let n = 0; n < stationArea.length; n++) {
              if ($.trim($(stationArea[n]).text()) == region[i].name) {
                $(stationArea[n]).removeClass('btn-danger').addClass('btn-info');
              }
            }
          }

        }
      },

      //arr1是否包含arr2
      isContain(arr1, arr2){
        for (var i = arr2.length - 1; i >= 0; i--) {
          if (!arr1.includes(Number(arr2[i]))) {
            return false;
          }
        }
        return true;
      },

      //模式单元按钮
      isRadio(ev){
        let text = $(ev.target).text();
        $(ev.target).removeClass('btn-info').addClass('btn-warning').siblings().removeClass('btn-warning').addClass('btn-info');
        let a = [];
        a.push(text);
        this.$store.commit('typeCommit',a)
      },
      //站点选择确定事件
      saveChooseStation (){
        this.isShow = false;
          this.$store.commit('chooseStation',{
            stationNumber:this.chooseStation,
            stationText:this.chooseStationText
          })

      },
      //开始时段改变
      timeFrameS(){
        this.$store.commit('timeFrameS',{
          FrameS:this.date1
        })
      },
      //结束时段改变
      timeFrameE(){
        this.$store.commit('timeFrameE',{
          FrameE:this.date2
        })
      },
      //预报量改变
      prediction(a){
        let b = {};
        b.value = a.value;
        b.caption = a.label;
        this.$store.commit('prediction',b);
      },
      //预报时效改变
      timeliness(a){
        let b = [];
        b.push(a);
        this.$store.commit('timeliness',b)
      },
      //起报时间选择
      newspaper(ev){
        let text = $(ev.target).text();
        $(ev.target).removeClass('btn-info').addClass('btn-warning').siblings().removeClass('btn-warning').addClass('btn-info');
        let a = [];
        a.push(text);
        this.$store.commit('newspaper',a)
      },
      //push的同时更新站名数组的方法
      pushStationText(){
        let Btn = $('.stationName button');
        let i = 0;
        this.chooseStationText = [];
        while (Btn[i])
        {
          if(this.chooseStation.includes(Number($(Btn[i]).data('stationcode'))))
          {
            let text = $(Btn[i]).text();
            this.chooseStationText.push(text);
          }
          i++;
        }
      }
    },
    computed: {
      //初始化的开始年份
      yearStart(){
        return this.$store.state.firstCache.yearStart;
      },
      //初始化的结束年份
      yearEnd(){
        return this.$store.state.firstCache.yearEnd;
      },
      //初始化的开始时段
      timeFrameStart(){
        return this.$store.state.firstCache.timeFrameStart;
      },
      //初始化的结束时段
      timeFrameEnd(){
        return this.$store.state.firstCache.timeFrameEnd;
      },
      //初始化的选中站点
      initstationcode(){
        return this.$store.state.firstCache.chooseStation;
      },
      //初始化的模式选择
      initType(){
        return $.trim(this.$store.state.firstCache.type[0]);
      },
      //初始化计预报时效选择
      initTimeliness(){
        return this.$store.state.firstCache.timeliness[0];
      },
      //初始化预报量
      initPrediction(){
        return this.$store.state.firstCache.predictionMsg.value;
      },
      //初始化起报时间
      initNewspaper(){
        return $.trim(this.$store.state.firstCache.newspaper[0]);
      }
    },
    created(){
      function getRealHttp (){
        return axios.post('http://101.200.12.178:8090/OFTPService/services/Sample/getSampleInfoReal')
      }
      function getHourSpan (){
        return axios.post('http://101.200.12.178:8090/OFTPService/services/Sample/getSampleInfoNWP')
      }
      this.timer();

      axios.all([getRealHttp(),getHourSpan()])
        .then(axios.spread((b,c)=>{
          b.data.forEach((item,index)=>{
            let a = {
              value:item.name,
              caption:item.caption
            };
            this.Real.push(a);
          });
          let hourSpan = c.data[0].hourSpanList;
          let arr = [];
          hourSpan.split(',').forEach((item,index)=>{
            arr.push(item)
          });
          this.hourSpan = arr;
          this.$store.commit('realCommit',b.data)
        }))
        .catch((error)=> {
          console.log(error)
        });
    },
    mounted(){
      /*
      * * `Vue.nextTick(callback)`，当数据发生变化，更新后执行回调。
       * `Vue.$nextTick(callback)`，当dom发生变化，更新后执行的回调。
      * */
      let initStation = this.initstationcode;
      if(initStation.length)
      {
          initStation.forEach((item,index)=>{
          this.chooseStation.push(item.stationNum);
          this.chooseStationText.push($.trim(item.stationName));

        });
      }
    }
  }
</script>
<style>
  .leftToolbar-body {
    width: 100%;
    height: 100%;
    padding: 10px;
    color: white;
    overflow-y: scroll;
    overflow-x: hidden;

  }
  .leftToolbar .leftToolbar-body .vue-datepicker .vue-datepicker-panels {
    width: auto;
    left: -42px;
  }
  .datePick {
    margin-bottom: 10px;
    margin-top: 10px
  }

  .datePick .vue-datepicker {
    display: inline-block;
  }

  .datePick #myDate1, #myDate2 {
    width: 180px;
    border: solid 1px #9ac3f3;
    border-radius: 4px;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
    text-align: center;
  }

  .stationName {
    margin-bottom: 10px;
  }

  .stationName button {
    margin: 3px;
    padding: 3px 10px;
    width: 66px;
  }

  .stationArea button {
    margin: 3px 5px;
    padding: 3px 22.5px;
  }

  .stationArea .s {
    border: 1px solid #d9534f;
  }
  .chooseBtn,.model button {
    margin: 10px 0;
  }
  .model button {
    width: 92px;
  }
  .chooseCtr button {
    margin: 3px 5px;
    padding: 3px 61.5px;
  }
  .chooseStation button{
    margin: 3px;
    padding: 3px 5px;
  }
</style>
