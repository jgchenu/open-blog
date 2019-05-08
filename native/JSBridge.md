## JSBridge 介绍

JSBridge是一座用JavaScript搭建起来的桥，一端是web，一端是native。我们搭建这座桥的目的也很简单，让native可以调用web的js代码，让web可以 “调用” 原生的代码。

## JSBridge 起源

当然不是因为 JavaScript 语言高人一等（虽然斯坦福大学已经把算法导论的语言从 Java 改成 JavaScript，小得意一下，嘻嘻），主要的原因还是因为 JavaScript 主要载体 Web 是当前世界上的 **最易编写 、 最易维护 、 最易部署**的 UI 构建方式。工程师可以用很简单的 HTML 标签和 CSS 样式快速的构建出一个页面，并且在服务端部署后，用户不需要主动更新，就能看到最新的 UI 展现。

因此，**开发维护成本** 和 **更新成本** 较低的 Web 技术成为混合开发中几乎不二的选择，而作为 Web 技术逻辑核心的 JavaScript 也理所应当肩负起与其他技术『桥接』的职责，并且作为移动不可缺少的一部分，任何一个移动操作系统中都包含可运行 JavaScript 的容器，例如 WebView 和 JSCore。所以，运行 JavaScript 不用像运行其他语言时，要额外添加运行环境。因此，基于上面种种原因，`JSBridge` 应运而生。

`PhoneGap`（Codova 的前身）作为 Hybrid 鼻祖框架，应该是最先被开发者广泛认知的 `JSBridge` 的应用场景；而对于 `JSBridge` 的应用在国内真正兴盛起来，则是因为杀手级应用微信的出现，主要用途是在网页中通过 `JSBridge` 设置分享内容。

移动端混合开发中的 `JSBridge`，主要被应用在两种形式的技术方案上：

* 基于 Web 的 Hybrid 解决方案：例如微信浏览器、各公司的 Hybrid 方案

* 非基于 Web UI 但业务逻辑基于 JavaScript 的解决方案：例如 React-Native
* 【注】：微信小程序基于 Web UI，但是为了追求运行效率，对 UI 展现逻辑和业务逻辑的 JavaScript 进行了隔离。因此小程序的技术方案介于上面描述的两种方式之间。



## JSBridge 的用途

`JSBridge` 简单来讲，主要是 给 `JavaScript` 提供调用 `Native` 功能的接口，让混合开发中的『前端部分』可以方便地使用地址位置、摄像头甚至支付等 `Native` 功能。

既然是『简单来讲』，那么 JSBridge 的用途肯定不只『调用 Native 功能』这么简单宽泛。实际上，JSBridge 就像其名称中的『Bridge』的意义一样，是 Native 和非 Native 之间的桥梁，它的核心是 构建 Native 和非 Native 间消息通信的通道，而且是 双向通信的通道。

所谓 双向通信的通道: native<->jsbridge<->javascript

* JS 向 Native 发送消息 : 调用相关功能、通知 Native 当前 JS 的相关状态等。

* Native 向 JS 发送消息 : 回溯调用结果、消息推送、通知 JS 当前 Native 的状态等。

这里有些同学有疑问了：消息都是单向的，那么调用 Native 功能时 Callback 怎么实现的？

## JSBridge 的实现原理

`JavaScript` 运行在一个单独的 `JS Context` 中（例如，WebView 的 `Webkit` 引擎、`JSCore`）。由于这些 `Context` 与原生运行环境的天然隔离，我们可以将这种情况与 `RPC`（`Remote Procedure Call`，远程过程调用）通信进行类比，将 Native 与 JavaScript 的每次互相调用看做一次 RPC 调用。

![bridge1](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/bridge1.jpg)

在 `JSBridge` 的设计中，可以把前端看做 `RPC` 的客户端，把 `Native` 端看做 `RPC` 的服务器端。 `JSBridge` 要实现的主要逻辑就出现了：通信调用（Native 与 JS 通信） 和 句柄解析调用。（如果你是个前端，而且并不熟悉 `RPC` 的话，你也可以把这个流程类比成 JSONP 的流程）

通过以上的分析，可以清楚地知晓 `JSBridge` 主要的功能和职责，接下来就以 `Hybrid` 方案 为案例从这几点来剖析 `JSBridge` 的实现原理。


### JSBridge 的通信原理

Hybrid 方案是基于 WebView 的，JavaScript 执行在 WebView 的 Webkit 引擎中。因此，Hybrid 方案中 JSBridge 的通信原理会具有一些 Web 特性。

### JavaScript 调用 Native
JavaScript 调用 Native 的方式，主要有两种：
* 注入 API 
* 拦截 URL SCHEME。

