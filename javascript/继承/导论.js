/*
__proto__
其次是 __proto__ ，绝大部分浏览器都支持这个非标准的方法访问原型，
然而它并不存在于 Person.prototype 中，实际上，它是来自于 Object.prototype ，
与其说是一个属性，不如说是一个 getter/setter，当使用 obj.__proto__ 时，可以理解成返回了 Object.getPrototypeOf(obj)。

constructor
首先是 constructor 属性，我们看个例子：
*/
function Person() {

}
var person = new Person();
console.log(person.constructor === Person); // true
/*
当获取 person.constructor 时，其实 person 中并没有 constructor 属性,当不能读取到constructor 属性时，会从 person 的原型也就是 Person.prototype 中读取，正好原型中有该属性，所以：

person.constructor === Person.prototype.constructor
*/