var worker = new Worker('./work.js')
// 监听消息事件
worker.addEventListener('message', function (e) {
    console.log('MAIN: ', 'RECEIVE', e.data);
});
/*
或者可以使用 onmessage 来监听消息事件：
worker.onmessage = function () {
 console.log('MAIN: ', 'RECEIVE', e.data);
};
*/
// 监听 error 事件
worker.addEventListener('error', function (e) {
    console.log('MAIN: ', 'ERROR', e);
    console.log('MAIN: ', 'ERROR', 'filename:' + e.filename + '---message:' + e.message + '---lineno:' + e.lineno);
    /*
        event.filename: 导致错误的 Worker 脚本的名称；
        event.message: 错误的信息；
        event.lineno: 出现错误的行号；
    */
});
/*
或者可以使用 onerror来监听错误事件：
worker.onerror = function () {
 console.log('MAIN: ', 'ERROR', e);
};
*/
//触发事件，传递信息给 Worker
worker.postMessage({
    m: 'Hello Worker, I am main.js'
});
// worker.terminate();