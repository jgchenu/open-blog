Koa2 中间件原理解析


原文出自：https://www.pandashen.com

前言

Koa 2.x 版本是当下最流行的 NodeJS 框架，Koa 2.0 的源码特别精简，不像 Express 封装的功能那么多，所以大部分的功能都是由 Koa 开发团队（同 Express 是一家出品）和社区贡献者针对 Koa 对 NodeJS 的封装特性实现的中间件来提供的，用法非常简单，就是引入中间件，并调用 Koa 的 use 方法使用在对应的位置，这样就可以通过在内部操作 ctx 实现一些功能，我们接下来就讨论常用中间件的实现原理以及我们应该如何开发一个 Koa 中间件供自己和别人使用。


### Koa 的洋葱模型介绍

我们本次不对洋葱模型的实现原理进行过多的刨析，主要根据 API 的使用方式及洋葱模型分析中间件是如何工作的。
```js
// 洋葱模型特点
// 引入 Koa
const Koa = require("koa");

// 创建服务
const app = new Koa();

app.use(async (ctx, next) => {
    console.log(1);
    await next();
    console.log(2);
});

app.use(async (ctx, next) => {
    console.log(3);
    await next();
    console.log(4);
});

app.use(async (ctx, next) => {
    console.log(5);
    await next();
    console.log(6);
});

// 监听服务
app.listen(3000);

// 1
// 3
// 5
// 6
// 4
// 2
```

我们知道 Koa 的 use 方法是支持异步的，所以为了保证正常的按照洋葱模型的执行顺序执行代码，需要在调用 next 的时候让代码等待，等待异步结束后再继续向下执行，所以我们在 Koa 中都是建议使用 `async/await` 的，引入的中间件都是在 use 方法中调用，由此我们可以分析出每一个 Koa 的中间件都是返回一个 async 函数的。


### `koa-bodyparser` 中间件模拟
***

想要分析 `koa-bodyparser` 的原理首先需要知道用法和作用，`koa-bodyparser` 中间件是将我们的 post 请求和表单提交的查询字符串转换成对象，并挂在 `ctx.request.body 上，方便我们在其他中间件或接口处取值，使用前需提前安装。
```js
yarn add koa koa-bodyparser
```
`koa-bodyparser` 具体用法如下：
```js
// koa-bodyparser 的用法
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const app = new Koa();

// 使用中间件
app.use(bodyParser());

app.use(async (ctx, next) => {
    if (ctx.path === "/" && ctx.method === "POST") {
        // 使用中间件后 ctx.request.body 属性自动加上了 post 请求的数据
        console.log(ctx.request.body);
    }
});

app.listen(3000);
```

根据用法我们可以看出 koa-bodyparser 中间件引入的其实是一个函数，我们把它放在了 use 中执行，根据 Koa 的特点，我们推断出 koa-bodyparser 的函数执行后应该给我们返回了一个 async 函数，下面是我们模拟实现的代码。
```js
// 文件：my-koa-bodyparser.js
const querystring = require("querystring");

module.exports = function bodyParser() {
    return async (ctx, next) => {
        await new Promise((resolve, reject) => {
            // 存储数据的数组
            let dataArr = [];

            // 接收数据
            ctx.req.on("data", data => dataArr.push(data));

            // 整合数据并使用 Promise 成功
            ctx.req.on("end", () => {
                // 获取请求数据的类型 json 或表单
                let contentType = ctx.get("Content-Type");

                // 获取数据 Buffer 格式
                let data = Buffer.concat(dataArr).toString();

                if (contentType === "application/x-www-form-urlencoded") {
                    // 如果是表单提交，则将查询字符串转换成对象赋值给 ctx.request.body
                    ctx.request.body = querystring.parse(data);
                } else if (contentType === "applaction/json") {
                    // 如果是 json，则将字符串格式的对象转换成对象赋值给 ctx.request.body
                    ctx.request.body = JSON.parse(data);
                }

                // 执行成功的回调
                resolve();
            });
        });

        // 继续向下执行
        await next();
    };
};
```

在上面代码中由几点是需要我们注意的，即 next 的调用以及为什么通过流接收数据、处理数据和将数据挂在 `ctx.request.body` 要在 `Promise` 中进行。

首先是 next 的调用，我们知道 Koa 的 `next` 执行，其实就是在执行下一个中间件的函数，即下一个 use 中的 async 函数，为了保证后面的异步代码执行完毕后再继续执行当前的代码，所以我们需要使用 `await`进行等待，其次就是数据从接收到挂在 `ctx.request.body` 都在 Promise 中执行，是因为在接收数据的操作是异步的，整个处理数据的过程需要等待异步完成后，再把数据挂在 `ctx.request.body` 上，可以保证我们在下一个 use 的 async 函数中可以在 `ctx.request.body` 上拿到数据，所以我们使用 await 等待一个 Promise 成功后再执行 next。


### `koa-better-body` 中间件模拟

koa-bodyparser 在处理表单提交时还是显得有一点弱，因为不支持文件上传，而 koa-better-body 则弥补了这个不足，但是 koa-better-body 为 Koa 1.x 版本的中间件，Koa 1.x 的中间件都是使用 Generator 函数实现的，我们需要使用 koa-convert 将 koa-better-body 转化成 Koa 2.x 的中间件。
```js
npm install koa koa-better-body koa-convert path uuid
```
`koa-better-body` 具体用法如下：
```js
// koa-better-body 的用法
const Koa = require("koa");
const betterBody = require("koa-better-body");
const convert = require("koa-convert"); // 将  koa 1.0 中间转化成 koa 2.0 中间件
const path = require("path");
const fs = require("fs");
const uuid = require("uuid/v1"); // 生成随机串

