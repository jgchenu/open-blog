涉及面试题：前端路由原理？两种实现方式有什么区别？

前端路由实现起来其实很简单，本质就是监听 URL 的变化，然后匹配路由规则，显示相应的页面，并且无须刷新页面。目前前端使用的路由就只有两种实现方式:Hash 模式,History 模式

#### Hash 模式

www.test.com/#/ 就是 Hash URL，当 # 后面的哈希值发生变化时，可以通过 hashchange 事件来监听到 URL 的变化，从而进行跳转页面，并且无论哈希值如何变化，服务端接收到的 URL 请求永远是 www.test.com。

window.addEventListener('hashchange', () => {
  // ... 具体逻辑
})

Hash 模式相对来说更简单，并且兼容性也更好。

#### History 模式

History 模式是 HTML5 新推出的功能，主要使用 history.pushState 和 history.replaceState 改变 URL。

通过 History 模式改变 URL 同样不会引起页面的刷新，只会更新浏览器的历史记录。
```
// 新增历史记录
history.pushState(stateObject, title, URL)
// 替换当前历史记录
history.replaceState(stateObject, title, URL)
当用户做出浏览器动作时，比如点击后退按钮时会触发 popState 事件

window.addEventListener('popstate', e => {
  // e.state 就是 pushState(stateObject) 中的 stateObject
  console.log(e.state)
})
```

**两种模式对比**

Hash 模式只可以更改 # 后面的内容，History 模式可以通过 API 设置任意的同源 URL

History 模式可以通过 API 添加任意类型的数据到历史记录中,Hash 模式只能更改哈希值，也就是字符串

Hash 模式无需后端配置，并且兼容性好,不需要后端配合。

History 模式在用户手动输入地址或者刷新页面的时候会发起 URL 请求，需要后端配合，配置 index.html 页面用于匹配不到静态资源的时候