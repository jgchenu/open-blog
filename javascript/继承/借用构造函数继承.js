/**
 * 借助构造函数实现继承
 */
function Parent() {
    this.name = 'parent1';
}
Parent.prototype.say = function () {
    //Parent1 原型链上的方法并没有被 Child1 所继承
};

function Child() {
    Parent.call(this); //apply；改变函数运行的上下文（将父级的构造函数this指向子构造函数的实例上）
    this.type = 'child';
}
console.log(new Child());//Child1 { name: 'parent1', type: 'child1' }
console.log(new Child().say()) //Uncaught TypeError: (intermediate value).say is not a function
//缺点就是父类原型链上的方法没有被child1继承了，因为只是调用了父类的构造函数，将属性赋值给子类的实例