const app = new Koa();

// 将 koa-better-body 中间件从 koa 1.0 转化成 koa 2.0，并使用中间件
app.use(convert(betterBody({
    uploadDir: path.resolve(__dirname, "upload")
})));

app.use(async (ctx, next) => {
    if (ctx.path === "/" && ctx.method === "POST") {
        // 使用中间件后 ctx.request.fields 属性自动加上了 post 请求的文件数据
        console.log(ctx.request.fields);

        // 将文件重命名
        let imgPath = ctx.request.fields.avatar[0].path;
        let newPath = path.resolve(__dirname, uuid());
        fs.rename(imgPath, newPath);
    }
});

app.listen(3000);
```

上面代码中 `koa-better-body` 的主要功能就是将表单上传的文件存入本地指定的文件夹下，并将文件流对象挂在了 `ctx.request.fields` 属性上，我们接下来就模拟 `koa-better-body` 的功能实现一版基于 Koa 2.x 处理文件上传的中间件。
```js
// 文件：my-koa-better-body.js
const fs = require("fs");
const uuid = require("uuid/v1");
const path = require("path");

// 给 Buffer 扩展 split 方法预备后面使用
Buffer.prototype.split = function (sep) {
    let len = Buffer.from(sep).length; // 分隔符所占的字节数
    let result = []; // 返回的数组
    let start = 0; // 查找 Buffer 的起始位置
    let offset = 0; // 偏移量

    // 循环查找分隔符
    while ((offset = this.indexOf(sep, start)) !== -1) {
        // 将分隔符之前的部分截取出来存入
        result.push(this.slice(start, offset));
        start = offset + len;
    }

    // 处理剩下的部分
    result.push(this.slice(start));

    // 返回结果
    return result;
}

module.exports = function (options) {
    return async (ctx, next) => {
        await new Promise((resolve, reject) => {
            let dataArr = []; // 存储读取的数据

            // 读取数据
            ctx.req.on("data", data => dataArr.push(data));

            ctx.req.on("end", () => {
                // 取到请求体每段的分割线字符串
                let bondery = `--${ctx.get("content-Type").split("=")[1]}`;

                // 获取不同系统的换行符
                let lineBreak = process.platform === "win32" ? "\r\n" : "\n";

                // 非文件类型数据的最终返回结果
                let fields = {};

                // 分隔的 buffer 去掉没用的头和尾即开头的 '' 和末尾的 '--'
                dataArr = dataArr.split(bondery).slice(1, -1);

                // 循环处理 dataArr 中每一段 Buffer 的内容
                dataArr.forEach(lines => {
                    // 对于普通值，信息由包含键名的行 + 两个换行 + 数据值 + 换行组成
                    // 对于文件，信息由包含 filename 的行 + 两个换行 + 文件内容 + 换行组成
                    let [head, tail] = lines.split(`${lineBreak}${lineBreak}`);

                    // 判断是否是文件，如果是文件则创建文件并写入，如果是普通值则存入 fields 对象中
                    if (head.includes("filename")) {
                        // 防止文件内容含有换行而被分割，应重新截取内容并去掉最后的换行
                        let tail = lines.slice(head.length + 2 * lineBreak.length, -lineBreak.length);

                        // 创建可写流并指定写入的路径：绝对路径 + 指定文件夹 + 随机文件名，最后写入文件
                        fs.createWriteStream(path.join(__dirname, options.uploadDir, uuid())).end(tail);
                    } else {
                        // 是普通值取出键名
                        let key = head.match(/name="(\w+)"/)[1];

                        // 将 key 设置给 fields tail 去掉末尾换行后的内容
                        fields[key] = tail.toString("utf8").slice(0, -lineBreak.length);
                    }
                });

                // 将处理好的 fields 对象挂在 ctx.request.fields 上，并完成 Promise
                ctx.request.fields = fields;
                resolve();
            });
        });

        // 向下执行
        await next();
    }
}
```

上面的内容逻辑可以通过代码注释来理解，就是模拟 `koa-better-body` 的功能逻辑，我们主要的关心点在于中间件实现的方式，上面功能实现的异步操作依然是读取数据，为了等待数据处理结束仍然在 `Promise` 中执行，并使用 await 等待，Promise 执行成功调用 next。


### `koa-views` 中间件模拟

Node 模板是我们经常使用的工具用来在服务端帮我们渲染页面，模板的种类繁多，因此出现了 koa-view 中间件，帮我们来兼容这些模板，先安装依赖的模块。
```js
npm install koa koa-views ejs
```
下面是一个 ejs 的模板文件：
```html
<!-- 文件：index.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ejs</title>
</head>
<body>
    <%=name%>
    <%=age%>

    <%if (name=="panda") {%>
        panda
    <%} else {%>
        shen
    <%}%>

    <%arr.forEach(item => {%>
        <li><%=item%></li>
    <%})%>
