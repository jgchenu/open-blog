## 题目：原生js实现ajax请求，原生js实现jsonp请求

附上github地址（包含服务端部分）：`https://github.com/jgchenu/Communication-basics`


### 1.原生js实现ajax请求
---
```js
 //用原生js构造一个Ajax实例
      
 var ajax = function (param) {
            var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            var type = (param.type || 'get').toUpperCase();
            var url = param.url;
            if (!url) {
                return
            }
            var data = param.data || {};
            var dataArr = [];
            for (let key in data) {
                dataArr.push(key + '=' + data[key]);
            }
            if (type === 'GET') {
                url = url + '?' + dataArr.join('&');
                xhr.open(type, url);
                xhr.send();
            } else {
                xhr.open(type, url);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(dataArr.join('&'));
            }
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 304 || xhr.status === 206) {
                    var res;
                    if (param.success && param.success instanceof Function) {
                        res = xhr.responseText;
                        param.success.call(xhr, res);
                    }
                } else {
                    if (param.error && param.error instanceof Function) {
                        res = xhr.responseText;
                        param.error.call(xhr, res);
                    }
                }
            }
        }
        ajax({
            type: 'get',
            url: 'http://127.0.0.1:3000/sb',
            success(res) {
                console.log(res);
            },
            error(err) {
                console.log(err);
            }
        })

```
### 2.原生js实现jsonp请求
---
```js
var util = {
            callbackName: 'jsonp'
        };
        util.createScript = function (url, charset) {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            charset && script.setAttribute('charset', charset);
            script.setAttribute('src', url);
            script.async = true;
            return script;
        }
        util.jsonp = function ({
            url,
            success,
            error,
            charset
        }) {
            var callbackName = util.callbackName;
            window.callbackName = function () {
                success && success instanceof (Function) && success(arguments[0]);
            }
            var script = util.createScript(url + '&callback=' + callbackName, charset);
            script.onload = script.onreadystatechange = function () {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    window.callbackName = null;
                }
            }
            script.onerror = function () {
                error && error instanceof(Function) && error(arguments[0]);
            }
            document.querySelector('head').appendChild(script);
        }
        util.jsonp({
            url: 'http://chenjianguang.com',
            success(res) {
                console.log(res);
            },
            error(err) {
                console.log(err);
            },
            charset: 'charset'
        })
```
### 3.nodejs 使用koa2 实现reastful api以及服务端报错接口
---
```js
---index.js
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const app = new Koa;
let home = Router();
const APIError = require('./util').APIError;
app.use(cors());
app.use(async (ctx, next) => {
    ctx.rest = (data) => {
        ctx.response.type = 'application/json';
        ctx.response.body = data;
    }
    try {
        await next();

    } catch (e) {
        ctx.response.status = 400;
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: e.code || 'internal:unknown_error',
            message: e.message || ''
        };
    }

})
home.get('/', async (ctx, next) => {
    ctx.rest({
        code: 200200,
        msg: '测试成功'
    });

})
home.get('/sb', async (ctx, next) => {
    throw new APIError('auth:user_not_found', 'user not found');
})
app.use(home.routes());
app.listen(3000, () => {
    console.log('start');
})
--util.js
module.exports={
    APIError: function (code, message) {
        this.code = code || 'internal:unknown_error';
        this.message = message || '';
    }
}
```