/*
1. 发布订阅模式介绍

发布---订阅模式又叫观察者模式，它定义了对象间的一种一对多的关系，
让多个观察者对象同时监听某一个主题对象，当一个对象发生改变时，所有依赖于它的对象都将得到通知。

现实生活中的发布-订阅模式；

比如小红最近在淘宝网上看上一双鞋子，但是呢 联系到卖家后，才发现这双鞋卖光了，但是小红对这双鞋又非常喜欢，所以呢联系卖家，问卖家什么时候有货，卖家告诉她，要等一个星期后才有货，卖家告诉小红，要是你喜欢的话，你可以收藏我们的店铺，等有货的时候再通知你，所以小红收藏了此店铺，但与此同时，小明，小花等也喜欢这双鞋，也收藏了该店铺；等来货的时候就依次会通知他们；

在上面的故事中，可以看出是一个典型的发布订阅模式，卖家是属于发布者，小红，小明等属于订阅者，订阅该店铺，卖家作为发布者，当鞋子到了的时候，会依次通知小明，小红等，依次使用旺旺等工具给他们发布消息；
*/

/*
发布订阅模式的优点：

  1. 支持简单的广播通信，当对象状态发生改变时，会自动通知已经订阅过的对象。

比如上面的列子，小明，小红不需要天天逛淘宝网看鞋子到了没有，在合适的时间点，发布者(卖家)来货了的时候，会通知该订阅者(小红，小明等人)。

  2. 发布者与订阅者耦合性降低，发布者只管发布一条消息出去，它不关心这条消息如何被订阅者使用，同时，订阅者只监听发布者的事件名，只要发布者的事件名不变，它不管发布者如何改变；同理卖家（发布者）它只需要将鞋子来货的这件事告诉订阅者(买家)，他不管买家到底买还是不买，还是买其他卖家的。只要鞋子到货了就通知订阅者即可。

 对于第一点，我们日常工作中也经常使用到，比如我们的ajax请求，请求有成功(success)和失败(error)的回调函数，我们可以订阅ajax的success和error事件。我们并不关心对象在异步运行的状态，我们只关心success的时候或者error的时候我们要做点我们自己的事情就可以了

 发布订阅模式的缺点：

  1.创建订阅者需要消耗一定的时间和内存。

  2.虽然可以弱化对象之间的联系，如果过度使用的话，反而使代码不好理解及代码不好维护等等。

 */

/*
 如何实现发布--订阅模式？

  1. 首先要想好谁是发布者(比如上面的卖家)。

  2. 然后给发布者添加一个缓存列表，用于存放回调函数来通知订阅者(比如上面的买家收藏了卖家的店铺，卖家通过收藏了该店铺的一个列表名单)。

  3. 最后就是发布消息，发布者遍历这个缓存列表，依次触发里面存放的订阅者回调函数。

  我们还可以在回调函数里面添加一点参数，比如鞋子的颜色，鞋子尺码等信息；

  我们先来实现下简单的发布-订阅模式；代码如下：
*/
var shoeObj = {}; // 定义发布者
shoeObj.list = []; // 缓存列表 存放订阅者回调函数

// 增加订阅者
shoeObj.listen = function (fn) {
    shoeObj.list.push(fn); // 订阅消息添加到缓存列表
}

// 发布消息
shoeObj.trigger = function () {
    for (var i = 0, fn; fn = this.list[i++];) {
        fn.apply(this, arguments);
    }
}
// 小红订阅如下消息
shoeObj.listen(function (color, size) {
    console.log("颜色是：" + color);
    console.log("尺码是：" + size);
});

// 小花订阅如下消息
shoeObj.listen(function (color, size) {
    console.log("再次打印颜色是：" + color);
    console.log("再次打印尺码是：" + size);
});
shoeObj.trigger("红色", 40);
shoeObj.trigger("黑色", 42);
/*
打印如上截图，我们看到订阅者接收到发布者的每个消息，但是呢，对于小红来说，她只想接收颜色为红色的消息，不想接收颜色为黑色的消息，为此我们需要对代码进行如下改造下，我们可以先增加一个key，使订阅者只订阅自己感兴趣的消息。代码如下：
*/
var shoeObj = {}; // 定义发布者
shoeObj.list = []; // 缓存列表 存放订阅者回调函数

