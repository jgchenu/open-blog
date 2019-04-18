
koa是一个基于nodejs的web开发框架，特点是小而精，对比大而全的express，两者虽然由同一团队开发，但各有其更适合的应用场景：express适合开发较大的企业级应用，而koa致力于成为web开发中的基石，例如egg.js就是基于koa开发的。
关于两个框架的区别和联系，后期我会再写一篇express源码解析，这里不赘述。本文的主要目的如下：

koa官网上说：“koa提供了一套优雅的方法，帮助您快速而愉快地编写服务端应用程序”。这套优雅的方法是什么？是如何实现的？让我们一探究竟，并手写源码。
![koa 源码结构概览](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/koa1.jpg)
## 傻瓜式用法
---
koa的用法可以说非常傻瓜，我们快速过一下：

首先映入眼帘的不是假山，是hello world
```js
const Koa = require('koa');
const app = new Koa();

app.use((ctx, next) => {
  ctx.body = 'Hello World';
});

app.listen(3000); 
```
## 不用框架时的写法
---
```js
let http = require('http')

let server = http.createServer((req, res) => {
  res.end('hello world')
})

server.listen(4000)
```

对比发现，相对原生，`koa`多了两个实例上的`use`、`listen`方法，和`use`回调中的`ctx、next`两个参数。这四个不同，几乎就是koa的全部了，也是这四个不同让koa如此强大。

### listen

简单！http的语法糖，实际上还是用了`http.createServer()`，然后监听了一个端口。

### ctx

比较简单！利用 `上下文(context)` 机制，将原来的`req,res`对象合二为一，并进行了大量拓展,使开发者可以方便的使用更多属性和方法，大大减少了处理字符串、提取信息的时间，免去了许多引入第三方包的过程。(例如ctx.query、ctx.path等)

### use
重点！`koa`的核心 ——` 中间件（middleware）`。解决了异步编程中回调地狱的问题，基于`Promise`，利用 `洋葱模型` 思想，使嵌套的、纠缠不清的代码变得清晰、明确，并且可拓展，可定制，借助许多第三方中间件，可以使精简的koa更加全能（例如`koa-router`，实现了路由）。其原理主要是一个极其精妙的 `compose`函数。在使用时，用 `next()` 方法，从上一个中间件跳到下一个中间件。

注：以上加粗部分，下面都有详细介绍。

## 源码
---
koa有多简单？简单到只有四个文件，算上大量的空行和注释，加起来不到1800行代码（有用的也就几百行）。参考本目录下的./koa/lib/ 里面的4个文件源码

所以，学习koa源码并不是一个痛苦的过程。豪不夸张的说，搞定这四个文件，手写下面的100多行代码，你就能完全理解koa。为了防止大段代码的出现，我会讲的很详细。

## 准备工作
---

模仿官方，我们建立一个koa文件夹，并创建四个文件：`application.js，context.js，request.js，response.js`。 通过查看`package.json`可以发现，`application.js`为入口文件。


`context.js`是上下文对象相关，`request.js`是请求对象相关，`response.js`是响应对象相关。

首先，梳理一下思路，原理无非就是use的时候拿到一个回调函数，listen的时候执行这个函数。

此外，use回调函数的参数ctx拓展了很多功能，这个ctx其实就是原生的req、res经过一系列处理产生的。

其实，第一句不准确，use可以多次，所以是多个回调函数，用户第二个参数`next()`跳到下一个，把多个use的回调函数按照规则顺序执行。

那么，看起来就很简单了，难点只有两个：一个是如何将原生req和res加工成ctx，另一个是如何实现中间件。

第一个，ctx其实就是一个上下文对象，`request`和`response`两个文件用来拓展属性，`context`文件实现代理，我们会手写相关源码。

第二个，源码中的中间件由一个中间件执行模块`koa-compose`实现，这里我们会手写一个。koa-compose 源代码可以查看`./koa/koa-compose.js`

## application.js
---

结合上面`hello world`，可以明确，koa是一个类,实例上主要两个方法，`use和listen`。

上面说过，`listen`是`http`的语法糖，所以要引入`http`模块。

