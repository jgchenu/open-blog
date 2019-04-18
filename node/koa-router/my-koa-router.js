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
        return async (ctx, next)=> { // 当前 next 是 Koa 自己的 next，即 Koa 其他的中间件
            // 筛选出路径相同的路由
            let handlers = this.layers.filter(layer => layer.match(ctx.path));
            this.compose(ctx, next, handlers);
        }
    }
}

module.exports=Router;