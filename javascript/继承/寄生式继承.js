/**
 * 寄生式继承 
 */
function objectCreate(o){
    function F(){}
    F.prototype=o;
    return new F();
}
//这个等同于用Object.create(o),生成以o为原型对象的一个空对象obj
//但是Object.create(o) 生成的obj.__proto__===o,obj.__proto__.constructor===Object;
function createAnother(origin){
    var clone=objectCreate(origin);//通过调用函数来创建一个新对象
    clone.sayHi=function(){
        alert('hi')
    }//以某种方式来增强这个对象
    return clone;
    //返回这个对象
}
//即创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后再像真的做了所有工作一样返回对象

var parent={
    name:'Nichsd',
    frends:['sheel','kitty']
}
var child1=createAnother(parent);
var child2=createAnother(parent);
child1.name='child1';
child2.name='child2';
child1.frends.push('i am child1')
//注意for in会取到本身跟原型属性，需要用hasOwnProperty()去判断过滤掉原型属性
//Object.keys()取到的是本身的属性，不包含原型属性
console.log(child1); 
console.log(child2);
console.log(child1.__proto__)
console.log(child2.__proto__===parent)
console.log(child1.__proto__===parent)

/*
{ sayHi: [Function], name: 'child1' }
{ sayHi: [Function], name: 'child2' }
{ name: 'Nichsd', frends: [ 'sheel', 'kitty', 'i am child1' ] }
true
true
child1 跟child2 共享同一个parent对象的属性
创建的child对象的属性如果跟parent同名，会屏蔽掉parent的属性，对数组对象的一系列操作，会导致
并且child1 跟child2是得到增强的对象，有额外的函数
使用寄生式继承来为对象添加函数，会由于不能做到函数复用而降低效率，这一点与借用构造函数调用Parent.call(this)类似,这部分的父类属性并没有进行复用。
*/
