### POST跟GET 

* 本质上都是TCP链接，但是由于浏览器不同 服务器不同 HTTP规定 在应用中表现出来是有些不同的。
* 换道理说，你是可以在GET 加url参数，也可以加request body，你也可以使用post 加url参数，不过有些服务器是忽略GET方法的request body的。
* 但是两者还有一个 真正的区别，GET只发一个TCP包，POST发两个TCP包，GET 将header跟data 一起发出去(一个TCP包)，而POST 会先发header (一个TCP包)，然后等服务器响应100 再发data(另外一个TCP包),然后服务器再响应200， 所以在网络差的时候，GET比POST更快。
* Get 请求能缓存，Post 不能。
* Post 相对 Get 安全一点点，因为Get 请求都包含在 URL 里（当然你想写到 body 里也是可以的），且会被浏览器保存历史纪录。Post虽然可以带url，但是不会被浏览器保存历史记录，但是在抓包的情况下都是一样的。
* URL有长度限制，会影响 Get 请求，但是这个长度限制是浏览器规定的，不是 RFC 规定的

