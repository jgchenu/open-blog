// 文件：my-koa-views.js
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// console.log(typeof (fs.readFileSync))
// 将读取文件方法转换成 Promise
const readFile = promisify(fs.readFile);

// 导出中间件
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
