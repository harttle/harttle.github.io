---
title: 重定向 CORS 跨域请求
tags: Chrome HTTP Safari iOS CORS 跨域 XHR
---

## TL;DR

* 非[简单请求][cors-preflight]不可重定向，包括第一个[preflight][preflight]请求和第二个真正的请求都不行。
* 简单请求可以重定向任意多次，但如需兼容多数浏览器，只可进行一次重定向。
* 中间服务器应当同样配置相关 [CORS][cors] 响应头。

<!--more-->

## 中间服务器设置

当跨域请求被重定向时，中间服务器返回的 CORS 相关的响应头应当与最终服务器保持一致。
任何一级的 CORS 失败都会导致 CORS 失败。这些头字段包括[`Access-Control-Allow-Origin`][acao]，
[`Access-Control-Allow-Credentials`][acac]等。

> 响应 preflight 的头字段包括[`Access-Control-Allow-Headers`][acah]，
> [`Access-Control-Allow-Methods`][acam]等。
> 因为 preflight 不允许重定向（见下文），所以中间服务器也就不必管这些 preflight 头字段。

如果*中间服务器*未设置`Access-Control-Allow-Origin`，在 Chrome 中的错误信息为：

```
XMLHttpRequest cannot load http://mid.com:4001/redirect. 
Redirect from 'http://mid.com:4001/redirect' to 'http://index.com/access-control-allow-origin-wildcard' 
has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource. 
Origin 'http://index.com:4001' is therefore not allowed access.
```

如果*最终服务器*未设置`Access-Control-Allow-Origin`，在 Chrome 中的错误信息为：

```
XMLHttpRequest cannot load http://index.com:4001/access-control-allow-origin-not-set. 
No 'Access-Control-Allow-Origin' header is present on the requested resource. 
Origin 'null' is therefore not allowed access.
```

> Origin 变成 `null` 的解释见下文。

## 重定向preflight 请求

**任何非 2xx 状态码都认为 preflight 失败**，
所以 preflight 不允许重定向。各浏览器表现一致不再赘述，可参考 W3C：

> The following request rules are to be observed while making the preflight request:
>
> * If the end user cancels the request
>  Apply the abort steps.
>
> * If the response has an HTTP status code that is not in the 2xx range
>  Apply the network error steps.
>
> -- W3C CORS Recommandation: [Cross-Origin Request with Preflight][preflight]

## 重定向简单请求

对于简单请求浏览器会跳过 preflight 直接发送真正的请求。
该请求被重定向后浏览器会直接访问被重定向后的地址，也可以跟随多次重定向。
但重定向后请求头字段`origin`会被设为`"null"`（被认为是 privacy-sensitive context）。
这意味着响应头中的`Access-Control-Allow-Origin`需要是`*`或者`null`（该字段不允许多个值）。

即使浏览器给简单请求设置了非[简单头字段][s-header]（如[`DNT`][dnt]）时，也应当继续跟随重定向且不校验响应头的`DNT`
（因为它属于`User Agent Header`，浏览器应当对此知情）。
参考 [W3C 对简单请求的处理要求][w3c-simple]：

> If the manual redirect flag is unset and the response has an HTTP status code of 301, 302, 303, 307, or 308
> Apply the redirect steps. -- W3C CORS Recommendation

OSX 下 Chrome 的行为是标准的，即使设置了[`DNT`][dnt]也会直接跟随重定向。

### Safari 的怪异行为

Safari 在设置`DNT`字段后，会向重定向后的地址首先发起 preflight（可能是它忘记了该头部是自己设置的？）。
这一行为在桌面 Safari 的隐身模式，以及 iOS 很多浏览器中都可以观察到。
Safari 远程调试 iPhone，遇此行为调试器会崩掉（笔者试了3个 Mac+iPhone Pair）。
建议使用[tcpdump][tcpdump]或者写[一个简单的 CORS 服务器][cors-demo]来调试。
在 OPTIONS 请求中，会带有[`Access-Control-Request-Headers`][acrh]来声明需要发送`dnt`。

