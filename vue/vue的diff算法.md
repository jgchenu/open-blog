
### 1. vnode比dom优势的原因
当数据变化的时候，由于重新渲染生成新的dom性能开销很大，那么很容易就引起了整个dom树的重绘跟回流，有没有可能我们只更新我们修改的那一小部分dom，而不要引起整个dom的更改呢。 

diff算法可以做到，其实diff算法也好，vnode也好，说到底还是有操作到dom，只是说我们并不需要关心我们操作哪些dom，我们要做的就是数据去驱动视图的更新，然后diff算法帮我们做最优化的处理。

这个过程就是：真实的dom生成了oldVnode，节点数据改变，生成了Vnode，跟原先的oldVnode，通过diff算法做比较，一边进行比较，一边进行打补丁，做真实dom的更新 。
而这整个diff过程，就是调用了patch这个函数

### 2.vnode dom的表示
 > vnode(virtul dom) 其实是将复杂的庞大的dom对象，抽离成一个相对简单很多的对象，这个对象能够去描述dom的基本结构跟信息
这里两个概念：vnode 成为虚拟节点，简称节点，dom称为元素节点，是真实存在的元素节点。

比如：
```
<div>
<span>光光</span>
</div> 

vnode={
    tag:'div',
    children:[
        {tag:'span',children:[{text:'光光'}]}
    ]
}
```

### 3.diff的比较方式:
> 是经过一层层的同层对比的，不会跨层级的。
```
<div>
    <p>123</p>
</div>

<div>
    <span>456</span>
</div>
```
这里只会div跟div做比较，
p跟span做比较，
并不会说拿p跟div做比较，因为他们要符合相同的层级关系才能比较。




### 4. data 属性代理 setter触发notify 遍历订阅者watcher

因为数据data下的属性，都是通过Object.defineProperty($data,key,{set:function(){},get:function(){}})进行了代理，所以会每次的设置属性，会触发set函数里面Dep.notify去遍历对应属性所有的watcher。

订阅者watcher会调用patch去给真实dom打补丁，也就是patch(oldVnode,Vnode)，新旧节点的对比。


### 5.patch(oldVnode,Vnode) 分析
```
function patch (oldVnode, vnode) {
    if (sameVnode(oldVnode, vnode)) {
    	patchVnode(oldVnode, vnode)
    } else {
    	const oEl = oldVnode.el // 当前oldVnode对应的真实元素节点
    	let parentEle = api.parentNode(oEl)  // 父元素
    	createEle(vnode)  // 根据Vnode生成新元素
    	if (parentEle !== null) {
            api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl)) // 将新元素添加进父元素
            api.removeChild(parentEle, oldVnode.el)  // 移除以前的旧元素节点
            oldVnode = null
    	}
    }
    return vnode
}

```
patch(oldVnode,Vnode)函数 ： 接收两个参数 新节点vnode,旧节点oldVnode

patch函数通过  sameVnode(oldVnode,vnode)  来判断两个节点是否“值得比较”
**值得**:才去执行patchVnode。
**不值得的话**: 就是很直接，直接替换对应的dom元素。

