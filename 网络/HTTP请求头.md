### 通用首部

通用字段	作用

Cache-Control	控制缓存的行为

Connection	浏览器想要优先使用的连接类型，比如 keep-alive

Date	创建报文时间

Pragma	报文指令

Via	代理服务器相关信息

Transfer-Encoding	传输编码方式

Upgrade	要求客户端升级协议

Warning	在内容中可能存在错误

### 请求首部

请求首部	作用

Accept	能正确接收的媒体类型

Accept-Charset	能正确接收的字符集

Accept-Encoding	能正确接收的编码格式列表

Accept-Language	能正确接收的语言列表

Expect	期待服务端的指定行为

From	请求方邮箱地址

Host	服务器的域名

If-Match	两端资源标记比较

If-Modified-Since	本地资源未修改返回 304（比较时间）

If-None-Match	本地资源未修改返回 304（比较标记）

User-Agent	客户端信息

Max-Forwards	限制可被代理及网关转发的次数

Proxy-Authorization	向代理服务器发送验证信息

Range	请求某个内容的一部分

Referer	表示浏览器所访问的前一个页面

TE	传输编码方式

### 响应首部

响应首部	作用

Accept-Ranges	是否支持某些种类的范围

Age	资源在代理缓存中存在的时间

ETag	资源标识

Location	客户端重定向到某个 URL

Proxy-Authenticate	向代理服务器发送验证信息

Server	服务器名字

WWW-Authenticate	获取资源需要的验证信息

### 实体首部

实体首部	作用

Allow	资源的正确请求方式

Content-Encoding	内容的编码格式

Content-Language	内容使用的语言

Content-Length	request body 长度

Content-Location	返回数据的备用地址

Content-MD5	Base64加密格式的内容 MD5检验值

Content-Range	内容的位置范围

Content-Type	内容的媒体类型

Expires	内容的过期时间

Last_modified	内容的最后修改时间