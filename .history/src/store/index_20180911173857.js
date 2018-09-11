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
      yearStart: '1951',//开始年份
      yearEnd: '2018',//结束年份
      timeFrameStart: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).format('MM-dd'),//获取当前时间前一天,//开始时段
      timeFrameEnd: new Date().format('MM-dd'),//当前时间 ,//结束时段
      chooseStation: [], //选中站点信息
      type: [],//模式选择信息
      predictionMsg: {
        value:'TEM_Avg',
        caption:'平均气温'
      },//预报量
      timeliness: ['24'],//预报时效选择信息
      newspaper: [],//起报时间选择信息
      chooseFactors: [],//选择的因子,
      selectReal:[],//再次选择的观测因子
      selectNwp:[],//再次选择的模式因子
      real:[],//接口获取的因子信息,
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
      userName:'杨春',
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
      jypgdata:{}//检验评估数据


    }
  },
  mutations: {
    //模态框控制
    modelIsShow(state, payload){
      state.firstCache.model = payload;
    },
    //开始时间
    startChange (state, payload){
      state.firstCache.yearStart = payload.startTime;
    },
    //结束时间
    endChange (state, payload){
      state.firstCache.yearEnd = payload.endTime;
    },
    //开始时段
    timeFrameS (state, payload){
      state.firstCache.timeFrameStart = payload.FrameS;
    },
    //结束时段
    timeFrameE (state, payload){
      state.firstCache.timeFrameEnd = payload.FrameE;
    },
    //提交选中站点信息
    chooseStation (state, payload){
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
    //因子抽取返回没有数据的因子、删除对应数据
    noDataFactors (state, payload){
      let f = state.firstCache.chooseFactors;
      f.forEach((item,index)=>{
        if(payload.includes(item.name))
        {
          f.splice(index,1)
        }
      });
      state.firstCache.chooseFactors = f;
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
    //接口获取的实验人员名称
    testUserName(state,payload){
      state.firstCache.testUserName = payload;
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
    
  }
});
//定义容器
//接口获取全部模型方法
axios.post('http://101.200.12.178:8090/OFTPService/services/Model/getModels').then((data1)=>{
  store.commit('ycMethod',data1.data)
});
//接口获取实验人名称
axios.post('http://101.200.12.178:8090/OFTPService/services/Project/listUserName').then((data2)=>{
  store.commit('testUserName',data2.data)
});
//接口获取预报要素查询
axios.post('http://101.200.12.178:8090/OFTPService/services/Project/listForecastElement').then((data3)=>{
  store.commit('listForecastElement',data3.data)
});
//接口获取实验模型方法
axios.post('http://101.200.12.178:8090/OFTPService/services/Project/listForecastMethod').then((data4)=>{
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
