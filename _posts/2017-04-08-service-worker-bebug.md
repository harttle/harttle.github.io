---
title: Service Worker 调试技巧
tags: Chrome PWA 事件 测试 缓存 Service-Worker
---

在 [PWA 初探](/2017/01/28/pwa-explore.html) 中初步地介绍了 Progressive Web App
的技术构成。本文则就其中的 [Service Worker][sw] 展开，介绍其部署要求以及调试方法。
包括 https 限制、Service Worker 更新问题、以及 [Chrome][chrome] 调试工具。

<!--more-->

# Trusted Origin

由于 Service Worker 可以任意操作缓存和截获所有页面 fetch 请求，
Web 标准要求 Service Worker 文件本身的 URL 必须是 HTTPS 或 localhost 等受信域名（Trusted Origin）。
否则注册过程会失败并抛出 `SecurityError` 异常。

> If the result of running potentially trustworthy origin with the origin of job’s script url as the argument is Not Trusted, then:
>
> 1. Invoke Reject Job Promise with job and a "SecurityError" exception.
> 2. Invoke Finish Job with job and abort these steps.
>
> -- [Register Algorithm][register-algo], W3C Service Worker

在调试过程中可以使用 Chrome 命令行参数来禁用安全域名检查：

```bash
./chrome --user-data-dir=/tmp/foo --unsafely-treat-insecure-origin-as-secure=http://your.insecure.site
```

对于移动端测试可以做 https 的反向代理。自签证书是不行的，详见这个 Issue：
<https://github.com/w3c/ServiceWorker/issues/691>

# 跳过 waiting

我们知道 [Web Workers][web-worker] 分为 **专用 Worker**（dedicated worker）和 **共享 Worker**（shared worker）。
Service Worker 属于后者，这意味着在一个标签页可以打印另一个标签页的访问日志哈哈。
因此为了保证用户体验的一致性，只要还有客户（可理解为标签页）在使用旧的 Service Worker，
新的 Service Worker 版本就不能立即激活：只能进行安装并进入等待状态。

> Wait until no service worker client is using registration or registration's waiting worker's skip waiting flag is set.
>
> -- [Install Algorithm][install-algo], W3C Service Worker

在调试 Service Worker 时肯定希望重新加载后立即激活，
为此我们可以在 `install` 事件发生时通过 `skipWaiting()` 来设置 skip waiting 标记。
这样每次 Service Worker 安装后就会被立即激活。

```javascript
self.addEventListener('install', function() {
    if (ENV === 'development') {
        self.skipWaiting();
    }
});
```

但是当 Chrome 未检测到 Service Worker 发生变化时（比如该文件设置了 [HTTP 缓存][http-cache]），
甚至连安装都不会被触发。现在可以借助于 [Chrome][chrome] 调试了：
在 Application 标签页勾选 "Update on reload"，Chrome 会在每次刷新时去访问 Service Worker
文件并重新安装和激活。

> 本节的示例都来自 <https://service-worker.github.io/demos/simple-fetch/>。

![update on reload](/assets/img/blog/pwa/update-on-reload@2x.png)

# 刷新的行为

在 [使用 HTTP 缓存][http-cache] 一文提到了浏览器刷新按钮的行为，
但是有 Service Worker 时情况会稍微复杂一些：

* 普通刷新时，Chrome 遵循 HTTP 缓存机制，Service Worker 也会正常运行。（除非勾选了 Update on reload）
* 强制刷新时，Chrome 跳过所有缓存机制（只是跳过而非清空），Service Worker 也不会被执行。
* 勾选了 Application/SW 的 Update on reload 时，刷新页面会先执行 Service Worker 的获取、安装，激活，然后开始页面的正常访问流程（此时 Service Worker 已经生效）。
* 勾选了 Application/SW 的 Bypass for network 时，所有网络请求不经过 Service Worker，无其他副作用。
* 勾选了 Network 的 Disable cache 时，浏览器禁用 [HTTP 缓存][http-cache]，但 Service Worker 正常工作。**这是最常用的调试方式，无论是否启用了 Service Worker**。

# 清空缓存

除了上述跳过缓存的方法之外，我们还可以直接清空 Chrome 的各种缓存。
见 Application 标签页的 Clear Storage 选项卡。

![clear cache](/assets/img/blog/pwa/clear-cache@2x.png)

# 网络跟踪

此外经过 Service Worker 的 fetch 请求 Chrome 都会在 Network 标签页里标注出来，其中：

* **来自 Service Worker 的内容**会在 "Size" 字段中标注为 `"from ServiceWorker"`
* **Service Worker 发出的请求**会在 "Name" 字段中添加 ⚙ 图标。

例如下图中，第一个名为 "300" 的请求是一张 jpeg 图片，
其 URL 为`"https://unsplash.it/200/300"`，该请求是由 Service Worker 代理的，
因此被标注为 `"from ServiceWorker"`。

为了响应页面请求，Service Worker 也发出了名为 "300" 的请求（这是图中第二个请求），
但 Service Worker 把 URL 改成了 `"https://unsplash.it/g/200/300"`，因此返回给页面的图片是灰色的。

![service worker network](/assets/img/blog/pwa/service-worker-network@2x.png)

# 参考阅读

* Service Worker Spec.: <https://w3c.github.io/ServiceWorker>
* Chromium Service Worker FAQ: <https://www.chromium.org/blink/serviceworker/service-worker-faq>
* PWA 基本特性与标准现状：<http://harttle.com/2017/01/28/pwa-explore.html>

[sw]: https://w3c.github.io/ServiceWorker/
[register]: https://w3c.github.io/ServiceWorker/#navigator-service-worker-register
[register-algo]: https://w3c.github.io/ServiceWorker/#register-algorithm
[update]: https://www.w3.org/TR/service-workers/#service-worker-registration-update
[cc]: /2017/04/04/using-http-cache.html
[web-worker]: https://html.spec.whatwg.org/multipage/workers.html
[install-algo]: https://www.w3.org/TR/service-workers/#installation-algorithm
[chrome]: http://harttle.com/tags.html#Chrome
[http-cache]: /2017/04/04/using-http-cache.html