</body>
</html>
```

### `koa-views`具体用法如下：
```js
// koa-views 的用法
const Koa = require("koa");
const views = require("koa-views");
const path = require("path");

const app = new Koa();

// 使用中间件
app.use(views(path.resolve(__dirname, "views"), {
    extension: "ejs"
}));

app.use(async (ctx, next) => {
    await ctx.render("index", { name: "panda", age: 20, arr: [1, 2, 3] });
});

app.listen(3000);
```
可以看出我们使用了 koa-views 中间件后，让 ctx 上多了 render 方法帮助我们实现对模板的渲染和响应页面，就和直接使用 ejs 自带的 render 方法一样，并且从用法可以看出 render 方法是异步执行的，所以需要使用 await 进行等待，接下来我们就来模拟实现一版简单的 koa-views 中间件。
```js
// 文件：my-koa-views.js
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// 将读取文件方法转换成 Promise
const readFile = promisify(fs.radFile);

// 到处中间件
module.exports = function (dir, options) {
    return async (ctx, next) => {
        // 动态引入模板依赖模块
        const view = require(options.extension);

        ctx.render = async (filename, data) => {
            // 异步读取文件内容
            let tmpl = await readFile(path.join(dir, `${filename}.${options.extension}`), "utf8");

            // 将模板渲染并返回页面字符串
            let pageStr = view.render(tmpl, data);

            // 设置响应类型并响应页面
            ctx.set("Content-Type", "text/html;charset=utf8");
            ctx.body = pageStr;
        }

        // 继续向下执行
        await next();
    }
}
```
挂在 ctx 上的 `render` 方法之所以是异步执行的是因为内部读取模板文件是异步执行的，需要等待，所以 render 方法为 async 函数，在中间件内部动态引入了我们使的用模板，如 ejs，并在 ctx.render 内部使用对应的 render 方法获取替换数据后的页面字符串，并以 html 的类型响应。


### `koa-static` 中间件模拟

下面是 `koa-static` 中间件的用法，代码使用的依赖如下，使用前需安装。
```js
npm install koa koa-static mime
```

### `koa-static` 具体用法如下：
```js
// koa-static 的用法
const Koa = require("koa");
const static = require("koa-static");
const path = require("path");

const app = new Koa();

app.use(static(path.resolve(__dirname, "public")));

app.use(async (ctx, next) => {
    ctx.body = "hello world";
});

app.listen(3000);
```
通过使用和分析，我们知道了 koa-static 中间件的作用是在服务器接到请求时，帮我们处理静态文件，如果我们直接访问文件名的时候，会查找这个文件并直接响应，如果没有这个文件路径会当作文件夹，并查找文件夹下的 index.html，如果存在则直接响应，如果不存在则交给其他中间件处理。
```js
// 文件：my-koa-static.js
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const { promisify } = require("util");

// 将 stat 和 access 转换成 Promise
const stat = promisify(fs.stat);
const access = promisify(fs.access)

module.exports = function (dir) {
    return async (ctx, next) => {
        // 将访问的路由处理成绝对路径，这里要使用 join 因为有可能是 /
        let realPath = path.join(dir, ctx.path);

        try {
            // 获取 stat 对象
            let statObj = await stat(realPath);

            // 如果是文件，则设置文件类型并直接响应内容，否则当作文件夹寻找 index.html
            if (statObj.isFile()) {
                ctx.set("Content-Type", `${mime.getType()};charset=utf8`);
                ctx.body = fs.createReadStream(realPath);
            } else {
                let filename = path.join(realPath, "index.html");

                // 如果不存在该文件则执行 catch 中的 next 交给其他中间件处理
                await access(filename);

                // 存在设置文件类型并响应内容
                ctx.set("Content-Type", "text/html;charset=utf8");
                ctx.body = fs.createReadStream(filename);
            }
        } catch (e) {
            await next();
        }
    }
}
```

上面的逻辑中需要检测路径是否存在，由于我们导出的函数都是 async 函数，所以我们将 stat 和 access 转化成了 Promise，并用 try...catch 进行捕获，在路径不合法时调用 next 交给其他中间件处理。


### `koa-router` 中间件模拟

在 Express 框架中，路由是被内置在了框架内部，而 Koa 中没有内置，是使用 koa-router 中间件来实现的，使用前需要安装。
```js
npm install koa koa-router
```

`koa-router` 功能非常强大，下面我们只是简单的使用，并且根据使用的功能进行模拟。

```js
// koa-router 的简单用法
const Koa = require("Koa");
const Router = require("koa-router");

