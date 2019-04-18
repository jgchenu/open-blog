// koa-router 的简单用法
const Koa = require("Koa");
const Router = require("./my-koa-router");

const app = new Koa();
const router = new Router();

router.get("/panda", async (ctx, next) => {
  ctx.body = "panda";
  await next();
});

router.get("/panda", async (ctx, next) => {
  ctx.body = "pandashen";
  await next();
});

router.get("/shen", async (ctx, next) => {
  ctx.body = "shen";
  await next();
});

// 调用路由中间件
app.use(router.routes());

app.listen(3000);
