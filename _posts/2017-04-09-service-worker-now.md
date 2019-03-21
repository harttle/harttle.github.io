---
title: 立即使用 Service Worker！
tags: AppCache Chrome JavaScript PWA Safari 缓存 Service-Worker
---

Web 相比于 Native 最大的弱势莫过于离线能力，如果你没有连接到网络想必网页一定是打不开的。
为了离线能力 Web 也有过很多的尝试，比如很多浏览器提供的 Reading List，HTML5 的 APPCache，
indexDB、localStorage、sessionStorage 等一系列的存储 API，以及本文要介绍的 Service Worker。
本文的主要内容包括为什么可以立即使用 Service Worker，以及如何借助 Service Worker 快速搭建离线可用的 App。

**Service Worker 可以平滑引入**。[Service Worker][sw] 是 [PWA 系列技术][pwa-explore] 中实现离线能力的关键技术。
它属于一种共享的 [Web Worker][web-worker]（shared worker），运行在页面进程之外。
因此 Service Worker 天生和页面脚本没有耦合，在引入 Service Worker 的同时无需重构既有代码。
这大概也是 Progressive Web App 中 Progressive 的另一层含义。

**Service Worker 进程采用较为现代的接口**。Web Worker 是事件驱动的 JavaScript 进程，而 Service Worker 可以监听到更多的功能事件（Functional Events），
比如资源请求（`fetch`）、推送通知（`push`）、后台同步（`sync`）。
这些事件大多基于 [ExtendableEvent][ext-event] 实现，并采取 [Promise][promise] 接口，
用起来相当舒服。

<!--more-->

## 备受批评的 AppCache

在 HTML5 (Section 7.9) 中引入的 Application Cache 备受批评的，如今已经被全面废弃。
建议这部分开发者直接使用 Service Worker。
网络上有无数关于 AppCache 的评论，本文直接引用 [A List Apart 上一篇博客][alistaprt] 的主要观点：

* 即使在线，文件总是从 AppCache 中来
* 只有 Manifest 变化时文件才会更新，一旦变化总会更新所有文件
* 不支持 conditional download，破坏响应式设计
* 失败的 fallback 页面，无法区分网络错误和状态码
* 重定向被处理为访问失败

W3C 决定 AppCache 仍然保留在 [HTML 5.0 Recommendation 中][appcache]，在 HTML 后续版本中移除。

* Issue: <https://github.com/w3c/html/issues/40>
* Mailing list: <https://lists.w3.org/Archives/Public/public-html/2016May/0005.html>

WHATWG HTML5 作为 Live Standard，也将 AppCache 标注为 Discouraged 并引导至 Service Worker。

![whatwg html5 appcache](/assets/img/blog/pwa/whatwg-application-cache@2x.png)

## 生命周期

Service Worker 的使用过程很简单，在页面脚本中注册 Service Worker 文件所在的 URL，
Service Worker 就开始安装和激活了。激活后的 Service Worker 就可以监听到功能事件了。
同一页面中，新注册的 Service Worker 会在旧的 Service Worker 没人在使用之后激活。
MDN 给出了很漂亮的生命周期图示：

![service worker lifecycle](https://mdn.mozillademos.org/files/12636/sw-lifecycle.png)

## 缓存静态文件

引入 Service Worker 后首先可以进行的网站优化就是缓存静态文件和静态页面，这些页面立即就可以离线访问了。
将页面加入缓存有两种方法：在 Service Worker 安装时添加，或者在请求真正发生时添加。

### on install

在 Service Worker 注册时立即去获取并添加。下一次访问当前页面时已经可以离线。

```javascript
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('harttle.land-v1.0.0').then(function(cache) {
      return cache.addAll([
        '/css/main.css',
        '/js/main.js',
        '/font/iconfont.ttf'
      ]);
    })
  );
});
```

### on fetch

在请求发生时获取并添加。需要在 Service Worker 激活后（激活时请求已经结束）下一次访问时添加到缓存，再下一次访问可以离线。

```javascript
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('harttle.land-v1.0.0').then(function(cache) {
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});
```

### 比较

* 前者的优点是第二次访问即可离线，缺点是需要将需要缓存的 URL 在编译时插入到脚本中；
* 后者的优点是无需更改编译过程，也不会产生额外的流量，缺点是需要多一次访问才能离线可用。

除了静态的页面和文件之外，如果对 AJAX 数据加以适当的缓存可以实现真正的离线可用，
要达到这一步可能需要对既有的 Web App 进行一些重构以分离数据和模板。

## 版本更新

Service Worker 在客户端进行页面缓存，那么服务器提供的 HTTP 缓存就需要配合，让两者更好地一起工作。
PWA 的版本更新其实就是 Service Worker 的更新：**给 Service Worker 打版本号，资源文件使用该版本号作为 [CacheStorage][CacheStorage] 的键值**。

Service Worker 标准提供了完整的安装和版本支持，PWA 可以利用上文中的 `install` 事件进行资源初始化，`activate` 事件用来更新缓存。
[`activate` 事件][activate] 会在 Service Worker 真正激活时触发，此时所有的功能事件（包括`fetch`）都会经过 Service Worker。
此时通常会清空过期的缓存：

```javascript
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        // VERION === 'harttle.land-v1.0.1'
        cacheNames.filter(function(cacheName) {
          return cacheName !== VERSION
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
```

Service Worker 用来控制页面资源缓存，那么`sw.js`文件本身如何进行更新呢？
一个原则是不在 Service Worker 中缓存 `sw.js` 自己，让服务器来决定 `sw.js` 本身的更新。
浏览器在检查 Service Worker 是否有更新时会遵循该文件的[HTTP缓存设置][http-cache]，但每天至少一次。

调试时更新 [Service Worker][sw] 和 [CacheStorage][CacheStorage] 有更方便的方法，可参考
[Service Worker 调试技巧](/2017/04/08/service-worker-debug.html) 一文。
关于 Service Worker 的更新机制的更详细讨论，可参考 [Service Worker 更新机制](/2017/04/10/service-worker-update.html) 一文。

## 兼容性考虑

目前 Service Worker 标准虽然仍处于草案阶段，但浏览器厂商已经在快速地跟进实现了。
目前 Firefox 和 Chrome 均已发布支持 Service Worker 的版本，Safari 尚未明确表示支持。
国内的厂商大多基于 Webkit 内核进行包装或二次开发，因此这些浏览器的支持问题并不大，
唯一值得担心的就是 Safari 的兼容性，毕竟国内 iPhone 奇多。

Service Worker 兼容性列表：<https://jakearchibald.github.io/isserviceworkerready/>

[sw]: https://w3c.github.io/ServiceWorker/
[web-worker]: https://html.spec.whatwg.org/multipage/workers.html
[pwa-explore]: /2017/01/28/pwa-explore.html
[ext-event]: https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[alistaprt]: https://alistapart.com/article/application-cache-is-a-douchebag
[appcache]: https://www.w3.org/TR/html5/browsers.html#appcache
[CacheStorage]: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
[http-cache]: /2017/04/04/using-http-cache.html
[update]: https://www.w3.org/TR/service-workers/#service-worker-registration-update
[activate]: https://www.w3.org/TR/service-workers/#service-worker-global-scope-activate-event
