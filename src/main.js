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

/*
如果是生产环境，就使用 /api 路径
nginx 配置如下：

location /api {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://localhost:8080/;
}
 */

axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '/api' : '/';

axios.interceptors.request.use(
    config => {

        // login token
        let tokenName = localStorage.getItem('tokenName');
        let tokenValue = localStorage.getItem('tokenValue');
        if (tokenName !== undefined && tokenName !== '') {
            config.headers[tokenName] = tokenValue;
        }

        // idempotency key
        let idempotencyKeyHeaderName = localStorage.getItem('idempotencyKeyHeaderName');
        let idempotencyKey = localStorage.getItem('idempotencyKey');
        if (idempotencyKeyHeaderName !== undefined && idempotencyKeyHeaderName !== '') {
            config.headers[idempotencyKeyHeaderName] = idempotencyKey;
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
    let data = error.response.data.data;
    let msg = error.response.data.msg;

    if (code === 2005) {
        return router.push("/login");
    }

    /**
     * Send an HTTP GET request to the "/idempotency-key" endpoint
     * to retrieve the idempotency key.
     * If the request is successful, the key
     * and its associated header name are stored in local storage for later use.
     */
    function getIdempotencyKey() {

        axios.get('/idempotency-key').then(res => {
            if (res.data.code === 200) {
                let idempotencyKeyHeaderName = res.data.data.idempotencyKeyHeaderName;
                let idempotencyKey = res.data.data.idempotencyKey;
                localStorage.setItem('idempotencyKeyHeaderName', idempotencyKeyHeaderName);
                localStorage.setItem('idempotencyKey', idempotencyKey);
            }
        });
    }

    if (code === 3021) {
        // idempotency key 为空，重新获取
        console.error(msg, '. ' + data);
        getIdempotencyKey();
        return;
    }

    if (code === 3023) {
        // idempotency key 不正确，重新获取
        console.error(msg + '. Current idempotency key is ' + data);
        getIdempotencyKey();
        return;
    }

    if (code === 3022) {
        // idempotency key 冲突，不进行操作
        console.error(msg + '. The idempotency key is ' + data);
        return;
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