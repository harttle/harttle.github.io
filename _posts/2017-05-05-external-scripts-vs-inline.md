---
title: 内联和外链脚本的性能实验
tags: Chrome DNS HTTP JavaScript inline 性能 缓存
---

HTML 中引入 CSS 和 Script 是为了分离内容、样式和脚本。但有时出于性能考虑可能会内联（一部分）脚本和样式。内联可以减少请求，但外链可以更好地利用[HTTP 缓存][http-cache]。
本文通过实验来验证这两种脚本引入方式的渲染性能差别，同时考虑文件数目、网络耗时的影响。

### TL;DR

推荐总是使用外链脚本并尽可能利用 HTTP 缓存。除了整体性能较高外，外链脚本符合关注点分离的原则维护性更好。为减小没有缓存时的请求数量，可按更新频率合并脚本文件。
以下是实验结论：

* 不考虑网络耗时的情况下，内联脚本的 HTML 解析和渲染时间更长，达到可交互状态也需要更长的时间。
* 无缓存的情况下文件数目的增多会急剧增加渲染时间，但只要合适地使用缓存，即使文件数目非常多也不会影响渲染性能。
* 在各种网络情况下即使没有缓存，少量的外链和内联脚本的渲染性能表现非常相近。

<!--more-->

## 定性认识

在开始做实验之前，定性地总结一下内联和外链脚本的区别：

指标      | 内联脚本   | 外链脚本
---       | ---        | ---
请求数量  | 非常少     | 可能很多
执行时机  | 立即执行   | 可通过 [async, defer][async-defer] 配置
HTML 转义 | 需要转义   | 不需转义
缓存      | 无         | 遵循 HTTP 缓存
下载大小  | 较大且冗余 | 较小

> 下文中的实验均在 Chrome 58.0.3029.96 (MacOS 64bit) 下测试，**渲染性能**以 [`DOMContentLoaded`][dom-ready] 事件触发花费的时间来衡量。

## 渲染性能差异

除了脚本外链/内联之外，渲染性能受很多因素的影响，比如：浏览器性能、网络状况、当前 CPU 情况等。为了观察外链/内联的影响，这一实验排除了其他的无关变量：

* 使用同样的浏览器 Chrome 并集中时间段进行试验
* 设置 HTTP 缓存来避免网络耗时

[external.html][external.html] 是一个引入了 3 个外部脚本的 HTML 页面，存在缓存时页面载入过程（`DOMContentLoaded`）只有 `221ms`，首屏（First Paint）为 `223ms` 如下图：

![external scripts performance][external-perf]

如果将这 3 个 HTML 页面内联，使用 [inline.html][inline.html] 进行试验，渲染时间（`DOMContentLoaded`）增加到 `349ms`，首屏（First Paint）为 `232ms`：

![inline scripts performance][inline-perf]

显然内联脚本的 HTML 页面性能差了很多，一个主要原因是内联后 HTML 较大更容易观察到[流式渲染现象][flow-render]，上图中的载入过程发生了多次重绘。
另一个重要原因是浏览器对独立的外链脚本可以做更多的优化，比如文件缓存可以节省下载时间、[代码缓存][code-caching] 可以节省脚本编译时间。

>  When a script is compiled for the first time, cache data is produced and stored. The next time V8 needs to compile the same script, even in a different V8 instance, it can use the cache data to recreate the compilation result instead of compiling from scratch.  -- [code-caching][code-caching], V8 project

此外，外链脚本还可以利用 [async, defer][async-defer] 配置来进一步利用浏览器优化，比如并行的 JavaScript 解析：

>  Starting in version 41, Chrome parses async and deferred scripts on a separate thread as soon as the download has begun. This means that parsing can complete just milliseconds after the download has finished, and results in pages loading as much as 10% faster. It's particularly effective on large scripts and slow network connections. -- [chromium-jstech][chromium-jstech]

总之，**不考虑网络耗时的情况下，内联脚本的 HTML 解析和渲染时间更长，达到可交互状态也需要更长的时间。**

