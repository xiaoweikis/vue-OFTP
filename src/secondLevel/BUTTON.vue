<template>
  <button type="button"
          class="btn"
          :class='[computedType, computedSize, computedOutline, computedActive, computedBlock,layer]'
          :value="value"
  >
    {{ btnText }}
  </button>
</template>
<script>
  export default {
    props: [
      'btnText', // 按钮文本内容
      'btnType', // 按钮类型 default,primary,secondary,success,danger,warning,info,light,dark,link
      'btnSize', // 按钮尺寸大小lg,sm
      'btnOutline', // 只有边框的按钮样式default,primary,secondary,success,danger,warning,info,light,dark,link
      'btnActive', // 按钮状态，是一个布尔值，true表示激活（当前状态）
      'btnBlock', // 按钮是不是块元素，是一个布遥值，true表示块元素 ,
      'value',
      'layer'
    ],
    computed: {
      //控制按钮类型
      computedType(){
        return this.btnType ? `btn-${this.btnType}` : '';
      },
      computedSize () {
        // 控制按钮大小尺寸
        return this.btnSize ? `btn-${this.btnSize}` : '';
      },
      computedOutline(){
        //控制按钮边框
        return this.btnOutline ? `btn-outline-${this.btnOutline}` : '';
      },
      computedActive(){
        //是否激活
        return this.btnActive === 'true' ? 'active' : '';
      },
      computedBlock(){
        //控制按钮是否为块级元素
        return this.btnBlock === 'true' ? 'btn-block' : '';
      },
      layerClass(){
        return this.layer ? `${this.layer}`: '';
      }
    }
  }
</script>
<style>
  @import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
  @import "../../node_modules/bootstrap/dist/css/bootstrap-theme.min.css";
</style>
