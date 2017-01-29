---
title: PWA 初探
tags: Android Chrome PWA 缓存
---

[PWA][pwa](Progressive Web Apps)是 Google 最近在提的一种 Web App 形态
（或者如 Wikipedia 所称的“软件开发方法”）。
Harttle 能找到的关于 PWA 最早的一篇文章是 2015年6月 Alex Russell 的一篇博客：
[Progressive apps escaping tabs without losing our soul][alax-pwa]，
**让 Web App 从标签页跳出来，同时保持 Web 的灵魂。**
如 Alex 所述，PWA 意图让 Web 在保留其本质（开放平台、易于访问、可索引）的同时，
在离线、交互、通知等方面达到类似 App 的用户体验。

> Progressive Web Apps use modern web capabilities to deliver an app-like user experience. They evolve from pages in browser tabs to immersive, top-level apps, maintaining the web's low friction at every moment. -- Google PWA Tutorials

<!--more-->

# What is a Progressive Web App?

PWA 就是提供类似 App 体验的网站，其具体技术包括[Service worker][service-worker]、[manifest][manifest]、
[Cache API][api-cache] 等等。
目前这些技术标准多数处于草案阶段，兼容性的浏览器只有 Chrome 40, Firefox 40 和 Opera，
对于推送通知、indexedDB 等技术则需要更高版本的浏览器。

在国内的移动互联网中 Safari、UC、QQ 等浏览器占有主要份额，
因此目前基本处于生产环境不可用的试水阶段。然而在流量昂贵、Chrome 盛行的印度，
只需少量流量便可安装、离线可用的 PWA 已经在不少公司开始研发
（PropTiger、MagicBricks、Housing 等）。

相比于开发一个 App 注册一个 ServiceWorker 非常简单，
只需要在你的页面脚本中这样引入你的 service worker 文件：

```javascript
navigator.serviceWorker.register('./sw.js')
```

> 由于 Service Worker 可以任意操作缓存和截获请求，Web 标准要求 service worker 文件本身以 HTTPS 方式载入以确保安全（其实 localhost 等安全域名也是可以的）。

# Offline

既 HTML5 [AppCache][appcache]（Application Cache） 的失败之后，Service Worker 标准中提供了更加灵活的
[Cache API][api-cache]，加上新的 Response/Request API 可以完全控制客户端缓存。
这无疑提供了完整的离线 API。

Cache API 提供了 CacheStorage 接口来操作缓存（在 Service Worker Scope 中为`caches`对象）。
可以配合 Service Worker 生命周期完成离线优先的缓存机制：

* 在`install`时使用 `.keys()` 获取所有缓存键并使用 `.delete()` 来清理过期的缓存。
* 在`active`时使用 `.add()` 和 `.addAll()` 来立即添加当前页面资源进缓存，
* 在`fetch`时使用 `caches.put()` 来更新缓存。

> 为了避免体验不一致，Service Worker 在 `install` 后不会立即`active`，
> 除非用户关闭了所有标签页，在调试时可以在`install`事件中调用`self.skipWaiting()`来强制`active`。

缓存 Response 时需要注意一个 Response 流只能被读一次，因此需要返回一份，同时 clone 一份放入缓存。

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

上述代码来自 Jake 的 [The Offline Cookbook][offline-cookbook]。
另外通过[Background Sync][bg-sync]可以让浏览器在下一次联网时发送消息而不需页面在运行。
典型的场景是：1. 断网了，2. 发送一条消息，3. 把手机装进口袋，4. 进入有网络的环境，5. 打开手机，消息早已发出去了！

# Push Notifycation

[推送通知][push]（Push Notifycation）是 Engagement 特性的技术支撑，这可能商业网站最关心的一点。
需要 Chrome 50（Android Chrome 55）。离线推送时 Service Worker 并不在运行，
需要 User Agent 接收信息并唤醒对应的 Service Worker，因此该特性依赖于浏览器厂商。
例如现在需要建立一个[Google Cloud Messaging][google-cloud-messaging]项目来向 Chrome 推送通知。

Web 最伟大的地方在于开放（因此这条路远比开发一个漂亮的 App 要漫长），
Web Push 也正在由 IETF 标准化：

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

# 添加到主屏幕

像 App 一样添加到主屏，并全屏打开（不带任何浏览器 UI）对用户来讲可能是 PWA 最像 App 的地方。
为此你需要一个 [`manifest`][manifest] 文件关联到当前网页：

```html
<link rel="manifest" href="/manifest.json">
```

在 `manifest.json` 中可以设置这些类似 App 的特性。比如：

* `short_name` 显示为桌面图标文字（用户可在添加时定义）；
* `name` 显示在启动界面（Splash Screen）；
* `start_url` 用户刷新从桌面图标打开的页面时载入；
* `icons`：最好包括一个 `144x144` 大小的 PNG 图标；

如果你设置了上述 Manifest 字段且拥有一个 service worker，
只要用户在5分钟内访问两次 Chrome 便会提示用户添加到主屏。
Chrome 的具体策略见
[increasing engagement with app install banners in chrome for android][engagement]一文。

# 启动过程动画

在 Chrome 中，PWA 桌面图标的启动动画是由 `manifest` 中 `name`, `background_color`, `icons` 字段动态生成的。
目前尚不可自定义，可以预见这里还有不少的标准化工作。

> The splash screen is generated dynamically from information held in the Web App Manifest and is a combination of the name and background_color properties, and the icon in the icons array that is closest to "128dp" for the device. -- [Splashscreen, Google Developers][splashscreen]

最后给一个小编的成果，以供参考和点评：<https://weatherpwa.baidu.com>

[pwa]: https://developers.google.com/web/progressive-web-apps/
[alax-pwa]: https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/
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
