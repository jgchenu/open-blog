
## Workbox 3：Service Worker 可以如此简单

如果你追求极致的 Web 体验，你一定在站点中使用过 PWA，也一定面临过在编写 Service Worker 代码时的犹豫不决，因为 Service Worker 太重要了，一旦注册在用户的浏览器，全站的请求都会被 Service Worker 控制，一不留神，小问题也成了大问题了。不过到了现在有了 Workbox 3，一切关于 Service Worker 的担心都不再是问题。

### 科普 Service Worker

如果你已经熟悉 Service Worker，可以跳过此段。

Service Worker 是 PWA 中重要的一部分，它是一个网站安插在用户浏览器中的大脑。Service Worker 是这样被注册在页面上的：
```
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```
为什么说 SW（下文将 Service Worker 简称为 SW）是网站的大脑？举个例子，如果在 www.example.com 的根路径下注册了一个 SW，那么这个 SW 将可以控制所有该浏览器向 www.example.com 站点发起的请求。只需要监听 fetch 事件，你就可以任意的操纵请求，可以返回从 CacheStorage 中读的数据，也可以通过 Fetch API 发起新的请求，甚至可以 new 一个 Response，返回给页面。
```
// 一段糟糕的 SW 代码，在这个 SW 注册好以后，整个 SW 控制站点的所有请求返回的都将是字符串 "bad"，包括页面的 HTML
self.addEventListener('fetch', function(event) {
  event.respondWith(
    new Response('bad')
  );
});
```
就是因为 SW 权利太大了，写起来才会如履薄冰，一不小心有些页面资源就不能及时正确的更新了。

一个还算完整的 Service Worker 示例
先来看一个直接手写的 SW 文件
```
var cacheStorageKey = 'cachesName';
var cacheList = [
  // 注册成功后要立即缓存的资源列表
]

// 当浏览器解析完 SW 文件时触发 install 事件
self.addEventListener('install', function(e) {
  // install 事件中一般会将 cacheList 中要缓存的内容通过 addAll 方法，请求一遍放入 caches 中
  e.waitUntil(
    caches.open(cacheStorageKey).then(function(cache) {
      return cache.addAll(cacheList)
    })
  );
});

// 激活时触发 activate 事件
self.addEventListener('activate', function(e) {
  // active 事件中通常做一些过期资源释放的工作，匹配到就从 caches 中删除
  var cacheDeletePromises = caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(name => {
      if (name !== cacheStorageKey) {
        return caches.delete(name);
      } else {
        return Promise.resolve();
      }
    }));
  });

  e.waitUntil(
    Promise.all([cacheDeletePromises])
  );
});

self.addEventListener('fetch', function(e) {
  // 在此编写缓存策略
  e.respondWith(
    // 可以通过匹配缓存中的资源返回
    caches.match(e.request)
    // 也可以从远端拉取
    fetch(e.request.url)
    // 也可以自己造
    new Response('自己造')
    // 也可以通过吧 fetch 拿到的响应通过 caches.put 方法放进 caches
  );
});

```
其实所有站点 SW 的 install 和 active 都差不多，无非是做预缓存资源列表，更新后缓存清理的工作，逻辑不太复杂，而重点在于 fetch 事件。上面的代码，我把 fetch 事件的逻辑省略了，因为如果认真写的话，太多了，而且也不利于讲明白缓存策略这件事。想象一下，你需要根据不同文件的扩展名把不同的资源通过不同的策略缓存在 caches 中，各种 CSS，JS，HTML，图片，都需要单独搞一套缓存策略，你就知道 fetch 中需要写多少东西了吧。

#### Workbox 3
Workbox 的出现就是为了解决上面的问题的，它被定义为 PWA 相关的工具集合，其实围绕它的还有一些列工具，如 workbox-cli、gulp-workbox、webpack-workbox-plagin 等等，不过他们都不是今天的重点，今天想聊的就是 Workbox 本身。

其实可以把 Workbox 理解为 Google 官方的 PWA 框架，它解决的就是用底层 API 写 PWA 太过复杂的问题。这里说的底层 API，指的就是去监听 SW 的 install、active、 fetch 事件做相应逻辑处理等。使用起来是这样的：
```
// 首先引入 Workbox 框架
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.0/workbox-sw.js');
workbox.precaching([
  // 注册成功后要立即缓存的资源列表
]);

// html的缓存策略
workbox.routing.registerRoute(
  new RegExp(''.*\.html'),
  workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
  new RegExp('.*\.(?:js|css)'),
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  new RegExp('https://your\.cdn\.com/'),
  workbox.strategies.staleWhileRevalidate()
);

workbox.routing.registerRoute(
  new RegExp('https://your\.img\.cdn\.com/'),
  workbox.strategies.cacheFirst({
    cacheName: 'example:img'
  })
);
```
上面的代码理解起来就容易的多了，通过 workbox.precaching 中的是 install 以后要塞进 caches 中的内容，workbox.routing.registerRoute 中第一个参数是一个正则，匹配经过 fetch 事件的所有请求，如果匹配上了，就走相应的缓存策略 workbox.strategies 对象为我们提供了几种最常用的策略，如下：
```
Stale-While-Revalidate


Cache First


Network First


Network Only


Cache Only

```
你可以通过 plugin 扩展这些策略，比如增加个缓存过期时间（官方有提供）什么的。甚至可以继续监听 fetch 事件，然后使用这些策略，官方文档在这里.

经验之谈

在经过一段时间的使用和思考以后，给出我认为最为合理，最为保守的缓存策略。

* HTML，如果你想让页面离线可以访问，使用 NetworkFirst，如果不需要离线访问，使用 NetworkOnly，其他策略均不建议对 HTML 使用。

* CSS 和 JS，情况比较复杂，因为一般站点的 CSS，JS 都在 CDN 上，SW 并没有办法判断从 CDN 上请求下来的资源是否正确（HTTP 200），如果缓存了失败的结果，问题就大了。这种我建议使用 Stale-While-Revalidate 策略，既保证了页面速度，即便失败，用户刷新一下就更新了。

* 如果你的 CSS，JS 与站点在同一个域下，并且文件名中带了 Hash 版本号，那可以直接使用 Cache First 策略。

* 图片建议使用 Cache First，并设置一定的失效事件，请求一次就不会再变动了。

上面这些只是普适性的策略，见仁见智。

还有，要牢记，对于不在同一域下的任何资源，绝对不能使用 Cache only 和 Cache first。

最后打个报告

淘宝 PC 首页的 Service Worker 上线已经有一段时间了，经过不断地对缓存策略的调整，收益还是比较明显的，页面总下载时间从平均 1.7s，下降到了平均 1.4s，缩短了近 18% 的下载时间。

前面的例子中，我们使用的是 Google 的 CDN 地址引入的 Workbox，我已经将 3.3.0 版本迁移到 alicdn，后续还会继续维护更新，使用方法如下：
```
importScripts('https://g.alicdn.com/kg/workbox/3.3.0/workbox-sw.js');
workbox.setConfig({
  modulePathPrefix: 'https://g.alicdn.com/kg/workbox/3.3.0/'
});
```