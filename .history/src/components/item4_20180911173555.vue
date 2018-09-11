<template>
  <div class="assess clearfix">
    <div class="assessLeft">
      <toolbarItem title="时段">
        <div class="dateBox">
          <span>开始:&nbsp</span>
          <Input :readonly="true" :value="startTime" style="width: 180px;"/>
        </div>
        <div class="dateBox">
          <span>结束:&nbsp</span>
          <Input :readonly="true" :value="endTime" style="width: 180px;"/>
        </div>
      </toolbarItem>
    </div>
    <div class="assessRight">
      <div class="assessRight-tools">
        <ButtonGroup size="large">
          <Button type="ghost" icon="ios-cloud-upload-outline">上传样本</Button>
          <Button type="ghost" icon="ios-cloud-download-outline" @click.native="exportResult">评估结果导出</Button>
          <Button type="ghost" icon="ios-list-outline" @click.native="factorsSample">显示样本构建表</Button>
        </ButtonGroup>
      </div>
      <div class="assessRight-content">
        <span class="spanTitle">评估结果</span>
        <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
        <Table border  :columns="cols" :data="rows" width="100%"></Table>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import toolbarItem from '@/secondLevel/toolbarItem';
  import { Input ,ButtonGroup ,Button ,Table,Message} from 'iview';
  import $ from 'jquery';
  export default {
    data(){
      return {
        cols: [
          {
            title: '站号',
            key: 'stationNum',
            align:'center'
          },
          {
            title: '平方绝对误差',
            key: 'MAE',
            align:'center'
          },
          {
            title: '均方根误差',
            key: 'RMSE',
            align:'center'
          },
          {
            title: '<1℃准确率',
            key: 'Tk1',
            align:'center'
          },
          {
            title: '<2℃准确率',
            key: 'Tk2',
            align:'center'
          }
        ],
        rows: [],
        exportUrl:''//评估结果地址
      }
    },
    components: {
      toolbarItem,
      Input,
      Button,
      ButtonGroup,
      Table,
      Message
    },
    created(){
      $.post('http://101.200.12.178:8090/OFTPService/services/Test/dev')
        .done(data => {
          if(data){
            this.getCols(data);
            this.exportUrl = 'http://101.200.12.178:8090' + data.url;
            let a = {
              row : this.rows,
              cols : this.cols
            }
          }else {
            Message.error({
              content: '无数据，请重新尝试',
              duration: 8,
              closable: true
            })
          }
        })
        .fail(error => {
          Message.error({
            content: '无数据，请重新尝试'+error,
            duration: 8,
            closable: true
          })
        })
    },
    methods: {
      //处理表格数据rows
      getCols(data){
        let result = data.result;
        for (var key in result) {
          let a = {};
          a.stationNum = key;
          for(var item in result[key]){
            if(item == 'MAE'){
              a.MAE = result[key][item]
            }else if(item == 'RMSE'){
              a.RMSE = result[key][item];
            }else if(item == 'Tk1'){
              a.Tk1 = result[key][item]
            }else if(item == 'Tk2'){
              a.Tk2 = result[key][item]
            }
          }
          this.rows.push(a)
        }
      },
      //导出评估结果
      exportResult(){
        if (this.exportUrl !== '') {
          let url = this.exportUrl;
          this.$local.download(url, '预测结果');
        } else {
          Message.warning({
            content: '无评估数据',
            duration: 8,
            closable: true
          });
        }
      },
      //显示构建样本
      factorsSample(){
        this.$store.commit('modelIsShow', true);
      }
    },
    computed: {
      startTime(){
        let startYear = this.$store.state.firstCache.yearStart;
        let startMonth = this.$store.state.firstCache.timeFrameStart;
        return startYear + '-' + startMonth
      },
      endTime(){
        let endYear = this.$store.state.firstCache.yearEnd;
        let endMonth = this.$store.state.firstCache.timeFrameEnd;
        return endYear + '-' + endMonth
      }
    }
  }
</script>
<style>
  .assessLeft {
    width: 342px;
    height: 100%;
    padding: 10px;
    color: white;
    float: left;
  }

  .assessRight {
    width: calc(100% - 342px);
    height: 100%;
    color: white;
    float: left;
    padding: 10px;
  }

  .ivu-input {
    text-align: center;
  }

  .dateBox {
    margin-top: 10px;
  }

  .assessRight-tools {
    height: 80px;
    line-height: 80px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    width: 100%;
  }

  .assessRight-tools button {
    font-size: 15px;
    color: #495060;
    background: rgba(255, 255, 255, .4);
  }

  .spanTitle {
    font-size: 16px;
    background: rgb(53, 53, 53);
    height: 37px;
    display: block;
    color: white;
    line-height: 36px;
    padding-left: 12px;
    margin-top: 10px;
    text-align: center;
  }
</style>
