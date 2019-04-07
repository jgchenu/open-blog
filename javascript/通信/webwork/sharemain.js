var myWorker = new SharedWorker("sharework.js");


myWorker.port.start();


myWorker.port.postMessage("hello, I'm main");


myWorker.port.onmessage = function (e) {
    console.log('Message received from worker',e.data);
}