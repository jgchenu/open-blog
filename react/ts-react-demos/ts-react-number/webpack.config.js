// 引入webpack
const webpack = require("webpack");
// 引入webpack插件 生成index.html文件
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path")

// 把模块导出
module.exports = {
  // 以前是jsx，因为我们用typescript写，所以这里后缀是tsx
  entry:"./src/index.tsx",
  // 指定模式为开发模式
  mode:"development",
  // 输出配置
  output:{
    // 输出目录为当前目录下的dist目录
    path:path.resolve(__dirname,'dist'),
    // 输出文件名
    filename:"index.js"
  },
  // 为了方便调试，还要配置一下调试工具
  devtool:"source-map",
  // 解析路径，查找模块的时候使用
  resolve:{
    // 一般写模块不会写后缀，在这里配置好相应的后缀，那么当我们不写后缀时，会按照这个后缀优先查找
    extensions:[".ts",'.tsx','.js','.json']
  },
  // 解析处理模块的转化
  module:{
    // 遵循的规则
    rules:[
      {
        // 如果这个模块是.ts或者.tsx，则会使用ts-loader把代码转成es5
        test:/\.tsx?$/,
        loader:"ts-loader"
      },
      {
        // 使用sourcemap调试
        // enforce:pre表示这个loader要在别的loader执行前执行
        enforce:"pre",
        test:/\.js$/,
        loader:"source-map-loader"
      }
    ]
  },
  // 插件的配置
  plugins:[
    // 这个插件是生成index.html
    new HtmlWebpackPlugin({
      // 以哪个文件为模板，模板路径
      template:"./src/index.html",
      // 编译后的文件名
      filename:"index.html"
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  // 开发环境服务配置
  devServer:{
    // 启动热更新,当模块、组件有变化，不会刷新整个页面，而是局部刷新
    // 需要和插件webpack.HotModuleReplacementPlugin配合使用
    hot:true, 
    // 静态资源目录
    contentBase:path.resolve(__dirname,'dist'),
    // 不管访问什么路径，都重定向到index.html
    historyApiFallback:{
      index:"./index.html"
    }
  }
}