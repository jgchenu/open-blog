// koa-better-body 的用法
const Koa = require("koa");
const betterBody = require("koa-better-body");
const convert = require("koa-convert"); // 将  koa 1.0 中间转化成 koa 2.0 中间件
const path = require("path");
const fs = require("fs");
const uuid = require("uuid/v1"); // 生成随机串

const app = new Koa();

app.use(async (ctx,next)=>{
    function ensureExists(path, mask, cb) {
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else cb(null); // successfully created folder
        });
    }
    ensureExists(__dirname + '/upload', 0744, function(err) {
        if (err){} // handle folder creation error
        else{console.log('create success')} // we're all good
    });
        // 正确的方法是，创建一个目录，如果不存在具有全部权限为脚本和被他人读取
    await next();
})
// 将 koa-better-body 中间件从 koa 1.0 转化成 koa 2.0，并使用中间件
app.use(convert(betterBody({
    uploadDir: path.resolve(__dirname, "upload")
})));

app.use(async (ctx, next) => {
    if (ctx.path === "/" && ctx.method === "POST") {
        // 使用中间件后 ctx.request.fields 属性自动加上了 post 请求的文件数据
        let keys=JSON.parse(JSON.stringify(Object.keys(ctx.request.fields)));

        // 将文件重命名
        let imgPath = ctx.request.fields[keys[1]][0].path;
        let newPath = path.resolve(__dirname, uuid());
        fs.rename(imgPath, newPath);
    }
    ctx.body=ctx.request.fields;
    await next();
});

app.listen(3000,()=>{
    console.log('listen to 3000')
});