### 注入API
注入 API 方式的主要原理是，通过 WebView 提供的接口，向 JavaScript 的 Context（window）中注入对象或者方法，让 JavaScript 调用时，直接执行相应的 Native 代码逻辑，达到 JavaScript 调用 Native 的目的。

对于 iOS 的 UIWebView，实例如下：
```js
JSContext *context = [uiWebView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];

context[@"postBridgeMessage"] = ^(NSArray<NSArray *> *calls) {
    // Native 逻辑
};
```

前端调用方式：
```js
window.postBridgeMessage(message);
```
对于 iOS 的 WKWebView 可以用以下方式：
```js
@interface WKWebVIewVC ()<WKScriptMessageHandler>

@implementation WKWebVIewVC

- (void)viewDidLoad {
    [super viewDidLoad];

    WKWebViewConfiguration* configuration = [[WKWebViewConfiguration alloc] init];
    configuration.userContentController = [[WKUserContentController alloc] init];
    WKUserContentController *userCC = configuration.userContentController;
    // 注入对象，前端调用其方法时，Native 可以捕获到
    [userCC addScriptMessageHandler:self name:@"nativeBridge"];

    WKWebView wkWebView = [[WKWebView alloc] initWithFrame:self.view.frame configuration:configuration];

    // TODO 显示 WebView
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if ([message.name isEqualToString:@"nativeBridge"]) {
        NSLog(@"前端传递的数据 %@: ",message.body);
        // Native 逻辑
    }
}
```
前端调用方式：
```js
window.webkit.messageHandlers.nativeBridge.postMessage(message);
```
对于 Android 可以采用下面的方式：
```js
ublic class JavaScriptInterfaceDemoActivity extends Activity {
	private WebView Wv;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Wv = (WebView)findViewById(R.id.webView);
        final JavaScriptInterface myJavaScriptInterface = new JavaScriptInterface(this);

        Wv.getSettings().setJavaScriptEnabled(true);
        Wv.addJavascriptInterface(myJavaScriptInterface, "nativeBridge");

        // TODO 显示 WebView

    }

    public class JavaScriptInterface {
         Context mContext;

         JavaScriptInterface(Context c) {
             mContext = c;
         }

         public void postMessage(String webMessage){
             // Native 逻辑
         }
     }
}
```
前端调用方式：
```js
window.nativeBridge.postMessage(message);
```
在 4.2 之前，Android 注入 JavaScript 对象的接口是 addJavascriptInterface，但是这个接口有漏洞，可以被不法分子利用，危害用户的安全，因此在 4.2 中引入新的接口 @JavascriptInterface（上面代码中使用的）来替代这个接口，解决安全问题。所以 Android 注入对对象的方式是 有**兼容性问题**的。（4.2 之前很多方案都采用拦截 prompt 的方式来实现，因为篇幅有限，这里就不展开了。）

### 拦截 URL SCHEME

先解释一下 URL SCHEME：URL SCHEME是一种类似于url的链接，是为了方便app直接互相调用设计的，形式和普通的 url 近似，主要区别是 protocol 和 host 一般是自定义的，例如: qunarhy://hy/url?url=http://ymfe.tech，protocol 是 qunarhy，host 则是 hy。

拦截 URL SCHEME 的主要流程是：Web 端通过某种方式（例如 iframe.src）发送 URL Scheme 请求，之后 Native 拦截到请求并根据 URL SCHEME（包括所带的参数）进行相关操作。

在时间过程中，这种方式有一定的 缺陷：

* 使用 iframe.src 发送 URL SCHEME 会有 url 长度的隐患。
* 创建请求，需要一定的耗时，比注入 API 的方式调用同样的功能，耗时会较长。

但是之前为什么很多方案使用这种方式呢？因为它 支持 `iOS6`。而现在的大环境下，iOS6 占比很小，基本上可以忽略，所以并不推荐为了 iOS6 使用这种 并不优雅 的方式。

【注】：有些方案为了规避 url 长度隐患的缺陷，在 iOS 上采用了使用 Ajax 发送同域请求的方式，并将参数放到 head 或 body 里。这样，虽然规避了 url 长度的隐患，但是 WKWebView 并不支持这样的方式。

【注2】：为什么选择 iframe.src 不选择 locaiton.href ？因为如果通过 location.href 连续调用 Native，很容易丢失一些调用。

### Native 调用 JavaScript
相比于 JavaScript 调用 Native， Native 调用 JavaScript 较为简单，毕竟不管是 iOS 的 UIWebView 还是 WKWebView，还是 Android 的 WebView 组件，都以子组件的形式存在于 View/Activity 中，直接调用相应的 API 即可。

