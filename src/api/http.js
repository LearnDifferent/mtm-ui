import axios from 'axios';
import router from '@/router';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '/api' : '/';

axios.interceptors.request.use(
  config => {
    const tokenName = localStorage.getItem('tokenName');
    const tokenValue = localStorage.getItem('tokenValue');
    if (tokenName !== undefined && tokenName !== '') {
      config.headers[tokenName] = tokenValue;
    }

    const idempotencyKeyHeaderName = localStorage.getItem('idempotencyKeyHeaderName');
    const idempotencyKey = localStorage.getItem('idempotencyKey');
    if (idempotencyKeyHeaderName !== undefined && idempotencyKeyHeaderName !== '') {
      config.headers[idempotencyKeyHeaderName] = idempotencyKey;
    }

    return config;
  },
  error => Promise.reject(error)
);

function getIdempotencyKey() {
  axios.get('/idempotency-key').then(res => {
    if (res.data.code === 200) {
      const idempotencyKeyHeaderName = res.data.data.idempotencyKeyHeaderName;
      const idempotencyKey = res.data.data.idempotencyKey;
      localStorage.setItem('idempotencyKeyHeaderName', idempotencyKeyHeaderName);
      localStorage.setItem('idempotencyKey', idempotencyKey);
    }
  });
}

axios.interceptors.response.use(
  resp => resp,
  error => {
    const code = error.response && error.response.data && error.response.data.code;
    const path = error.config && error.config.url;
    const method = error.config && error.config.method;
    const data = error.response && error.response.data && error.response.data.data;
    const msg = error.response && error.response.data && error.response.data.msg;

    if (code === 2005) {
      return router.push('/login');
    }

    if (code === 3021) {
      console.error(msg, '. ' + data);
      getIdempotencyKey();
      return;
    }

    if (code === 3023) {
      console.error(msg + '. Current idempotency key is ' + data);
      getIdempotencyKey();
      return;
    }

    if (code === 3022) {
      console.error(msg + '. The idempotency key is ' + data);
      return;
    }

    if (
      code === 3020 &&
      !(path === '/login' && method === 'post') &&
      !(path === '/bookmark' && method === 'get') &&
      !(path === '/bookmark' && method === 'post') &&
      !(path === '/user/change-password' && method === 'post')
    ) {
      const errorList = error.response.data.data;
      if (errorList !== undefined && errorList !== null && errorList.length > 0) {
        alert(errorList[0]);
      } else {
        alert(error.response.data.msg);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
