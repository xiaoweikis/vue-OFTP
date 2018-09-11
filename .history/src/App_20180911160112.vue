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
      width="600px"
      @on-ok="closeModal"
      @on-cancel="closeModal"
      :closable="false"
    >
      <Table border :columns="columns3" :data="this.modalData" ></Table>
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
          title: '条件名称',
          key: 'name',
          width: 140
        },
        {
          title: '选择信息',
          key: 'information'
        }
      ],//样本构建表
      data3: []//样本构建表
    }
  },
  methods:{
    //模态框关闭事件
    closeModal(){
      this.$store.commit('modelIsShow', false);
    }
  },
  computed:{
    //获取模块狂状态
    isShow:{
      get:function(){
        return this.$store.state.firstCache.model;
      },
      set:function(){}
    },
    modalData(){
      console.log(this.$store.state.firstCache.sample)
      return this.$store.state.firstCache.sample;
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
  height: 949px;
  overflow-y: auto;
}
body {
  background: url(assets/bgm.jpg)no-repeat;
  background-size: cover;
  font-family: 'Microsoft YaHei', 微软雅黑, SimSun, 宋体, sans-serif;
  color: rgb(51, 51, 51);
  margin: 0;
  padding: 0;
  overflow: hidden;
}
ul li {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bg {
  width: 100%;
  min-height: 949px;
  background: url(assets/bgm.jpg)no-repeat;
  background-size: cover;
  position: fixed;
  z-index: -9;
  filter:blur(10px)
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
</style>
