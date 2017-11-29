---
title: 合理使用 HTTP 缓存
tags: HTTP 缓存 网络 浏览器
---

HTTP 缓存
[使用 HTTP 缓存：Etag, Last-Modified 与 Cache-Control][cache]
一文对 HTTP 协议的缓存机制进行了简单的讨论，本文集中讨论实际操作中的最佳实践。

# TL;DR

* 谨慎地使用过期时间，最好配合 MD5 一起使用。
* 总是启用条件请求，比如 `Etag` 或 `Last-Modified`。
* 文件服务采用 `Last-Modified`，动态内容采用 `Etag`。
* 分离经常变化的部分，也会提高缓存的命中率。

<!--more-->

# 谨慎使用过期时间

设置过期时间可以使用`Cache-Control`字段也可以使用`Expires`字段，前者设置有效期长度后者设置截止日期。
一旦浏览器获得这样的资源，在一定时期内服务器都无法保证资源的更新。
因此使用不当的过期时间可能导致资源的有效性和一致性问题。

**有效性问题**。考虑一个简单的场景：[Harttle][harttle] 编写了一篇工作周报，设置更新周期为一周并立即发布。
发布后很快 Harttle 便发现里面老板的名字写错了， 更新后又再次发布。
即便如此，在两次发布之间打开过该周报的同学，可能在一周内都会看到错误的版本。

**一致性问题**。页面的脚本文件之间可能存在依赖关系，这时如果使用 `max-age` 策略来缓存这些文件
可能会使整个页面不可访问，因为 `max-age` 无法表达依赖关系。
文件版本错乱的状况远比你想象的常见：浏览器随时可以丢弃任意一个文件的缓存、
相互依赖的文件并非总是一同载入、同一页面的资源到达时间也略有不同。

过期时间对于前端的基础库、博客页面、带MD5的资源等比较有用，尤其是 CDN 上的资源常常都有很长的过期时间。

# 启用条件请求

**条件请求**（[Conditional Requests][cr]）是指结果可能会被校验程序改变的 [HTTP 请求][http]。
其中**校验器**（validator）通常是指缓存相关的校验程序。
条件头字段包括 `If-Match`, `If-None-Match`, `If-Modified-Since`, `If-Unmodified-Since`, `If-Range`。
详情可参考 [使用 HTTP 缓存][cache] 一文，交互过程在 [MDN Conditional Requests][cr] 也有很好的图示。

不论有无 `max-age`，总是应该启用条件请求。因为浏览器在刷新时就会忽略 `max-age`，
另外假设文件已过期，条件请求也可能减少不必要的传输。

对于静态的文件服务采用 `Last-Modified` 比较方便，但对于很多网站页面而言最后修改时间很难确定。
此时 `Etag` 更加方便，只需渲染结束后通过一次哈希来决定是否发送。
比如在 [Express.js][exp] 中 `Etag` 是默认开启的，此外我们也可以做 [进一步的性能优化][exp-perf]。

# 使用 MD5

由于过期时间独自无法解决快速更新的问题，条件请求也无法避免发送一次请求。
MD5 + 永不过期的 CDN 几乎已经成为业界常态：为每一个静态文件的文件名都增加版本号（或 MD5 值），
每次更新文件都同时更新版本号，每个文件都在`Cache-Control`设为永不过期，
同时 HTML 等入口文件的 `Cache-Control` 则设为禁止缓存。

> 标准上讲，使用 URL 的 search 字符串作为文件版本号是完全等价的，这样文件名都无需改变。
> 这一 Trick 在 Github Badges 中很常见。但是在实践中，网络运营商和 CDN 提供商不一定会理会 search 字符串。

增加版本号这一操作（成为 revision）通常在发布过程中进行，与压缩混淆一起。
主流的构建工具均已支持：

* gulp-rev: <https://www.npmjs.com/package/gulp-rev>
* rev-hash: <https://www.npmjs.com/package/rev-hash>
* grunt-rev: <https://github.com/sebdeckers/grunt-rev>
* webpack-md5-hash: <https://www.npmjs.com/package/webpack-md5-hash>

# 分离变化的部分

按照现在的节奏，一个互联网应用几乎每天都会有更新。
那么对于一个使用频次较高的网站，将所有静态文件（比如 JavaScript 脚本）打包在一起会让缓存整体失效。
在这种情况下分离的缓存会更加有效。比如：

* 把经常变化的业务逻辑抽离，单独缓存。
* 基础工具库独立打包并缓存。

[harttle]: http://harttle.land
[cr]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Conditional_requests
[cache]: /2017/04/04/using-http-cache.html
[exp]: http://expressjs.com/zh-cn/api.html
[exp-perf]: /2016/10/07/express-cache.html
[http]: /2014/10/01/http.html
