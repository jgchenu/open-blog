### 介绍
---
WebSocket 协议在2008年诞生，2011年成为国际标准。所有浏览器都已经支持了。

它的最大特点就是，服务器可以主动向客户端推送信息，客户端也可以主动向服务器发送信息，是真正的双向平等对话，属于服务器推送技术的一种(HTTP2.0也支持推送了)。

其他特点包括：

（1）建立在 TCP 协议之上，服务器端的实现比较容易。

（2）与 HTTP 协议有着良好的兼容性。默认端口也是80和443，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器。并且WebSocket复用了HTTP的握手通道。具体指的是，客户端通过HTTP请求与WebSocket服务端协商升级协议，协议升级完成后，后续的数据交换则遵照WebSocket的协议。

（3）数据格式比较轻量，性能开销小，通信高效。

（4）可以发送文本，也可以发送二进制数据。

（5）没有同源限制，客户端可以与任意服务器通信。

（6）协议标识符是ws（如果加密，则为wss），服务器网址就是 URL。

```
ws://example.com:80/some/path
```

### 客户端的简单示例
---

下面是一个网页脚本的例子（点击这里看运行结果），基本上一眼就能明白。

```
var ws = new WebSocket("wss://echo.websocket.org");

ws.onopen = function(evt) { 
  console.log("Connection open ..."); 
  ws.send("Hello WebSockets!");
};

ws.onmessage = function(evt) {
  console.log( "Received Message: " + evt.data);
  ws.close();
};

ws.onclose = function(evt) {
  console.log("Connection closed.");
};      
// 上面也可以用这种格式,给wx实例增加事件监听
ws.addEventListener("message", function(event) {
  var data = event.data;
  // 处理数据
});
```
#### 跟http请求的构造函数XMLHttpRequerst.readyState一样也有webSocket.readyState

readyState属性返回实例对象的当前状态，共有四种。

* CONNECTING：值为0，表示正在连接。
* OPEN：值为1，表示连接成功，可以通信了。
* CLOSING：值为2，表示连接正在关闭。
* CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
下面是一个示例。
```
switch (ws.readyState) {
  case WebSocket.CONNECTING:
    // do something
    break;
  case WebSocket.OPEN:
    // do something
    break;
  case WebSocket.CLOSING:
    // do something
    break;
  case WebSocket.CLOSED:
    // do something
    break;
  default:
    // this never happens
    break;
}
```

注意，服务器数据可能是文本，也可能是二进制数据（blob对象或Arraybuffer对象）。


webSocket.onmessage
实例对象的onmessage属性，用于指定收到服务器数据后的回调函数。

```

ws.addEventListener("message", function(event) {
  var data = event.data;
  // 处理数据
});
ws.onmessage = function(event){
  if(typeof event.data === String) {
    console.log("Received data string");
  }

  if(event.data instanceof ArrayBuffer){
    var buffer = event.data;
    console.log("Received arraybuffer");
  }
}
```
除了动态判断收到的数据类型，也可以使用binaryType属性，显式指定收到的二进制数据类型。

```
// 收到的是 blob 数据
ws.binaryType = "blob";
ws.onmessage = function(e) {
  console.log(e.data.size);
};

// 收到的是 ArrayBuffer 数据
ws.binaryType = "arraybuffer";
ws.onmessage = function(e) {
  console.log(e.data.byteLength);
};
```
### 如何建立连接

前面提到，WebSocket复用了HTTP的握手通道。具体指的是，客户端通过HTTP请求与WebSocket服务端协商升级协议。协议升级完成后，后续的数据交换则遵照WebSocket的协议。


#### 1、客户端：申请协议升级
首先，客户端发起协议升级请求。可以看到，采用的是标准的HTTP报文格式，且只支持GET方法。
```
GET / HTTP/1.1
Host: localhost:8080
Origin: http://127.0.0.1:3000
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: w4v7O6xFTi36lq3RNcgctw==
```
重点请求首部意义如下：

* Connection: Upgrade：表示要升级协议
* Upgrade: websocket：表示要升级到websocket协议。
* Sec-WebSocket-Version: 13：表示websocket的版本。如果服务端不支持该版本，需要返回一个Sec-WebSocket-Versionheader，里面包含服务端支持的版本号。
* Sec-WebSocket-Key：与后面服务端响应首部的Sec-WebSocket-Accept是配套的，提供基本的防护，比如恶意的连接，或者无意的连接。


注意，上面请求省略了部分非重点请求首部。由于是标准的HTTP请求，类似Host、Origin、Cookie等请求首部会照常发送。在握手阶段，可以通过相关请求首部进行 安全限制、权限校验等。

#### 服务端：响应协议升级

服务端返回内容如下，状态代码101表示协议切换。到此完成协议升级，后续的数据交互都按照新的协议来。
```
HTTP/1.1 101 Switching Protocols
Connection:Upgrade
Upgrade: websocket
Sec-WebSocket-Accept: Oy4NRAQ13jhfONC7bP8dTKb4PTU=
```

备注：每个header都以`\r\n`结尾，并且最后一行加上一个额外的空行`\r\n`。此外，服务端回应的HTTP状态码只能在握手阶段使用。过了握手阶段后，就只能采用特定的错误码。

**Sec-WebSocket-Accept的计算**

Sec-WebSocket-Accept根据客户端请求首部的Sec-WebSocket-Key计算出来。
计算公式为：

* 将Sec-WebSocket-Key跟258EAFA5-E914-47DA-95CA-C5AB0DC85B11拼接。
* 通过SHA1计算出摘要，并转成base64字符串。

伪代码如下：
>toBase64( sha1( Sec-WebSocket-Key + 258EAFA5-E914-47DA-95CA-C5AB0DC85B11 )  )
复制代码验证下前面的返回结果：
```
const crypto = require('crypto');
const magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const secWebSocketKey = 'w4v7O6xFTi36lq3RNcgctw==';

let secWebSocketAccept = crypto.createHash('sha1')
	.update(secWebSocketKey + magic)
	.digest('base64');

console.log(secWebSocketAccept);
// Oy4NRAQ13jhfONC7bP8dTKb4PTU=
```
#### 连接保持+心跳

WebSocket为了保持客户端、服务端的实时双向通信，需要确保客户端、服务端之间的TCP通道保持连接没有断开。然而，对于长时间没有数据往来的连接，如果依旧长时间保持着，可能会浪费包括的连接资源。
但不排除有些场景，客户端、服务端虽然长时间没有数据往来，但仍需要保持连接。这个时候，可以采用心跳来实现。

发送方->接收方：ping
接收方->发送方：pong

ping、pong的操作，对应的是WebSocket的两个控制帧，opcode分别是`0x9`、`0xA`。
举例，WebSocket服务端向客户端发送ping，只需要如下代码（采用ws模块）
```
ws.ping('', false, true);
```

