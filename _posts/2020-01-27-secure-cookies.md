---
title: Chrome 80 跨域 Cookie 变化的影响和应对方案
tags: Chrome Cookie SameSite Secure 跨域
---

根据 [时间线][chrome-release] Chrome 80 稳定版本将在 2020-02-04 发布。
它的 [变更列表][chrome-80] 中有两项 [Cookie 安全][cookie] 相关的变更，
对非安全连接下的 Cookie 设置和 Cookie 跨域发送做了更多限制。
这意味着通过 Cookie 跨域跟踪用户的相关功能可能会受到影响（比如日志、统计），
且只能在 HTTPS 上修复（意味着可以避免针对非安全连接的 MitM 攻击）。
具体地，有这两个 feature：

* [Reject insecure SameSite=None cookies](https://www.chromestatus.com/feature/5633521622188032)
* [Cookies default to SameSite=Lax](https://www.chromestatus.com/feature/5088147346030592)

对应的标准草案可以在 IETF 网站找到：[Incrementally Better Cookies](https://tools.ietf.org/html/draft-west-cookie-incrementalism-00)。
下文关注这两个变更对业务带来的影响，以及可能的应对方案。

<!--more-->

## Cookie 的构成

上面提到的 SameSite 和 Secure 都是 Cookie 属性（Attribute），
因此我们先回顾下 Cookie 和它的字段的设置方法以及有哪些字段可以设置。

简单来说服务器端可以通过 Set-Cookie [响应头][http] 来设置 Cookie 值和属性，
浏览器端脚本则通过 `document.cookie` API 来读写。
这个 API 由 2000 年的 [DOM Level2][dom2] 标准化，用起来非常奇怪以及原始，
以至于通常需要一个 JavaScript 包装才勉强能用，比如 [MDN 文档][cookie] 中给出的 `docCookies()` 实现。
原始的 Cookie API 就是 `document.cookie`：

* 通过对 `document.cookie` 赋值来设置一个 cookie 项，以及这项 cookie 的各种属性（比如 domain、path、expires 等）。
* 通过读取 `document.cookie` 的值来得到现有的所有 cookie。

例如：

```javascript
document.cookie = "author=harttle; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=.foo.com";
document.cookie = "site=harttle.land; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=.foo.com";
console.log(document.cookie) // outputs "author=harttle; site=harttle.land"
```

注意每次赋值只能包含一个 cookie 键值对，后续是这个 cookie 的属性。
读取时总是拿到当前有效的 cookie 键值对列表，不会返回 cookie 的属性。
可以在 Chrome 开发者工具的 Application 中看到所有 cookie 以及它们的所有属性：

![cookie list for foo.com][cookie-list]

## Secure 和 SameSite

这两个 Cookie 属性是本文的主角。其中，

* **Secure** 表示这个 Cookie 只会发送给 HTTPS 的主机，默认没有设置（也就是 insecure）。也就是说如果我的站点同时有 HTTPS 和 HTTP 服务，其中 HTTP 的服务上无法读写 Secure Cookie（避免中间人利用非安全连接伪造 Session）。
* **SameSite** 针对的是跨站域名伪造攻击（见 [MDN:CSRF][csrf]），用来限制跨站携带 Cookie。也就是说我从 harttle.com 加载 analytics.com/v.gif 时，只有 SameSite=None 时后者才能收到 Cookie。

Secure 是布尔类型，设置了就是 secure 未设置就是 insecure；SameSite 比较讲究，有三种取值：

* **None**：所有同域请求和跨栈请求浏览器都会发送 Cookie，这是 Chrome 80 之前的默认值。注意这里的跨栈请求是指 subrequest 比如加载一个图片资源。fetch 和 XHR 携带 Cookie 遵循 CORS 标准，可以参考 [CORS 跨域发送 Cookie](https://harttle.land/2016/12/28/cors-with-cookie.html) 一文。
* **Strict**：只有同域请求（从设置 Cookie 的域发起的请求）浏览器才发送 Cookie。包括 subrequest，也包括顶级跳转（top-level navigations），也就是说只有从自己的网站发起的跳转请求或资源请求才发送 Cookie。
* **Lax**：只有顶级跳转才跨域发送 Cookie，subrequest 不发送，这是 Chrome 80 之后的默认值。也就是说页面里的跨域图片不会发送 Cookie，但用户点击超链接跳转到其他域仍然会发送。

更多 Cookie 属性的详情可以参考： <https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02>

## Chrome 80 的变化

Chrome 80 对这些属性带来两个变更：

* 一是默认值 `SameSite=None` 变为 `SameSite=Lax`
* 二是会拒绝 insecure 的 `SameSite=None` Cookie

请求类型 | top-level navigation | subrequests | 站内
--- | --- | --- | ---
旧浏览器+默认设置 | ✔ | ✔ | ✔
Chrome >= 80 + SameSite=Lax（默认） | ✔ | ✖ | ✔
Chrome >= 80 + SameSite=Strict | ✖ | ✖ | ✔
Chrome >= 80 + SameSite=None | ✔ | ✔ | ✔

看起来设置 `SameSite=None` 就可以保持兼容，但 `SameSite=None` 要求同时设置 `Secure`。
再考虑到新属性可能会被旧浏览器拒绝或错误解释，完美的兼容方案还比较复杂，见下一节。

## 可能的应对方案

如果你确实不再想收到跨域发送来的 Cookie 了，可以什么都不做，新的浏览器会帮你拦掉它们。
如果你希望 Chrome 80 升级后以前能收到的 Cookie 现在仍然可以收到，需要做两件事情：

1. 站点迁移到 HTTPS，否则（从 Chrome 52 和 Firefox 52 起）无法设置 Secure 字段，而 Secure 是 `SameSite=None` 的前置条件。
2. 需要跟踪的 Cookie 上同时添加 `Secure` 和 `SameSite=None` 字段。

以上可以在较新的 Chrome 上很好地工作了。
但是 SameSite 在旧的 Chrome 上可能被拒绝，在 OSX 和 iOS 上 None 可能会被错误地处理为 Strict，
详情请参考 [incompatible-clients](https://www.chromium.org/updates/same-site/incompatible-clients)。
这里有一个简单的兼容方案：

1. 旧的 Cookie 和它们的属性完全不变。
2. 设置这些 Cookie 的地方同时再设置一个名字对应的 Cookie 项，设置 `Secure` 和 `SameSite=None`。
3. 使用这些 Cookie 的地方取第二个，fallback 到第一个。

[http]: https://harttle.land/2014/10/01/http.html
[dom2]: https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-8747038
[cookie]: https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
[cookie-list]: /assets/img/blog/http/cookie-list@2x.png
[chrome-release]: https://www.chromestatus.com/features/schedule
[chrome-80]: https://www.chromestatus.com/features#milestone%3D80
[csrf]: https://developer.mozilla.org/en-US/docs/Glossary/CSRF
[cookie]: https://harttle.land/2015/08/10/cookie-session.html