function myInstanceof(left,right){
    let prototype=right.prototype;
    left=left.__proto__;
    while(true){
        if(left===null||left===undefined){
            return false;
        }
        if(prototype===left){
            return true;
        }
        left=left.__proto__;
    }
}
myInstanceof({},Object)
myInstanceof([],Object)
var foo=function(){}
//所有函数的原型是Function.prototype 其实所有函数是Function的实例 
// function 就是个语法糖
// 内部等同于 new Function()
foo.__proto__===Function.prototype
Array.__proto__===Function.prototype
Object.__proto__===Function.prototype
//Function.prototype的原型是
Function.prototype.__proto__===Object.prototype