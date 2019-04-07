### typeof实现原理

`typeof` 来判断`number, string, object, boolean, function, undefined, symbol` 这七种类型，这种判断能帮助我们搞定一些问题，比如在判断不是 `object` 类型的数据的时候，`typeof`能比较清楚的告诉我们具体是哪一类的类型。但是，很遗憾的一点是，`typeof`在判断一个 object的数据的时候只能告诉我们这个数据是 object, 而不能细致的具体到是哪一种 object, 比如
```js
let s = new String('abc');
typeof s === 'object'// true
s instanceof String // true
```
要想判断一个数据具体是哪一种 object 的时候，我们需要利用 `instanceof` 这个操作符来判断。

那么`typeof`是怎么来判断变量的类型的？

js 在底层存储变量的时候，会在变量的机器码的低位1-3位存储其类型信息

• 000：对象
• 010：浮点数
• 100：字符串
• 110：布尔
• 1：整数

但是, 对于 undefined 和 null 来说，这两个值的信息存储是有点特殊的。

null：所有机器码均为0

undefined：用 −2^30 整数来表示

所以，`typeof` 在判断 null 的时候就出现问题了，由于 null 的所有机器码均为0，因此直接被当做了对象来看待。

然而用 `instanceof` 来判断的话

`null instanceof null // TypeError: Right-hand side of 'instanceof' is not an object `右边的变量必须是一个包装对象，而不是那种typeof null===‘object’的bug导致的对象。

null 直接被判断为不是 object，这也是 JavaScript 的历史遗留bug，

有一个不错的判断类型的方法，就是Object.prototype.toString，我们可以利用这个方法来对一个变量的类型来进行比较准确的判断
```js
Object.prototype.toString.call(1) // "[object Number]"  
Object.prototype.toString.call('hi') // "[object String]"  
Object.prototype.toString.call({a:'hi'}) // "[object Object]"  
Object.prototype.toString.call([1,'a']) // "[object Array]"  
Object.prototype.toString.call(true) // "[object Boolean]"  
Object.prototype.toString.call(() => {}) // "[object Function]"  
Object.prototype.toString.call(null) // "[object Null]"
  Object.prototype.toString.call(undefined) // "[object Undefined]"  
Object.prototype.toString.call(Symbol(1)) // "[object Symbol]"
```
### instanceof 操作符的实现原理

`instanceof` 来判断对象的具体类型，其实 instanceof 主要的作用就是判断一个实例是否属于某种类型
```js
let person = function () {
}

let nicole = new person()
nicole instanceof person // true
```
当然，`instanceof` 也可以判断一个实例是否是其父类型或者祖先类型的实例。
```js
let person = function () {
}
let programmer = function () {
}
programmer.prototype = new person()
let nicole = new programmer()
nicole instanceof person // true
nicole instanceof programmer // true
```
这是 `instanceof` 的用法，但是 `instanceof` 的原理是什么呢？

根据 `ECMAScript` 语言规范，我梳理了一下大概的思路，然后整理了一段代码如下
```js
function new_instance_of(leftVaule, rightVaule) { 
let rightProto = rightVaule.prototype; // 取右表达式的 prototype 值
leftVaule = leftVaule.__proto__; // 取左表达式的__proto__值
while (true) {
if (leftVaule === null) {
return false; 
}
if (leftVaule === rightProto) {
return true; 
} 
leftVaule = leftVaule.__proto__ 
}
}
```

其实 `instanceof` 主要的实现原理就是只要右边变量的 `prototype` 在左边变量的原型链上即可。因此，`instanceof` 在查找的过程中会遍历左边变量的原型链，直到找到右边变量的 `prototype`，如果查找失败，则会返回 false，告诉我们左边变量并非是右边变量的实例。

看到几个有趣的例子
```js
function Foo() {
}

Object instanceof Object // true
Function instanceof Function // true
Function instanceof Object // true
Foo instanceof Foo // false
Foo instanceof Object // true
Foo instanceof Function // true
```
我们知道每个 JavaScript 对象均有一个隐式的 __proto__ 原型属性，而函数显式的原型属性是 prototype，只有 Object.prototype.__proto__ 属性在未修改的情况下为 null 值。根据图上的原理，我们来梳理上面提到的几个有趣的 instanceof 使用的例子。

```js
Object instanceof Object  //true
```
由图可知，Object 的 prototype 属性是 Object.prototype, 而由于 Object 本身是一个函数，由 Function 所创建，所以 Object.__proto__ 的值是 Function.prototype，而 Function.prototype 的 __proto__ 属性是 Object.prototype，所以我们可以判断出，`Object instanceof Object` 的结果是 true 。用代码简单的表示一下

