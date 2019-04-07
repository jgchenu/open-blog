/*
curry函数返回了一个命名函数，该命名函数为var judge=(...args)=>{
    return args.length===fn.length?fn(...args):(...arg)=>judge(...args,...arg)
}
由于有了judge 命名引用，
那么curry化的函数 判断传入的参数跟fn函数设定需要的参数长度是否相等
相等的话，就直接调用fn，不相等的话从而来递归调用judge,返回一个函数(...arg)=>judge(...args,...arg)，最开始用judge=（...args）=>...来收集上次传入的参数为一个args变量数组，然后返回的函数(...arg)=>judge(...args,...arg) 用来收集下次调用的参数为一个arg变量数组，然后递归调用judge(...args,..arg)传入收集来的传入参数，重复上面的操作，直到传入的实参变量跟函数要求的参数一样多，才进行函数调用，并返回结果

*/
var curry = fn =>
   judge = (...args) =>
       args.length === fn.length
           ? fn(...args)
           : (...arg) => judge(...args, ...arg)