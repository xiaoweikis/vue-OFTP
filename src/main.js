// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from '@/store'
import 'iview/dist/styles/iview.css'

import axios from 'axios';
import VueAxios from 'vue-axios'

import iview from 'iview'

import utils from './lib/utils'

Vue.use(iview)
Vue.use(VueAxios,axios);
Vue.use(utils);

Vue.prototype.$host = 'http://101.200.12.178:8090/OFTPServiceV2/services/';

Vue.config.productionTip = false;



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
