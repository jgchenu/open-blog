// koa-better-body 的用法
const Koa = require("koa");
const betterBody = require("./my-koa-better-body");
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

app.use(betterBody({
    uploadDir:  "upload" //当前demo.js所在的目录
}));

app.use(async (ctx, next) => {
    if (ctx.path === "/" && ctx.method === "POST") {
        // 使用中间件后 ctx.request.fields 属性自动加上了 post 请求的文件数据
        // let keys=JSON.parse(JSON.stringify(Object.keys(ctx.request.fields)));
        console.log( ctx.request.fields)
        // 将文件重命名
        // let imgPath = ctx.request.fields[keys[1]].path;
        // let newPath = path.resolve(__dirname, uuid());
        // fs.rename(imgPath, newPath);
    }
    ctx.body=ctx.request.fields;
    await next();
});

app.listen(3000,()=>{
    console.log('listen to 3000')
});