Native 调用 JavaScript，其实就是执行拼接 JavaScript 字符串，从外部调用 JavaScript 中的方法，因此 JavaScript 的方法必须在全局的 window 上。（闭包里的方法，JavaScript 自己都调用不了，更不用想让 Native 去调用了）

对于 iOS 的 UIWebView，示例如下：
```js
result = [uiWebview stringByEvaluatingJavaScriptFromString:javaScriptString];
```
对于 iOS 的 WKWebView，示例如下：
```js
[wkWebView evaluateJavaScript:javaScriptString completionHandler:completionHandler];
```
对于 Android，在 Kitkat（4.4）之前并没有提供 iOS 类似的调用方式，只能用 loadUrl 一段 JavaScript 代码，来实现：
```js
webView.loadUrl("javascript:" + javaScriptString);
```
而 Kitkat 之后的版本，也可以用 evaluateJavascript 方法实现：
```js
webView.evaluateJavascript(javaScriptString, new ValueCallback<String>() {
    @Override
    public void onReceiveValue(String value) {

    }
});
```
【注】：使用 loadUrl 的方式，并不能获取 JavaScript 执行后的结果。

### 通信原理小总结
通信原理是 JSBridge 实现的核心，实现方式可以各种各样，但是万变不离其宗。这里，笔者推荐的实现方式如下：

* JavaScript 调用 Native 推荐使用 注入 API 的方式（iOS6 忽略，Android 4.2以下使用 WebViewClient 的 onJsPrompt 方式）。

* Native 调用 JavaScript 则直接执行拼接好的 JavaScript 代码即可。

对于其他方式，诸如 React Native、微信小程序 的通信方式都与上描述的近似，并根据实际情况进行优化。

以 React Native 的 iOS 端举例：JavaScript 运行在 JSCore 中，实际上可以与上面的方式一样，利用注入 API 来实现 JavaScript 调用 Native 功能。不过 React Native 并没有设计成 JavaScript 直接调用 Object-C，而是 `为了与 Native 开发里事件响应机制一致，设计成 需要在 Object-C 去调 JavaScript 时才通过返回值触发调用`。原理基本一样，只是实现方式不同。

当然不仅仅 iOS 和 Android，其他手机操作系统也用相应的 API，例如 WMP（Win 10）下可以用 window.external.notify 和 WebView.InvokeScript/InvokeScriptAsync 进行双向通信。其他系统也类似。
### JSBridge 接口实现
从上面的剖析中，可以得知，JSBridge 的接口主要功能有两个：**调用 Native（给 Native 发消息）** 和 **被 Native 调用（接收 Native 消息）**。因此，JSBridge 可以设计如下：
```js
window.JSBridge = {
    // 调用 Native
    invoke: function(msg) {
        // 判断环境，获取不同的 nativeBridge
        nativeBridge.postMessage(msg);
    },
    receiveMessage: function(msg) {
        // 处理 msg
    }
};
```
在上面的文章中，提到过 RPC 中有一个非常重要的环节是 `句柄解析调用` ，这点在 JSBridge 中体现为 `句柄与功能对应关系`。同时，我们将句柄抽象为 `桥名（BridgeName）`，最终演化为 一个 `BridgeName` 对应一个 `Native 功能`或者一类` Native 消息`。 基于此点，JSBridge 的实现可以优化为如下：
```js
window.JSBridge = {
    // 调用 Native
    invoke: function(bridgeName, data) {
        // 判断环境，获取不同的 nativeBridge
        nativeBridge.postMessage({
            bridgeName: bridgeName,
            data: data || {}
        });
    },
    receiveMessage: function(msg) {
        var bridgeName = msg.bridgeName,
            data = msg.data || {};
        // 具体逻辑
    }
};
```
JSBridge 大概的雏形出现了。现在终于可以着手解决这个问题了：消息都是单向的，那么调用 Native 功能时 Callback 怎么实现的？

对于 JSBridge 的 Callback ，其实就是 RPC 框架的回调机制。当然也可以用更简单的 JSONP 机制解释：

> 当发送 JSONP 请求时，url 参数里会有 callback 参数，其值是 当前页面唯一 的，而同时以此参数值为 key 将回调函数存到 window 上，随后，服务器返回 script 中，也会以此参数值作为句柄，调用相应的回调函数。

