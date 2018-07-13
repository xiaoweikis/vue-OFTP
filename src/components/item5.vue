<template>
  <div>
    <div class="detailsNav">
      <ButtonGroup size="large">
        <Button  type="ghost" icon="ios-redo-outline" >
          <router-link to="/item5"  exact>
            本次实验详情
          </router-link>
        </Button>
        <Button type="ghost" icon="ios-list-outline" >
          <router-link  to="/item5/Catalogue" >
            历史实验目录
          </router-link>
        </Button>
      </ButtonGroup>
    </div>
    <div>
      <router-view></router-view>
    </div>
  </div>


</template>
<script type="text/ecmascript-6">
  import { Input ,Radio ,RadioGroup ,Table ,ButtonGroup , Button} from 'iview';

        export default {
          data(){
            return {
              radio:'yes',
        testName:''
      }
    },
    components : {
      Input,
      Radio,
      RadioGroup,
      Table,ButtonGroup , Button
    },

  }
</script>
<style>
  h3 {
    font-size: 24px;
    margin: 20px 0 10px 0;
  }
  .detailsNav {
    padding: 15px;
  }
  .detailsNav a {
    color: #495060;
    background: none;
  }
  .detailsNav button {
    font-size: 15px;
    color: #495060;
    background: rgba(255, 255, 255, .4);
  }
 .detailsNav .is-active {
   color: red;
 }
</style>
