onconnect = function (e) {
    var port = e.ports[0];
    port.addEventListener('message', function (e) {
        var workerResult = 'Result: ' + (e.data[0] + e.data[1]+JSON.stringify(e.ports));
        port.postMessage(workerResult);
    });
    port.start();
}