## 文件数量的影响

HTTP/2 有多路复用机制，文件数目不会造成任何影响（不考虑不同域名导致的 DNS 时间）。
但 HTTP/1.1 要求用户代理对单个服务器不得维护 2 个以上的连接，实现上浏览器也普遍存在同时下载脚本数目的限制。见 [HTTP: 8.1.4 Practical Considerations][rfc2616]：

>  Clients that use persistent connections SHOULD limit the number of
   simultaneous connections that they maintain to a given server. A
   single-user client SHOULD NOT maintain more than 2 connections with
   any server or proxy. A proxy SHOULD use up to 2*N connections to
   another server or proxy, where N is the number of simultaneously
   active users. These guidelines are intended to improve HTTP response
   times and avoid congestion.  -- [RFC 2616][http]

在 Regular 3G （100ms, 150km/s）情形下，考察外链 JS 文件数目对渲染性能的影响（`DOMContentLoaded` 时间）。
由下表可见，**无缓存的情况下文件数目的增多会急剧增加渲染时间，但只要合适地使用缓存，即使文件数目非常多也不会影响渲染性能。**

文件数目 | 内联  | 外链无缓存 | 外链缓存
---      | ---   | ---        | ---
1        | 165ms | 259ms      | 187ms
3        | 155ms | 320ms      | 155ms
10       | 183ms | 440ms      | 188ms
20       | 194ms | 611ms      | 193ms

> 这一部分使用的测试文件为
> [external-1.html][external-1.html] - [external-20.html][external-20.html],
> [inline-1.html][inline-1.html] - [inline-20.html][inline-20.html]。

## 网络耗时的影响

为了观察网络耗时对页面性能的影响，我们在禁用 Chrome 缓存的情况下调整网络状态，
仍然使用 [external.html][external.html] 和 [inline.html][inline.html] 进行试验：

网络配置   | 网络参数       | 内联  | 外链
---        | ---            | ---   | ---
Wifi       | 2ms, 30Mb/s    | 317ms | 319ms
Regular 4G | 20ms, 4.0M/s   | 1.6s  | 1.64s
Regular 3G | 100ms, 150kb/s | 8.38s | 8.52s

Chrome 的同时下载限制是 6 个，因此 `external.html` 的 3 个外链脚本没有超过这个限制。
**在各种网络情况下即使没有缓存，少量的外链和内联脚本的渲染性能表现非常相近。**
实践中可以通过合并外链脚本的方式来确保脚本太多不影响渲染性能。

[flow-render]: /2016/11/26/static-dom-render-blocking.html
[harttle]: https://harttle.land
[http-cache]: /2017/04/04/using-http-cache.html
[async-defer]: /2016/03/14/non-blocking-javascript-loading.html
[inline-perf]: /assets/img/blog/html/inline-perf@2x.png
[external-perf]: /assets/img/blog/html/external-perf@2x.png
[dom-ready]: /2016/05/14/binding-document-ready-event.html
[external.html]: https://github.com/harttle/external-vs-inline-scripts/blob/master/external.html
[inline.html]: https://github.com/harttle/external-vs-inline-scripts/blob/master/inline.html
[code-caching]: https://v8project.blogspot.jp/2015/07/code-caching.html
[rfc2616]: https://tools.ietf.org/html/rfc2616#page-46
[http]: /2014/10/01/http.html
[chromium-jstech]: https://blog.chromium.org/2015/03/new-javascript-techniques-for-rapid.html
[external-1.html]: https://github.com/harttle/external-vs-inline-scripts/blob/master/external-1.html
[external-20.html]: https://github.com/harttle/external-vs-inline-scripts/blob/master/external-1.html
[inline-1.html]: https://github.com/harttle/external-vs-inline-scripts/blob/master/inline-1.html
[inline-20.html]: https://github.com/harttle/external-vs-inline-scripts/blob/master/inline-1.html
