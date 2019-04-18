// koa-static 的用法
const Koa = require("koa");
const static = require("./my-koa-static");
const path = require("path");

const app = new Koa();

app.use(static(path.resolve(__dirname, "public")));

app.use(async (ctx, next) => {
    ctx.body = "hello world";
    await next()
});

app.listen(3000,()=>{
    console.log('listen to 3000 test my-koa-views')
});
