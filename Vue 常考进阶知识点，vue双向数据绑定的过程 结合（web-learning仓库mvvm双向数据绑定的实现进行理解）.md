## 剖析Vue实现原理 - 如何实现双向绑定mvvm

> 本文能帮你做什么？<br>
> 1、了解vue的双向数据绑定原理以及核心代码模块<br>
> 2、缓解好奇心的同时了解如何实现双向绑定<br>
> 为了便于说明原理与实现，本文相关代码主要摘自[vue源码]

##### 相信大家对mvvm双向绑定应该都不陌生了，一言不合上代码，下面先看一个本文最终实现的效果吧，和vue一样的语法，如果还不了解双向绑定，猛戳[Google](https://www.google.com.hk/search?q=%E5%8F%8C%E5%90%91%E7%BB%91%E5%AE%9A)

```html
<div id="mvvm-app">
    <input type="text" v-model="word">
    <p>{{word}}</p>
    <button v-on:click="sayHi">change model</button>
</div>

<script src="./js/observer.js"></script>
<script src="./js/watcher.js"></script>
<script src="./js/compile.js"></script>
<script src="./js/mvvm.js"></script>
<script>
var vm = new MVVM({
    el: '#mvvm-app',
        data: {
            word: 'Hello World!'
        },
        methods: {
            sayHi: function() {
                this.word = 'Hi, everybody!';
            }
        }
    });
</script>
```
效果：![请求头，返回头](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/mvvm1.gif)
### 几种实现双向绑定的做法
目前几种主流的mvc(vm)框架都实现了单向数据绑定，而我所理解的双向数据绑定无非就是在单向绑定的基础上给可输入元素（input、textare等）添加了change(input)事件，来动态修改model和 view，并没有多高深。所以无需太过介怀是实现的单向或双向绑定。

实现数据绑定的做法有大致如下几种：

> 发布者-订阅者模式（backbone.js）

> 脏值检查（angular.js） <br>

> 数据劫持（vue.js） 

