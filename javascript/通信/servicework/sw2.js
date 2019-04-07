self.addEventListener("message", function(event) {    
    console.log("sw2.js " + event.data); 
     // event.source是消息来源页面对象的引用   
    event.source.postMessage('this message is from sw2.js, to page');
});