// 增加订阅者
shoeObj.listen = function (key, fn) {
    if (!this.list[key]) {
        // 如果还没有订阅过此类消息，给该类消息创建一个缓存列表
        this.list[key] = [];
    }
    this.list[key].push(fn); // 订阅消息添加到缓存列表
}

// 发布消息
shoeObj.trigger = function () {
    var key = Array.prototype.shift.call(arguments); // 取出消息类型名称
    var fns = this.list[key]; // 取出该消息对应的回调函数的集合

    // 如果没有订阅过该消息的话(没有使用listen订阅过，或者使用listen订阅了，但是没有回调函数)，则返回
    if (!fns || fns.length === 0) {
        return;
    }
    for (var i = 0, fn; fn = fns[i++];) {
        fn.apply(this, arguments); // arguments 是发布消息时附送的参数
    }
};

// 小红订阅如下消息
shoeObj.listen('red', function (size) {
    console.log("尺码是：" + size);
});

// 小花订阅如下消息
shoeObj.listen('block', function (size) {
    console.log("再次打印尺码是：" + size);
});
shoeObj.trigger("red", 40);
shoeObj.trigger("block", 42);
/*
3. 发布---订阅模式的代码封装

我们知道，对于上面的代码，小红去买鞋这么一个对象shoeObj 进行订阅，但是如果以后我们需要对买房子或者其他的对象进行订阅呢，我们需要复制上面的代码，再重新改下里面的对象代码；为此我们需要进行代码封装；
*/
var event = {
    list: [],
    listen: function (key, fn) {
        if (!this.list[key]) {
            this.list[key] = [];
        }
        // 订阅的消息添加到缓存列表中
        this.list[key].push(fn);
    },
    trigger: function () {
        var key = Array.prototype.shift.call(arguments);
        var fns = this.list[key];
        // 如果没有订阅过该消息的话，则返回
        if (!fns || fns.length === 0) {
            return;
        }
        for (var i = 0, fn; fn = fns[i++];) {
            fn.apply(this, arguments);
        }
    }
};
/*
我们再定义一个initEvent函数，这个函数使所有的普通对象都具有发布订阅功能，如下代码：
*/
var initEvent = function (obj) {
    for (var i in event) {
        obj[i] = event[i];
    }
};
// 我们再来测试下，我们还是给shoeObj这个对象添加发布-订阅功能；
var shoeObj = {};
initEvent(shoeObj);

// 小红订阅如下消息
shoeObj.listen('red', function (size) {
    console.log("尺码是：" + size);
});

// 小花订阅如下消息
shoeObj.listen('block', function (size) {
    console.log("再次打印尺码是：" + size);
});
shoeObj.trigger("red", 40);
shoeObj.trigger("block", 42);
/*
4.如何取消订阅事件？

比如上面的列子，小红她突然不想买鞋子了，那么对于卖家的店铺他不想再接受该店铺的消息，那么小红可以取消该店铺的订阅。
*/
event.remove = function (key, fn) {
    var fns = this.list[key];
    // 如果key对应的消息没有订阅过的话，则返回
    if (!fns) {
        return false;
    }
    // 如果没有传入具体的回调函数，表示需要取消key对应消息的所有订阅
    if (!fn) {
        fns&&(fns.length = 0);//fns数组存在 才设置为0
    } else {
        for (var i = 0; i < fns.length; i++) {
            var _fn = fns[i];
            if (_fn === fn) {
                fns.splice(i, 1); // 删除订阅者的回调函数
            }
        }
    }
};
// 测试代码如下：
var initEvent = function(obj) {
    for(var i in event) {
        obj[i] = event[i];
    }
};
var shoeObj = {};
initEvent(shoeObj);
// 小红订阅如下消息
shoeObj.listen('red',fn1 = function(size){
    console.log("尺码是："+size);  
});
// 小花订阅如下消息
shoeObj.listen('red',fn2 = function(size){
    console.log("再次打印尺码是："+size); 
});
shoeObj.remove("red",fn1);
shoeObj.trigger("red",42);
/*
5. 全局--发布订阅对象代码封装

我们再来看看我们传统的ajax请求吧，比如我们传统的ajax请求，请求成功后需要做如下事情：

 1. 渲染数据。

 2. 使用数据来做一个动画。

那么我们以前肯定是如下写代码：
*/

