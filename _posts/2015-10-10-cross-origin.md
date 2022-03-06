---
title: Web 开发中跨域的几种解决方案
tags: DOM HTML HTTP JavaScript jQuery iframe JSON 跨域 CORS
excerpt: 这些办法大致可以分为两类： 一类是 Hack，比如通过 `title`, `navigation` 等对象传递信息，JSONP 可以说是一个最优秀的 Hack。 另一类是 HTML5 支持，一个是 `Access-Control-Allow-Origin` 响应头，一个是 `window.postMessage`。 跨域的正道还是 HTML5 提供的 CORS 头字段以及 `window.postMessage`， 可以支持 POST, PUT 等 HTTP 方法，从机制上解决跨域问题。
---

出于安全考虑，HTML 的同源策略不允许 JavaScript 进行跨域操作，
直接发送跨域 AJAX 会得到如下错误：

![cors-err][cors-err]

随着 Web App 的功能越来越强
各种跨域的需求催生了无数的跨域手法。甚至在 HTML5 标准中都给出了官方的跨域方法，
也是最近应付面试的需要，拿一篇文章来总结既有的各种跨域手段。

这些跨域通信的方法大致可以分为两类：

* 一类是 Hack，比如通过 `title`, `navigation` 等对象传递信息，JSONP 可以说是一个最优秀的 Hack。
* 另一类是 HTML5 支持，一个是 `Access-Control-Allow-Origin` 响应头，一个是 `window.postMessage`。

<!--more-->

## 设置 document.domain

* 原理：相同主域名不同子域名下的页面，可以设置 `document.domain` 让它们同域
* 限制：同域 document 提供的是页面间的互操作，需要载入 iframe 页面

下面几个域名下的页面都是可以通过 `document.domain` 跨域互操作的：
`http://a.com/foo`, `http://b.a.com/bar`, `http://c.a.com/bar`。
但只能以页面嵌套的方式来进行页面互操作，比如常见的 `iframe` 方式就可以完成页面嵌套：

```javascript
// URL http://a.com/foo
var ifr = document.createElement('iframe');
ifr.src = 'http://b.a.com/bar'; 
ifr.onload = function(){
    var ifrdoc = ifr.contentDocument || ifr.contentWindow.document;
    ifrdoc.getElementsById("foo").innerHTML);
};

ifr.style.display = 'none';
document.body.appendChild(ifr);
```

上述代码所在的 URL 是 `http://a.com/foo`，它对 `http://b.a.com/bar` 的 DOM 访问要求后者将
`document.domain` 往上设置一级：

```javascript
// URL http://b.a.com/bar
document.domain = 'a.com'
```

**`document.domain` 只能从子域设置到主域，往下设置以及往其他域名设置都是不允许的**，
在 Chrome 中给出的错误是这样的：

```
Uncaught DOMException: Failed to set the 'domain' property on 'Document': 'baidu.com' is not a suffix of 'b.a.com'
```

## 有 src 的标签

* 原理：所有具有 `src` 属性的 HTML 标签都是可以跨域的，包括 `<img>`, `<script>`
* 限制：需要创建一个 DOM 对象，只能用于 GET 方法

在 `document.body` 中 `append` 一个具有 `src` 属性的 HTML 标签，
`src` 属性值指向的 URL 会以 GET 方法被访问，该访问是可以跨域的。

> 其实样式表的 `<link>` 标签也是可以跨域的，只要是有 `src` 或 `href` 的 HTML 标签都有跨域的能力。

不同的 HTML 标签发送 HTTP 请求的时机不同，例如 `<img>` 在更改 `src` 属性时就会发送请求，而 `script`, `iframe`, `link[rel=stylesheet]` 只有在添加到 DOM 树之后才会发送 HTTP 请求：

```javascript
var img = new Image();
img.src = 'http://some/picture';        // 发送 HTTP 请求

var ifr = $('<iframe>', {src: 'http://b.a.com/bar'});
$('body').append(ifr);                  // 发送 HTTP 请求
```

## JSONP

* 原理：`<script>` 是可以跨域的，而且在跨域脚本中可以直接回调当前脚本的函数。
* 限制：需要创建一个 DOM 对象并且添加到 DOM 树，只能用于 GET 方法

JSONP 利用的是 `<script>` 可以跨域的特性，跨域 URL 返回的脚本不仅包含数据，还包含一个回调：

```javascript
// URL: http://b.a.com/foo
var data = {
    foo: 'bar',
    bar: 'foo'
};
callback(data);
```

> 该例子只用于示例，实际情况应当考虑名称隐藏等问题。

然后在我们在主站 `http://a.com` 中，可以这样来跨域获取 `http://b.a.com` 的数据：

```javascript
// URL: http://a.com/foo
var callback = function(data){
    // 处理跨域请求得到的数据
};
var script = $('<script>', {src: 'http://b.a.com/bar'});
$('body').append(script);
```

其实 jQuery 已经封装了 JSONP 的使用，我们可以这样来：

```javascript
$.getJSON( "http://b.a.com/bar?callback = callback ", function( data ){
    // 处理跨域请求得到的数据
});
```

`$.getJSON` 与 `$.get` 的区别是前者会把 `responseText` 转换为 JSON，而且当 URL 具有 `callback` 参数时，
jQuery 将会把它解释为一个 JSONP 请求，创建一个 `<script>` 标签来完成该请求。

