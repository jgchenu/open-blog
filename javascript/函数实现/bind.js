Function.prototype.myBind=function(context){
    if(typeof this !=='function'){
        throw new TypeError('not a function')
    }
    context=context||window;
    context.fn=this;
    const args=[...arguments].slice(1)
    return function F(){
        let result;
        if(this instanceof F){
            // 因为 bind 可以实现类似这样的代码 f.bind(obj, 1)(2)，
            //所以我们需要将两边的参数拼接起来，于是就有了这样的实现 [...args,...arguments]
            // 在对于 new 的情况来说，不会被任何方式改变 this，所以对于这种情况我们需要忽略传入的 this,this默认绑定到新生成的对象obj中，这个对象obj._proto__===context.fn。prototype 是以context.fn 为构造函数的
            result= new context.fn(...args,...arguments)    
        }else{
            result= context.fn(...args,...arguments)

        }
        delete context.fn;
        //如果不返回result的话，会返回一个以F.prototype为原型的空对象
        return result;
    }
}
var a = 'window.a';
var obj = {
    a: 'obj.a'
}

function foo(x,y,z) {
    this.a=x;
    this.b=y;
    this.c=z;
}
var bindFoo=foo.myBind(obj,1);
newObj=new bindFoo(2,3)
console.log(obj,newObj)