Koa有一套错误处理机制,需要监听实例的error事件。所以要引入`events`模块继承`EventEmitter`。再引入另外三个自定义模块。
```js
//application.js
let http = require('http')
let EventEmitter = require('events')
let context = require('./context')
let request = require('./request')
let response = require('./response')

class Koa extends EventEmitter {
  constructor () {
    super()
  }
  use () {

  }
  listen () {

  }
}

module.exports = Koa
```

这三个模块，其实都是一个对象，为了代码能跑通，这里先简单导出一下。
```js
//context.js

let proto = {} // proto同源码定义的变量名
module.exports = proto
```
```js
// request.js

let request = {}
module.exports = request
```
```js
// response.js

let response = {}
module.exports = response
```

开始写Koa类里面的代码，先实现创建服务的功能：
* 1、listen方法创建一个http服务并监听一个端口。
* 2、use方法把回调传入。
```js
//application.js

class Koa extends EventEmitter {
  constructor () {
    super()
    this.fn
  }
  use (fn) {
    this.fn = fn // 用户使用use方法时，回调赋给this.fn
  }
  listen (...args) {
    let server = http.createServer(this.fn) // 放入回调
    server.listen(...args) // 因为listen方法可能有多参数，所以这里直接解构所有参数就可以了
  }
}
```
这样就可以启动一个服务了，测试一下：
```js
let Koa = require('./application')
let app = new Koa()

app.use((req, res) => { // 还没写中间件，所以这里还不是ctx和next
  res.end('hello world')
})

app.listen(3000)
```
下面先解决`ctx`，`ctx`是一个上下文对象，里面绑定了很多请求和相应相关的数据和方法，例如`ctx.path`、`ctx.query`、`ctx.body()`等等等等，极大的为开发提供了便利。

思路是这样的：用户调用use方法时，把这个回调fn存起来`this.fn=fn`，调用`createContext`函数用来创建上下文`ctx`，创建一个`handleRequest`函数用来处理请求，并且this绑定koa实例，实例调用`listen`时将`handleRequest`作为`createServer`回调函数，在`handleRequest`函数内调用`fn`并将上下文对象`ctx`传入，中间件函数参数就得到了ctx。
```js
class Koa extends EventEmitter {
  constructor () {
    super()
    this.fn
    this.context = context // 将三个模块保存，全局的放到实例上
    this.request = request
    this.response = response
  }
  use (fn) {
    this.fn = fn
  }
  createContext(req, res){ // 这是核心，创建ctx
    // 使用Object.create方法是为了继承this.context但在增加属性时不影响原对象
    const ctx = Object.create(this.context)
    const request = ctx.request = Object.create(this.request)
    const response = ctx.response = Object.create(this.response)
    // 请仔细阅读以下眼花缭乱的操作，后面是有用的
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    request.ctx = response.ctx = ctx
    request.response = response
    response.request = request
    return ctx
  }
  handleRequest(req,res){ // 创建一个处理请求的函数
    let ctx = this.createContext(req, res) // 创建ctx
    this.fn(ctx) // 调用用户给的回调，把ctx还给用户使用。
    res.end(ctx.body) // ctx.body用来输出到页面，后面会说如何绑定数据到ctx.body
  }
  listen (...args) {
    let server = http.createServer(this.handleRequest.bind(this))// 这里使用bind调用，以防this丢失
    server.listen(...args)
  }
}
```
如果不理解`Object.create`可以看这个例子：
```js
let o1 = {a: 'hello'}
let o2 = Object.create(o1)
o2.b = 'world'
console.log('o1:', o1.b) // 创建出的对象不会影响原对象
console.log('o2:', o2.a) // 创建出的对象会继承原对象的属性

// o1: undefined
// o2: hello
```
经过上面的操作，用户在ctx上可以用各种姿势取到想要的值。

例如url，可以用`ctx.req.url`、`ctx.request.req.url`、`ctx.response.req.url`取到。
```js
app.use((ctx) => {
  console.log(ctx.req.url)
  console.log(ctx.request.req.url)
  console.log(ctx.response.req.url)
  console.log(ctx.request.url)
  console.log(ctx.request.path)
  console.log(ctx.url)
  console.log(ctx.path)
})
// 访问localhost:3000/abc

//abc
//abc
//abc
//undefined
//undefined
//undefined
//undefined
```
姿势多，不一定爽，要想爽，我们希望能实现以下两点：