**发布者-订阅者模式:** 一般通过sub, pub的方式实现数据和视图的绑定监听，更新数据方式通常做法是 `vm.set('property', value)`，这里有篇文章讲的比较详细，有兴趣可点[这里](http://www.html-js.com/article/Study-of-twoway-data-binding-JavaScript-talk-about-JavaScript-every-day)

这种方式现在毕竟太low了，我们更希望通过 `vm.property = value `这种方式更新数据，同时自动更新视图，于是有了下面两种方式

**脏值检查:** angular.js 是通过脏值检测的方式比对数据是否有变更，来决定是否更新视图，最简单的方式就是通过 `setInterval()` 定时轮询检测数据变动，当然Google不会这么low，angular只有在指定的事件触发时进入脏值检测，大致如下：

- DOM事件，譬如用户输入文本，点击按钮等。( ng-click ) 
- XHR响应事件 ( $http ) 
- 浏览器Location变更事件 ( $location ) 
- Timer事件( $timeout , $interval ) 
- 执行 $digest() 或 $apply()

**数据劫持:** vue.js 则是采用数据劫持结合发布者-订阅者模式的方式，通过`Object.defineProperty()`来劫持各个属性的`setter`，`getter`，在数据变动时发布消息给订阅者，触发相应的监听回调。


### 思路整理
已经了解到vue是通过数据劫持的方式来做数据绑定的，其中最核心的方法便是通过`Object.defineProperty()`来实现对属性的劫持，达到监听数据变动的目的，无疑这个方法是本文中最重要、最基础的内容之一，如果不熟悉defineProperty，猛戳[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
整理了一下，要实现mvvm的双向绑定，就必须要实现以下几点：
1、实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
2、实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
3、实现一个Watcher，作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图
4、mvvm入口函数，整合以上三者
![请求头，返回头](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/mvvm.png)


### 1、实现Observer
ok, 思路已经整理完毕，也已经比较明确相关逻辑和模块功能了，let's do it
我们知道可以利用`Obeject.defineProperty()`来监听属性变动
那么将需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上	`setter`和`getter`
这样的话，给这个对象的某个值赋值，就会触发`setter`，那么就能监听到了数据变化。。相关代码可以是这样：
```javascript
var data = {name: 'kindeng'};
observe(data);
data.name = 'dmq'; // 哈哈哈，监听到值变化了 kindeng --> dmq

function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    // 取出所有属性遍历
    Object.keys(data).forEach(function(key) {
	    defineReactive(data, key, data[key]);
	});
};

function defineReactive(data, key, val) {
    observe(val); // 监听子属性
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: false, // 不能再define
        get: function() {
            return val;
        },
        set: function(newVal) {
            console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
            val = newVal;
        }
    });
}

```
这样我们已经可以监听每个数据的变化了，那么监听到变化之后就是怎么通知订阅者了，所以接下来我们需要实现一个消息订阅器，很简单，维护一个数组，用来收集订阅者，数据变动触发notify，再调用订阅者的update方法，代码改善之后是这样：
```javascript
// ... 省略
function defineReactive(data, key, val) {
	var dep = new Dep();
    observe(val); // 监听子属性

    Object.defineProperty(data, key, {
        // ... 省略
        set: function(newVal) {
        	if (val === newVal) return;
            console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
            val = newVal;
            dep.notify(); // 通知所有订阅者
        }
    });
}

function Dep() {
    this.subs = [];
}
Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};
```
那么问题来了，谁是订阅者？怎么往订阅器添加订阅者？
没错，上面的思路整理中我们已经明确订阅者应该是Watcher, 而且`var dep = new Dep();`是在 `defineReactive`方法内部定义的，所以想通过`dep`添加订阅者，就必须要在闭包内操作，所以我们可以在	`getter`里面动手脚：
```javascript
// Observer.js
// ...省略
Object.defineProperty(data, key, {
	get: function() {
		// 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
		Dep.target && dep.addDep(Dep.target);
		return val;
	}
    // ... 省略
});

// Watcher.js
Watcher.prototype = {
	get: function(key) {
		Dep.target = this;
		this.value = data[key];	// 这里会触发属性的getter，从而添加订阅者
		Dep.target = null;
	}
}
```
这里已经实现了一个Observer了，已经具备了监听数据和数据变化通知订阅者的功能，[完整代码](https://github.com/DMQ/mvvm/blob/master/js/observer.js)。那么接下来就是实现Compile了

### 2、实现Compile
compile主要做的事情是解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图，如图所示：
![请求头，返回头](https://raw.githubusercontent.com/jgchenu/staticAssets/master/web-learning/mvvm2.png)

因为遍历解析的过程有多次操作dom节点，为提高性能和效率，会先将vue实例根节点的`el`转换成文档碎片`fragment`进行解析编译操作，解析完成，再将`fragment`添加回原来的真实dom节点中
```javascript
function Compile(el) {
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}
Compile.prototype = {
	init: function() { this.compileElement(this.$fragment); },
    node2Fragment: function(el) {
        var fragment = document.createDocumentFragment(), child;
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }
};
```

compileElement方法将遍历所有节点及其子节点，进行扫描解析编译，调用对应的指令渲染函数进行数据渲染，并调用对应的指令更新函数进行绑定，详看代码及注释说明：

```javascript
Compile.prototype = {
	// ... 省略
	compileElement: function(el) {
        var childNodes = el.childNodes, me = this;
        [].slice.call(childNodes).forEach(function(node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;	// 表达式文本
            // 按元素节点方式编译
            if (me.isElementNode(node)) {
                me.compile(node);
            } else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }
            // 遍历编译子节点
            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    },

    compile: function(node) {
        var nodeAttrs = node.attributes, me = this;
        [].slice.call(nodeAttrs).forEach(function(attr) {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            var attrName = attr.name;	// v-text
            if (me.isDirective(attrName)) {
                var exp = attr.value; // content
                var dir = attrName.substring(2);	// text
                if (me.isEventDirective(dir)) {
                	// 事件指令, 如 v-on:click
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                } else {
                	// 普通指令
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }
            }
        });
    }
};

// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    // ...省略
    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];
        // 第一次初始化视图
        updaterFn && updaterFn(node, vm[exp]);
        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, function(value, oldValue) {
        	// 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, oldValue);
        });
    }
};

// 更新函数
var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
    // ...省略
};
```
这里通过递归遍历保证了每个节点及子节点都会解析编译到，包括了{{}}表达式声明的文本节点。指令的声明规定是通过特定前缀的节点属性来标记，如`<span v-text="content" other-attr`中`v-text`便是指令，而`other-attr`不是指令，只是普通的属性。
监听数据、绑定更新函数的处理是在`compileUtil.bind()`这个方法中，通过`new Watcher()`添加回调来接收数据变化的通知

至此，一个简单的Compile就完成了，[完整代码](https://github.com/DMQ/mvvm/blob/master/js/compile.js)。接下来要看看Watcher这个订阅者的具体实现了

### 3、实现Watcher
Watcher订阅者作为Observer和Compile之间通信的桥梁，主要做的事情是:
1、在自身实例化时往属性订阅器(dep)里面添加自己
2、自身必须有一个update()方法
3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。
如果有点乱，可以回顾下前面的[思路整理](#_2)
```javascript
function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    // 此处为了触发属性的getter，从而在dep添加自己，结合Observer更易理解
    this.value = this.get(); 
}
Watcher.prototype = {
    update: function() {
        this.run();	// 属性值变化收到通知
    },
    run: function() {
        var value = this.get(); // 取到最新值
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal); // 执行Compile中绑定的回调，更新视图
        }
    },
    get: function() {
        Dep.target = this;	// 将当前订阅者指向自己
        var value = this.vm[exp];	// 触发getter，添加自己到属性订阅器中
        Dep.target = null;	// 添加完毕，重置
        return value;
    }
};
// 这里再次列出Observer和Dep，方便理解
Object.defineProperty(data, key, {
	get: function() {
		// 由于需要在闭包内添加watcher，所以可以在Dep定义一个全局target属性，暂存watcher, 添加完移除
		Dep.target && dep.addDep(Dep.target);
		return val;
	}
    // ... 省略
});
Dep.prototype = {
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update(); // 调用订阅者的update方法，通知变化
        });
    }
};
```
实例化`Watcher`的时候，调用`get()`方法，通过`Dep.target = watcherInstance`标记订阅者是当前watcher实例，强行触发属性定义的`getter`方法，`getter`方法执行的时候，就会在属性的订阅器`dep`添加当前watcher实例，从而在属性值有变化的时候，watcherInstance就能收到更新通知。

ok, Watcher也已经实现了，[完整代码](https://github.com/DMQ/mvvm/blob/master/js/watcher.js)。
基本上vue中数据绑定相关比较核心的几个模块也是这几个，猛戳[这里](https://github.com/vuejs/vue) , 在`src` 目录可找到vue源码。

最后来讲讲MVVM入口文件的相关逻辑和实现吧，相对就比较简单了~

### 4、实现MVVM
MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。

一个简单的MVVM构造器是这样子：
```javascript
function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data;
    observe(data, this);
    this.$compile = new Compile(options.el || document.body, this)
}
```

但是这里有个问题，从代码中可看出监听的数据对象是options.data，每次需要更新视图，则必须通过`var vm = new MVVM({data:{name: 'kindeng'}}); vm._data.name = 'dmq'; `这样的方式来改变数据。

显然不符合我们一开始的期望，我们所期望的调用方式应该是这样的：
`var vm = new MVVM({data: {name: 'kindeng'}}); vm.name = 'dmq';`

所以这里需要给MVVM实例添加一个属性代理的方法，使访问vm的属性代理为访问vm._data的属性，改造后的代码如下：

```javascript
function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data, me = this;
    // 属性代理，实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) {
        me._proxy(key);
    });
    observe(data, this);
    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
	_proxy: function(key) {
		var me = this;
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
	}
};

```
这里主要还是利用了`Object.defineProperty()`这个方法来劫持了vm实例对象的属性的读写权，使读写vm实例的属性转成读写了`vm._data`的属性值，达到鱼目混珠的效果，哈哈

至此，全部模块和功能已经完成了，如本文开头所承诺的两点。一个简单的MVVM模块已经实现，其思想和原理大部分来自经过简化改造的vue[源码](https://github.com/vuejs/vue)，猛戳[这里](https://github.com/DMQ/mvvm)可以看到本文的所有相关代码。
由于本文内容偏实践，所以代码量较多，且不宜列出大篇幅代码，所以建议想深入了解的童鞋可以再次结合本文源代码来进行阅读，这样会更加容易理解和掌握。

### 总结
本文主要围绕“几种实现双向绑定的做法”、“实现Observer”、“实现Compile”、“实现Watcher”、“实现MVVM”这几个模块来阐述了双向绑定的原理和实现。并根据思路流程渐进梳理讲解了一些细节思路和比较关键的内容点，以及通过展示部分关键代码讲述了怎样一步步实现一个双向绑定MVVM。文中肯定会有一些不够严谨的思考和错误，欢迎大家指正，有兴趣欢迎一起探讨和改进~

最后，感谢您的阅读！

### 拓展：为什么Vue中不能通过索引来修改数组以更新视图

我们知道在Vue中的数据是通过Object.defineProperty这种劫持的方式来实现数据更新的，可是数组是一个比较特殊的类型。官网上说：

由于 JavaScript 的限制，Vue 不能检测以下变动的数组： 当你利用索引直接设置一个项时，例如：`vm.items[indexOfItem] = newValue` 当你修改数组的长度时，例如：`vm.items.length = newLength`

我搜寻其他的文章里也说是因为大部分浏览器Object.observe()支持的不友好，不能检测很好的检测到数组的数据变化，因此在Vue中则使用了其他的方法来实现数据的更新。

那么我就在想，作者为什么不用Object.defineProperty来实现对数组的数据劫持呢，不能实现的原因是什么呢？我们这里来看个demo：
```
function defArray(obj, key, val){
    Object.defineProperty(obj, key, {
        get(){
            console.log('get val: '+val);
            return val;
        }, 
        set(newVal){
            console.log('old value: '+val);
            console.log('new value: '+newVal);

            val = newVal;
        }
    });
}
let arr = [0, 1, 2, 3, 4, 5];
arr.forEach((item, index)=>{
    defArray(arr, index, item);
})
arr[1] = 123; // 修改索引为1的值
/*
> arr[1] = 1
 old value: 1
 new value: 123
 123
*/

console.log(arr[2]); // 获取索引为1的数据
/*
> console.log(arr[2]);
 get val: 2
 2
*/
```
arr数组的长度为6，修改索引在0-5之间任意索引的数据，都能触发set方法，获取相应的数据时，就能触发get方法。不过当获取额外的数据时，或者先删除原数据再添加时，就不会触发相应的方法了：
```
arr[6] = 6;
console.log(arr[6]); // 6

delete arr[2];
arr[2] = 2;
console.log(arr[2]);
```
因为我们只对已存在的索引的数据进行数据劫持，新添加的数据或者先删除再添加的数据，都是没有get和set方法的，都不能通过数据劫持的方式来更新视图。但数组是正常更新的，只是无法更新视图了。

所以我在这里大胆的猜测一下作者不用索引来更新视图的原因：防止因新添加或者先删除再添加等的操作，导致后续添加的数据没有get和set方法，在Vue中就统一操作，无论是数组还是Object类型的数据，都可以通过Vue.$set(Array|Object, key, val)来操作数据，并更新视图（当然，Object类型的数据，在Vue初始化时就已经存在的key，是可以直接通过key来修改的哈）。

以下源码均摘自与github上的Vue.js v2.5.17-beta.0版本。 commit链接： Vue.js v2.5.17-beta.0

###  变异方法更新数组
在官方网站中，提供了以下几个方法来检测数组的变化，也会触发视图的更新：
```
push()

pop()

shift()

unshift()

splice()

sort()

reverse()
```
在Vue的源码中，对Vue中的数组数据实现了类似的方法，这里官方的叫法是变异方法，比如push()方法，并不是调用Array中原生的push方法，而是调用自己实现的push方法，来实现数据的劫持，再通过Array中的push方法实现数组数据的更新，可能有点晕，看代码，我这里把几个距离较远的代码都放到一块了，但代码都没动，只是改了位置：
```
// 获取原生Array中提供的所有方法
var arrayProto = Array.prototype;

// 将原生提供的方法创建一个新的对象，以免修改原生的方法，造成全局污染
var arrayMethods = Object.create(arrayProto); 

// 将要实现的几个变异方法
var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

/**
 * Intercept mutating methods and emit events
 * 截取这些方法，然后实现相应的操作
 */
methodsToPatch.forEach(function (method) {
    // cache original method
    var original = arrayProto[method]; // 缓存原始方法

    // def即Object.defineProperty的包装函数
    def(arrayMethods, method, function mutator () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        
        var result = original.apply(this, args); // 调用原始方法完成对数组的更新
        var ob = this.__ob__;
        var inserted; // 存储要修改的数据
        switch (method) {
        case 'push':
        case 'unshift':
            inserted = args;
            break
        case 'splice':
            inserted = args.slice(2);
            break
        }
        console.log( args, inserted );
        if (inserted) { ob.observeArray(inserted); } // 如果有修改的数据，则添加observer监听器
        // notify change
        ob.dep.notify(); // 触发更新
        return result
    });
});

/**
 * Observe a list of Array items.
 * 对数组中的每项添加监听器
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};
```
这里我们也就知道了，在Vue中的数组数据，调用上面的那些方法，都是事先实现的同名方法，然后再通过apply调用原生方法，再添加监听器，触发更新等后续操作。

如果我们自己想单独实现下这样的操作如何实现呢，如果把仅仅把上面的代码拿出来是不行的，这些自定义的变异方法还没有跟数组进行绑定呢，数组调用这些方法时，还是原生的方法，因此这里我们需要把这些变异方法绑定到数组上，我们来看下Vue源码中的实现：
```
// can we use __proto__?
var hasProto = '__proto__' in {};  // __proto__是否可用


/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    // 当前数据为数组，若__protp__可用，则调用protoAugment方法，否则调用copyAugment方法
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value); // 监听数组的每一项
  } else {
    this.walk(value);
  }
};

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 * 把这些方法定义到原型链__proto__上
 */
function protoAugment (target, src, keys) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 * ie9、ie10 和 opera 没有 __proto__ 属性，为数组添加自定义方法
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}
```
这样就能给每个数组添加上这些变异方法了。因此Vue中也可以使用splice()来更新数组中的内容:`vm.$arr.splice(index, 1, newVal);`

我们自己实现这样的操作时，可以把上面的Observer简化一下：
```
function init(value){
    // can we use __proto__?
    var hasProto = '__proto__' in {};

    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
}

var arr = [1, 2, 3, 4, 5];
init(arr);


arr.splice(2, 1, 2);
arr.push(6, 7, 8);
```
#### Vue.$set的实现
不多说话，直接看源码怎么实现的，内部有本人的中文注释：
```
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 * 在一个对象上设置一个属性。如果该属性尚不存在，则添加新属性并触发更改通知。
 */
function set (target, key, val) {
  if ("development" !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
  }

  // 如果当前对象是数组，且key是合法的数字索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 若索引值小于数组的长度，则数组长度不变，只修改
    // 若索引值比当前数组的长度大，则说明是新添加元素，需要更新数组的长度
    // 这里采用变异方法splice来更新数组
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }

  // 以下操作时，target均为object对象类型

  // 若当前key已经存在于对象中，且没有原型链中，直接更新即可
  // 因为在Vue初始化时已经添加了监听器，这里就不用再添加了
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;

  // 若当前对象是Vue实例，则不允许使用这种方式添加属性，应当在初始化时预先声明
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }

  //  证明不是vue的实例data里面的数据，则直接赋值
  if (!ob) {
    target[key] = val;
    return val
  }

  // 若当前key不存在，则在ob.value上创建set和get方法，并触发更新
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val
}
```
因此使用Vue.$set方法更新数组时，内部依然是用的splice()方法来操作的，而更新对象类型的数据则略微复杂点。