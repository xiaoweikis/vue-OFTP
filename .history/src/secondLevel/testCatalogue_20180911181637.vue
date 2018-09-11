<template>
  <div class="testCatalogue">
    <div class="testCatalogueLeft">
      <toolbarItem title="筛选查询">
        <div class="inquire">
          <span>用户查询&nbsp:</span>&nbsp<Select style="width: 190px" v-model="userName" @on-change="screen" clearable >
          <Option v-for="item,index in testUserName" :value="item.testUser" :key="index">{{item.testUser}}</Option>
        </Select>
        </div>
        <div class="inquire">
          <span>要素查询&nbsp:</span>&nbsp<Select
          style="width: 190px" v-model="forecastElement" @on-change="screen" clearable >
          <Option v-for="a,b in listForecastElement" :value="a.forecastElementCaption" :key="b">
            {{a.forecastElementCaption}}
          </Option>
        </Select>
        </div>
        <div class="inquire">
          <span>模型方法&nbsp:</span>&nbsp<Select style="width: 190px" @on-change="screen" v-model="forecastMethod"
                                              clearable>
          <Option v-for="a,b in listForecastMethod" :value="a.forecastMethodCaption" :key="b">
            {{a.forecastMethodCaption}}
          </Option>
        </Select>
        </div>
        <div class="inquire">
          <span>站点查询&nbsp:</span>&nbsp<Select style="width: 190px" @on-change="screen" v-model="chooseStation" clearable>
          <Option v-for="a,b in station" :value="a.station_Name" :key="b">{{a.station_Name}}</Option>
        </Select>
        </div>
      </toolbarItem>
    </div>
    <div class="testCatalogueRight">
      <Table :columns="cols"
             :data="rows"
             width="100%"
      >

      </Table>
    </div>
    <Modal
      title="详情"
      v-model="modal"
      class-name="vertical-center-modal"
      width="1000"
    >
      <div class="testDetails">
        <div class="testDetails_item">
          <!--基本信息-->
          <span class="spanTitle">基本信息</span>
          <div class="testDetails_item_content">
            <strong>实验人员&nbsp:</strong><span>&nbsp{{details[0].testUser}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验时间&nbsp:</strong><span>&nbsp{{details[0].dateTime}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验名称&nbsp:</strong><span>&nbsp{{details[0].name}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
          </div>
          <!--样本信息-->
          <span class="spanTitle">样本信息</span>
          <div class="testDetails_item_content">
            <strong class="r">日期&nbsp:</strong><span>&nbsp{{getYears}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">站点&nbsp:</strong><span>&nbsp{{getStation}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">模式&nbsp:</strong><span>&nbsp{{typeNWP}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">预报量&nbsp:</strong><span>&nbsp{{getForecastElement}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r"> 起报时间&nbsp:</strong><span>&nbsp{{details[0].forecastHour}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong class="r">预报时效&nbsp:</strong><span>&nbsp{{details[0].forecastHourSpan}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <div v-if="JSON.parse(details[0].factorAll).length">
              <strong class="r">所选因子&nbsp:</strong><span>&nbsp{{factorAll}}</span>
              <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            </div>
            <div v-if="details[0].factorRealCaption.length">
              <strong class="r">观测因子&nbsp:</strong><span>&nbsp{{details[0].factorRealCaption}}</span>
              <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            </div>
            <div v-if="details[0].factorRealCaption.length">
              <strong class="r">模式因子&nbsp:</strong><span>&nbsp{{details[0].factorNWPCaption}}</span>
              <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            </div>
          </div>
          <!--分析结果-->
          <span class="spanTitle">分析结果</span>
          <div class="testDetails_item_content">
            <Table
              border
              stripe
              :columns="getRow"
              :data="JSON.parse(details[0].row)"
            >
            </Table>
          </div>
          <!--评估结果-->
          <span class="spanTitle">评估结果</span>
           <div class="testDetails_item_content">
            <Table border :columns="getJypg.cols" :data="getJypg.row" width="100%"></Table>
          </div>
          <!--预报方案-->
          <span class="spanTitle">预报方案</span>
          <div class="testDetails_item_content">
            <strong>实验方法&nbsp:</strong><span>&nbsp{{details[0].forecastMethodCaption}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验方案&nbsp:</strong><span>&nbsp{{details[0].forecastSchemeCaption}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>建模样本&nbsp:</strong><span>&nbsp{{forecasTime}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
            <strong>实验样本&nbsp:</strong><span>&nbsp{{trainTime}}</span>
            <hr style="color: #e9eaec;margin: 3px 0 10px 0;"/>
          </div>
          <!--实验备注及核心代码-->
          <span class="spanTitle">实验备注及核心代码</span>
          <div class="testDetails_item_content_r">
            <Input v-if="details[0].remark.length" :value="details[0].remark" :readonly="false"/>
            <Input type="textarea" :readonly="true" :rows="20" :value="uniCodePython"/>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script type="text/ecmascript-6">
  import toolbarItem from '@/secondLevel/toolbarItem';
  import { Table , ButtonGroup,Button, Option ,Select ,Message,Spin ,Icon ,Modal ,Input} from 'iview';
  import 'iview/dist/styles/iview.css';
  export default{
    data(){
      return {
        station: [
          {"station_Id_C": "57516", "station_Name": "沙坪坝", "lon": 106.457759, "lat": 29.540857},
          {"station_Id_C": "57511", "station_Name": "北碚", "lon": 106.479559, "lat": 29.826947},
          {"station_Id_C": "57513", "station_Name": "渝北", "lon": 106.762873, "lat": 29.790661},
          {"station_Id_C": "57518", "station_Name": "巴南", "lon": 106.733788, "lat": 29.325479},
          {"station_Id_C": "57409", "station_Name": "潼南", "lon": 105.77805, "lat": 30.10985},
          {"station_Id_C": "57512", "station_Name": "合川", "lon": 106.31955, "lat": 30.1126},
          {"station_Id_C": "57510", "station_Name": "铜梁", "lon": 106.0283, "lat": 29.8071},
          {"station_Id_C": "57502", "station_Name": "大足", "lon": 105.75445, "lat": 29.61575},
          {"station_Id_C": "57514", "station_Name": "璧山", "lon": 106.20735, "lat": 29.5818},
          {"station_Id_C": "57505", "station_Name": "荣昌", "lon": 105.51495, "lat": 29.4664},
          {"station_Id_C": "57506", "station_Name": "永川", "lon": 105.85835, "lat": 29.2524},
          {"station_Id_C": "57517", "station_Name": "江津", "lon": 106.21495, "lat": 28.9894},
          {"station_Id_C": "57612", "station_Name": "綦江", "lon": 106.6517, "lat": 28.81915},
          {"station_Id_C": "57509", "station_Name": "万盛", "lon": 106.932286, "lat": 28.911975},
          {"station_Id_C": "57519", "station_Name": "南川", "lon": 107.1657, "lat": 29.13275},
          {"station_Id_C": "57520", "station_Name": "长寿", "lon": 107.1569, "lat": 29.9752},
          {"station_Id_C": "57522", "station_Name": "涪陵", "lon": 107.33165, "lat": 29.68055},
          {"station_Id_C": "57523", "station_Name": "丰都", "lon": 107.84345, "lat": 29.90505},
          {"station_Id_C": "57425", "station_Name": "垫江", "lon": 107.45525, "lat": 30.245},
          {"station_Id_C": "57525", "station_Name": "武隆", "lon": 107.6553, "lat": 29.34685},
          {"station_Id_C": "57635", "station_Name": "秀山", "lon": 108.942516, "lat": 28.4220},
          {"station_Id_C": "57633", "station_Name": "酉阳", "lon": 108.8168, "lat": 28.86555},
          {"station_Id_C": "57537", "station_Name": "彭水", "lon": 108.2026, "lat": 29.3985},
          {"station_Id_C": "57536", "station_Name": "黔江", "lon": 108.71945, "lat": 29.4697},
          {"station_Id_C": "57438", "station_Name": "石柱", "lon": 108.2844, "lat": 30.1},
          {"station_Id_C": "57437", "station_Name": "忠县", "lon": 107.8936, "lat": 30.32},
          {"station_Id_C": "57426", "station_Name": "梁平", "lon": 107.7448, "lat": 30.6523},
          {"station_Id_C": "57432", "station_Name": "万州", "lon": 108.3929, "lat": 30.69565},
          {"station_Id_C": "57339", "station_Name": "云阳", "lon": 108.83175, "lat": 31.0091},
          {"station_Id_C": "57338", "station_Name": "开州", "lon": 108.416, "lat": 31.25635},
          {"station_Id_C": "57348", "station_Name": "奉节", "lon": 109.39295, "lat": 30.9289},
          {"station_Id_C": "57349", "station_Name": "巫山", "lon": 109.88025, "lat": 31.1211},
          {"station_Id_C": "57345", "station_Name": "巫溪", "lon": 109.3384, "lat": 31.48265},
          {"station_Id_C": "57333", "station_Name": "城口", "lon": 108.77505, "lat": 31.91575}
        ],
        userName: '',//人员
        forecastElement: '',//要素
        forecastMethod: '',//方法
        chooseStation: '',//站点
        details: [{
          testUser: '',
          dateTime: '',
          name: '',
          sampleStartYear: '',
          sampleEndYear: '',
          forecastStationName: '[]',
          forecastStationNum: '',
          typeNWP: '[]',
          forecastElementCaption: '',
          forecastElement: '',
          forecastHour: '[]',
          forecastHourSpan: '[]',
          factorAll: '[]',
          factorRealCaption: '',
          factorNWPCaption: '',
          cols: '[]',
          row: '[]',
          forecastMethodCaption: '',
          forecastSchemeCaption: '',
          forecastStartYear: '',
          forecastEndYear: '',
          trainStartYear: '',
          trainEndYear: '',
          remark: '',
          sourceCode: '',
          testResult:{}
        }],
        cols: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          }, {
            title: '实验名称',
            key: 'name',
            align: 'center'
          }, {
            title: '预报要素',
            key: 'forecastElementCaption',
            align: 'center'
          }, {
            title: '用户',
            key: 'testUser',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'person'
                  }
                }),
                h('span', params.row.testUser)
              ]);
            }
          }, {
            title: '模型方法',
            key: 'forecastMethodCaption',
            align: 'center'
          }, {
            title: '实验时间',
            key: 'dateTime',
            align: 'center'
          }, {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return h('div', [
                h(Button, {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.modal = true;
                      let id = params.row.id;
                      $.post('http://101.200.12.178:8090/OFTPService/services/Project/getProject', {para: JSON.stringify({id: id})})
                        .done(data => {
                          this.details = data;
                        })
                    }
                  }
                }, '详情'),
                h(Button, {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.index);
                      let id = params.row.id;
                      $.post('http://101.200.12.178:8090/OFTPService/services/Project/deleteMethod', {para: JSON.stringify({id: id})})
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        rows: [],
        modal: false,
        getProjects: []


      }
    },
    components: {
      toolbarItem,
      Table,
      Select,
      Option,
      Icon,
      Button,
      ButtonGroup,
      Modal,
      Input
    },
    computed: {
      //获取实验人员列表
      testUserName(){
        return this.$store.state.firstCache.testUserName;
      },
      //获取实验要素列表
      listForecastElement(){
        return this.$store.state.firstCache.listForecastElement;
      },
      //获取实验模型方法列表
      listForecastMethod(){
        return this.$store.state.firstCache.listForecastMethod;
      },
      //获取条件筛选选择信息
      getInformation(){
        return this.$store.state.firstCache.inquire;
      },
      //计算年份
      getYears(){
        return this.details[0].sampleStartYear + ' 至 ' + this.details[0].sampleEndYear;
      },
      //计算站点
      getStation(){
        let station = JSON.parse(this.details[0].forecastStationName);
        let stationName = '';
        station.forEach(item => {
          stationName += $.trim(item.stationName) + '  ';
        });
        return stationName
      },
      //计算模式
      typeNWP(){
        return JSON.parse(this.details[0].typeNWP)[0];
      },
      //计算预报量
      getForecastElement(){
        return this.details[0].forecastElementCaption;

      },
      //计算所选因子
      factorAll(){
        let a = '';
        let factors = JSON.parse(this.details[0].factorAll);
        factors.forEach(item => {
          a += item + '  ';
        });
        return a;
      },
      //getRow,原来的handsontable组件数据换成iview数据
      getRow(){
        let cols = JSON.parse(this.details[0].cols);
        let b = [];
        cols.forEach(item => {
          let a = {};
          if (item.key == 'stationName' || item.key == 'stationNum') {
            a.title = item.title;
            a.key = item.key;
            a.width = 80;
            a.fixed = 'left';
            a.align = 'center';
          } else {
            a.title = item.title;
            a.key = item.key;
            a.width = 120;
            a.align = 'center';
          }
          b.push(a);
        });
        return b;
      },
      //计算建模样本起止时间
      forecasTime(){
        return this.details[0].forecastStartYear + ' - ' + this.details[0].forecastEndYear
      },
      //计算实验样本起止时间
      trainTime(){
        return this.details[0].trainStartYear + ' - ' + this.details[0].trainEndYear
      },
      //解码python代码显示
      uniCodePython(){
        let code = this.details[0].sourceCode;
        return this.decodeUnicode(code);
      }

    },
    created(){
      //接口获取实验目录
      $.post('http://101.200.12.178:8090/OFTPService/services/Project/getProjects', {para: JSON.stringify({testUser: '杨春'})})
        .done((data)=> {
          this.getProjects = data;
          this.getRows(data);
        })

    },
    methods: {
      //筛选查询
      screen(a){
        let query = [];
        let data = this.getProjects;
        if (this.userName && this.userName.length) query.push({testUser: this.userName});
        if (this.forecastElement && this.forecastElement.length) query.push({forecastElementCaption: this.forecastElement});
        if (this.forecastMethod && this.forecastMethod.length) query.push({forecastMethodCaption: this.forecastMethod});
        if (this.chooseStation && this.chooseStation.length) query.push({forecastStationName: this.chooseStation});
        let newData = [];
        data.forEach(item => {
          let a = true;
          query.forEach(option => {
            if (option.testUser && option.testUser !== item.testUser) {
              a = false;
            }
            if (option.forecastElementCaption && option.forecastElementCaption !== item.forecastElementCaption) {
              a = false;
            }
            if (option.forecastMethodCaption && option.forecastMethodCaption !== item.forecastMethodCaption) {
              a = false;
            }
            if (option.forecastStationName) {
              let station = JSON.parse(item.forecastStationName);
              let stationNameArr = [];
              for (let i = 0; i < station.length; i++) {
                stationNameArr.push($.trim(station[i].stationName));
              }
              if (!stationNameArr.includes(option.forecastStationName)) {
                a = false;
              }
            }
          });
          if (a) {
            newData.push(item)
          }
        });
        this.getRows(newData)
      },
      //处理成iview Tabel组件需要的数据格式
      getRows(data){
        this.rows = [];
        data.forEach(item => {
          let a = {};
          a.name = item.name;
          a.forecastElementCaption = item.forecastElementCaption;
          a.testUser = item.testUser;
          a.forecastMethodCaption = item.forecastMethodCaption;
          a.dateTime = item.dateTime;
          a.id = item.id;
          this.rows.push(a);
        })
      },
      //解码函数
      decodeUnicode(str) {
        str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
          return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
        });
        str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
          return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
        });
        str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
          return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
        });

        return str;
      },
      //目录信息删除功能
      remove (index) {
        this.rows.splice(index, 1);
      }
    }

  }
</script>
<style>
  .testCatalogueLeft {
    width: 342px;
    height: 100%;
    padding: 10px;
    color: white;
    float: left;
  }

  .testCatalogueRight {
    width: calc(100% - 342px);
    height: 100%;
    color: white;
    float: left;
    padding: 10px;
  }

  .testCatalogueRight textarea.ivu-input {
    background: rgba(33, 36, 43, .6);
    color: white;
  }

  .testDetails_item_content_r textarea.ivu-input {
    background: rgba(33, 36, 43, .6);
    color: white;
  }

  .inquire {
    margin-top: 15px;
  }

  .testDetails_item_content_r {
    width: 80%;
    margin: auto;
  }
</style>
