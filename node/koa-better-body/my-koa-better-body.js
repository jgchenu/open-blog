// 文件：my-koa-better-body.js
const fs = require("fs");
const uuid = require("uuid/v1");
const path = require("path");

// 给 Buffer 扩展 split 方法预备后面使用
Buffer.prototype.split = function(sep) {
  let len = Buffer.from(sep).length; // 分隔符所占的字节数
  let result = []; // 返回的数组
  let start = 0; // 查找 Buffer 的起始位置
  let offset = 0; // 偏移量

  // 循环查找分隔符
  while ((offset = this.indexOf(sep, start)) !== -1) {
    // 将分隔符之前的部分截取出来存入
    result.push(this.slice(start, offset));
    start = offset + len;
  }

  // 处理剩下的部分
  result.push(this.slice(start));

  // 返回结果
  return result;
};

module.exports = function(options) {
  return async (ctx, next) => {
    await new Promise((resolve, reject) => {
      let dataArr = []; // 存储读取的数据

      // 读取数据
      ctx.req.on("data", data => dataArr.push(data));

      ctx.req.on("end", () => {
        //console.log(ctx.get("content-Type"))
        //multipart/form-data; boundary=--------------------------416246143457280168711593
        // 取到请求体每段的分割线字符串
        let bondery = `--${ctx.get("content-Type").split("=")[1]}`;
        // 获取不同系统的换行符
        let lineBreak; //mac 下 platform为darwin为"\r\n"， wind32 为"\r\n"，win64 为"\r"
        if (process.platform === "darwin" || process.platform === "win32") {
          lineBreak = "\r\n";
        } else {
          lineBreak = "\n";
        }
        // 非文件类型数据的最终返回结果
        let fields = {};
        // 分隔的 buffer 去掉没用的头和尾即开头的 '' 和末尾的 '--'
        dataArr = Buffer.concat(dataArr)
          .split(bondery)
          .slice(1, -1);
        // 循环处理 dataArr 中每一段 Buffer 的内容
        dataArr.forEach(lines => {
          // 对于普通值，信息由包含键名的行 + 两个换行 + 数据值 + 换行组成
          // 对于文件，信息由包含 filename 的行 + 两个换行 + 文件内容 + 换行组成
          let [head, tail] = lines.split(`${lineBreak}${lineBreak}`);
          // 判断是否是文件，如果是文件则创建文件并写入，如果是普通值则存入 fields 对象中
          // console.log(lines.split(`${lineBreak}${lineBreak}`))
          // console.log('lines.head',head.toString());
          // console.log('lines.tail',tail.toString());
          if (head.includes("filename")) {
            // 防止文件内容含有换行而被分割，应重新截取内容并去掉最后的换行
            let tail = lines.slice(
              head.length + 2 * lineBreak.length,
              -lineBreak.length
            );
            // 创建可写流并指定写入的路径：绝对路径 + 指定文件夹 + 随机文件名，最后写入文件
            let imgPath = path.join(__dirname, options.uploadDir, uuid());
            let key = head.toString().match(/name="(\w+)"/)[1];
            let extendtion = head
              .toString()
              .match(/filename="(.*)"/)[1]
              .split(".")[1];
            let fullPath = `${imgPath}.${extendtion}`;
            fs.createWriteStream(fullPath).end(tail);
            fields[key] = fullPath;
          } else {
            // 是普通值取出键名

            let key = head.toString().match(/name="(\w+)"/)[1];

            // 将 key 设置给 fields tail 去掉末尾换行后的内容
            fields[key] = tail.toString("utf8").slice(0, -lineBreak.length);
          }
        });

        // 将处理好的 fields 对象挂在 ctx.request.fields 上，并完成 Promise
        ctx.request.fields = fields;
        resolve();
      });
    });

    // 向下执行
    await next();
  };
};
