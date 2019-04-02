**该问题出现的issue，目前官方未给出修复以及解决方案**

[issue 114](https://github.com/Meituan-Dianping/mpvue/issues/140)

## 使用场景：
在使用mpvue开发小程序中，出现同路由复用，使用不同页面的情况。
例如： 全部->详情页1(id=22)->个人页->详情页2(id=24,前面详情页1 id被改变)->返回个人页->返回详情页(id=24)

## 问题分析：
通过打断点分析，同路由下的不同页面，数据data的挂载，是共享的...也就是说用的一直都是同一个data，而不是每个页面拥有一个独立的data

## 解决方案：
[使用修改后的mpvue-loader插件包](https://github.com/jgchenu/mpvue-loader)

[使用开源更改后的页面插件包](https://github.com/HelloZJW/mpvue-page-factory)

需要修改 重复使用路由 页面的main.js文件


```
import pageFactory from 'mpvue-page-factory'
import App from './index'
Page(pageFactory(App))
```

![配置如下](https://user-gold-cdn.xitu.io/2018/10/13/1666c2970bc2800c?w=784&h=459&f=png&s=47256)

修改使用的mvpue-loader插件以及增加工厂页面插件

--package.json

    "mpvue-loader": "git+https://github.com/HelloZJW/mpvue-loader.git#patch1.0.x",
    "mpvue-page-factory": "^1.0.0",


![](https://user-gold-cdn.xitu.io/2018/10/13/1666c2ad783f45d0?w=895&h=484&f=png&s=69211)


## 注意：

**并且在该页面请勿使用mpvue官方文档提供的api获取页面传参：**

![](https://user-gold-cdn.xitu.io/2018/10/13/1666c3d9430afba6?w=659&h=256&f=png&s=35676)

**请使用小程序的api获取页面栈，在跳转的页面onLoad函数 附带参数option，然后再通过option来获取id**

![](https://user-gold-cdn.xitu.io/2018/10/13/1666c3bdf4283929?w=550&h=158&f=png&s=15717)


**有的小伙伴发现自己的版本是从最近的mpvue官方初始化的，不能正确地配置现在提供一个初始化的修复版mpvue项目仓库提供于大家使用**

**[simple-mpue-fixed](https://github.com/jgchenu/simple-mpvue-fixed)**

**感谢该方案的插件提供者~[HelloZJW](https://github.com/HelloZJW)**



