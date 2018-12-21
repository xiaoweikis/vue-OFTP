<template>
  <div id="app">
    <div class="bg"></div>
    <div class="body-container">
      <Header></Header>
      <NavList></NavList>
    </div>
    <!--建模样本模态框-->
    <Modal
      v-model="isShow"
      title="样本构建表"
      width="800px"
      @on-ok="closeModal"
      @on-cancel="closeModal"
      :closable="false"
      ok-text="关闭"
      cancel-text=""
    >
      <!-- <Table  :columns="columns3" :data="this.modalData" ></Table> -->
     <div>
       <p 
      v-for="item,index of modalData"
      :key="index"
      v-show="item.information"
      >
        <span 
        style="display: inline-block;width:90px;font-weight:bold"
        >
          {{item.name}}
        </span>
        <span>
          {{item.information}}
        </span>
      </p>
     </div>
       <div class="tableBox"  v-if="table1Data.length" >
          <h4 style="text-align:center;font-weight:bold">观测因子列表</h4>
           <Table stripe border :columns="columns1" :data="table1Data"></Table>
        </div>
        <div class="tableBox"  v-if="table2Data.length" >
          <h4 style="text-align:center;font-weight:bold">模式因子列表</h4>
           <Table stripe border :columns="columns2"  :data="table2Data"></Table>
        </div>
        <div class="tableBox" v-if="Object.keys(getSampleCount).length">
          <h4 style="text-align:center;font-weight:bold;position: relative;">
            <span class="table_textTile">理论样本总数<i>:{{countSampleStation}}</i> | 实际样本总数<i>:{{countSum}} </i> </span>
            站点实际样本数
          </h4>  
           <div class="table3box">
               <Table stripe border :columns="columns3"  :data="getTable3Data"></Table>
             </div>
        </div>
    </Modal>
  </div>
</template>

<script type="text/ecmascript-6">
  import Header from '@/components/header'
  import NavList from '@/components/headerNav'
  import { Modal ,Table} from 'iview';
