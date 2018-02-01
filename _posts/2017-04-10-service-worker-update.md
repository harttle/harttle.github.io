---
title: Service Worker 更新机制
tags: Chrome HTTP 缓存 进程 浏览器 Service-Worker PWA
---

[Service Worker][sw] 用来控制页面资源缓存，那么`sw.js`文件本身如何进行更新呢？
[立即使用 Service Worker！](/2017/04/09/service-worker-now.html) 中介绍了使用 Service Worker 搭建离线 App，
以及这一 App 的版本更新方式。
本文重点关注 Service Worker 本身的更新机制，如何设置 HTTP 缓存，当前浏览器的更新机制，以及调试时如何快速更新。

# Service Worker 更新

Service Worker 作为离线缓存的核心，它的更新意味着 App 版本的更新。
它的更新是由浏览器触发、在独立进程中进行的。

* 独立的更新进程。安装和更新进程都是独立的进程，渲染进程和当前的 Service Worker 会同时启动，安装和更新不影响用户使用当前 App，这里 Web App 比 Native 更加轻量。
* 零客户端时更新。为了不打扰用户，只有在用户关闭了所有旧版页面之后（因为 Service Worker 是 shared worker）新的 Worker 才会被激活。
* [更新过程][soft-update]（Soft Update）由浏览器触发，只有逐字节比对不同时才会启动 [更新算法][update]（Update Algorithm）。

<!--more-->

# HTTP 缓存

Service Worker 控制着整个 App 的离线缓存。
为了避免 Service Worker 缓存自己导致死锁无法升级，通常将 `sw.js` 本身的缓存直接交给 [HTTP 服务器缓存][http-cache]。

但 `sw.js` 并不是页面的脚本资源，它的更新由浏览器触发（多次 `register()` 同一个 Service Worker 不会触发更新），并应用了特殊的缓存策略。
Service Worker 的更新算法（这里是指 [Soft Update][soft-update]）只在下列情况会被触发：

* 注册了一个新的 URL 不同的 Service Worker
* 功能事件被触发，比如 `push`, `sync` 等
* 页面导航，包括 `fetch`（此时请求为 `non-subresource request`，因此也会触发 Soft Update）

触发更新算法后，浏览器会检查并遵循 `sw.js` 的文件缓存设置，比如`max-age`。
这意味着：

* 如果不设置 `sw.js` 的 HTTP 缓存，每次页面加载该文件都会被请求。
* 如果设置了 10s 的缓存，则 10s 内浏览器不会再次访问服务器。

到此为止这些行为都是标准的 HTTP 缓存。这里有个 Node.js Demo：

* <https://github.com/service-worker/demos/tree/master/sw-update>

# SW 文件的 MD5

[合理使用 HTTP 缓存](/2017/04/04/http-cache-best-practice.html) 一文提到，静态文件的通常实践为 MD5 + 长时间 `max-age`。
静态文件添加 MD5 的实践（又称 FileRev）基于这样一个逻辑：

> HTML 页面是网站的入口，它对其他资源文件的引用描述了资源间的依赖关系。

但 Service Worker 的情况有所不同：
**Service Worker 不属于页面资源脚本，即程序入口的执行点可能不是页面，而是 Service Worker 本身**。
此时如果给 Service Worker 增加 MD5 可能导致很严重的后果：

* 新的 HTML 未载入（页面中通常包含 regsiter 代码）Service Worker 就无法更新
* Service Worker 无法更新就无法载入新的 HTML

虽然可以通过小心的编码避免上述问题，比如在 Service Worker 中对 HTML 总是采用网络优先的缓存策略，
但是让软件能否正常更新依赖于小心的编码，总是不如依赖于固化的编译部署流程。

# 缓存之外

Service Worker 的特殊之处除了由浏览器触发更新之外，还应用了特殊的缓存策略：
如果该文件已 24 小时没有更新，当 [Update][update] 触发时会强制更新。这意味着最坏情况下 Service Worker 会每天更新一次。

> Set request’s cache mode to "no-cache" if any of the following are true:
> * registration’s use cache is false.
> * job’s force bypass cache flag is set.
> * newestWorker is not null, and registration’s last update check time is not null and the time difference in seconds calculated by the current time minus registration’s last update check time is greater than 86400.
>
> -- [Soft Update][soft-update], W3C Service Worker

# Registration.update()

Service Worker 标准中给出了 [`ServiceWorkerRegistration.update()`][reg-update] 方法，调用该方法会导致立即更新 Service Worker。
但 Chrome 貌似还是不会跳过 HTTP 缓存，此处实现和标准尚存在差异。

> update() pings the server for an updated version of this script without consulting caches. This is conceptually the same operation that UA does maximum once per every 24 hours.
>
> -- [ServiceWorkerRegistration.update()][reg-update], W3C Service Worker

# 调试时更新

在 [Service Worker 调试技巧](/2017/04/08/service-worker-debug.html) 中提到很多调试手段，
包括 Service Worker 被载入后立即激活：

```javascript
self.addEventListener('install', function() {
    self.skipWaiting();
});
```

以及存在 Service Worker 时浏览器刷新以及强制刷新的行为。
更多调试相关方法可参考：[Service Worker 调试技巧](/2017/04/08/service-worker-debug.html) 一文。


[http-cache]: /2017/04/04/using-http-cache.html
[sw]: https://w3c.github.io/ServiceWorker/
[soft-update]: https://w3c.github.io/ServiceWorker/#soft-update
[update]: https://w3c.github.io/ServiceWorker/#update-algorithm
[reg-update]: https://www.w3.org/TR/service-workers/#service-worker-registration-update
