---
title: CORS 跨域中的 preflight 请求
tags: 跨域 CORS AJAX HTTP XHR
---

我们知道借助[`Access-Control-Allow-Origin`][acao]响应头字段可以允许跨域 AJAX，
对于非**简单请求**，[CORS][cors] 机制跨域会首先进行 preflight（一个 OPTIONS 请求），
该请求成功后才会发送真正的请求。
这一设计旨在确保服务器对 CORS 标准知情，以保护不支持 CORS 的旧服务器。

![Flowchart_showing_Simple_and_Preflight_XHR][Flowchart_showing_Simple_and_Preflight_XHR]

> Wikipedia: https://upload.wikimedia.org/wikipedia/commons/c/ca/Flowchart_showing_Simple_and_Preflight_XHR.svg

<!--more-->

# 简单请求

**简单请求**具体是指请求方法是[简单方法][s-method]且请求头是[简单头][s-header]的 HTTP 请求。具体地，

* *简单方法*包括`GET`, `HEAD`, `POST`。
* *简单头*包括：`Accept`, `Accept-Language`, `Content-Language`，以及值为`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain` 其中之一的 `Content-Type` 头。

对于非简单请求浏览器会首先发送 OPTIONS 请求（成为 preflight），
例如添加一个自定义头部`x-foo`的 HTTP 请求：

```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.setRequestHeader('x-foo', 'bar');
xhr.send();
```

服务器需要成功响应（2xx）并在`Access-Control-Alow-Headers`中包含`x-foo`
（因为它不是[简单头部][s-header]）：

```
OPTIONS /origin-redirect-with-preflight 200
Access-Control-Allow-Headers:x-foo
Access-Control-Allow-Origin:http://index.com:4001
Connection:keep-alive
Content-Length:0
```

# Access-Control-Request-Headers

[Access-Control-Request-Headers][acrh] 是 preflight 请求中用来标识真正请求将会包含哪些头部字段，
preflight 请求本身不会发送这些头字段。
例如上述请求中`Access-Control-Request-Headers`字段的值应该是`x-foo`。
服务器应当在对应的`Access-Control-Allow-Headers`响应头中包含这些字段。
否则即使返回 200 preflight 也会失败：

```
XMLHttpRequest cannot load http://mid.com:4001/access-control-allow-origin-wildcard.
Request header field x-foo is not allowed by Access-Control-Allow-Headers in preflight response.
```

# 关于 DNT 请求头

有些浏览器（如 Safari 隐身模式）会在请求中添加[`DNT`][dnt]头，
但浏览器不会（也不应）因此而发起 preflight。
因为这一请求头是浏览器添加的，也应当对此知情。
所以响应头中也不需要包含`Access-Control-Allow-Headers`，
参照 [W3C Recommendation][w3c-preflight]，满足以下条件即可跳过 preflight：

> For request method there either is a method cache match or it is a simple method and the force preflight flag is unset.
> For every header of author request headers there either is a header cache match for the field name or it is a simple header.

只要所有 "Author Header" 都是简单头即可跳过 preflight，
这里虽然 "DNT" 头不属于简单头，但它也不属于 "Author Header"，它是 "User-Agent Header"。
因此它不会导致触发 preflight。但是这一简单请求如果被重定向情况会变得相当复杂，
请参考 [重定向 CORS 跨域请求][redirect-cors]一文中的讨论。

[acao]: https://www.w3.org/TR/cors/#access-control-allow-origin-response-header
[acrh]: https://www.w3.org/TR/cors/#access-control-request-headers-request-header
[pref]: https://www.w3.org/TR/cors/#preflight-request
[s-method]: https://www.w3.org/TR/cors/#simple-method
[s-header]: https://www.w3.org/TR/cors/#simple-header
[Flowchart_showing_Simple_and_Preflight_XHR]: https://upload.wikimedia.org/wikipedia/commons/c/ca/Flowchart_showing_Simple_and_Preflight_XHR.svg
[dnt]: https://en.wikipedia.org/wiki/Do_Not_Track
[w3c-preflight]: https://www.w3.org/TR/cors/#cross-origin-request-with-preflight-0
[redirect-cors]: /2016/12/30/cors-redirect.html
[cors]: /2015/10/10/cross-origin.html
