<template>
    <article class="managing">
        <Table stripe border :columns="cols"  :data="methodsData"></Table>
    </article>
</template>
<script>
export default {
  name: "managing",
  data() {
    return {
      cols: [
        {
          title: "序号",
          type: "index",
          align: "center"
        },
        {
          title: "方法",
          key: "caption",
          align: "center"
        },
        {
          title: "方案",
          key: "scheme",
          align: "center"
        },
        {
          title: "发布者",
          key: "promulgator",
          align: "center"
        },
        {
          title: "发布时间",
          key: "releaseTime",
          align: "center"
        },
        {
          title: "操作",
          align: "center",
          key: "handle",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                    disabled: params.row.valid ? true : false
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.agree(params.row);
                    }
                  }
                },
                "同意发布"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "0px"
                  },
                  on: {
                    click: () => {
                      this.delete(params.row,params.index);
                      console.log(this.methodsData);
                    }
                  }
                },
                "取消发布"
              )
            ]);
          }
        }
      ],
      methodsData: [],
      valid:[],//无效的发布
      validDta:[],
    };
  },
  created() {
    $.post(this.$host + "Model/getModelList").done(data => {
      
      if (data && data.length) {
       // this.validDta = data;
        data.forEach(element => {
          let a = {};
          a.caption = element.methodCaption;
          a.scheme = element.caption;
          a.promulgator = element.showName;
          a.releaseTime = element.publishTime;
          a.valid = element.valid;
          a.id = element.id;
          this.methodsData.push(a);

        });
        
      }
    });
  },
  methods: {
    agree(row) {
      let a = {};
      a.valid = 1;
      a.id = row.id;
      $.post(this.$host + "Model/updateValid", { para: JSON.stringify(a) })
        .done(data => {
          if (data) {
            row.valid = 1;
          }
        })
        .fail(error => {
          this.$Notice.error({
            title: error
          });
        });
    },
    delete(row,index) {
      let a = {};
      a.valid = 0;
      a.id = row.id;
      $.post(this.$host + "Model/updateValid", { para: JSON.stringify(a) })
        .done(data => {
          if (data) {
            row.valid = 0;
            // this.methodsData.splice(index, 1);
          }
        })
        .fail(error => {
          this.$Notice.error({
            title: error
          });
        });
    }
  },
  computed: {
    getValid(){
      this.methodsData.forEach( item => {
        if(!item.valid){
          this.valid.push({
            id:item.id
          })
        }
      })
      return this.valid;
    }
  }
};
</script>
<style>
.managing {
  padding: 10px 30px;
}
.managing h4 {
  font-size: 20px;
  padding: 10px;
}
.detailsNav button i {
  position: relative;
  top: 2px;
}
.detailsNav button span {
  position: relative;
  top: -2px;
}
</style>
