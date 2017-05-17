---
title: PWA 初探：基本特性与标准现状
tags: Android Chrome PWA 缓存 Service-Worker
---

[PWA][pwa](Progressive Web Apps)是 Google 最近在提的一种 Web App 形态
（或者如 Wikipedia 所称的“软件开发方法”）。
Harttle 能找到的关于 PWA 最早的一篇文章是 2015年6月 Alex Russell 的一篇博客：
[Progressive apps escaping tabs without losing our soul][alex-pwa]，
**让 Web App 从标签页跳出来，同时保持 Web 的灵魂。**

如 Alex 所述，PWA 意图让 Web 在保留其本质（开放平台、易于访问、可索引）的同时，
在离线、交互、通知等方面达到类似 App 的用户体验。按 [Google 官方的解释][pwa-google]
PWA 具有这些特性：Reliable, Fast, Engaging。

> Progressive Web Apps use modern web capabilities to deliver an app-like user experience. They evolve from pages in browser tabs to immersive, top-level apps, maintaining the web's low friction at every moment. -- Google PWA Tutorials

<!--more-->

# Native or Web?

从 HTTP 的发明到 AJAX 的流行，Web 在整个应用市场中获得了极大的胜利，
但智能手机带来的移动互联网潮流中，Native 应用凭借更好的系统集成以及快速的技术迭代成为这一时代的弄潮儿。
此时的 Native 在很多方面都超越 Web：

* 一方面，与操作系统集成度比较高，比 Web 应用的功能更加丰富。比如推送通知，离线可用，重力、健康等传感器，蓝牙、Wifi 等操作系统接口。
* 另一方面，技术迭代非常迅速。Android、iOS 有 Google 和 Apple 等厂商的推动，操作系统接口升级很快。

与此同时，Web 确实也在不断地更新技术，比如 [蓝牙协议][bluetooth]、[推送 API][pushapi]，还有下文中的诸多技术标准。
但确实不可否认 Web 技术的更新非常缓慢，这是开放技术的代价：
技术更新依赖于标准化的推行。
只在标准制定阶段就需要历经提案（Proposal）、作者草案（Editor's Draft）、官方草案（Working Draft），建议（Recommendation）等过程
（当然从这个角度讲 WHATWG 的标准化过程就比 W3C 聪明很多）。
此后的浏览器厂商实现、Web 开发者的推广又需要更长的时间。

但 Web 从来都是以开放性和扩展性取胜，开放才是 Web 的本质。正如 Alex 所述，Web 同样拥有 Native 无法比拟的优势：

* 连通性，整个 Web 系统由超链接相互连接。
* 一致性和可访问性，所有人或机器都可以很好地理解 Web 文档。
* 开放性，开发和访问无需授权或支付费用。

下文关于 PWA 系列技术标准的介绍，回答了如何以 Web 的方式满足移动互联网的需求。

# What is a Progressive Web App?

PWA 就是提供类似 App 体验的网站，其具体技术包括
[Service worker][service-worker]、
[Web App Manifest][manifest]、
[Cache API][api-cache]、
[Fetch API][fetch-api]、
[Push API][push-api]、
[Web Push Protocol][web-push]、
[Notification][notification] 等等。
目前这些技术标准多数处于草案阶段，兼容性的浏览器只有 Chrome 40, Firefox 40 和 Opera，
对于推送通知、indexedDB 等技术则需要更高版本的浏览器。

在国内的移动互联网中 Safari、UC、QQ 等浏览器占有主要份额，
因此目前基本处于生产环境不可用的试水阶段。然而在流量昂贵、Chrome 盛行的印度，
只需少量流量便可安装、离线可用的 PWA 已经在不少公司开始研发
（PropTiger、MagicBricks、Housing 等）。

相比于开发一个 App，在原生的 Web 页面上启用 PWA 特性非常容易：
通过 JavaScript API 完全控制页面缓存、通过 HTML 扩展支持清单文件，
这一切都是 Web，有着开放的标准和文档，以及开放的解决方案。
下文中就 PWA 中的关键技术做概述性的介绍。

# Service Worker

既 HTML5 [AppCache][appcache]（Application Cache） 的失败之后，新的 Service Worker 标准意在提供更加灵活的
[Cache API][api-cache]，加上新的 Fetch API （见下文）可以完全控制客户端缓存。

* Service Worker 标准：<https://www.w3.org/TR/service-workers/>
* 标准状态：Working Draft
* 兼容性：Android Browser 53+，Opera Mobile 37，Chrome for Android 56，Samsung Internet 4+，QQ Browser 1.2

Service Worker 是一种 [Web Worker][web-worker]（定义在 HTML 标准中），是事件驱动的后台进程。
通过对客户事件添加钩子可以实现 Web App 的离线启动：

