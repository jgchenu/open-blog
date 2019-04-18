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
