/**
 * 组合式继承
 */
function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green']
}
Parent.prototype.sayName = function () {
    console.log(this.name)
    //Parent1 原型链上的方法并没有被 Child1 所继承
};


function Child(name, age) {
    Parent.call(this, name); //call；改变函数运行的上下文（将父级的构造函数this指向子构造函数的实例上）
    this.age = age;
}
//将Child.prototype赋值为Parent的实例
Child.prototype=new Parent();
//将Child.prototype.constructor重新指回构造函数
Child.prototype.constructor=Child;
Child.prototype.sayAge=function(){
    console.log(this.age)
}
var child1=new Child('child1',21);
var child2=new Child('child2',22)
console.log(child1); 
console.log(child2);
// Child { name: 'child1', colors: [ 'red', 'blue', 'green' ], age: 21 }
// Child { name: 'child2', colors: [ 'red', 'blue', 'green' ], age: 22 }
// 缺点：无论在什么情况下，都会调用两次超类型构造函数，一次是在创建子类型原型的时候，另一次是在子类型构造函数内部。

// 子类型最终会包含超类型的全部实例属性，但我们不得不在调用子类型构造函数时候重写这些属性