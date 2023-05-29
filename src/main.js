import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import axios from 'axios';
import VueAxios from 'vue-axios';
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
axios.interceptors.response.use(resp => {
    return resp
}, error => {
    let code = error.response.data.code;
    let path = error.config.url;
    let method = error.config.method;
    if (code === 2005) {
        return router.push("/login");
    }
    if (
        code === 3020
        && !(path === '/login' && method === 'post')
        && !(path === '/bookmark' && method === 'get')
        && !(path === '/bookmark' && method === 'post')
        && !(path === '/user/change-password' && method === 'post')
        ) {
        // 3020 表示输入有误
        let errorList = error.response.data.data;
        if (errorList !== undefined && errorList !== null && errorList.length > 0) {
            alert(errorList[0]);
        } else {
            alert(error.response.data.msg);
        }
    }
    return Promise.reject(error);
});

new Vue({
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app');