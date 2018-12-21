<template>
  <nav>
    <div class="userWarp">
      <Avatar icon="person" v-show="!nikename==''"/><span @click="login" ref="userName">{{nikename == "" ? "登录" : nikename}}</span>
      &nbsp
      <span @click="logOut" v-show="!nikename==''">退出</span>
      &nbsp
      <span @click="isupdatePasswordShow">修改密码</span>
    </div>
     <Modal
        v-model="loginmodal"
        title="登录"
        ok-text="登录"
        cancel-text=""
        width="350"
        @on-ok="loginvalidate"
        footer-hide
        >
     <Form ref="formInline" :model="formInline" :rules="ruleInline">
        <FormItem prop="user">
            <Input type="text" v-model="formInline.user" placeholder="Username">
                <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
        </FormItem>
        <FormItem prop="password">
            <Input type="password" v-model="formInline.password" placeholder="Password">
                <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
        </FormItem>
        <FormItem class="logintext">
            <Button type="primary" @click="loginvalidate()">Signin</Button>
        </FormItem>
     </Form>
   </Modal>
   <Modal
    v-model="updatepsd"
    title="修改密码"
    ok-text="确认修改"
    cancel-text=""
    width="350"
    @on-ok="updatePassword"
   >
      <Input type="password" v-model="newpassword" placeholder="new Password">
          <Icon type="ios-locked-outline" slot="prepend"></Icon>
      </Input>
   </Modal>
  </nav>
</template>
<script>
export default {
  name: "head-login",
  data() {
    return {
      loginmodal: false,
      formInline: {
        user: "",
        password: ""
      },
      ruleInline: {
        user: [
          {
            required: true,
            message: "Please fill in the user name",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "Please fill in the password.",
            trigger: "blur"
          },
          {
            type: "string",
            min: 4,
            message: "The password length cannot be less than 4 bits",
            trigger: "blur"
          }
        ]
      },
      nikename:'',
      updatepsd:false,
      newpassword:'',//新密码
      userName:''
    };
  },
  beforeCreate(){
   
  },
  created(){
  //    try {
  //      this.userName = JSON.parse(unescape(this.$local.getCookie('usname')));
     
  //  }catch (e){
  //    console.log(e);
  //     this.$Message.error({
  //             content:'用户还未登录'
  //          })
  //  }
    if(this.getCookieUsername){
     
        this.nikename = this.getCookieUsername.showName;
        this.$store.commit('username',this.getCookieUsername)
      }
   
  },
  methods: {
    login() {
      this.loginmodal = true;
    },
    loginvalidate(){
       let a = {
         userName:this.formInline.user,
         password:this.formInline.password
       }
       $.post(this.$hostIp + '/WMUser/services/UserService/login',{para:JSON.stringify(a)})
       .done( data => {
         if(data && data.length){
           this.nikename = data[0].showName;
           console.log(this.nikename)
           this.loginmodal = false;
           this.$Message.success({
              content:'登录成功'
           })
           this.$store.commit('username',data[0])
           this.$local.setCookie('usname',JSON.stringify(data[0]),7)
         }else {
           this.$Message.error({
              content:'用户名或密码错误，请重新登录'
           })
         }
         
       }).fail( error => {
          this.$Message.error({
              content:error
           })
       })
    },
    isupdatePasswordShow(){
      this.updatepsd = true;
    },
    updatePassword(){
       let a = {
         userName:this.formInline.user,
         password:this.newpassword
       }
       $.post(this.$hostIp+'/WMUser/services/UserService/updatePassword',{para:JSON.stringify(a)})
       .done( data => {
         if(data){
           this.$Message.success({
              content:'密码修改成功'
           })
         }
       })
    },
    logOut(){
      this.$local.delCookie('usname');
      this.nikename = '';
    }
  },
  computed: {
    getCookieUsername(){
       return JSON.parse(unescape(this.$local.getCookie('usname')));
    }
  }
};
</script>

<style>
nav {
  position: relative;
  width: 100%;
  height: 80px;
  line-height: 80px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 7px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -1px rgba(0, 0, 0, 0.2);
  background: url(../assets/banner1.png) no-repeat 20px center;
}
.userWarp {
  width: 200px;
  float: right;
  color: white;
  cursor: pointer;
}
 .logintext,.ivu-modal-header {
  text-align: center;
}
.userWarp .ivu-avatar {
  width: 24px;
    height: 24px;
    line-height: 24px;
  margin-right: 5px;
}
.userWarp .ivu-avatar i {
  line-height: 24px;
  font-size: 14px;
}
</style>
