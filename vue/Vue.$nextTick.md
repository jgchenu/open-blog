#### NextTick 原理分析

nextTick 可以让我们在下次 DOM 更新循环结束之后执行延迟回调，用于获得更新后的 DOM。

在 Vue 2.4 之前都是使用的 microtasks，但是 microtasks 的优先级过高，在某些情况下可能会出现比事件冒泡更快的情况，但如果都使用 macrotasks 又可能会出现渲染的性能问题。所以在新版本中，会默认使用 microtasks，但在特殊情况下会使用 macrotasks，比如 v-on。

> microtasks中原本的Object.observe因为性能原因最终放弃了。原因在于 O.o 的使用限制了很多 V8 中已有的优化，导致被 observed 的对象会比 non-observed 的对象慢得多。过多的上下文切换 (框架和浏览器之间) 会对异步的数据变化通知造成挑战，也很难对框架进行大幅性能优化 (macro-optimizations)。Polymer 团队的头也说用了 O.o 调试很诡异。

对于实现 microtasks，会先判断是否能使用 Promise，不能的话降级为MuatationObserver，以上都不行就使用macrotasks 

对于实现 macrotasks ，会先判断是否能使用 setImmediate ，不能的话降级为 MessageChannel，以上都不行的话就使用 setTimeout

```

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
let timerFunc

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter)) //根据counter创建一个文本节点
  observer.observe(textNode, {
    characterData: true //characterData:Boolean	是否节点内容或节点文本的变动
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  timerFunc = () => {
    port.postMessage(1)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}


```
执行优先级Promise,MutationObserver,setImmediate > MessageChannel ,setTimeout
```
Promise.resolve().then(()=>{
  console.log('promise');
})
var observer=new MutationObserver(()=>{console.log('MutationObserver')});
var counter=1;
var textNode=document.createTextNode(String(counter));
observer.observe(textNode,{
  characterData:true
})
counter=(counter+1)%2;
textNode.data=String(counter)
var channel=new MessageChannel()
var port=channel.port1;//使用port1对象传信息会触发port2对象的onmessage回调
channel.port2.onmessage=(e)=>{console.log('MessageChannel',e)};//e 为MessageEvent对象，data属性值为port1.postMessage 传过来的
port.postMessage(1);
//必须传实参，否则会报错。然后传的这个1变为回调函数里面MessageEvent.data的值

setImmediate(()=>{console.log('setImmediate')})
setTimeout(()=>{console.log('setTimeout')})

//顺序打印：Promise,MutationObserver,setImediate, MessageChannel ,setTimeout
```