export default {

  name: 'App',
  components: {
    Header,
    NavList,
    Modal,
    Table
  },
  data(){
    return {
      modal2:false,//建模样本模态框
      columns3: [
        {
          title: '站号',
          key: 'name',
          width: 140,
          align:'center'
        },
        {
          title:'理论样本数',
          key:'theory',
          align:'center'
        },
        {
          title: '实际样本数',
          key: 'practical',
          align:'center'
        },
         {
          title: '样本缺失数',
          key: 'miss',
          align:'center'
        },
         {
          title: '样本完整度',
          key: 'full',
          align:'center'
        }
      ],//样本构建表
      data3: [],
       columns1: [
        {
          title: "序号",
          type: "index",
          width: 90,
          align: "center"
        },
        {
          title: "因子",
          align: "center",
          key: "factor"
        },
        {
          title: "层次",
          align: "center",
          key: "level"
        },
        {
          title: "日期差",
          align: "center",
          key: "datePoor"
        },
        {
          title: "时次",
          align: "center",
          key: "whenTime"
        }
      ], //实况因子
      columns2: [
        {
          title: "序号",
          type: "index",
          width: 90,
          align: "center"
        },
        {
          title: "因子",
          align: "center",
          key: "factor"
        },
        {
          title: "模式",
          align: "center",
          key: "type"
        },
        {
          title: "层次",
          align: "center",
          key: "level"
        },
        {
          title: "日期差",
          align: "center",
          key: "datePoor"
        },
        {
          title: "起报时间",
          align: "center",
          key: "newspaperTime"
        },
        {
          title: "时效",
          align: "center",
          key: "jetLag"
        }
      ], //模式因子//样本构建表

    }
  },
  methods:{
    //模态框关闭事件
    closeModal(){
      this.$store.commit('modelIsShow', false);
    }
  },
  computed:{
    //获取模态框状态
    isShow:{
      get:function(){
        return this.$store.state.firstCache.model;
      },
      set:function(){}
    },
    modalData(){
      return this.$store.state.firstCache.sample;
    },
    //获取观测因子数据
    table1Data(){
      return this.$store.state.firstCache.table1;
    },
    table2Data(){
      return this.$store.state.firstCache.table2;
    },
    //获取站点实际样本数
    getSampleCount(){
      return this.$store.state.firstCache.sampleCount;
    },
    getTable3Data(){
      let count = this.$store.state.firstCache.sampleCount;
      let data = [];
      console.log(count)
      for(let key in count){
        let a = {};
        a.name = key;
        a.theory = this.countSampleStationSum;//理论样本数
        a.practical = count[key];//实际样本数
        a.miss = this.countSampleStationSum - count[key];//样本缺失数
        a.full = (count[key] / this.countSampleStationSum).toFixed(4) * 100 +'%' //样本完整度
        data.push(a);
      }
      return data;
    },
    //获取预报量
    getpredictionMsg(){
      return this.$store.state.firstCache.predictionMsg;
    },
    //计算站点理论样本总数
    countSampleStation(){
      let len = this.$store.state.firstCache.chooseStation.length;
      let num = 0;
      let s = this.getYearEnd+'-'+this.getTimeS;
      let e = this.getYearEnd+'-'+this.getTimeE;
      let sTime = new Date(s);
      let eTime = new Date(e);
      let year = Number(this.$store.state.firstCache.yearEnd) - Number(this.$store.state.firstCache.yearStart) + 1;
      let day = (eTime.getTime() - sTime.getTime() + (24*1000*3600)) * year / (1000*3600*24);
     
      return day * len;
    },
    //计算理论样本数
    countSampleStationSum(){
     
      let num = 0;
      let s = this.getYearEnd+'-'+this.getTimeS;
      let e = this.getYearEnd+'-'+this.getTimeE;
      let sTime = new Date(s);
      let eTime = new Date(e);
      let year = Number(this.$store.state.firstCache.yearEnd) - Number(this.$store.state.firstCache.yearStart) + 1;
      let day = (eTime.getTime() - sTime.getTime() + (24*1000*3600)) * year / (1000*3600*24);

      return day;
    },
    //计算实际样本总数
    countSum(){
      let count = this.$store.state.firstCache.sampleCount;
      let num = 0;
      for(let key in count){
        num += count[key];
      }
      return num;
    },
    //获取开始年
    getYearStart(){
      return this.$store.state.firstCache.yearStart;
    },
    //获取结束年
    getYearEnd(){
      return this.$store.state.firstCache.yearEnd;
    },
    //获取开始时段
    getTimeS(){
      return this.$store.state.firstCache.timeFrameStart;
    },
     //获取结束时段
    getTimeE(){
      return this.$store.state.firstCache.timeFrameEnd;
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  min-height: 600px;
 
}
body {
  background: url(assets/bgm1.jpg)no-repeat;
  background-size: cover;
  font-family: 'Microsoft YaHei', 微软雅黑, SimSun, 宋体, sans-serif;
  color: rgb(51, 51, 51);
  margin: 0;
  padding: 0;

}
ul li {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bg {
  width: 100%;
  min-height: 949px;
  background: url(assets/bgm1.jpg)no-repeat;
  background-size: cover;
  position: fixed;
  z-index: -9;
  filter:blur(7px)
}
.body-container {
  width: 1360px;
  height: 100%;
  box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.3);
  margin: 0 auto;
}
.is-active {
  background:url('./assets/menu_bg_active1.gif') no-repeat top left
}
  .pageContainer {
    width: 100%;
    height: 100%;
  }
  .radioBtn {
    font-size: 14px;
    height: 30px;
    margin: 0 5px 5px;
    padding: 2px 5px 2px 5px;
    cursor: pointer;
    color: #000;
    border: none;
    border-radius: 2px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .clearfix:after{
    content:"";
    clear:both;
    Display:block;
    Visibility:hidden;
    Height:0;
    Line-height:0;
  }
  #content .ivu-btn-group .ivu-icon {
    font-size: 24px;
  }
  
  .table3box .table-cell {
    border-right: 1px solid #dddee1;
    border-bottom: 1px solid #dddee1;
    flex: 1;
    display: inline-block;
    width: 24.9999%;

  }
  .table-cell .r {
    display: inline-block;
    width: 48%;
    text-align: center;
    padding: 5px 0;
  }
   .table3box .b {
     border-bottom: none;
   }
  .table-cell .cell-name {
    border-right: 1px solid #dddee1;
    font-weight: bold #dddee1;
    background: rgb(248,248,249);
  }
 
  /* .table3box .p {
    border-right: none;
  } */
  .table_textTile {
    font-size: 14px;
    position: absolute;
    left: 0;
    top: 5px;
  }
  .ivu-modal-header p, .ivu-modal-header-inner {
    font-size: 20px;
  }
  h4 {
    font-size: 16px;
  }
</style>
