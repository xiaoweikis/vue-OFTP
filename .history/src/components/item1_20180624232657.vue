<template>
  <div class="pageContainer">
    <div class="leftToolbar">
      <Tools></Tools>
    </div>
    <div class="rightContent">
      <Result></Result>
    </div>
  </div>
</template>
<script>
  import Tools from '@/secondLevel/leftToolbar';
  import Result from '@/secondLevel/rightContent';

  export default {
    name: 'factorsChouQu',
    components: {
      Tools,
      Result
    }
  }
</script>
<style>
.pageContainer .leftToolbar,.rightContent {
  float: left;
}
.pageContainer .leftToolbar {
  width: 342px;
  height: 100%;

}
.pageContainer .rightContent {
  width: calc(100% - 342px);
  height: 100%;
  padding: 10px;

}
</style>
