```js
const pAny = require('p-any');
const unless = require('koa-unless');
const verify = require('./verify');
const getSecret = require('./get-secret');
const resolveAuthHeader = require('./resolvers/auth-header');
const resolveCookies = require('./resolvers/cookie');

module.exports = (opts = {}) => {
    const { debug, getToken, isRevoked, key = 'user', passthrough, tokenKey } = opts;
    const tokenResolvers = [resolveCookies, resolveAuthHeader];

    if (getToken && typeof getToken === 'function') {
        tokenResolvers.unshift(getToken);
    }

    const middleware = async function jwt(ctx, next) {
        let token;
        tokenResolvers.find(resolver => token = resolver(ctx, opts));

        if (!token && !passthrough) {
            ctx.throw(401, debug ? 'Token not found' : 'Authentication Error');
        }

        let { state: { secret = opts.secret } } = ctx;

        try {
            if (typeof secret === 'function') {
                secret = await getSecret(secret, token)
            }
            
            if (!secret) {
                throw new Error('Secret not provided');
            }

            let secrets = Array.isArray(secret) ? secret : [secret];
            const decodedTokens = secrets.map(async (s) => {
                return await verify(token, s, opts)
            });

            const decodedToken = await pAny(decodedTokens)
                .catch(function (err) {
                    if (err instanceof pAny.AggregateError) {
                        for (const e of err) {
                            throw e;
                        }
                    } else {
                        throw err;
                    }
                });

            if (isRevoked) {
                const tokenRevoked = await isRevoked(ctx, decodedToken, token);
                if (tokenRevoked) {
                    throw new Error('Token revoked');
                }
            }

            ctx.state[key] = decodedToken;
            if (tokenKey) {
                ctx.state[tokenKey] = token;
            }

        } catch (e) {
            if (!passthrough) {
                const msg = debug ? e.message : 'Authentication Error';
                ctx.throw(401, msg, { originalError: e });
            }
        }

        return next();
    };

    middleware.unless = unless;
    return middleware;
};
```

### index.js 

```js
var koa = require('koa');
var jwt = require('koa-jwt');

var app = new Koa();

// Middleware below this line is only reached if JWT token is valid
// unless the URL starts with '/public'
app.use(jwt({ secret: 'shared-secret' }).unless({ path: [/^\/public/] }));

```
我们先从我们平常最常使用的代码例子来分析入口的源码，

从index.js文件中，我们可以看到
```js
module.exports=function(opts={}){}
```
接收一个对象类型的参数，并且默认值为空对象。

判断getToken属性是否有传入，是否为函数，是的话就加入到tokenResolvers数组中，优先使用getToken对opts进行处理；

遍历 tokenResolvers: [resolveCookies, resolveAuthHeader]数组里面的方法，调用`tokenResolvers.find(resolver => token = resolver(ctx, opts));` 这些方法对于opts进行处理，得到token；

#### resolveCookies
```js
module.exports = function resolveCookies(ctx, opts) {
    return opts.cookie && ctx.cookies.get(opts.cookie);
};
//当opts.cookie的cookie属性存在，表示设置了cookie，那么才去ctx.cookies.get(opts.cookie) 获取相对应的cookie 属性值；
```
#### resolveAuthHeader

  ![DNS请求报文](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/jwt2.png)
```js
module.exports = function resolveAuthorizationHeader(ctx, opts) {
    if (!ctx.header || !ctx.header.authorization) {
        return;
    }


    const parts = ctx.header.authorization.split(' ');

    if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
            return credentials;
        }
    }
    if (!opts.passthrough) {
        ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"');
    }
};

```
如果header请求头不存在或者header头的authorization 没设置，直接return 返回。

将header的authorization进行分割，取到token返回

如果token没存在并且passthrough为false的情况下，则直接抛出错误`ctx.throw(401, debug ? 'Token not found' : 'Authentication Error');

通过判断 ctx.state.secret是否存在 存在设置为secret属性，不存在则使用opts.secret作为secret；

之后对secret做三种判断
* secret 为函数 `secret = await getSecret(secret, token)`
* secret ctx.state.secret跟opts.secret都没有提供，也就是'undefined',`throw new Error('Secret not provided');`

当secret 为函数，getSecret做了这些事情

#### getSecret
```js
const { decode } = require('jsonwebtoken');

module.exports = async (provider, token) => {
    const decoded = decode(token, { complete: true });

    if (!decoded || !decoded.header) {
        throw new Error('Invalid token');
    }

    return provider(decoded.header, decoded.payload);
};
secret = await getSecret(secret, token)
```
`secrets = Array.isArray(secret) ? secret : [secret];`
 secrets作为一个数组

 ```js
const decodedTokens = secrets.map(async (s) => {
    return await verify(token, s, opts)
});

const decodedToken = await pAny(decodedTokens).catch(function (err) {
                    if (err instanceof pAny.AggregateError) {
                        for (const e of err) {
                            throw e;
                        }
                    } else {
                        throw err;
                    }
                });

 ```
这两步都是对token进行解析

#### verify
```js
const jwt = require('jsonwebtoken');

module.exports = (...args) => {
    return new Promise((resolve, reject) => {
        jwt.verify(...args, (error, decoded) => {
            error ? reject(error) : resolve(decoded);
        });
    });
};
```
 然后设置`ctx.state[key] = decodedToken;`，解析后的payload 赋值在ctx.state.user=decodedToken; 
 而 `ctx.state[tokenKey] = token;`是为进行解析的token