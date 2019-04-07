// 只要递归调用"浅拷贝"就行了。
function deepCopy(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i])
        } else {
            c[i] = p[i]
        }
    }
    return c;
}

// JSON.parse(JSON.stringify(object))
let a = {
    age: 1,
    jobs: {
        first: 'FE'
    }
}
let b = JSON.parse(JSON.stringify(a))
a.jobs.first = 'native'
console.log(b.jobs.first) // FE
/*
但是该方法也是有局限性的：
会忽略 undefined
会忽略 symbol
不能序列化函数
不能解决循环引用的对象
*/