运行上面的 `new_instance_of(Object,Object)`

主要的while过程
```js
leftValue = Object.__proto__    Object.__proto___===Function.prototype
rightValue = Object.prototype;
// 第一次判断
leftValue != rightValue
leftValue = Function.prototype.__proto__ = Object.prototype
// 第二次判断
leftValue = Object.__proto__.__proto__    Function.prototype.__proto__===Object.prototype

leftValue === rightValue
// 返回 true
Function instanceof Function 
```
运行上面的`new_instance_of(Function,Function)`

主要的while过程 
```js
leftValue = Function.__proto__ Funtion.__proto___===Function.prototype
rightValue = Object.prototype;
// 第一次判断
leftValue === rightValue
// 返回 true
Function instanceof Object
```
运行上面的`new_instance_of(Function,Object)`

主要的while过程 
```js
leftValue = Function.__proto__ Funtion.__proto___===Function.prototype
rightValue = Object.prototype;
// 第一次判断
leftValue === rightValue
// 返回 false

//第二次判断

lleftValue = Function.__proto__.__proto__ Function.prototype.__proto__===Object.prototype
```
总结
简单来说，我们使用 `typeof` 来判断基本数据类型是 ok 的，不过需要注意当用 typeof 来判断 null 类型时的问题，如果想要判断一个对象的具体类型可以考虑用 instanceof，但是 instanceof 也可能判断不准确，比如一个数组，他可以被 `instanceof` 判断为 Object。所以我们要想比较准确的判断对象实例的类型时，可以采取 `Object.prototype.toString.call` 方法。



### call函数的实现
```js
Function.prototype.myCall=function(context=window){
if(typeof this!=='function'){
throw new TypeError('Error')
}
context.fn=this;
const args=[...arguments].slice(1);
const result=context.fn(...args)
delete context.fn;
return result
}
// let fn=function(){} === function fn(){}
// this --> fn 
```
##3 apply函数的实现
```js
Function.prototype.myBind = function (context) {
if (typeof this !== 'function') {
throw new TypeError('Error')
}
const _this = this
const args = [...arguments].slice(1)
// 返回一个函数
return function F() {
// 因为返回了一个函数，我们可以 new F()，所以需要判断
if (this instanceof F) {
return new _this(...args, ...arguments)
}
return _this.apply(context, args.concat(...arguments))
}
}
```
bind 返回了一个函数，对于函数来说有两种方式调用
* 一种是直接调用，
* 一种是通过 new 的方式，我们先来说直接调用的方式


对于直接调用来说，这里选择了 apply 的方式实现，但是对于参数需要注意以下情况：因为 bind 可以实现类似这样的代码 f.bind(obj, 1)(2)，所以我们需要将两边的参数拼接起来，于是就有了这样的实现 args.concat(...arguments)


### bind 函数的实现
```js
Function.prototype.myBind = function (context) {
if (typeof this !== 'function') {
throw new TypeError('Error')
}
const _this = this
const args = [...arguments].slice(1)
// 返回一个函数
return function F() {
// 因为返回了一个函数，我们可以 new F()，所以需要判断
if (this instanceof F) {
return new _this(...args, ...arguments)
}
return _this.apply(context, args.concat(...arguments))
}
}
```

最后来说通过 new 的方式，在之前的章节中我们学习过如何判断 this，对于 new 的情况来说，不会被任何方式改变 this，所以对于这种情况我们需要忽略传入的 this

```js
new 函数的模拟实现
function create() {
  let obj = {} //新生成了一个对象
  let Con = [].shift.call(arguments)
  obj.__proto__ = Con.prototype /链接到原型/
  let result = Con.apply(obj, arguments)
  return result instanceof Object ? result : obj
}
```
在调用 new 的过程中会发生以上四件事情：

* 创建一个空对象
* 获取构造函数
* 设置空对象的原型
* 绑定this并执行构造函数确保返回值为对象


对于对象来说，其实都是通过 new 产生的，无论是 function Foo() 还是 `let a = { b : 1 }` 。

对于创建一个对象来说，更推荐使用字面量的方式创建对象（无论性能上还是可读性）。因为你使用 new Object() 的方式创建对象需要通过作用域链一层层找到 Object，但是你使用字面量的方式就没这个问题。
```js
function Foo() {}
// function 就是个语法糖
// 内部等同于 new Function()
let a = { b: 1 }
// 这个字面量内部也是使用了 new Object()
```










