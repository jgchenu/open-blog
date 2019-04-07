/*
首先可以通过 Object.assign 来解决这个问题，很多人认为这个函数是用来深拷贝的。
其实并不是，Object.assign 只会拷贝所有的属性值到新的对象中，
如果属性值是对象的话，拷贝的是地址，所以并不是深拷贝。
*/

let a = {
    age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // 1

/* 另外我们还可以通过展开运算符 ... 来实现浅拷贝*/
let a = {
    age: 1
}
let b = {
    ...a
}
a.age = 2
console.log(b.age) // 1