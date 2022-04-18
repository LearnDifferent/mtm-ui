# mtm-ui

## Project setup

```bash
npm install
```

### Configuration

1. Modify the `target` in [vue.config.js](./vue.config.js) from `'http://web:80'` to `'http://localhost:80'`.

> The [backend server](https://github.com/LearnDifferent/mtm) is running on [localhost:80](http://localhost:80) and the [frontend client](https://github.com/LearnDifferent/mtm-ui) is running on [localhost:3000](http://localhost:3000)

2. Forward real remote IP using Nginx reverse proxy.

> See:
> - [Using the Forwarded header](https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/)
> - [Can't get client's real IP when using Nginx reverse proxy](https://stackoverflow.com/a/64388115)
> - [Nginx 代理且前后端分离时，后端获取客户端真实IP](https://blog.csdn.net/u010024991/article/details/109291184)

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production
```bash
npm run build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## License

Released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).