从自定义的`request`上取值、拓展除了原生属性外的更多属性，例如`query`, `path`等。

能够直接通过`ctx.url`的方式取值，上面都不够方便。

### 1 修改request
---
```js
// request.js
let url = require('url')
let request = {
  get url() { // 这样就可以用ctx.request.url上取值了，不用通过原生的req
    return this.req.url
  },
  get path() {
    return url.parse(this.req.url).pathname
  },
  get query() {
    return url.parse(this.req.url).query
  }
  // 。。。。。。
}
module.exports = request
```

非常简单，使用对象`get访问器`返回一个处理过的数据就可以将数据绑定到`request`上了，这里的问题是如何拿到数据，由于前面
```js
 const request = (ctx.request = Object.create(this.request));
 ctx.req = request.req = response.req = req;
 ```
 这一步，所以`rquest`就是`this`，那`this.req===request.req`就是原生的req，再利用一些第三方模块对req进行处理就可以了，源码上拓展了非常多，这里只举例几个，看懂原理即可。
```js
// 访问localhost:3000/abc?id=1

// /abc?id=1
// /abc?id=1
// /abc?id=1
// /abc?id=1
// /abc
// undefined
// undefined
```
###  2 接下来要实现ctx直接取值，这里是通过一个代理来实现的
---
```js
// context.js
let proto = {

}
function defineGetter(prop, name){ // 创建一个defineGetter函数，参数分别是要代理的对象和对象上的属性
    proto.__defineGetter__(name, function(){ // 每个对象都有一个__defineGetter__方法，可以用这个方法实现代理，下面详解
        return this[prop][name] // 这里的this是ctx（原因下面解释），所以ctx.url得到的就是this.request.url
    })
}
defineGetter('request', 'url')
defineGetter('request', 'path')
module.exports = proto
// 访问localhost:3000/abc?id=1

// /abc?id=1
// /abc?id=1
// /abc?id=1
// /abc?id=1
// /abc
// /abc?id=1
// /abc
```

`__defineGetter__`方法可以将一个函数绑定在当前对象的指定属性上，当那个属性的值被读取时，你所绑定的函数就会被调用，第一个参数是`属性`，第二个是`函数`，由于ctx继承了proto，所以当ctx.url时，触发了`__defineGetter__`方法，所以这里的`this`就是`ctx`。这样，当调用`defineGetter`方法，就可以将参数一的参数二属性代理到ctx上了。

有个问题，要代理多少个属性就要调用多少遍`defineGetter`函数么？是的，如果想优雅一点，可以模仿官方源码，提出一个`delegates`模块，批量代理（其实也没优雅到哪去），这里为了方便展示，还是看懂即可吧。

### 3 修改`response`。根据koa的api，输出数据到页面不是`res.end('xx')`也不是`res.send('xx')`，而是`ctx.body = 'xx'`。我们要实现设置`ctx.body`，还要实现获取`ctx.body`。
---
```js
// response.js
let response = {
    get body(){
        return this._body // get时返回出去
    },
    set body(value){
        this.res.statusCode = 200 // 只要设置了body，就应该把状态码设置为200
        this._body = value // set时先保存下来
    }
}
module.exports = response
```
这样得到的是`ctx.response.body`，并不是`ctx.body`，同样，通过`context.js`代理一下

### 4修改context
---
```js
let proto = {

}
function defineGetter (prop, name) {
    proto.__defineGetter__(name, function(){
        return this[prop][name]
    })
}
function defineSetter (prop, name) {
    proto.__defineSetter__(name, function(val){ // 用__defineSetter__方法设置值
        this[prop][name] = val
    })
}
defineGetter('request', 'url')
defineGetter('request', 'path')
defineGetter('response', 'body') // 同样代理response的body属性
defineSetter('response', 'body') // 同理
module.exports = proto
```
测试一下
```js
app.use((ctx) => {
  ctx.body = 'hello world'
  console.log(ctx.body)
})
访问localhost:3000

// node控制台输出：

// hello world

// 网页显示：hello world
```