这个过程就去取到oldVnode对应的真实dom节点，调用**api.parentNode**取到 旧节点对应dom元素节点的父亲dom元素节点然后去调用createEle(vnode）生成新的dom节点:**vnode.el**,之后通过api.insertBefore(parentEle,vnode.el,api.nextSibling(oEl))先取到oEl元素节点的后面的相邻元素节点，然后把vnode.el新元素节点插在前面，后面的相邻元素节点跟新元素节点一起插入父元素节点中。

相当于替换掉了这个oEl元素节点的位置。之后调用api.removeChild(parentEle, oldVnode.el)，移除旧的元素节点，之后把oldvnode=null 释放这块的内存，最后返回这个vnode.

### 6.sameVnode分析
但是我们怎么去判断”值不值得“，sameVnode(oldVnode,vnode)的比较，这一步做了什么呢？

```
function sameVnode (a, b) {
  return (
    a.key === b.key &&  // key值
    a.tag === b.tag &&  // 标签名
    a.isComment === b.isComment &&  // 是否为注释节点
    // 是否都定义了data，data包含一些具体信息，例如onclick , style
    isDef(a.data) === isDef(b.data) &&  
    sameInputType(a, b) // 当标签是<input>的时候，type必须相同
  )
}
```
判断oldVnode跟vnode 绑定的key，tag标签名，isComment是否为注释节点，isDef(oldVnode)跟isDef(vnode)是否都定义了，并且当标签为input时候，type必须相同
这些都满足相等的时候，就“值得”返回true，否则就是“flase”，整个节点替换。


### 7.”值得“后，patchVnode(oldVnode,vnode)做了哪些操作

```
patchVnode (oldVnode, vnode) {
    const el = vnode.el = oldVnode.el
    let i, oldCh = oldVnode.children, ch = vnode.children
    if (oldVnode === vnode) return
    if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
        api.setTextContent(el, vnode.text)
    }else {
        updateEle(el, vnode, oldVnode)
    	if (oldCh && ch && oldCh !== ch) {
            updateChildren(el, oldCh, ch)
    	}else if (ch){
            createEle(vnode) //create el's children dom
    	}else if (oldCh){
            api.removeChildren(el)
    	}
    }
}
```
找到oldVnode对应的dom元素节点el。

判断oldVnode跟vnode是否指向同一个对象，如果是，直接return返回，函数终止。

如果他们都有文本节点且不相等，那么调用api.setTextContent(el,vnode.text)将el.text设置为vnode.text。

如果都有子节点，且子节点不相等，那么调用updateChildren(el,oldCh,ch)去diff更新子节点。

如果oldVnode有子节点，而vnode没有，则调用api.removeChildren(el)删除oldVnode.el的子元素 。

如果vode有子节点，而oldVnode没有，调用createEle(vnode)去生成el的子节点。

### 8.updateChildren(el,oldCh,ch) diff到底做了啥

上面这些是比较好理解的，重点是在updateChildren(el,oldCh,ch)这个函数
```
updateChildren (parentElm, oldCh, newCh) {
    let oldStartIdx = 0, newStartIdx = 0 //旧子节点的起始索引
    let oldEndIdx = oldCh.length - 1 //旧子节点的结束索引
    let oldStartVnode = oldCh[0] //旧子节点中的起始节点
    let oldEndVnode = oldCh[oldEndIdx] //旧子节点中的结束节点
    let newEndIdx = newCh.length - 1 //新子节点的起始索引
    let newStartVnode = newCh[0] //新子节点中的起始节点
    let newEndVnode = newCh[newEndIdx] //新子节点中的结束节点
    let oldKeyToIdx //设置了key的索引表
    let idxInOld 
    let elmToMove
    let before
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {   // 对于vnode.key的比较，会把oldVnode = null
            oldStartVnode = oldCh[++oldStartIdx] 
        }else if (oldEndVnode == null) {
            oldEndVnode = oldCh[--oldEndIdx]
        }else if (newStartVnode == null) {
            newStartVnode = newCh[++newStartIdx]
        }else if (newEndVnode == null) {
            newEndVnode = newCh[--newEndIdx]
        }else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldCh[++oldStartIdx]
            newStartVnode = newCh[++newStartIdx]
        }else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldCh[--oldEndIdx]
            newEndVnode = newCh[--newEndIdx]
        }else if (sameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
            oldStartVnode = oldCh[++oldStartIdx]
            newEndVnode = newCh[--newEndIdx]
        }else if (sameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldCh[--oldEndIdx]
            newStartVnode = newCh[++newStartIdx]
        }else {
           // 使用key时的比较
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) // 有key生成index hash表
            }
            idxInOld = oldKeyToIdx[newStartVnode.key]
            if (!idxInOld) {
                api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                newStartVnode = newCh[++newStartIdx]
            }
            else {
                elmToMove = oldCh[idxInOld]
                if (elmToMove.sel !== newStartVnode.sel) {
                    api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                }else {
                    patchVnode(elmToMove, newStartVnode)
                    oldCh[idxInOld] = null
                    api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
                }
                newStartVnode = newCh[++newStartIdx]
            }
        }
    }
    if (oldStartIdx > oldEndIdx) {
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el
        //判断插入元素的位置，是否是最后一个元素，不是的话，就将before设置为newCh[newEndIdx + 1].el
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
        //在同一父元素节点下，根据startIdx ～ newEndIdx，在before节点前插入newCh中未比较的vnode对应的dom元素
    }else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
    oldS > oldE表示oldCh先遍历完，那么就将多余的vCh根据index添加到dom中去
    S > E表示vCh先遍历完，那么就在真实dom中将区间为[oldS, oldE]的多余节点删掉
}
```

首先将vnode的子节点vch和oldvnode的子节点oldch提取出来

根据while循环条件(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) 初始索引大于等于结束索引之后，就是oldCh或者vCh 有一个比较完了，才停止比较。

在这之前，会一直从两边向内改变索引，直到起始节点跟终止节点不为null,
之后oldStartVnode，oldEndVnode分别跟newStartVnode,oldStartVnode两两做sameVnode的比较，这个sameVnode在前面已经解释过了。

```
sameVnode(oldStartVnode, newStartVnode){
    patchVnode(oldStartVnode, newStartVnode)
    oldStartVnode = oldCh[++oldStartIdx]
    newStartVnode = newCh[++newStartIdx]
}
```           
> 如果这个oldStartVnode,newStartVnode值得比较，那么就去patchVnode里面再去各种判断，有的直接是文本节点替换删除，有的是直接又进入到patchChildren去diff，这是一个递归的diff过程。
这一步比较难说明白，就是diff的时候碰到值得比较的，满足sameVnode条件的，就去做patchvnode递归处理，然后把新节点的指针指向下一个节点，把旧节点的指针指向下一个节点。
oldStartVnode指向下一个节点，newStartVnode指向下一个节点。


```
sameVnode(oldEndVnode, newEndVnode){
    patchVnode(oldEndVnode, newEndVnode)
    oldEndVnode = oldCh[--oldEndIdx]
    newEndVnode = newCh[--newEndIdx]
}
```
> 如果这个oldStartVnode,newEndVnode 值得比较，那么就去patchVnode里面再去各种判断，有的直接是文本节点替换删除，有的是直接又进入到patchChildren去diff，这是一个递归的diff过程。
这跟上面sameVnode(oldStartVnode, newStartVnode)的一个类似的过程,
oldEndVnode指向上一个节点，newEndVnode指向上一个节点。

```
sameVnode(oldStartVnode, newEndVnode){
    patchVnode(oldStartVnode, newEndVnode)
    api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
    oldStartVnode = oldCh[++oldStartIdx]
    newEndVnode = newCh[--newEndIdx]
}
分析过程同上，就是旧起始节点跟新的结束节点 ”值得“比较，会去调用patchVnode完成diff过程，
同时，会将真实dom节点中，oldStartVnode.el移到 api.nextSibling(oldEndVnode.el) 也就是oldEndVnode的下个相邻节点 之前,也就是插入到oldEndVnode.el后面
然后 oldStartVnode指向下个节点，newEndVnode指向上个节点
```
```
sameVnode(oldEndVnode, newStartVnode）{
    patchVnode(oldEndVnode, newStartVnode)
    api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
    oldEndVnode = oldCh[--oldEndIdx]
    newStartVnode = newCh[++newStartIdx]
}
分析过程同上，就是旧起始节点跟新的结束节点 ”值得“比较，会去调用patchVnode完成diff过程，
同时，会将真实dom节点中，oldEndVnode.el移到 oldStartVnode.el 元素节点之前。
然后 oldStartVnode指向下个节点，newEndVnode指向上个节点
```
这四部 按照这个顺序进行先后比较，而且只会触发其中一种 或者 不触发，进入else的逻辑。
oldstart <-> vstart 
oldend <-> vend
oldstart <-> vend
oldend <-> vstart

如果上面这4种都”不值得“做比较，那么就进入else逻辑：如果有key，用key生成oldKeyToIdx hash表，oldVnode的key对应着index，然后通过 idxInOld = oldKeyToIdx[newStartVnode.key] 来取到新的vnode的key在老的oldKeyToIdx表中对应的index；


```
    if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) // 生成key的index hash表
    }
    idxInOld = oldKeyToIdx[newStartVnode.key]
    if (!idxInOld) {
        api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
        newStartVnode = newCh[++newStartIdx]
    }else {
     elmToMove = oldCh[idxInOld]
    if (elmToMove.sel !== newStartVnode.sel) {
        api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
     }else {
        patchVnode(elmToMove, newStartVnode)
        oldCh[idxInOld] = null
        api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
     }
    newStartVnode = newCh[++newStartIdx]
    }
```
>上面不满足sameVnode的四种情况
>
>如果新旧子节点都存在key，那么会根据oldChild的key生成一张hash表，用S的key与hash表做匹配,匹配节点为elmToMove = oldCh[idxInOld]
>
>匹配失败：api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
newStartVnode = newCh[++newStartIdx]
就在真实dom中将 createEle(newStartVnode).el移到oldStartVnode.el前面
>匹配成功就判断S和匹配节点（elmToMove）是否为sameNode
>
>如果是sameVnode，就调用patchVnode(elmToMove, newStartVnode)，然后将oldCh的对应节点删除，调用api.insertBefore(parentElm, lmToMove.el, oldStartVnode.el)，就在真实dom中将elmToMove.el移到oldStartVnode.el前面。
>
>如果不是sameVnode，就在真实dom中将createEle(newStartVnode).el 移到oldStartVnode.el前面
>
>如果没有key,则直接将S生成新的节点插入真实DOM（ps：这下可以解释为什么v-for的时候需要设置key了，如果没有key那么就只会做四种匹配，就算指针中间有可复用的节点都不能被复用了）


按照这个顺序
oldstart <-> vstart 
oldend <-> vend
oldstart <-> vend
oldend <-> vstart

#### 通过例子1(oldCh.length<newCh.length)来解析过程：

dom: a b d

oldCh:a b d

newCh:a c d b

oldS === oldStartVnode
oldE === oldEndVnode
S === startVnode
E === endVnode

>第一步：
>
>dom: a b d
>
>oldS = a, oldE = d；
>
>S = a, E = b;
>
>满足sameVnode(oldS,S)，oldS和S匹配，则将dom中的a节点放到第一个，已经是第一个了就不管了，此时dom的位置为：a b d ，oldSIdx++, SIdx++

>第二步：
>
>dom: a b d
>
>oldS = b, oldE = d；
>
>S = c, E = b;
>
>满足sameVnode(oldS,E)
根据里面的条件，那么将dom中，oldS对应的b oldE对应的d后面；
此时dom的位置为：a d b,oldSIdx++, EIdx--


>第三步：
>
>dom:a d b
>
>oldS =d ,oldE=d;
>
>S=c,E=d
>
>满足sameVnode(oldS,E)
oldE和E匹配，位置不变,此时dom的位置为：a d b ,oldIdx++,EIdx--

>第四步
>
>oldS>oldE;
>
>遍历结束，说明oldCh先遍历完，就将剩余的vCh节点根据自己的的index插入到真实dom中去

最后的结束会有一个条件会成立，要么oldS > oldE或S > E
因为while循环的条件是：oldS <= oldE && S <=E
oldS > oldE表示oldCh先遍历完，那么就将多余的vCh根据index添加到dom中去（如上图）
S > E表示vCh先遍历完，那么就在真实dom中将区间为[oldS, oldE]的多余节点删掉

#### 我们通过例子2(oldCh.length>newCh.length)再来熟悉下：

dom：b a d f e

old:b a d f e

new:a b e

>第一步：
>
>dom: b a d f e
>
>oldS = b, oldE = e；
>
>S = a, E = e;
>
>
>满足sameVnode(oldE,E)，oldE和E匹配，不用进行移动操作了，直接调用patchVnode(oldE,E)此时dom的位置为：：b a d f e ，oldSIdx--, SIdx--


>第二步：
>
>dom: b a d f e
>
>oldS = b, oldE = f；
>
>S = a, E = b;
>
>满足sameVnode(oldS,E)，oldS和E匹配，则将oldS.el(dom中的b)放到endVnode.el（dom中的f）后面，此时dom的位置为：a d f b e ，oldSIdx++, EIdx--

>第三步：
>
>dom: a d f b e
>
>oldS = a, oldE = f；
>
>S = a, E = a;
>
>满足sameVnode(oldS,S)，oldS和S匹配，不用进行移动操作了，直接调用patchVnode(oldS,S)此时dom的位置为：a d f b e ，oldSIdx++, SIdx++

>第四步
>
>S>E;
>
>S>E表示vCh先遍历完，那么就在真实dom中将oldVch区间为[oldS, oldE]的多余节点对应的dom节点删除
>这段代码体现在
```
else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
}
```

#### 我们通过例子3(不满足4种sameVnod的情况)再来熟悉下：

dom：b d c a

old:b d c a

new:a e b f

>第一步：
>
>dom: b d c a
>
>oldS = b, oldE = a；
>
>S = a, E = f;
>
>满足sameVnode(oldE,S)，oldE和S匹配，则将oldE.el(dom中的a)放到oldS.el（dom中的b）前面，此时dom的位置为：a b d c ，oldEIdx--, SIdx++


>第二步：
>
>dom: a b d c 
>
>oldS = b, oldE = c；
>
>S = e, E = f;
>
>上面不满足sameVnode的四种情况
>
>如果新旧子节点都存在key，那么会根据oldChild的key生成一张hash表，用S的key与hash表做匹配,匹配节点为elmToMove = oldCh[idxInOld]
>
>匹配失败：api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
newStartVnode = newCh[++newStartIdx]
就在真实dom中将 createEle(newStartVnode).el移到oldStartVnode.el前面,newStartIdx++;如果没有key,则直接将S生成新的节点插入真实DOM（ps：这下可以解释为什么v-for的时候需要设置key了，如果没有key那么就只会做四种匹配，就算指针中间有可复用的节点都不能被复用了）
>
>匹配成功就判断S和匹配节点（elmToMove）是否为sameNode
>
>如果是sameVnode，就调用patchVnode(elmToMove, newStartVnode)，然后将oldCh的对应节点删除，调用api.insertBefore(parentElm, lmToMove.el, oldStartVnode.el)，就在真实dom中将elmToMove.el移到oldStartVnode.el前面,newStartIdx++
>
>如果不是sameVnode，就在真实dom中将createEle(newStartVnode).el 移到oldStartVnode.el前面,newStartIdx++
>


>第二步：
>
>dom: a b d c 
>
>oldS = b, oldE = c；
>
>S = e, E = f;
>
>这个时候，将S.el(e)移到oldS (dom中的b)之前，此时的dom：a e b d c,SIdx++;

>第三步：
>
>dom: a e b d c
>
>oldS = b, oldE = c；
>
>S = b, E = f;
>
>满足sameVnode(oldS,S),只调用patchVnode，此时的dom：a e b d c,SIdx++,oldS++;

>第四步：
>
>dom: a e b d c
>
>oldS = d, oldE = c；
>
>S = f, E = f;
>
>这个时候，将S.el(e)移到oldS (dom中的d)之前，此时的dom：a e b f d c;SIdx++;


>第五步：
>
> SIdx>EIdx
>
>S>E表示vCh先遍历完，那么就在真实dom中将oldVch区间为[oldS, oldE]的多余节点对应的dom节点删除
>这段代码体现在
```
else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
}
```