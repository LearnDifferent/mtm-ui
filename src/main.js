import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import http from './api/http';
import VueAxios from 'vue-axios';
import moment from 'moment';
import DatetimePicker from 'vuetify-datetime-picker';

Vue.config.productionTip = false;
Vue.use(VueAxios, http);
Vue.use(DatetimePicker);

Vue.filter('dateFormat', function (daraStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(daraStr).format(pattern);
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app');