接下来解决一下`body`的问题，上面说了，一旦给body设置值，状态码就改成`200`，那么没设置值就应该是`404`。还有，用户不光会输出字符串，还有可能是文件、页面、json等，这里都要处理，所以改一下`handleRequest`函数：
```js
let Stream = require('stream') // 引入stream
handleRequest(req,res){
    res.statusCode = 404 // 默认404
    let ctx = this.createContext(req, res)
    this.fn(ctx)
    if(typeof ctx.body == 'object'){ // 如果是个对象，按json形式输出
        res.setHeader('Content-Type', 'application/json;charset=utf8')
        res.end(JSON.stringify(ctx.body))
    } else if (ctx.body instanceof Stream){ // 如果是流
        ctx.body.pipe(res)
    }
    else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) { // 如果是字符串或buffer
        res.setHeader('Content-Type', 'text/htmlcharset=utf8')
        res.end(ctx.body)
    } else {
        res.end('Not found')
    }
}
```
这样上下文相关就实现了，接下来看重中之重：中间件
现在只能`use`一次，我们要实现use多次，并可以在`use`的回调函数中使用`next`方法跳到下一个中间件，在此之前，我们先了解一个概念：**“洋葱模型”**。
![koa 源码结构概览](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/koa2.png)

```js
// 当我们多次使用use时

    app.use((crx, next) => {
        console.log(1)
        next()
        console.log(2)
    })
    app.use((crx, next) => {
        console.log(3)
        next()
        console.log(4)
    })
    app.use((crx, next) => {
        console.log(5)
        next()
        console.log(6)
    })
// 它的执行顺序是这样的：

1
3
5
6
4
2
```

next方法会调用下一个use，next下面的代码会在下一个use执行完再执行，我们可以把上面的代码想象成这样：
```js
app.use((ctx, next) => {
    console.log(1)
    // next()  被替换成下一个use里的代码
    console.log(3)
    // next()  又被替换成下一个use里的代码
    console.log(5)
    // next()  没有下一个use了，所以这个无效
    console.log(6)
    console.log(4)
    console.log(2)
})
```

这样的话，理所应当输出`135642`

这就是**洋葱模型**了，通过`next`把执行权交给下一个中间件。

这样，开发者手中的请求数据会像仪仗队一样，乖乖的经过每一层中间件的检阅，最后响应给用户。

既应付了复杂的操作，又避免了混乱的嵌套。

除此之外，koa的中间件还支持异步，可以使用`async/await`
```js
app.use(async (ctx, next) => {
    console.log(1)
    await next()
    console.log(2)
})
app.use(async (ctx, next) => {
    console.log(3)
    let p = new Promise((resolve, roject) => {
        setTimeout(() => {
            console.log('3.5')
            resolve()
        }, 1000)
    })
    await p.then()
    await next()
    console.log(4)
    ctx.body = 'hello world'
})
1
3
// 一秒后
3.5
4
2
```


`async`函数返回的是一个`promise`，当上一个use的`next`前加上`await`关键字，会等待下一个use的回调`resolve`了再继续执行代码。

所有现在要做的事有两步：

