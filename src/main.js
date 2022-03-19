import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Login from "@/views/Login";
import moment from 'moment';
import DatetimePicker from 'vuetify-datetime-picker';

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(DatetimePicker);

Vue.filter('dateFormat', function (daraStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
    return moment(daraStr).format(pattern)
})

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "/";
axios.interceptors.request.use(
    config => {
        let tokenName = localStorage.getItem('tokenName');
        let tokenValue = localStorage.getItem('tokenValue');
        if (tokenName != undefined && tokenName != '') {
            config.headers[tokenName] = tokenValue;
        }
        return config;
    }, error => {
        return Promise.reject(error)
    }
);

new Vue({
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app')
