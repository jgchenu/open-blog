// koa-bodyparser 的用法
const Koa = require("koa");
const bodyParser = require("./my-koa-bodyparser");

const app = new Koa();

// 使用中间件
app.use(bodyParser());

app.use(async (ctx, next) => {
    if (ctx.path === "/" && ctx.method === "POST") {
        // 使用中间件后 ctx.request.body 属性自动加上了 post 请求的数据
        console.log(ctx.request.body);
    }
    ctx.body=ctx.request.body;
    await next();
});

app.listen(3000,()=>{
    console.log('listen to 3000')
});