* 在`install`时使用 `.keys()` 获取所有缓存键并使用 `.delete()` 来清理过期的缓存。
* 在`active`时使用 `.add()` 和 `.addAll()` 来立即添加当前页面资源进缓存，
* 在`fetch`时使用 `caches.put()` 来更新缓存。

> 为了避免体验不一致，Service Worker 在 `install` 后不会立即`active`，
> 除非用户关闭了所有标签页，在调试时可以在`install`事件中调用`self.skipWaiting()`来强制`active`。

Service Worker 标准中还定义了 Cache API，提供 CacheStorage 接口来操作缓存（在 Service Worker Scope 中为`caches`对象）。
需要注意一个 Response 对象只能被读一次（Response 对象提供了流式的接口，定义在 Fetch API 中，见下文），
因此需要返回一份，同时 clone 一份放入缓存。
下面的代码写在 Service Worker 进程中，该进程的脚本文件通过 JavaScript API 在页面脚本中进行注册。

```javascript
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('mysite-dynamic').then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
```

上述代码来自 [The Offline Cookbook][offline-cookbook]。
其中调用了 `fetch()` 来进行真正的网络请求，即下文的 Fetch API。

# Fetch API

[Fetch API][fetch-api] 设计为比 [XMLHttpRequest][xhr] 更低层的 API，
意在统一页面中的各种 Fetch（包括 `img`、`script`、`lint`、`importScripts()`, `cursor` 等），
使它们的表现（比如重定向和跨域发生的时候）更为一致。
Fetch API 标准中还定义了 Response 和 Request 对象的接口，借此我们可以更方便地操作 HTTP 请求和响应。

* Fetch 标准：<https://fetch.spec.whatwg.org/>
* 标准状态：Living Standard
* 兼容性：Android Browser 53+，Opera Mobile 37+，Chrome for Android 56+，QQ Browser 1.2+ 

Fetch API 不是 Magic，同样遵循 [HTTP 缓存机制][http-cache]，它与`xhr` 的跨域行为也是一样的：
只有同域的请求和启用了 `CORS` 的跨域请求才能获取到[响应状态码][status-code]和响应体。

在[跨域的诸多办法][cross-origin]中，JSONP 在 Service Worker 中仍然可行（虽然 Harttle 推荐标准的 CORS），
但回调函数的上下文现在是 [ServiceWorkerGlobalScope][swgs]，而不是页面脚本中的 `window`。
`fetch` CORS 资源并需要读取其内容时，不仅服务器需要返回 CORS 相关状态码，在发送请求时也需要[声明 `cors`][fetch-cors]。

# Push Notification

[推送通知][push]（Push Notification）是 Engagement 特性的技术支撑，这可能商业网站最关心的一点。
需要 Chrome 50（Android Chrome 55）。离线推送时 Service Worker 并不在运行，
需要 User Agent 接收信息并唤醒对应的 Service Worker，因此该特性依赖于浏览器厂商。

相比而言推送消息较为复杂，PWA 的 Push 机制包括 [Notification][notification] 和 [Push API][push-api]
两部分标准，前者用于向用户展示通知，后者用于订阅推送消息。其中 Notification 标准早已有之，在桌面浏览器上使用较多。
此外通知的发送过程还依赖于 [Web Push Protocol][web-push]，由于移动设备在通信上的电量耗费问题，
Apple 早就托管了 iOS 的通知推送，国内众厂商也有托管所有通知的倾向。WebPush 成为这一过程的标准对开发者和 Web 的长远发展都有好处。

> 目前在 Chrome 上使用推送通知，需要借助于 [Google Cloud Messaging][google-cloud-messaging]。

* Push API（Working Draft）: <https://www.w3.org/TR/push-api/>
* Web Push Protocol（Internet Draft）: <https://tools.ietf.org/html/draft-ietf-webpush-protocol-12>
* Notification（Recommendation）: <https://www.w3.org/TR/notifications/>

WebPush 架构下的整个通信流程如下图所示：

```
https://tools.ietf.org/html/draft-ietf-webpush-protocol-12

    +-------+           +--------------+       +-------------+
    |  UA   |           | Push Service |       | Application |
    +-------+           +--------------+       |   Server    |
        |                      |               +-------------+
        |      Subscribe       |                      |
        |--------------------->|                      |
        |       Monitor        |                      |
        |<====================>|                      |
        |                      |                      |
        |          Distribute Push Resource           |
        |-------------------------------------------->|
        |                      |                      |
        :                      :                      :
        |                      |     Push Message     |
        |    Push Message      |<---------------------|
        |<---------------------|                      |
        |                      |                      |
```

# Web App Manifest

