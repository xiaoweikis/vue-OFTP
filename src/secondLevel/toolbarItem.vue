<template>
  <div class="project" :class="className">
      <span class="project-title">{{title}}</span>
      <div class="project-content">
        <slot>
          <input type="number" name="time" :value="startTime" @change="startChange" ref="sTime"/>
          至
          <input type="number" name="time" :value="endTime" @change="endChange" ref="eTime" />
        </slot>
      </div>
  </div>
</template>
<script>
  export default {
    props: ['title','startTime','endTime','className'],
    methods: {
      startChange(){
        this.$store.commit('startChange',{
          startTime:this.$refs.sTime.value
        })
      },
      endChange(){
        this.$store.commit('endChange',{
          endTime:this.$refs.eTime.value
        })
      }
    }
  }
</script>
<style>
  .project {
    width: 322px;
    padding: 10px;
    /*background-color: rgba(101, 101, 101, 0.3);*/
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    margin-bottom: 10px;
  }
  .project-title {
    display: block;
    width: 100%;
    border-bottom: 2px solid #009688;
    font-size: 15px;
    font-weight: bold;
    text-align: left;
    font-family: '宋体';
  }
  .project-content {
    padding-top: 5px;
    font-size: 15px;

  }
  .project-content input[type='number'] {
    font-size: 14px;
    width: 80px;
    height: 25px;
    margin-right: 5px;
    margin-left: 5px;
    text-align: center;
    border: solid 1px #9ac3f3;
    border-radius: 4px;
    color: black;
  }
</style>
