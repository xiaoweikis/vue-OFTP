<template>
  <div>
    <div class="detailsNav">
      <ButtonGroup size="large">
        <Button  type="ghost" icon="ios-redo-outline">
          <router-link to="/item5"  exact>
            本次实验详情
          </router-link>
        </Button>
        <Button type="ghost" icon="ios-list-outline">
          <router-link  to="/item5/Catalogue" >
            历史试验目录
          </router-link>
        </Button>
         <Button v-show="userName" type="ghost" icon="ios-people-outline" >
          <router-link  to="/item5/managing" >
            方法管理
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
import { Input, Radio, RadioGroup, Table, ButtonGroup, Button } from "iview";

export default {
  data() {
    return {
      radio: "yes",
      testName: ""
    };
  },
  components: {
    Input,
    Radio,
    RadioGroup,
    Table,
    ButtonGroup,
    Button
  },
  computed: {
    userName() {
      let userName = this.$store.state.firstCache.userName.showName;
      if (userName === "管理员") {
        return true;
      } else {
        return false;
      }
    }
  }
};
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
  color: white;
}
.detailsNav button a {
  color: white;
}
.detailsNav .is-active {
  color: red;
}
</style>