由此可见，`callback` 参数这个 唯一标识 是这个回调逻辑的关键。这样，我们可以参照这个逻辑来实现 JSBridge：用一个自增的唯一 id，来标识并存储回调函数，并把此 id 以参数形式传递给 Native，而 Native 也以此 id 作为回溯的标识。这样，即可实现 Callback 回调逻辑。
```js
(function () {
    var id = 0,
        callbacks = {};

    window.JSBridge = {
        // 调用 Native
        invoke: function(bridgeName, callback, data) {
            // 判断环境，获取不同的 nativeBridge
            var thisId = id ++; // 获取唯一 id
            callbacks[thisId] = callback; // 存储 Callback
            nativeBridge.postMessage({
                bridgeName: bridgeName,
                data: data || {},
                callbackId: thisId // 传到 Native 端
            });
        },
        receiveMessage: function(msg) {
            var bridgeName = msg.bridgeName,
                data = msg.data || {},
                callbackId = msg.callbackId; // Native 将 callbackId 原封不动传回
            // 具体逻辑
            // bridgeName 和 callbackId 不会同时存在
            if (callbackId) {
                if (callbacks[callbackId]) { // 找到相应句柄
                    callbacks[callbackId](msg.data); // 执行调用
                }
            } else if (bridgeName) {

            }
        }
    };
})();
```
最后用同样的方式加上 Native 调用的回调逻辑，同时对代码进行一些优化，就大概实现了一个功能比较完整的 JSBridge。其代码如下：

```js
(function () {
    var id = 0,
        callbacks = {},
        registerFuncs = {};

    window.JSBridge = {
        // 调用 Native
        invoke: function(bridgeName, callback, data) {
            // 判断环境，获取不同的 nativeBridge
            var thisId = id ++; // 获取唯一 id
            callbacks[thisId] = callback; // 存储 Callback
            nativeBridge.postMessage({
                bridgeName: bridgeName,
                data: data || {},
                callbackId: thisId // 传到 Native 端
            });
        },
        receiveMessage: function(msg) {
            var bridgeName = msg.bridgeName,
                data = msg.data || {},
                callbackId = msg.callbackId, // Native 将 callbackId 原封不动传回
                responstId = msg.responstId;
            // 具体逻辑
            // bridgeName 和 callbackId 不会同时存在
            if (callbackId) {
                if (callbacks[callbackId]) { // 找到相应句柄
                    callbacks[callbackId](msg.data); // 执行调用
                }
            } else if (bridgeName) {
                if (registerFuncs[bridgeName]) { // 通过 bridgeName 找到句柄
                    var ret = {},
                        flag = false;
                    registerFuncs[bridgeName].forEach(function(callback) => {
                        callback(data, function(r) {
                            flag = true;
                            ret = Object.assign(ret, r);
                        });
                    });
                    if (flag) {
                        nativeBridge.postMessage({ // 回调 Native
                            responstId: responstId,
                            ret: ret
                        });
                    }
                }
            }
        },
        register: function(bridgeName, callback) {
            if (!registerFuncs[bridgeName])  {
                registerFuncs[bridgeName] = [];
            }
            registerFuncs[bridgeName].push(callback); // 存储回调
        }
    };
})();
```
当然，这段代码片段只是一个示例，主要用于剖析 JSBridge 的原理和流程，里面存在诸多省略和不完善的代码逻辑，读者们可以自行完善。

【注】：这一节主要讲的是，JavaScript 端的 JSBridge 的实现，对于 Native 端涉及的并不多。在 Native 端配合实现 JSBridge 的 JavaScript 调用 Native 逻辑也很简单，主要的代码逻辑是：接收到 JavaScript 消息 => 解析参数，拿到 bridgeName、data 和 callbackId => 根据 bridgeName 找到功能方法，以 data 为参数执行 => 执行返回值和 callbackId 一起回传前端。 Native 调用 JavaScript 也同样简单，直接自动生成一个唯一的 ResponseId，并存储句柄，然后和 data 一起发送给前端即可。

## JSBridge 如何引用

对于 JSBridge 的引用，常用有两种方式，各有利弊。

### 由 Native 端进行注入
注入方式和 Native 调用 JavaScript 类似，直接执行桥的全部代码。

它的优点在于：桥的版本很容易与 Native 保持一致，Native 端不用对不同版本的 JSBridge 进行兼容；与此同时，它的缺点是：注入时机不确定，需要实现注入失败后重试的机制，保证注入的成功率，同时 JavaScript 端在调用接口时，需要优先判断 JSBridge 是否已经注入成功。

### 由 JavaScript 端引用
直接与 JavaScript 一起执行。

与由 Native 端注入正好相反，它的优点在于：JavaScript 端可以确定 JSBridge 的存在，直接调用即可；缺点是：如果桥的实现方式有更改，JSBridge 需要兼容多版本的 Native Bridge 或者 Native Bridge 兼容多版本的 JSBridge。