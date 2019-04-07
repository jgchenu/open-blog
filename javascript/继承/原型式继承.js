/**
 * 原型式继承
 */
function objectCreate(o){
    function F(){}
    F.prototype=o;
    return new F();
}
//这个等同于用Object.create(o),生成以o为原型对象的一个空对象obj
//但是Object.create(o) 生成的obj.__proto__===o,obj.__proto__.constructor===Object;
//Object.create第二个参数跟Object.defineProperties()方法的第二个参数格式相同，每个属性都是通过自己的描述符睇你的，
//以这种方式制定的任何属性都会覆盖原型对象上的同名属性
//var obj=Object.create({a:1},{a:{value:2}})
var parent={
    name:'Nichsd',
    frends:['sheel','kitty']
}
var child1=objectCreate(parent);
var child2=objectCreate(parent);
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
{ name: 'child1' }
{ name: 'child2' }
{ name: 'Nichsd', frends: [ 'sheel', 'kitty', 'i am child1' ] }
true
true
child1 跟child2 共享同一个parent对象的属性
创建的child对象的属性如果跟parent同名，会屏蔽掉parent的属性，对数组对象的一系列操作，会导致共享的数组值被改变。
*/
