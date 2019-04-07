Function.prototype.myCall = function (context) {
    if (typeof this !== 'function') {
        throw new TypeError('not a function')
    }
    context = context || window;
    context.fn = this;
    const args = [...arguments].splice(1);
    const result = context.fn(args);
    delete context.fn;
    return result;
}
var a='window.a';
var obj={
    a:'obj.a'
}
function foo(){
    console.log(this)
}
foo.myCall(obj)
foo.myCall();