const app = new Koa();
const router = new Router();

router.get("/panda", (ctx, next) => {
    ctx.body = "panda";
});

router.get("/panda", (ctx, next) => {
    ctx.body = "pandashen";
});

router.get("/shen", (ctx, next) => {
    ctx.body = "shen";
})

// 调用路由中间件
app.use(router.routes());

app.listen(3000);
```
从上面看出 koa-router 导出的是一个类，使用时需要创建一个实例，并且调用实例的 routes 方法将该方法返回的 async 函数进行连接，但是在匹配路由的时候，会根据路由 get 方法中的路径进行匹配，并串行执行内部的回调函数，当所有回调函数执行完毕之后会执行整个 Koa 串行的 next，原理同其他中间件，我下面来针对上面使用的功能简易实现。
```js
// 文件：my-koa-router.js
// 控制每一个路由层的类
class Layer {
    constructor(path, cb) {
        this.path = path;
        this.cb = cb;
    }
    match(path) {
        // 地址的路由和当前配置路由相等返回 true，否则返回 false
        return path === this.path;
    }
}

// 路由的类
class Router {
    constructor() {
        // 存放每个路由对象的数组，{ path: /xxx, fn: cb }
        this.layers = [];
    }
    get(path, cb) {
        // 将路由对象存入数组中
        this.layers.push(new Layer(path, cb));
    }
    compose(ctx, next, handlers) {
        // 将匹配的路由函数串联执行
        function dispatch(index) {
            // 如果当前 index 个数大于了存储路由对象的长度，则执行 Koa 的 next 方法
            if(index >= handlers.length) return next();

            // 否则调用取出的路由对象的回调执行，并传入一个函数，在传入的函数中递归 dispatch(index + 1)
            // 目的是为了执行下一个路由对象上的回调函数
            handlers[index].cb(ctx, () => dispatch(index + 1));
        }

        // 第一次执行路由对象的回调函数
        dispatch(0);
    }
    routes() {
        return async (ctx, next) { // 当前 next 是 Koa 自己的 next，即 Koa 其他的中间件
            // 筛选出路径相同的路由
            let handlers = this.layers.filter(layer => layer.match(ctx.path));
            this.compose(ctx, next, handlers);
        }
    }
}
```

在上面我们创建了一个 Router 类，定义了 get 方法，当然还有 post 等，我们只实现 get 意思一下，get 内为逻辑为将调用 get 方法的参数函数和路由字符串共同构建成对象存入了数组 layers，所以我们创建了专门构造路由对象的类 Layer，方便扩展，在路由匹配时我们可以根据 ctx.path 拿到路由字符串，并通过该路由过滤调数组中与路由不匹配的路由对象，调用 compose 方法将过滤后的数组作为参数 handlers 传入，串行执行路由对象上的回调函数。

compose 这个方法的实现思想非常的重要，在 Koa 源码中用于串联中间件，在 React 源码中用于串联 redux 的 promise、thunk 和 logger 等模块，我们的实现是一个简版，并没有兼容异步，主要思想是递归 dispatch 函数，每次取出数组中下一个路由对象的回调函数执行，直到所有匹配的路由的回调函数都执行完，执行 Koa 的下一个中间件 next，注意此处的 next 不同于数组中回调函数的参数 next，数组中路由对象回调函数的 next 代表下一个匹配路由的回调。


总结
上面我们分析和模拟了一些中间件，其实我们会理解 Koa 和 Express 相比较的优势是没有那么繁重，开发使用方便，需要的功能都可以用对应的中间件来实现，使用中间件可以给我们带来一些好处，比如能将我们处理好的数据和新方法挂载在 ctx 上，方便后面 use 传入的回调函数中使用，也可以帮我们处理一些公共逻辑，不至于在每一个 use 的回调中都去处理，大大减少了冗余代码，由此看来其实给 Koa 使用中间件的过程就是一个典型的 “装饰器” 模式，在通过上面的分析之后相信大家也了解了 Koa 的 “洋葱模型” 和异步特点，知道该如何开发自己的中间件了。

