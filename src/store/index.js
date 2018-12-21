/**
 * Created by WEI on 2018/6/19.
 */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios'
import $ from 'jquery'

//定义全局组件
Vue.use(Vuex);

let store = new Vuex.Store({
  state: {
    firstCache: {
      yearStart: '2013',//开始年份
      yearEnd: '2018',//结束年份
      timeFrameStart: '01-01',
      timeFrameEnd: "12-31",//当前时间 ,//结束时段
      chooseStation: [], //选中站点信息
      type: {
        name:'ECMWF',
        value:'ec'
      },//模式选择信息
      predictionMsg: {
        value:'MinTEM2020',
        caption:'20-20时日最低温',
        timeFlag:'时段量',
        test:'acc'
      },//预报量
      timeliness: '3',//预报时效选择信息
      newspaper: '8',//起报时间选择信息
      chooseFactors: [],//选择的因子,
      selectReal:[],//再次选择的观测因子
      selectNwp:[],//再次选择的模式因子
      real:[],//接口获取的观测因子信息,
      nwp:[],//接口获取的模式因子
      CorrelationData:{},//因子与预报量的相关系数数据,
      model:false,//模态框控制
      sample:[],//样本数据
      yxMethod:[],//预测方法接口数据
      ycTimeStart:'2015-06-01',
      ycTimeEnd:'2015-06-30',
      caption:{
        label:'',
        value:''
      },//客观预报方法
      pythonCode:'',//python代码
      mark:'',//备注信息
      commitFactors:false,//是否提交再次选择的因子
      userName:{},
      cols2:[],//表二数据
      rows2:[],//表二数据
      testUserName:[],//接口获取实验人员名称
      listForecastElement:[],//接口获取的实验要素
      listForecastMethod:[],//接口获取的模型方法
      inquire:{//条件筛选已选内容
        userName:'',
        ForecastElement:'',
        ForecastMethod:'',
        station:''

      },
      trainTime:{
        trainStartYear:'',
        trainEndYear:'',
        forecastStartYear:'',
        forecastEndYear:''
      },
      testName:'',
      isSave:true,//保存按钮状态
      jypgdata:{},//检验评估数据
      whenTime:'08',
      importFactors:[],//上传数据的因子信息
      alias:[],//存储因子抽取的返回数据
      nwpData:[],//保存模式因子的分层数据
      realData:[],//保存观测因子的分层数据
      factorTitle:[],//保存拼因子拼接好的名称
      table1:[],//观测 因子表数据
      table2:[],//模式因子表数据
      jmstartTime:'1951-01-01',//建模开始时间
      jmendTime:'',//建模结束时间
      syStartTime: '',//实验开始时间
      syEndTime: '2018-12-31',//实验结束时间
      item1Url:'',
      item1Url1:'',
      item2Url:'',
      item2Url1:'',
      item3Url:'',
      item3Url:'',
      sampleCount:{},//站点实际 样本数
      describe:'',//实验描述
      realTitle:[],//观测因子名称
      nwpTitle:[],//模式因子名称
      table3data:null,//因子分析表三数据
      CorrelationStation:[],//相关分析站点数据,
      Correlations:null,//相关分析原始返回数据
      factorScreen:[],//因子分析模块的筛选出的因子
    }
  },
  mutations: {
    //提交筛选后的因子
    factorScreen(state,payload){
      state.firstCache.factorScreen = payload;
    },
    //提交相关因子原始返回数据
    Correlations(state, payload){
      state.firstCache.Correlations = payload;
    },
    //提交相关分析站点数据
    CorrelationStation(state, payload){
      state.firstCache.CorrelationStation = payload;
    },
  
    //提交观测 因子名称
    realTitle(state, payload){
      state.firstCache.realTitle = payload;
    },
    //提交模式因子名称
    nwpTitle(state, payload){
      state.firstCache.nwpTitle = payload;
    },
    //模态框控制
    modelIsShow(state, payload){
      state.firstCache.model = payload;
    },
    //提交站点实际样本数
    sampleCount(state, payload){
      state.firstCache.sampleCount = payload;
    },
    //开始时间
    startChange (state, payload){
      let time = state.firstCache.jmstartTime.split('-');
      time[0] = payload;
      state.firstCache.jmstartTime = time.join('-');
      state.firstCache.yearStart = payload ;
    },
    //结束时间
    endChange (state, payload){
      let time = state.firstCache.syEndTime.split('-');
      time[0] = payload;
      state.firstCache.syEndTime = time.join('-');
      state.firstCache.yearEnd = payload ;
    },
    //开始时段
    timeFrameS (state, payload){
      let time = state.firstCache.jmstartTime.split('-');
      time[1] = payload.split('-')[0];
      time[2] = payload.split('-')[1];
      state.firstCache.timeFrameStart = payload;
      state.firstCache.jmstartTime = time.join('-');
    },
    //结束时段
    timeFrameE (state, payload){
      let time = state.firstCache.syEndTime.split('-');
      time[1] = payload.split('-')[0];
      time[2] = payload.split('-')[1];
      state.firstCache.timeFrameEnd = payload;
      state.firstCache.syEndTime = time.join('-');
    },
    //提交实验描述
    describeCommit(state, payload){
       state.firstCache.describe = payload;
    },
    //提交选中站点信息
    chooseStation (state, payload){
      if(payload.stationText){
      let num = payload.stationNumber;
      let text = payload.stationText;
      state.firstCache.chooseStation = [];
      num.forEach((item, index)=> {
        let a = {
          stationNum: item,
          stationName: text[index]
        };
        state.firstCache.chooseStation.push(a)
      })
      }else {
        state.firstCache.chooseStation = payload;
      }
      
    },
    //提交模式选择信息
    typeCommit (state, payload){
      state.firstCache.type = payload ;
    },
    //预报量选择信息
    timeliness (state, payload){
      state.firstCache.timeliness = payload;
    },
    //预报时效选择信息
    prediction (state, payload){
      state.firstCache.predictionMsg = payload;
    },
    //起报时间选择信息
    newspaper (state, payload){
      state.firstCache.newspaper = payload;
    },
    //因子选中信息
    factors (state, payload){
      state.firstCache.chooseFactors = payload;
    },
    //存储因子抽取的返回数据
    alias (state, payload){
      state.firstCache.alias = payload;
    },
    //提交再次选择出的观测因子
    selectReal (state, payload){
      if(!state.firstCache.selectReal.includes(payload))
      {
        state.firstCache.selectReal.push(payload)
      }else {
        let index = state.firstCache.selectReal.indexOf(payload);
        state.firstCache.selectReal.splice(index,1)
      }

    },
    //提交再次选择出的模式因子
    selectNwp (state, payload){
      if(!state.firstCache.selectNwp.includes(payload))
      {
        state.firstCache.selectNwp.push(payload)
      }else {
        let index = state.firstCache.selectNwp.indexOf(payload);
        state.firstCache.selectNwp.splice(index,1)
      }
    },
    //提交获取的因子的信息
    realCommit(state, payload){
      state.firstCache.real = payload
    },
    nwpCommit(state, payload){
      state.firstCache.nwp = payload
    },
    //提交因子与预报量关系数据
    CorrelationData(state, payload){
      state.firstCache.CorrelationData = payload;
    },
    //提交建模样本数据
    sample(state, payload){
      state.firstCache.sample = payload;
    },
    //提交预测方法数据
    ycMethod (state, payload){
      state.firstCache.ycMethod = payload;
    },
    //提交客观预报方法
    caption(state, payload){
      state.firstCache.caption = payload;
    },
    //提交python代码
    pythonCode(state,payload){
      state.firstCache.pythonCode = payload;
    },
    //提交备注信息
    mark(state,payload){
      state.firstCache.mark = payload;
    },
    //提交是否再次选择样本因子
    commitFactors(state,payload){
      state.firstCache.commitFactors = payload;
    },
    //提交表二数据
    table2data(state,payload){
      state.firstCache.cols2 = payload.a;
      state.firstCache.rows2 = payload.b;
    },
    //提交表三数据
    table3data(state,payload){
      state.firstCache.table3data = payload;
      
    },
    //接口获取的实验人员名称
    testUserName(state,payload){
      state.firstCache.testUserName = payload;
    },
    //提交登录名称
    username(state,payload){
      state.firstCache.userName = payload;
    },
    //接口获取的预报要素查询
    listForecastElement(state,payload){
      state.firstCache.listForecastElement = payload;
    },
    //接口获取的实验模型方法
    listForecastMethod(state,payload){
      state.firstCache.listForecastMethod = payload;
    },
    //接口获取的实验目录
    getProjects(state,payload){
      state.firstCache.getProjects = payload;
    },
    //提交建模样本时间
    trainTime(state,payload){
      state.firstCache.trainTime = payload;
    },
    //提交实验名称
    testName(state,payload){
      state.firstCache.testName = payload;
    },
    //提交保存按钮状态
    isSave(state,payload){
      state.firstCache.isSave = payload;
    },
    //提交检验评估数据
    jypgcommit(state,payload){
      state.firstCache.jypgdata = payload;
    },
    //提交时次数据
    whenTimecommit(state,payload){
      state.firstCache.whenTime = payload;
    },
    //提交上传数据的因子信息
    importFactors(state,payload){
      state.firstCache.importFactors = payload;
    },
    //提交模式因子的分层数据
    nwpData(state,payload){
      state.firstCache.nwpData = payload;
    },
    //提交观测因子的分层数据
    realData(state,payload){
      state.firstCache.realData = payload;
    },
    factorTitle(state,payload){
      state.firstCache.factorTitle = payload;
    },
    //提交观测因子表数据
    table1commit(state,payload){
      state.firstCache.table1 = payload;
    },
    //提交观测因子表数据
    table2commit(state,payload){
      state.firstCache.table2 = payload;
    },
    //提交建模时间开始
    jmstartTime(state,payload){
      let year = payload.split('-')[0];
      let month = payload.split('-')[1]+'-'+payload.split('-')[2];
      state.firstCache.yearStart = year;
      state.firstCache.timeFrameStart = month;
      console.log(year)
      console.log(month )
      state.firstCache.jmstartTime = payload;
    },
    jmendTime(state,payload){
      state.firstCache.jmendTime = payload;
    },
    //实验开始时间提交
    syStartTime(state,payload){
      state.firstCache.syStartTime = payload;
    },
    //实验结束时间提交
    syEndTime(state,payload){
      let year = payload.split('-')[0];
      let month = payload.split('-')[1]+'-'+payload.split('-')[2];
      state.firstCache.yearEnd = year;
      state.firstCache.timeFrameEnd = month;
      state.firstCache.syEndTime = payload;
    },
    //样本抽取地址
    item1Url(state,payload){
      state.firstCache.item1Url = payload;
    },
    item1Url1(state,payload){
      state.firstCache.item1Url1 = payload;
    },
    item2Url(state,payload){
      state.firstCache.item2Url = payload;
    },
    item3Url(state,payload){
      state.firstCache.item3Url = payload;
    }
    
  }
});
//定义容器
//接口获取全部模型方法

// axios.post('http://101.200.12.178:8090/OFTPServiceV2/services/Model/getModels').then((data1)=>{
  
//   store.commit('ycMethod',data1.data)
// });
//接口获取实验人名称
axios.post('http://39.105.223.250:8090/OFTPServiceV2/services/Project/listUserName').then((data2)=>{
 
  // let a = {
  //   testUser:'全部'
  // }
  // data2.data.unshift(a)
  store.commit('testUserName',data2.data)
});
//接口获取预报要素查询
axios.post('http://39.105.223.250:8090/OFTPServiceV2/services/Project/listForecastElement').then((data3)=>{
  // let a = {
  //   forecastElementCaption:'全部'
  // }
  // data3.data.unshift(a)
  store.commit('listForecastElement',data3.data)
});
//接口获取实验模型方法
axios.post( 'http://39.105.223.250:8090/OFTPServiceV2/services/Project/listForecastMethod').then((data4)=>{
  // let a = {
  //   forecastMethodCaption:'全部',
  // }
  // data4.data.unshift(a)
  store.commit('listForecastMethod',data4.data)
});





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

//导出实例
export default store;
