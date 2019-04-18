let http = require("http");
let EventEmitter = require("events");
let request = require("./request");
let response = require("./response");
let context = require("./context");
class Koa extends EventEmitter {
  constructor() {
    super();

    this.middlewares=[];
    this.context = context;
    this.request = request;
    this.response = response;
  }
  use(fn) {
    this.middlewares.push(fn)
  }
  compose(middlewares, ctx){ // 简化版的compose，接收中间件数组、ctx对象作为参数
    function dispatch(index){ // 利用递归函数将各中间件串联起来依次调用
      if(index === middlewares.length) return Promise.resolve() // 若最后一个中间件，返回一个resolve的promise
        let middleware = middlewares[index] // 取当前应该被调用的函数
       return Promise.resolve(middleware(ctx, () => dispatch(index + 1)))  // 调用并传入ctx和下一个将被调用的函数，用户next()时执行该函数
    }
   return  dispatch(0)
}
  createContext(req, res) {
    // 使用Object.create方法是为了继承this.context但在增加属性时不影响原对象
    const ctx = Object.create(context);
    const request = (ctx.request = Object.create(this.request));
    const response = (ctx.response = Object.create(this.response));
    ctx.req = request.req = response.req = req;
    ctx.res = request.res = response.res = res;
    request.ctx = response.ctx = ctx;
    request.response = response;
    response.request = request;
    return ctx;
  }
  handleRequest(req, res) {
    res.statusCode = 404; // 默认404
    let ctx = this.createContext(req, res);
    let fn = this.compose(this.middlewares, ctx)
    fn.then(()=>{
      if (typeof ctx.body == "object") {
        // 如果是个对象，按json形式输出
        res.setHeader("Content-Type", "application/json;charset=utf8");
        res.end(JSON.stringify(ctx.body));
      }  else if (typeof ctx.body === "string" || Buffer.isBuffer(ctx.body)) {
        // 如果是字符串或buffer
        res.setHeader("Content-Type", "text/html;charset=utf8");
        res.end(ctx.body);
      } else {
        res.end("Not found");
      }
    })
  }
  listen(...args) {
    let server = http.createServer(this.handleRequest.bind(this));
    server.listen(...args);
  }
}
module.exports = Koa;