```
Access-Control-Request-Headers: 'dnt, accept-language, origin'
```

这意味着为了 Safari 系列的浏览器（包括 iOS 平台的多数浏览器），
重定向简单 CORS 请求仍然需要实现 OPTIONS 方法（虽然我们发的只是是简单请求）。
并且在`Access-Control-Allow-Headers`响应头字段添加`dnt`声明。
否则 Safari 会认为 CORS 失败：

```
XMLHttpRequest cannot load http://index.com:4001/access-control-allow-origin-wildcard.
Request header field DNT is not allowed by Access-Control-Allow-Headers.
```

> 为了轻松地让 CORS preflight 成功，测试环境中可以简单地将请求头`Access-Control-Request-Headers`的内容直接设置到响应头的`Access-Control-Allow-Headers`。

## 重定向非简单请求

非简单请求是 [preflight][preflight] 成功后才发送实际的请求。
preflight 后的实际请求不允许重定向，否则会导致 CORS 跨域失败。

虽然在 Chrome 开发版中会对重定向后的地址再次发起 preflight，但该行为并不标准。
[W3C Recommendation][preflight]中提到真正的请求返回`301`, `302`, `303`, `307`, `308`都会判定为错误:

> This is the actual request. Apply the make a request steps and observe the request rules below while making the request.
> If the response has an HTTP status code of 301, 302, 303, 307, or 308
Apply the cache and network error steps. -- W3C CORS Recommendation

在 Chrome 中错误信息是`Request requires preflight, which is disallowed to follow cross-origin redirect`：

```
XMLHttpRequest cannot load http://mid.com:4001/cross-origin-redirect-with-preflight.
Redirect from 'http://mid.com:4001/cross-origin-redirect-with-preflight' to 'http://dest.com:4001/access-control-allow-origin-wildcard'
has been blocked by CORS policy: Request requires preflight,
which is disallowed to follow cross-origin redirect.
```

在 Safari 中的错误信息是`Cross-origin redirection denied by Cross-Origin Resource Sharing policy.`：

```
XMLHttpRequest cannot load http://mid.com:4001/redirect.
Cross-origin redirection denied by Cross-Origin Resource Sharing policy.
```

## 多次重定向的讨论

多次重定向涉及的一个关键问题是：**preflight 后的请求不允许重定向**。因此：

* *对于简单请求并且没有任何 preflight 的情况*：浏览器会一直跟随重定向（当然 HTTP 另有规定的除外，如 POST 被 302 时），直到最后一个请求返回或者中间请求的 CORS 验证失败（比如[`Access-Control-Allow-Origin`][acao]设置错误）。
* *对于简单请求但是浏览器会发起 preflight 的情况*（比如 Safari 对 `DNT` 的处理）：因 preflight 后重定向真正的请求会导致 CORS 失败，所以多次重定向是不可行的。
* *对于非简单请求*：浏览器会直接发起 preflight，后续的重定向都是不允许的因此多次重定向不可行。

总之，**如果需要兼容大多数浏览器，不论是否为简单请求都不可以多次重定向**。

[preflight]: https://www.w3.org/TR/cors/#cross-origin-request-with-preflight-0
[s-header]: https://www.w3.org/TR/cors/#simple-header
[w3c-simple]: https://www.w3.org/TR/cors/#simple-cross-origin-request-0
[tcpdump]: http://www.tcpdump.org/
[cors-demo]: https://github.com/harttle/cors-demo 
[acao]: https://www.w3.org/TR/cors/#access-control-allow-origin-response-header
[acac]: /2016/12/28/cors-with-cookie.html
[acah]: https://www.w3.org/TR/cors/#http-access-control-allow-headers
[acam]: https://www.w3.org/TR/cors/#http-access-control-allow-methods
[cors-preflight]: /2016/12/30/cors-preflight.html
[dnt]: https://en.wikipedia.org/wiki/Do_Not_Track
[cors]: /2015/10/10/cross-origin.html
[acrh]: https://www.w3.org/TR/cors/#access-control-request-headers-request-header
