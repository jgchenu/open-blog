  function  myNew() {
    let obj = {};
    let Fn = [...arguments].shift();
    let args = [...arguments].splice(1);
    obj.__proto__ = Fn.prototype;
    obj.fn = Fn;
    let result = obj.fn(...args)
    delete obj.fn;
    return result instanceof Object ? result : obj;
}

function foo(x,y){
    this.a=x;
    this.b=y;
}
var obj=myNew(foo,3,4)
console.log(obj)