### 第一步，让多个use的回调按照顺序排列成串。
---
这里用到了数组和递归，每次use将当前函数存到一个数组中，最后按顺序执行。执行这一步用到一个compose函数，这个函数是重中之重。
```js
constructor () {
    super()
    // this.fn  改成：
    this.middlewares = [] // 需要一个数组将每个中间件按顺序存放起来
    this.context = context
    this.request = request
    this.response = response
}
use (fn) {
    // this.fn = fn 改成：
    this.middlewares.push(fn) // 每次use，把当前回调函数存进数组
}
compose(middlewares, ctx){ // 简化版的compose，接收中间件数组、ctx对象作为参数
    function dispatch(index){ // 利用递归函数将各中间件串联起来依次调用
        if(index === middlewares.length) return // 最后一次next不能执行，不然会报错
        let middleware = middlewares[index] // 取当前应该被调用的函数
        middleware(ctx, () => dispatch(index + 1)) // 调用并传入ctx和下一个将被调用的函数，用户next()时执行该函数
    }
    dispatch(0)
}
handleRequest(req,res){
    res.statusCode = 404
    let ctx = this.createContext(req, res)
    // this.fn(ctx) 改成：
    this.compose(this.middlewares, ctx) // 调用compose，传入参数
    if(typeof ctx.body == 'object'){
        res.setHeader('Content-Type', 'application/json;charset=utf8')
        res.end(JSON.stringify(ctx.body))
    } else if (ctx.body instanceof Stream){
        ctx.body.pipe(res)
    }
    else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
        res.setHeader('Content-Type', 'text/htmlcharset=utf8')
        res.end(ctx.body)
    } else {
        res.end('Not found')
    }
}
```
再次测试上面打印123456的例子，可以正确的得到135642

### 第二步，把每个回调包装成Promise以实现异步。
---
最后一步，用`Promise.resolve`将每个回调包装成`Promise`，并在调用时`then`
```js
compose(middlewares, ctx){
    function dispatch(index){
        if(index === middlewares.length) return Promise.resolve() // 若最后一个中间件，返回一个resolve的promise
        let middleware = middlewares[index]
        return Promise.resolve(middleware(ctx, () => dispatch(index + 1))) // 用Promise.resolve把中间件包起来
    }
    return dispatch(0)
}
handleRequest(req,res){
    res.statusCode = 404
    let ctx = this.createContext(req, res)
    let fn = this.compose(this.middlewares, ctx)
    fn.then(() => { // then了之后再进行判断
        if(typeof ctx.body == 'object'){
            res.setHeader('Content-Type', 'application/json;charset=utf8')
            res.end(JSON.stringify(ctx.body))
        } else if (ctx.body instanceof Stream){
            ctx.body.pipe(res)
        }
        else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
            res.setHeader('Content-Type', 'text/htmlcharset=utf8')
            res.end(ctx.body)
        } else {
            res.end('Not found')
        }
    }).catch(err => { // 监控错误发射error，用于app.on('error', (err) =>{})
        this.emit('error', err)
        res.statusCode = 500
        res.end('server error')
    })
}
```

## 完整application代码
---
```js
let http = require('http')
let EventEmitter = require('events')
let context = require('./context')
let request = require('./request')
let response = require('./response')
let Stream = require('stream')
class Koa extends EventEmitter {
constructor () {
    super()
    this.middlewares = []
    this.context = context
    this.request = request
    this.response = response
}
use (fn) {
    this.middlewares.push(fn)
}
createContext(req, res){
    const ctx = Object.create(this.context)
    const request = ctx.request = Object.create(this.request)
    const response = ctx.response = Object.create(this.response)
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    request.ctx = response.ctx = ctx
    request.response = response
    response.request = request
    return ctx
}
compose(middlewares, ctx){
    function dispatch (index) {
        if (index === middlewares.length) return Promise.resolve()
        let middleware = middlewares[index]
        return Promise.resolve(middleware(ctx, () => dispatch(index + 1)))
    }
    return dispatch(0)
}
handleRequest(req,res){
    res.statusCode = 404
    let ctx = this.createContext(req, res)
    let fn = this.compose(this.middlewares, ctx)
    fn.then(() => {
        if (typeof ctx.body == 'object') {
            res.setHeader('Content-Type', 'application/json;charset=utf8')
            res.end(JSON.stringify(ctx.body))
        } else if (ctx.body instanceof Stream) {
            ctx.body.pipe(res)
        } else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
            res.setHeader('Content-Type', 'text/htmlcharset=utf8')
            res.end(ctx.body)
        } else {
            res.end('Not found')
        }
    }).catch(err => {
        this.emit('error', err)
        res.statusCode = 500
        res.end('server error')
    })
}
listen (...args) {
    let server = http.createServer(this.handleRequest.bind(this))
        server.listen(...args)
    }
}

module.exports = Koa
```
## 总结
这样就完成了全部核心功能的编写，通过本文你就可以足够了解koa了。