Function.prototype.myApply = function (context) {
    if (typeof this !== 'function') {
        throw new TypeError('not a function')
    }
    let result;
    context = context || window;
    context.fn = this;
    if (arguments[1]) {
        if(arguments[1].constructor===Array){
            result = context.fn(...arguments[1]);
        }else{
            throw new TypeError('VM1973:1 Uncaught TypeError: CreateListFromArrayLike called on non-object')
        }
    }else{
        result=context.fn();
    }
    delete context.fn;
    return result;
}
var a = 'window.a';
var obj = {
    a: 'obj.a'
}

function foo() {
    console.log(this)
}
foo.myApply(obj)
foo.myApply();