$.ajax("http://127.0.0.1/index.php",function(data){
    rendedData(data);  // 渲染数据
    doAnimate(data);  // 实现动画 
});
/*
假如以后还需要做点事情的话，我们还需要在里面写调用的方法；
这样代码就耦合性很高，那么我们现在使用发布-订阅模式来看如何重构上面的业务需求代码；
*/
$.ajax("http://127.0.0.1/index.php",function(data){
    Obj.trigger('success',data);  // 发布请求成功后的消息
});
// 下面我们来订阅此消息，比如我现在订阅渲染数据这个消息；
Obj.listen("success",function(data){
   renderData(data);
});
// 订阅动画这个消息
Obj.listen("success",function(data){
   doAnimate(data); 
});

// 为此我们可以封装一个全局发布-订阅模式对象；放在gloabl.js 如下代码：
var Event = (function(){
    var list = {},
          listen,
          trigger,
          remove;
          listen = function(key,fn){
            if(!list[key]) {
                list[key] = [];
            }
            list[key].push(fn);
        };
        trigger = function(){
            var key = Array.prototype.shift.call(arguments),
                 fns = list[key];
            if(!fns || fns.length === 0) {
                return false;
            }
            for(var i = 0, fn; fn = fns[i++];) {
                fn.apply(this,arguments);
            }
        };
        remove = function(key,fn){
            var fns = list[key];
            if(!fns) {
                return false;
            }
            if(!fn) {
                fns && (fns.length = 0);
            }else {
                for(var i = fns.length - 1; i >= 0; i--){
                    var _fn = fns[i];
                    if(_fn === fn) {
                        fns.splice(i,1);
                    }
                }
            }
        };
        return {
            listen: listen,
            trigger: trigger,
            remove: remove
        }
})();
// 测试代码如下：
Event.listen("color",function(size) {
    console.log("尺码为:"+size); // 打印出尺码为42
});
Event.trigger("color",42);
/*
6. 理解模块间通信

我们使用上面封装的全局的发布-订阅对象来实现两个模块之间的通信问题；比如现在有一个页面有一个按钮，每次点击此按钮后，div中会显示此按钮被点击的总次数；html如下代码：

<button id="count">点我</button>
<div id="showcount"></div>
*/

//我们中的a.js 负责处理点击操作 及发布消息；如下JS代码：
var a = (function(){
    var count = 0;
    var button = document.getElementById("count");
    button.onclick = function(){
        Event.trigger("add",count++);
    }
})();
// b.js 负责监听add这个消息，并把点击的总次数显示到页面上来；如下代码：
var b = (function(){
    var div = document.getElementById("showcount");
    Event.listen('add',function(count){
        div.innerHTML = count;
    });
})();
/*
下面是html代码如下，JS应用如下引用即可：
<!doctype html>
<html lang="en">
 <head>
  <meta charset="UTF-8">
  <title>Document</title>
  <script src="global.js"></script>
 </head>
 <body>
    <button id="count">点将我</button>
    <div id="showcount"></div>
    <script src = "a.js"></script>
    <script src = "b.js"></script>
 </body>
</html>
*/

/*
如上代码，当点击一次按钮后，showcount的div会自动加1，如上演示的是2个模块之间如何使用发布-订阅模式之间的通信问题；

其中global.js 就是我们上面封装的全局-发布订阅模式对象的封装代码；
*/