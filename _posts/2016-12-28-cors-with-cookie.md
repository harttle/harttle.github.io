---
title: CORS 跨域发送 Cookie
tags: AJAX Cookie XHR CORS 跨域
---

在 Web 页面中可以随意地载入跨域的图片、视频、样式等资源，
但 AJAX 请求通常会被浏览器应用同源安全策略，禁止获取跨域数据，以及限制发送跨域请求。
虽然 [有多种方法利用资源标签进行跨域][cross-origin]，但能够进行的数据交互非常有限。
在 2014 年 W3C 发布了 [CORS Recommendation][cors-w3c] 来允许更方便的跨域资源共享。
默认情况下浏览器对跨域请求不会携带 [Cookie][cookie]，但鉴于 Cookie 在身份验证等方面的重要性，
CORS 推荐使用额外的响应头字段来允许跨域发送 Cookie。

<!--more-->

## 客户端代码

在 `open` [XMLHttpRequest][xhr] 后，设置 `withCredentials` 为 `true` 即可让该跨域请求携带 Cookie。
注意携带的是目标页面所在域的 Cookie。

```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.withCredentials = true;
xhr.send();
```

如果你在使用 [jQuery][jq]，可以通过 [`xhrFields`][jquery-ajax] 来设置：

```javascript
$.ajax({
   url: a_cross_domain_url,
   xhrFields: {
      withCredentials: true
   }
});
```

如果你在使用 [Zepto][zepto]，抱歉没有办法。因为 Zepto 会在 `open` 之前设置 `withCredentials`。
根据 [WHATWG 的 XHR 标准][whatwg-xhr] 在 `open` 之后设置是不合法的，
虽然多数浏览器不抛出错误但仍然不会携带 Cookie。

> True when user credentials are to be included in a cross-origin request. False when they are to be excluded in a cross-origin request and when cookies are to be ignored in its response. Initially false.
> When set: throws an InvalidStateError exception if state is not unsent or opened, or if the send() flag is set. -- WHATWG XMLHttpRequest

## Access-Control-Allow-Credentials

只设置客户端当然是没用的，还需要目标服务器接受你跨域发送的 Cookie。
否则会被浏览器的同源策略挡住：

![AC-not-set][AC-not-set]

服务器同时设置 [`Access-Control-Allow-Credentials`][acac] 响应头为 `"true"`，
即可允许跨域请求携带 Cookie。

## Access-Control-Allow-Origin

除了 `Access-Control-Allow-Credentials` 之外，跨域发送 Cookie 还要求
`Access-Control-Allow-Origin` [不允许使用通配符][cors-mdn]。
事实上不仅不允许通配符，而且 [只能指定单一域名][w3c-res-check]：

> If the credentials flag is true and the response includes zero or more than one Access-Control-Allow-Credentials header values return fail and terminate this algorithm. --W3C Cross-Origin Resource Sharing

否则，浏览器还是会挡住跨域请求：

![wildcard-Access-Control-Allow-Credentials][wildcard-AC]

## 计算 Access-Control-Allow-Origin

既然 `Access-Control-Allow-Origin` 只允许单一域名，
服务器可能需要维护一个接受 Cookie 的 Origin 列表，
验证 `Origin` 请求头字段后直接将其设置为 `Access-Control-Allow-Origin` 的值。
（这一实践来自 [Stackoverflow](http://stackoverflow.com/questions/1653308/access-control-allow-origin-multiple-origin-domains)）
值得注意的是在 CORS 请求被重定向后 `Origin` 头字段会被置为 `null`。
此时可以选择从 `Referer` 头字段计算得到 `Origin`。

在正确配置的情况下，在 Chrome Network 就可以看到 Cookie 请求头被跨域发送了
（注意 `Host` 和 `Referer` 不同域，但仍然带了 `Cookie`）：

```
Accept:*/*
Accept-Encoding:gzip, deflate, sdch, br
Accept-Language:zh-CN,zh;q=0.8,en;q=0.6,nl;q=0.4,zh-TW;q=0.2,fr;q=0.2,de;q=0.2,ja;q=0.2
Connection:keep-alive
Cookie:auhtor:harttle; _gat=1; _ga=GA1.1.221305049.1482947002
Host:dest.com:4001
Origin:http://index.com:4001
Referer:http://index.com:4001/
User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36
```

## 服务器端代码

```javascript
const express = require('express');

var app = express();
app.get('/specific-allow-origin-with-credentials', (req, res) => {
    res.set({
        'Access-Control-Allow-Origin': 'http://index.com: 4001',
        'Access-Control-Allow-Credentials': true
    });
    res.status(200).end('I got your cookie: ' + req.headers.cookie);
});
app.listen(4001, () => console.log('listening to 4001'));
```

完整的 Demo 可以从 [harttle/cors-demo](https://github.com/harttle/cors-demo) 获取。

[acac]: https://www.w3.org/TR/cors/#access-control-allow-credentials-response-header
[cors-w3c]: https://www.w3.org/TR/cors/
[cors-wiki]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[cross-origin]: /2015/10/10/cross-origin.html
[xhr]: https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
[jquery-ajax]: http://api.jquery.com/jquery.ajax/
[whatwg-xhr]: https://xhr.spec.whatwg.org/#the-withcredentials-attribute
[AC-not-set]: /assets/img/blog/cors/allow-credentials-not-set@2x.png
[wildcard-AC]: /assets/img/blog/cors/wildcard-origin-with-credentials@2x.png
[cors-mdn]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
[w3c-res-check]: https://www.w3.org/TR/2010/WD-cors-20100727/#resource-sharing-check0
[cookie]: http://tools.ietf.org/html/rfc6265
[jq]: http://api.jquery.com
[zepto]: http://zeptojs.com/
