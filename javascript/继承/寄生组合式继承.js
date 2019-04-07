/**
 * 寄生式继承 
 */
function objectCreate(o) {
    function F() {}
    F.prototype = o;
    return new F();
}
//这个等同于用Object.create(o),生成以o为原型对象的一个空对象obj
//但是Object.create(o) 生成的obj.__proto__===o,obj.__proto__.constructor===Object;
function inheritPrototype(Child, Parent) {
    var prototype = objectCreate(Parent.prototype); //通过调用函数来创建一个以Parent为原型的新对象
    prototype.constructor = Child; //以某种方式来增强这个对象，重新指定constructor为Child
    Child.prototype = prototype; //指定Child.prototype为这个对象
}

/*
即创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后再像真的做了所有工作一样返回对象
这个函数等同于  Child.prototype = Object.create(Parent.prototype);
              Child.prototype.constructor = Child;
*/
function Parent(name) {
    this.name = name;
    this.frends = ['sheel', 'kitty'];
}
Parent.prototype.sayName=function(){
    console.log(this.name)
}
function Child(name,age){
    Parent.call(this,name);
    //通过将this指定为Child的实例，调用父类方法将父类属性赋值在子类实例；
    this.age=age;
}
inheritPrototype(Child,Parent);

var child1 = new Child('child1',22);
var child2 = new Child('child2',23);
child1.name = 'child1';
child2.name = 'child2';
child1.frends.push('child1-friend')
//注意for in会取到本身跟原型属性，需要用hasOwnProperty()去判断过滤掉原型属性
//Object.keys()取到的是本身的属性，不包含原型属性
console.log(child1);
console.log(child2);
child1.sayName();//child1.sayName()里面的this ，是指向调用的当前实例的，也就是child1
child2.sayName();
console.log(child1.__proto__)
console.log(child1.__proto__.__proto__)

/*
Child {
  name: 'child1',
  frends: [ 'sheel', 'kitty', 'child1-friend' ],
  age: 22 }
Child { name: 'child2', frends: [ 'sheel', 'kitty' ], age: 23 }
child1
child2
Child { constructor: [Function: Child] }
Parent { sayName: [Function] }。

inheritPrototype函数将Child.prototype设置为 一个以 Parent.prototype为原型的空对象
*/