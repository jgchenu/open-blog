
// 第一种 es6 array.flat()
//参考文章http://es6.ruanyifeng.com/#docs/array#  中的 flat()
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];
var newArr=Array.from(new Set(arr.flat(Infinity))).sort((a,b)=>{ return a-b})
console.log(newArr)

//第二种 数组的toString
var newArr1=Array.from(new Set(arr.toString().split(",").sort((a,b)=>{ return a-b}).map(Number)))
console.log(newArr1)
