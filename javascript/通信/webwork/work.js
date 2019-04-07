/*
Worker 的环境与作用域

在 Worker 线程的运行环境中没有 window 全局对象，也无法访问 DOM 对象，所以一般来说他只能来执行纯 JavaScript 的计算操作。

但是，他还是可以获取到部分浏览器提供的 API 的：

`setTimeout()， clearTimeout()， setInterval()， clearInterval()`：有了设计个函数，就可以在 Worker 线程中执行定时操作了；
`XMLHttpRequest` 对象：意味着我们可以在 Worker 线程中执行 **ajax** 请求；
`navigator` 对象：可以获取到 ppName，appVersion，platform，userAgent 等信息；
`location` 对象（只读）：可以获取到有关当前 URL 的信息；

*/

console.log('WORKER TASK: ', 'running');
//加载外部脚本
importScripts('work2.js', 'work3.js');
onmessage = function (e) {
    console.log('WORKER TASK: ', 'RECEIVE', e.data);
    // 发送数据事件
    postMessage('Hello, I am Worker');
    postMessage( hhh );
}
/*
或者使用 addEventListener 来监听事件
addEventListener('message', function (e) {
 console.log('WORKER TASK: ', 'RECEIVE', e.data);
 ...
});
*/