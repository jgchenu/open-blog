ES6 的 Set 和 Map 数据结构，由你制造

不过在每次读到 Set 和 Map 数据结构那一章的时候，总是有点不知所措，因为我不明白实现这样的数据结构，目的是什么，意义又是什么呢

Set 和 Map 主要的应用场景在于数组去重和数据存储，幸运的是在读了关于数据结构和算法之类的书籍后，恍然大悟的发现

原来 Set 是一种叫做集合的数据结构，Map 是一种叫做字典的数据结构

那么下面就跟随我一起去了解下这两种数据结构，最后来亲手实现的一个 ES6 中的 Set 和 Map 吧

参考文档：[阮一峰老师set-map](http://es6.ruanyifeng.com/#docs/set-map)

## 集合

集合是由一组无序且唯一(即不能重复)的项组成的，可以想象成集合是一个既没有重复元素，也没有顺序概念的数组

ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值

Set 本身是一个构造函数，用来生成 Set 数据结构。

这里说的 Set 其实就是我们所要讲到的集合，先来看下基础用法

```js
const s = new Set();

[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

for (let i of s) {
  console.log(i); // 2 3 5 4
}

// 去除数组的重复成员
let array = [1, 2, 1, 4, 5, 3];
[...new Set(array)]; // [1, 2, 4, 5, 3]
```

具体用法如果还有不清楚的，这里我会在后面一一细说。现在还是来看一下以 ES6 中 Set 类(数据结构)为基础实现的集合吧

Set 实例的`属性`和`方法`

**Set 的属性：**

- size：返回集合所包含元素的数量
- Set 的方法：
- 操作方法
- add(value)：向集合添加一个新的项
- delete(value)：从集合中移除一个值
- has(value)：如果值在集合中存在，返回 true,否则 false
- clear(): 移除集合里所有的项

**遍历方法**

- keys()：返回一个包含集合中所有键的数组
- values()：返回一个包含集合中所有值的数组
- entries：返回一个包含集合中所有键值对的数组(感觉没什么用就不实现了)
- forEach()：用于对集合成员执行某种操作，没有返回值

创建一个集合

```js
function Set(arr = []) {
  // 可以传入数组
  let items = {};
  this.size = 0; // 记录集合中成员的数量
}

module.exports = Set;
```

这里用{}对象来表示集合，也是因为对象不允许一个键指向两个不同的属性，保证了集合里的元素都是唯一的

接下来，就需要按照 ES6 中 Set 类的实现，添加一些集合的操作方法了

**has 方法**

首先要实现的是 has 方法，因为在 add 和 delete 等其他方法中都会被调用，下面来看一下它的实现

```js
function Set() {
  let items = {};
  this.size = 0;

  // has(val)方法
  this.has = function(val) {
    // 对象都有hasOwnProperty方法，判断是否拥有特定属性
    return items.hasOwnProperty(val);
  };
}
```

**add 方法**

接下来要实现 add 方法

```js
// add(val)方法
this.add = function(val) {
  if (!this.has(val)) {
    items[val] = val;
    this.size++; // 累加集合成员数量
    return true;
  }
  return false;
};
```

对于给定的 val，可以检测是否存在于集合中

如果不存在，就添加到集合中，返回 true

如果存在，就直接返回 false，不做任何操作

`delete`和`clear`方法

继续写着，这回把两个都写上

```js
// delete(val)方法
this.delete = function(val) {
  if (this.has(val)) {
    delete items[val]; // 将items对象上的属性删掉
    this.size--;
    return true;
  }
  return false;
};
// clear方法
this.clear = function() {
  items = {}; // 直接将集合赋一个空对象即可
  this.size = 0;
};
```

在`delete`方法中，判断 val 是否存在于集合中，如果存在就直接从集合中删掉，返回 true

以上完成的都是操作方法，下面我们再来实现一下遍历方法

`keys`、`values`方法

这两个方法我们可以放在一起来实现，因为通过 ES6 对 Object 的扩展可以轻松实现对应的方法，下面看一下具体实现，上代码：

```js
// keys()方法
this.keys = function() {
  return Object.keys(items); // 返回遍历集合的所有键名的数组
};
// values()方法
this.values = function() {
  return Object.values(items); // 返回遍历集合的所有键值的数组
};
```

使用一下看看

```js
// set.js
const Set = require("./Set.js"); // 导入写好的Set类
let set = new Set();
set.add(1);
set.add(3);
set.add(2);
console.log(set.keys()); // [ '1', '2', '3' ]
console.log(set.values()); // [ 1, 2, 3 ]
```

这里我们看到和 ES6 中的 Set 有点区别，因为 Object 的这几个方法都是按照数值大小，从小到大遍历的数组，所以大家知道这一点比较好，具体实现还是有些不同的，哈哈

`forEach`方法

ES6 中 Set 结构的实例上带的 forEach 方法，其实和数组的 forEach 方法很相似，只不过 Set 结构的键名就是键值，所以第一个参数与第二个参数的值永远都是一样的

下面就按照实现数组的 forEach 方法，我们来完成 Set 的 forEach 方法

```js
// forEach(fn, context)方法
this.forEach = function(fn, context = this) {
  for (let i = 0; i < this.size; i++) {
    let item = Object.keys(items)[i];
    fn.call(context, item, item, items);
  }
};
```

使用 forEach 方法
```js
// set.js
const Set = require('./Set.js');
let set = new Set();
set.add(1);
set.add(4);
set.add('3');
set.forEach((value, key) => console.log(key + ' : ' + value)); // 1:1, 3:3, 4:4
let arr = set.values(); // [ 1, 3, 4 ]
arr = new Set(arr.map(x => x \* 2)).values();
console.log(arr); // [ 2, 6, 8 ]
```
基本上实现了 Set 结构的方法，不过，发现一个问题，那就是每次添加一个元素都要 add 这样写起来确实好麻烦，Set 是可以接收一个数组作为参数的，那么我们把这个也实现一下
```js
function Set(arr = []) { 
  // 传入接受的数组，如果没有传指定一个空数组做为初始值
  let items = {};
  this.size = 0;
  // has 方法
  this.has = function (val) {
  return items.hasOwnProperty(val);
  };
  // add 方法
  this.add = function (val) {
  // 如果没有存在 items 里面就可以直接写入
  if (!this.has(val)) {
  items[val] = val;
  this.size++;
  return true;
  }
  return false;
};
arr.forEach((val, i) => { // 遍历传入的数组
this.add(val); // 将数组里每一项值添加到集合中
});
// 省略...
}
```
再来看看现在能不能支持传入的数组了
```js
// 间接使用 map 和 filter
const Set = require('./Set.js');
let arr = new Set([1, 2, 3]).values();
m = new Set(arr.map(x => x \* 2));
f = new Set(arr.filter(x => x>1));
console.log(m.values()); // [ 2, 4, 6 ]
console.log(f.values()); // [ 2, 3 ]

// 数组去重
let arr2 = new Set([3, 5, 2, 1, 2, 5, 5]).values();
console.log(arr2); // [ 1, 2, 3, 5 ]
```
现在我们有了一个和 ES6 中非常类似的 Set 类实现。如前所述，也可以用数组替代对象，存储元素。喜欢动手的同学们，之后也可以去尝试一下

除此之外，Set 还可以实现并集(union),交集(intersect),差集(difference)

做事还是要做全套的，我们也一一来实现一下吧


`union` 并集和 `intersect` 交
集

并集的数学概念，集合 A 和集合 B 的并集，表示为 A∪B

交集的数学概念，集合 A 和集合 B 的交集，表示为 A∩B

![](https://user-gold-cdn.xitu.io/2018/4/11/162b211ef5c5a8f5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
如图所示：

现在先来实现 `union` 方法
```js
// 并集
this.union = function (other) {
let union = new Set();
let values = this.values();
for (let i = 0; i < values.length; i++) {
union.add(values[i]);
}
values = other.values(); // 将 values 重新赋值为新的集合
for (let i = 0; i < values.length; i++) {
union.add(values[i]);
}

 return union;
 };
    // 交集
 this.intersect = function (other) {
        let intersect = new Set();
        let values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (other.has(values[i])) {     // 查看是否也存在于other中
                intersect.add(values[i]);   // 存在的话就像intersect中添加元素
            }
        }
        return intersect;
    };

```
再来看下 difference 差集的实现，之后一起再测试一番
![](https://user-gold-cdn.xitu.io/2018/4/11/162b21b967e02813?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)


`difference` 差集
差集的数学概念，集合 A 和集合 B 的差集，表示为 A-B
```js
    // 差集
    this.difference = function (other) {
        let difference = new Set();
        let values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (!other.has(values[i])) {    // 将不存在于other集合中的添加到新的集合中
                difference.add(values[i]);
            }
        }
        return difference;
    };
```
Set 完整实现
在此，先给大家贴一下完整的实现代码
```js
function Set(arr = []) {
let items = {};
this.size = 0;
// has 方法
this.has = function (val) {
return items.hasOwnProperty(val);
};
// add 方法
this.add = function (val) {
// 如果没有存在 items 里面就可以直接写入
if (!this.has(val)) {
items[val] = val;
this.size++;
return true;
}
return false;
};
arr.forEach((val, i) => {
this.add(val);
});
// delete 方法
this.delete = function (val) {
if (this.has(val)) {
delete items[val]; // 将 items 对象上的属性删掉
this.size--;
return true;
}
return false;
};
// clear 方法
this.clear = function () {
items = {};
this.size = 0;
};
// keys 方法
this.keys = function () {
return Object.keys(items);
};
// values 方法
this.values = function () {
return Object.values(items);
}
// forEach 方法
this.forEach = function (fn, context = this) {
for (let i = 0; i < this.size; i++) {
let item = Object.keys(items)[i];
fn.call(context, item, item, items);
}
}

    // 并集
    this.union = function (other) {
        let union = new Set();
        let values = this.values();

        for (let i = 0; i < values.length; i++) {
            union.add(values[i]);
        }
        values = other.values();    // 将values重新赋值为新的集合
        for (let i = 0; i < values.length; i++) {
            union.add(values[i]);
        }

        return union;
    };
    // 交集
    this.intersect = function (other) {
        let intersect = new Set();
        let values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (other.has(values[i])) {
                intersect.add(values[i]);
            }
        }
        return intersect;
    };
    // 差集
    this.difference = function (other) {
        let difference = new Set();
        let values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (!other.has(values[i])) {
                difference.add(values[i]);
            }
        }
        return difference;
    };
    // 子集
    this.subset = function(other) {
        if (this.size > other.size) {
            return false;
        } else {
            let values = this.values();
            for (let i = 0; i < values.length; i++) {
                console.log(values[i])
                console.log(other.values())
                if (!other.has(values[i])) {
                    return false;
                }
            }
            return true;
        }
    };

}

module.exports = Set;
```
写了辣么多一起来测试一下吧
```js
const Set = require('./Set.js');
let set = new Set([2, 1, 3]);
console.log(set.keys()); // [ '1', '2', '3' ]
console.log(set.values()); // [ 1, 2, 3 ]
console.log(set.size); // 3
set.delete(1);
console.log(set.values()); // [ 2, 3 ]
set.clear();
console.log(set.size); // 0

// 并集
let a = [1, 2, 3];
let b = new Set([4, 3, 2]);
let union = new Set(a).union(b).values();
console.log(union); // [ 1, 2, 3, 4 ]

// 交集
let c = new Set([4, 3, 2]);
let intersect = new Set([1,2,3]).intersect(c).values();
console.log(intersect); // [ 2, 3 ]

// 差集
let d = new Set([4, 3, 2]);
let difference = new Set([1,2,3]).difference(d).values();
// [1,2,3]和[4,3,2]的差集是 1
console.log(difference); // [ 1 ]
```

目前为止我们用集合这种数据结构就实现了类似 ES6 中 Set 类，上面的使用方法也基本一样，大家可以之后有时间的话动手去敲一敲看一看，走过路过不能错过

既然我们已经完成了 Set 的实现，那么好事要成双，一鼓作气再把 Map 也一起写出来，天了撸的，开始

### 字典

在数据结构还有一种结构叫做字典，它就是实现基于 ES6 中的 Map 类的结构

那么集合又和字典有什么区别呢：

共同点：集合、字典可以存储不重复的值

不同点：集合是以[值，值]的形式存储元素，字典是以[键，值]的形式存储

所以这一下让我们明白了，Map 其实的主要用途也是用于存储数据的，相比于 Object 只提供“字符串—值”的对应，Map 提供了“值—值”的对应。也就是说如果你需要“键值对”的数据结构，Map 比 Object 更合适

下面来看一下基本使用：
```js
const m = new Map();
const o = {p: 'Hello World'};
m.set(o, 'content')
m.get(o) // "content"

m.has(o) // true
m.delete(o) // true
m.has(o) // false
```

以上是 Map 的基本使用，还有更多有用的方法稍后会随着实现的深入分别展示

Map 的属性和方法

**属性：**
* size：返回字典所包含的元素个数


**操作方法：**
* set(key, val): 向字典中添加新元素
* get(key):通过键值查找特定的数值并返回
* has(key):如果键存在字典中返回 true,否则 false
* delete(key): 通过键值从字典中移除对应的数据
* clear():将这个字典中的所有元素删除


遍历方法：

* keys():将字典中包含的所有键名以数组形式返回
* values():将字典中包含的所有数值以数组形式返回
* forEach()：遍历字典的所有成员
知道了都有哪些属性和方法，那就闲言少叙，开始创建一个字典吧

创建一个字典
```js
function Map() {
  let items = {};
}

module.exports = Map; // 导出
```

创建好了字典这个骨架，那就开始添加一些方法了

`has`方法

首当其冲的当然是 has 了，因为在 set 和 get 里都会用到，实现思路和之前写的集合也很类似
```js
function Map() {
let items = {};
// has(key)方法
this.has = function(val) {
return items.hasOwnProperty(val);
};
}
```
实现了 has 方法后，我们可以来判断字典中是否包含该属性了，继续来实现其他方法

`set` 和 `get` 方法
```js
// set(key, val)方法
// set 相同 key 时，后面声明的会覆盖前面
// 如： new Map().set({}, 'a')
this.set = function(key, val) {
items[key] = val;  
 };
// get(key)方法
this.get = function(key) {
// 判断是否有 key，如果有的话直接返回对应的值
// 如果读取一个未知的键，则返回 undefined
return this.has(key) ? items[key] : undefined;
};
```
`set` 和 `get` 方法写好了，再接着搞 `delete` 和 `clear` 方法，不废话，看
```js
delete 和 clear 方法
// delete(key)方法
this.delete = function(key) {
if (this.has(key)) { // 如果有 key 值
delete items[key]; // 直接删掉 items 上对应的属性
this.size--; // 让 size 总数减 1
return true;
}
return false;
};
// clear()方法
this.clear = function() {
items = {};
this.size = 0;
};
```
上面把属性和操作方法都分别完成了，还剩下最后的遍历方法了，继续写下去，坚持到底就是胜利，各位看官也不容易了，加油加油！！！
```js
遍历方法(keys,values,forEach)
// keys()方法
this.keys = function() {
return Object.keys(items);
};
// values()方法
this.values = function() {
return Object.values(items);  
 };
// forEach(fn, context)方法
this.forEach = function(fn, context = this) {
for (let i = 0; i < this.size; i++) {
let key = Object.keys(items)[i];
let value = Object.values(items)[i];
fn.call(context, value, key, items);
}
};
```

Now 终于完成了 Map 类的实现，我给大家贴一下完整代码和测试用例，供大家空闲时间来研究分析分析

Map 完整实现

```js
function Map() {
let items = {};
this.size = 0;

    // 操作方法
    // has方法
    this.has = function(val) {
        return items.hasOwnProperty(val);
    };
    // set(key, val)方法
    this.set = function(key, val) {
        items[key] = val;
        this.size++;
    };
    // get(key)方法
    this.get = function(key) {
        return this.has(key) ? items[key] : undefined;
    };
    // delete(key)方法
    this.delete = function(key) {
        if (this.has(key)) {
            delete items[key];
            this.size--;
            return true;
        }
        return false;
    };
    // clear()方法
    this.clear = function() {
        items = {};
        this.size = 0;
    };
    // 遍历方法
    // keys()方法
    this.keys = function() {
        return Object.keys(items);
    };
    // values()方法
    this.values = function() {
        return Object.values(items);
    };
    // forEach(fn, context)方法
    this.forEach = function(fn, context = this) {
        for (let i = 0; i < this.size; i++) {
            let key = Object.keys(items)[i];
            let value = Object.values(items)[i];
            fn.call(context, value, key, items);
        }
    };

}

module.exports = Map;
```
再来看看下面的测试栗子
```js
    // map.js
    // 使用Map类
    const Map = require('./Map.js');
    let m = new Map();
    m.set('Jay', 'Jay的Chou');
    m.set(true, '真的');
    console.log(m.has('Chou'));  // false
    console.log(m.size);        // 2
    console.log(m.keys());      // [ 'Jay', 'true' ]
    console.log(m.values());    // [ 'Jay的Chou', '真的' ]
    console.log(m.get('jay'));  // undefined

    m.delete(true);
    console.log(m.keys());      // [ 'Jay' ]
    console.log(m.values());    // [ 'Jay的Chou' ]
```


根据集合和字典这两种数据结构实现了类似 ES6 的 Set 和 Map 数据结构。