> [jQuery.getJSON][jquery-json]: If the URL includes the string "callback =?" (or similar, as defined by the server-side API), the request is treated as JSONP instead. See the discussion of the jsonp data type in $.ajax() for more details.)

和所有依赖于创建 HTML 标签的方式一样，JSONP 也不支持 POST，而 GET 的数据是放在 URL 里的。
虽然 [RFC 2616][rfc2610] 没有提到限制到多少，
但提到了服务器可以对自己认为比较长的 URL 返回 414 状态码。一般来讲 URL 限长是在 2000 字符左右。

> 在 [如何理解 HTTP 响应的状态码？][statuscode] 一文中有更多关于 HTTP 响应状态码的讨论。

## navigation 对象

* 原理：iframe 之间是共享 `navigator` 对象的，用它来传递信息
* 要求：IE6/7

有些人注意到了 IE6/7 的一个漏洞：`iframe` 之间的 `window.navigator` 对象是共享的。
我们可以把它作为一个 Messenger，通过它来传递信息。比如一个简单的委托：

```javascript
// a.com
navigation.onData(){
    // 数据到达的处理函数
}
typeof navigation.getData === 'function' 
    || navigation.getData()
```

```javascript
// b.com
navigation.getData = function(){
    $.get('/path/under/b.com')
        .success(function(data){
            typeof navigation.onData === 'function'
                || navigation.onData(data)
        });
}
```

与 `document.navigator` 类似，`window.name` 也是当前窗口所有页面所共享的。也可以用它来传递信息。
同样蛋疼的办法还有传递 Hash（有些人叫锚点），这是因为每次浏览器打开一个 URL 时，URL 后面的 `#xxx` 部分会保留下来，那么新的页面可以从这里获得上一个页面的数据。

## 跨域资源共享（CORS）

* 原理：服务器设置 `Access-Control-Allow-Origin` HTTP 响应头之后，浏览器将会允许跨域请求
* 限制：浏览器需要支持 HTML5，**可以支持 POST，PUT 等方法**

前面提到的跨域手段都是某种意义上的 Hack，
HTML5 标准中提出的跨域资源共享（Cross Origin Resource Share，CORS）才是正道。
它支持其他的 HTTP 方法如 PUT, POST 等，可以从本质上解决跨域问题。

例如，从 `http://a.com` 要访问 `http://b.com` 的数据，通常情况下 Chrome 会因跨域请求而报错：

```
XMLHttpRequest cannot load http://b.com. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://a.com' is therefore not allowed access.
```

错误原因是被请求资源没有设置 `Access-Control-Allow-Origin`，所以我们在 `b.com` 的服务器中设置这个响应头字段即可：

```
Access-Control-Allow-Origin: *              # 允许所有域名访问，或者
Access-Control-Allow-Origin: http://a.com   # 只允许所有域名访问
```

为 `xhr` 设置 `withCredentials` 后 CORS 方法跨域还可 [携带 Cookie][cors-cookie]，但 PUT/POST 请求需要注意 [处理 preflight 请求][cors-preflight]。

## window.postMessage

* 原理：HTML5 允许窗口之间发送消息
* 限制：浏览器需要支持 HTML5，获取窗口句柄后才能相互通信

这是一个安全的跨域通信方法，`postMessage(message,targetOrigin)` 也是 HTML5 引入的特性。
可以给任何一个 window 发送消息，不论是否同源。第二个参数可以是 `*` 但如果你设置了一个 URL 但不相符，那么该事件不会被分发。看一个普通的使用方式吧：

```javascript
// URL: http://a.com/foo
var win = window.open('http://b.com/bar');
win.postMessage('Hello, bar!', 'http://b.com'); 
```

```javascript
// URL: http://b.com/bar
window.addEventListener('message',function(event) {
    console.log(event.data);
});
```

> 注意 IE8 及小于 IE8 的版本不支持 `addEventListener`，需要使用 `attachEvent` 来监听事件。
> 参见：[事件处理中的 this：attachEvent, addEventListener, onclick][event-this]


## 访问控制安全的讨论

在 HTML5 之前，JSONP 已经成为跨域的事实标准了，jQuery 都给出了支持。
值得注意的是它只是 Hack，并没有产生额外的安全问题。
因为 JSONP 要成功获取数据，需要跨域资源所在服务器的配合，比如资源所在服务器需要自愿地回调一个合适的函数，所以服务器仍然有能力控制资源的跨域访问。

跨域的正道还是要使用 HTML5 提供的 CORS 头字段以及 `window.postMessage`，
可以支持 POST, PUT 等 HTTP 方法，从机制上解决跨域问题。
值得注意的是 `Access-Control-Allow-Origin` 头字段是资源所在服务器设置的，
访问控制的责任仍然是在提供资源的服务器一方，这和 JSONP 是一样的。

[jquery-json]: http://api.jquery.com/jquery.getjson/
[event-this]: /2015/08/14/event-and-this.html
[rfc2616]: http://www.faqs.org/rfcs/rfc2616.html
[statuscode]: /2015/08/15/http-status-code.html
[cors-err]: /assets/img/blog/cors/error@2x.png
[cors-cookie]: /2016/12/28/cors-with-cookie.html
[cors-preflight]: /2016/12/30/cors-preflight.html
