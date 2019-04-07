 ### postMessage 

![possmessage](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/postmessage.png)

API介绍发送数据:
```
otherWindow.postMessage(message, targetOrigin, [transfer]);
```
* otherWindow: 窗口的一个引用,比如iframe的contentWindow属性,执行window.open返回的窗口对象,或者是命名过的或数值索引的 window.frames
* message：要发送到其他窗口的数据,它将会被[结构化克隆算法](https://developer.mozilla.org/en-US/docs/DOM/The_structured_clone_algorithm)序列化.这意味着你可以不受什么限制的将数据对象安全的传送给目标窗口而无需自己序列化
* targetOrigin: 通过窗口的origin属性来指定哪些窗口能接收到消息事件,指定后只有对应origin下的窗口才可以接收到消息,设置为通配符"*"表示可以发送到任何窗口,但通常处于安全性考虑不建议这么做.如果想要发送到与当前窗口同源的窗口,可设置为"/"
* transfer | 可选属性: 是一串和message同时传递的**Transferable**对象,这些对象的所有权将被转移给消息的接收方,而发送一方将不再保有所有权

接收数据: 监听message事件的发生
```
window.addEventListener("message", receiveMessage, false) ;
function receiveMessage(event) {
     var origin= event.origin;
     console.log(event);
}
```

### 场景一 

跨域通信(包括GET请求和POST请求) 我们都知道JSONP可以实现解决GET请求的跨域问题,但是不能解决POST请求的跨域问题.而postMessage都可以.这里只是列举一个示例,仅供参考,具体的代码如何编写要以具体的场景而定奥~父窗体创建跨域iframe并发送信息

父窗体创建跨域iframe并发送信息
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>跨域POST消息发送</title>
        <script type="text/JavaScript">    
            // sendPost 通过postMessage实现跨域通信将表单信息发送到 moweide.gitcafe.io上,
            // 并取得返回的数据    
            function sendPost() {        
                // 获取id为otherPage的iframe窗口对象        
                var iframeWin = document.getElementById("otherPage").contentWindow;        
                // 向该窗口发送消息        
                iframeWin.postMessage(document.getElementById("message").value, 
                    'http://moweide.gitcafe.io');    
            }    
            // 监听跨域请求的返回    
            window.addEventListener("message", function(event) {        
                console.log(event, event.data);    
            }, false);
        </script>
    </head>
    <body> 
        <textarea id="message"></textarea> 
        <input type="button" value="发送" onclick="sendPost()"> 
        <iframe
            src="http://moweide.gitcafe.io/other-domain.html" id="otherPage"
            style="display:none"></iframe>
    </body>

</html>
```
子窗体接收信息并处理
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>POST Handler</title>
        <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
        <script type="text/JavaScript">
            window.addEventListener("message", function( event ) {
                // 监听父窗口发送过来的数据向服务器发送post请求
                var data = event.data;
                $.ajax({
                    // 注意这里的url只是一个示例.实际练习的时候你需要自己想办法提供一个后台接口
                    type: 'POST', 
                    url: 'http://moweide.gitcafe.io/getData',
                    data: "info=" + data,
                    dataType: "json"
                }).done(function(res){        
                    //将请求成功返回的数据通过postMessage发送给父窗口        
                    window.parent.postMessage(res, "*");    
                }).fail(function(res){        
                    //将请求失败返回的数据通过postMessage发送给父窗口        
                    window.parent.postMessage(res, "*");    
                });
            }, false);
        </script>
    </head>

    <body></body>
</html>
```
### 场景二   Web Worker

`JavaScript`语言采用的是单线程模型,通常来说,所有任务都在一个线程上完成,一次只能做一件事,后面的任务要等到前面的任务被执行完成后才可以开始执行,但是这种方法如果遇到复杂费时的计算,就会导致发生阻塞,严重阻碍应用程序的正常运行.`Web Worker`为web内容在后台线程中运行脚本提供了一种简单的方法,线程可以执行任务而不干扰用户界面.一旦创建,一个worker可以将消息发送到创建它的JavaScript代码,通过消息发布到该代码指定的事件处理程序.一个woker是使用一个构造函数创建一个对象,运行一个命名的JavaScript文件-这个文件将包含在工作线程中运行的代码,woker运行在另一个全局上下文中,不同于当前的window,不能使用window来获取全局属性.一些局限性只能加载同源脚本文件,不能直接操作DOM节点Worker,线程不能执行`alert()`方法和`confirm()`方法，但可以使用 `XMLHttpRequest` 对象发出 `AJAX` 请求无法读取本地文件,只能加载网络文件,也不能使用window对象的默认方法和属性,然而你可以使用大量window对象之下的东西,包括`webSocket,indexedDB`以及`FireFoxOS`专用的D阿塔Store API等数据存储机制.查看`Functions and classes available to workers`获取详情。workers和主线程间的数据传递通过这样的消息机制进行——双方都使用`postMessage()`方法发送各自的消息，使用`onmessage`事件处理函数来响应消息（消息被包含在Message事件的data属性中）。这个过程中数据并不是被共享而是被复制;woker分为`专用worker`和`共享worker`,一个专用worker紧急能被首次生成它的脚本使用,而共享woker可以同时被多个脚本使用.

`Web Worker`的使用场景,用于收集埋点数据,可以用于大量复杂的数据计算,复杂的图像处理,大数据的处理.因为它不会阻碍主线程的正常执行和页面UI的渲染.埋点数据采集下的使用: 可在`main.js`中收集数据,将收集到的信息通过`postMessage`的方式发送给`worker.js`,在`woker.js`中进行相关运算和整理并发送到服务器端;当然,不使用`Web Woker`,通过在单页面应用中的`index.html`中创建`iframe`也可以实现页面间切换,页面停留时长等数据的采集,

### 场景三  Service Worker

可在浏览器控制台的`application`中里看到`Service Worker`的存在

![service worker](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/serviceworker.png)


`Service Worker`是web应用做离线存储的一个最佳的解决方案,`Service Worker`和`Web Worker`的相同点是在常规的js引擎线程以外开辟了新的js线程去处理一些不适合在主线程上处理的业务,不同点主要包括以下几点:
* `Web Worker`式服务于特定页面的,而`Service Worker`在被注册安装之后能够在多个页面使用Service Worker常驻在浏览器中,不会因为页面的关闭而被销毁.本质上,它是一个后台线程,只有你主动终结,或者浏览器回收,这个线程才会结束.生命周期.
* 可调用的API也不同,我们可以使用`Service Worker`来进行缓存,用js来拦截浏览器的http请求,并设置缓存的文件,从而创建离线web应用.这里我们主要介绍的是使用`postMessage`方法进行`Service Worker`和页面之间的通讯.从页面发送信息到`Service Worker`
* 需要注意一点,这个页面如果直接扔进浏览器里(使用的是`file协议`)打开是会报错的,要使用`nginx`做端口映射,或者用node搭建一个服务器(使用http协议)来访问该页面(目前我猜测的原因是浏览器对file协议打开的文件做了一些服务的限制
