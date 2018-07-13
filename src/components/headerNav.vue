<template>
  <div id="content">
    <ul id="menu">
      <li><router-link tag="a" to="/" exact>样本抽取</router-link></li>
      <li><router-link tag="a" to="/item2">因子分析</router-link></li>
      <li><router-link tag="a" to="/item3">客观预报</router-link></li>
      <li><router-link tag="a" to="/item4">模型评估</router-link></li>
      <li><router-link tag="a" to="/item5">方案管理</router-link></li>
    </ul>
    <div id="content-body">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
  import { backGround } from '../common/jquery.backgroundPosition.fixed'
  import { menuAnimation2 } from '../common/menuAnimation2'
  let menuList = [
    '样本抽取','因子分析','客观预报','模型评估','方案管理'
  ];
  export default {
    data (){
      return {
        menuList: menuList
      }
    },
    mounted(){
      backGround ();
      menuAnimation2 ();
    }
  }
</script>
<style>
  *{margin:0;padding:0;list-style-type:none;}
  a,img{border:0;}
  body{font:12px/180% Arial, Helvetica, sans-serif, "新宋体";}
  /* content */
  #content{position:relative;width:100%;;margin:0 auto;overflow: hidden;height: calc(100% - 80px)}
  #menu{float:left;width:100%;list-style:none;line-height:33px;background:url('../assets/menu_bg11.gif') no-repeat top left;border-top:1px solid #000;border-bottom:1px solid #000;margin:0;padding:0;}
  #menu li{float:left;border-left:1px solid #000;}
  #menu li a{float:left;font-size:1.2em;color:#fff;border-left:1px solid #ccc;text-decoration:none;background:url('../assets/menu_bg11.gif') no-repeat top left;}
  #menu  li a:hover{background:url('../assets/menu_bg_active1.gif') no-repeat top left;}
  #menu li:first-child{border:none;}
  #menu li:first-child a{border:none;}

  #content-body {
    width: 100%;
    height: calc(100% - 35px);
    margin-top: 35px;
    overflow: auto;
  }
  #menu .is-active {
    background:url('../assets/menu_bg_active1.gif') no-repeat top left
  }
</style>