Web App 也可以启用一些像 Native App 一样的特性：
比如添加图标到主屏幕，以全屏方式打开（不带任何浏览器 UI）。
为此你需要一个 [`manifest`][manifest] 文件关联到当前网页：

```html
<link rel="manifest" href="/manifest.json">
```

这个 Manifest 就是 [Web App Manifest][webapp-manifest] 文件，
用来集中地定义 Web App 的元信息，比如名字、图标、启动 URL 等等。

* Web App Manifest 标准: <https://w3c.github.io/manifest/>
* 标准状态：Working Draft
* 兼容性：Chrome38+, Opera 32+, Chrome for Android 57+, Opera Mobile 37+, Samsung Internet 4+, QQ Browser 1.2+

## 添加到主屏

如果你设置了下面的 Manifest 字段且拥有一个 service worker，
只要用户在5分钟内访问两次 Chrome 便会提示用户添加到主屏。

* `short_name` 显示为桌面图标文字（用户可在添加时定义）；
* `name` 显示在启动界面（Splash Screen）；
* `start_url` 用户刷新从桌面图标打开的页面时载入；
* `icons`：最好包括一个 `144x144` 大小的 PNG 图标；

如果为了测试可以在 `chrome://flags` 中直接关掉 `user engagement detection`，Chrome 的具体策略见
[increasing engagement with app install banners in chrome for android][engagement]一文。

## 启动过程动画

在 Chrome 中，PWA 桌面图标的启动动画是由 `manifest` 中 `name`, `background_color`, `icons` 字段动态生成的。
目前尚不可自定义，可以预见这里还有不少的标准化工作。

> The splash screen is generated dynamically from information held in the Web App Manifest and is a combination of the name and background_color properties, and the icon in the icons array that is closest to "128dp" for the device. -- [Splashscreen, Google Developers][splashscreen]

至此对 PWA 基本特性的介绍就结束了。但 PWA 是一系列的实践和标准本文未能覆盖全部，
还有一些其他特性也很有用，比如利用 [Background Sync][bg-sync] 可以让浏览器在下一次联网时后台发送未完成的请求。
最后 Harttle 给一个简单的 PWA Demo，以供参考和点评：<https://weatherpwa.baidu.com>

# 扩展阅读

* PWA (by Google Developers): <https://developers.google.com/web/progressive-web-apps/>
* PWA (by Alex Russell) <https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/>
* AppCache: <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Using_the_application_cache>
* Push Api: https://www.w3.org/TR/push-api/
* Fetch Api: <https://fetch.spec.whatwg.org/>
* Web Push Protocol: <https://tools.ietf.org/html/draft-ietf-webpush-protocol-12>
* Notification: <https://www.w3.org/TR/notifications/>
* Web App Manifest: <https://w3c.github.io/manifest/>
* Web Worker: <https://html.spec.whatwg.org/multipage/#dom-worker>
* Service Worker: <https://www.w3.org/TR/service-workers/>

[pwa]: https://developers.google.com/web/progressive-web-apps/
[alex-pwa]: https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/
[appcache]: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Using_the_application_cache
[api-cache]: https://developer.mozilla.org/zh-CN/docs/Web/API/Cache
[offline-cookbook]: https://jakearchibald.com/2014/offline-cookbook
[push]: https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
[google-cloud-messaging]: https://developers.google.com/cloud-messaging/
[bg-sync]: https://developers.google.com/web/updates/2015/12/background-sync
[manifest]: https://developer.mozilla.org/en-US/docs/Web/Manifest
[engagement]: https://developers.google.com/web/updates/2015/03/increasing-engagement-with-app-install-banners-in-chrome-for-android
[splashscreen]: https://developers.google.com/web/updates/2015/10/splashscreen
[service-worker]: https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API
[pwa-google]: https://developers.google.com/web/progressive-web-apps/
[fetch-api]: https://fetch.spec.whatwg.org/
[xhr]: https://xhr.spec.whatwg.org/#xmlhttprequest
[fetch-cors]: https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
[swgs]: https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorkerGlobalScope
[status-code]: /2015/08/15/http-status-code.html
[cross-origin]: /2015/10/10/cross-origin.html
[http-cache]: /2017/04/04/using-http-cache.html
[web-push]: https://tools.ietf.org/html/draft-ietf-webpush-protocol-12
[notification]: https://www.w3.org/TR/notifications/
[push-api]: https://www.w3.org/TR/push-api/
[webapp-manifest]: https://w3c.github.io/manifest/
[web-worker]: https://html.spec.whatwg.org/multipage/#dom-worker
[bluetooth]: https://webbluetoothcg.github.io/web-bluetooth/
[pushapi]: https://www.w3.org/TR/push-api/
