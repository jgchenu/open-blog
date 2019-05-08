/*
单体模式:提供一种将代码组织为一个逻辑单元的手段，这个逻辑单元中的代码可以通过单一变量进行访问。

单体模式的优点是：
可以用来划分命名空间，减少全局变量的数量。
使用单体模式可以使代码组织的更为一致，使代码容易阅读和维护。
可以被实例化，且实例化一次。

利用闭包来实现单体模式，划分一个基于闭包的变量，并且只能使用一次。
*/

// 单体模式
var Singleton = function(name){
    this.name = name;
};
Singleton.prototype.getName = function(){
    return this.name;
}
// 获取实例对象
var getInstance = (function() {
    var instance = null;
    return function(name) {
        if(!instance) {
            instance = new Singleton(name);
        }
        return instance;
    }
})();
// 测试单体模式的实例
var a = getInstance("aa");
var b = getInstance("bb");
console.log(a===b)
/*
理解使用代理实现单列模式的好处
    比如我现在页面上需要创建一个div的元素，那么我们肯定需要有一个创建div的函数，而现在我只需要这个函数只负责创建div元素，其他的它不想管，也就是想实现单一职责原则，就好比淘宝的kissy一样，一开始的时候他们定义kissy只做一件事，并且把这件事做好，具体的单体模式中的实例化类的事情交给代理函数去处理，这样做的好处是具体的业务逻辑分开了，代理只管代理的业务逻辑，在这里代理的作用是实例化对象，并且只实例化一次; 创建div代码只管创建div，其他的不管；如下代码：
*/  
var CreateDiv = function(html) {
    this.html = html;
    this.init();
}
CreateDiv.prototype.init = function(){
    var div = document.createElement("div");
    div.innerHTML = this.html;
    document.body.appendChild(div);
};
// 代理实现单体模式
var ProxyMode = (function(){
    var instance;
    return function(html) {
        if(!instance) {
            instance = new CreateDiv("我来测试下");
        }
        return instance;
    } 
})();
var a = new ProxyMode("aaa");
var b = new ProxyMode("bbb");
console.log(a===b);// true


/*
理解使用单体模式来实现弹窗的基本原理

下面我们继续来使用单体模式来实现一个弹窗的demo；我们先不讨论使用单体模式来实现，我们想下我们平时是怎么编写代码来实现弹窗效果的; 比如我们有一个弹窗，默认的情况下肯定是隐藏的，当我点击的时候，它需要显示出来；如下编写代码：
*/
// 没有使用单体模式实现弹窗效果
var createWindow = function(){
    var div = document.createElement("div");
    div.innerHTML = "我是弹窗内容";
    div.style.display = 'none';
    document.body.appendChild('div');
    return div;
};
document.getElementById("Id").onclick = function(){
    // 点击后先创建一个div元素
    var win = createWindow();
    win.style.display = "block";
}
/*
如上的代码；大家可以看看，有明显的缺点，比如我点击一个元素需要创建一个div，我点击第二个元素又会创建一次div，我们频繁的点击某某元素，他们会频繁的创建div的元素，虽然当我们点击关闭的时候可以移除弹出代码，但是呢我们频繁的创建和删除并不好，特别对于性能会有很大的影响，对DOM频繁的操作会引起重绘等，从而影响性能；因此这是非常不好的习惯；我们现在可以使用单体模式来实现弹窗效果，我们只实例化一次就可以了；如下代码：
*/
// 实现单体模式弹窗
var createWindow = (function(){
    var div;
    return function(){
        if(!div) {
            div = document.createElement("div");
            div.innerHTML = "我是弹窗内容";
            div.style.display = 'none';
            document.body.appendChild(div);
        }
        return div;
    }
})();
document.getElementById("Id").onclick = function(){
    // 点击后先创建一个div元素
    var win = createWindow();
    win.style.display = "block";
}

/*
上面的弹窗的代码虽然完成了使用单体模式创建弹窗效果，但是代码并不通用
比如上面是完成弹窗的代码，假如我们以后需要在页面中一个iframe呢？我们是不是需要重新写一套创建iframe的代码呢？比如如下创建iframe：
*/
var createIframe = (function(){
    var iframe;
    return function(){
        if(!iframe) {
            iframe = document.createElement("iframe");
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        return iframe;
    };
})();
/*
我们看到如上代码，创建div的代码和创建iframe代码很类似，
我们现在可以考虑把通用的代码分离出来，使代码变成完全抽象，我们现在可以编写一套代码封装在getInstance函数内，如下代码：
*/
var getInstance = function(fn) {
    var result;
    return function(){
        return result || (result = fn.call(this,arguments));
    }
};
/*
如上代码：我们使用一个参数fn传递进去，如果有result这个实例的话，直接返回，否则的话，当前的getInstance函数调用fn这个函数，是this指针指向与这个fn这个函数；之后返回被保存在result里面；现在我们可以传递一个函数进去，不管他是创建div也好，还是创建iframe也好，总之如果是这种的话，都可以使用getInstance来获取他们的实例对象；
*/
// 创建div
var createWindow = function(){
    var div = document.createElement("div");
    div.innerHTML = "我是弹窗内容";
    div.style.display = 'none';
    document.body.appendChild(div);
    return div;
};
// 创建iframe
var createIframe = function(){
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    return iframe;
};
// 获取实例的封装代码
var getInstance = function(fn) {
    var result;
    return function(){
        return result || (result = fn.call(this,arguments));
    }
};
// 测试创建div
var createSingleDiv = getInstance(createWindow);
document.getElementById("Id").onclick = function(){
    var win = createSingleDiv();
    win.style.display = "block";
};
// 测试创建iframe
var createSingleIframe = getInstance(createIframe);
document.getElementById("Id").onclick = function(){
    var win = createSingleIframe();
    win.src = "http://cnblogs.com";
};