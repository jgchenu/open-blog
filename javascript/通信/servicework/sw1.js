self.addEventListener("message", function(event) {
    console.log("sw1.js " + event.data);
    event.source.postMessage('this message is from sw1.js, to page');
});