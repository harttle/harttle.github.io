---
layout: blog
categories: web
title: 如何理解HTTP响应的状态码？
tags: HTTP WebSocket
---

我们知道HTTP协议是通过HTTP请求和HTTP响应来实现双向通信的。
HTTP状态码（HTTP Status Code）是用以表示Web服务器HTTP响应状态的3位数字代码，由RFC 2616规范定义。
合理的状态码不仅可以让用户或者浏览器做出更加合适的进一步操作，而且可以让客户端代码更加易于理解和维护。

HTTP状态码分为5类：1xx表示继续发送请求；2xx表示请求成功；3xx表示资源已找到但需要继续进行其他操作；
4xx表示客户端错误；5xx表示服务器错误。下面就具体详述常见状态码的语义，及其使用方式。

关于HTTP协议规范以及状态码在其中的作用，参见：[读 HTTP 协议][http]。
参考链接：http://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81

<!--more-->

## 1xx

1xx表示请求已被接受，但需要后续处理。例如：

### 100（Continue）

客户端应继续发送请求。

### 101（Switching Protocols）

需要切换协议，服务器通过的`Upgrade`响应头字段通知客户端。

HTML5引入的WebSocket便是这样工作的。首先客户端请求websocket所在的URL，服务器返回101，然后便建立了全双工的TCP连接。
注意`Upgrade`和`Connection`头字段属于Hop-by-hop字段，设置Websocket代理时需要继续设置这两个字段，而不是简单地转发请求。

## 2xx

请求已成功被服务器接收、理解、并接受。

### 200（OK）

请求已成功，请求所希望的响应头或数据体将随此响应返回。

### 201（Created）

请求已经被实现，而且有一个新的资源已经依据请求的需要而创建。在RESTFul风格的URL设计中，通常用来响应POST请求。

### 202（Accepted）

服务器已接受请求，但尚未处理。比如POST一个资源应当返回201，但由于性能原因未能立即创建，可以返回202。

### 204（No Content）

服务器成功处理了请求，但不需要返回任何实体内容，204响应禁止包含任何消息体。浏览器收到该响应后不应产生文档视图的变化。

### 205（Reset Content）

服务器成功处理了请求，但不需要返回任何实体内容，205响应禁止包含任何消息体。
与204不同的是，返回此状态码的响应要求请求者重置文档视图。比如用户刚刚提交一个表单，返回205后页面重置，用户可以立即填写下一个表单。

### 206（Partial Content）

HTTP协议允许分片传输。请求头中包含`Range`字段时，响应需要只返回`Range`指定的那一段。响应中应包含`Content-Range`来指示返回内容的范围。

### 其他

* 203（Non-Authoritative Information）
* 207（Multi-Status）

## 3xx

这类状态码代表需要客户端采取进一步的操作才能完成请求。通常，这些状态码用来重定向，
重定向目标在本次响应的`Location`头字段中指明。

### 301（Moved Permanently）

被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个URI之一。如果该请求不是GET/HEAD，
浏览器通常会要求用户确认重定向。

301通常用于网站迁移时，服务器对旧的URL进行301重定向到新的URL。这样搜索引擎可以正确地更新原有的页面排名等信息。

### 302（Found）

请求的资源现在临时从不同的URI响应请求。除非指定了`Cache-Control`或`Expires`，否则该响应不可缓存。
如果当前请求非HEAD或GET，浏览器需取得用户确认，再进行重定向。

> 这很好理解，因为上下文发生了变化，比如POST请求不是幂等的。

### 303（See Other）

对应当前请求的响应可以在另一个URI上被找到，而且客户端应当采用GET的方式访问那个资源。
这个方法的存在主要是为了允许由脚本激活的POST请求输出重定向到一个新的资源。
303响应禁止被缓存。

> 303会使得浏览器直接GET那个资源，不需用户同意。这是Web应用中最常见的重定向方式。

### 304（Not Modified）

如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变。
304响应禁止包含消息体。

304响应也是一种缓存机制。Web服务器对静态资源文件通常会采取缓存，因此在Web开发中你可以看到大量的304响应。
服务器给出的相应中通常会包含`Etag`来标识资源ID，比如：

```
ETag: "686897696a7c876b7e"
```

客户端在下次访问同一URL时会设置头字段`If-None-Match`（这是一个请求条件）：

```
If-None-Match: "686897696a7c876b7e"
```

服务器返回资源前会判断`Etag`是否与客户端提供的`If-None-Match`匹配，如果匹配则说明资源未发生改变，此时应返回304.

#### 关于HTTP缓存的讨论

除了使用`ETag/If-None-Match`通过文件内容来缓存外，还可以使用`Last-Modified/If-Modified-Since`通过文件修改时间来进行缓存。
这两者都需要客户端再次发送HTTP请求，如果文件未发生改变，服务器返回304。

而另外一种缓存策略`Expires/Cache-Control`则可以让客户端避免再次发送请求。一般会优先使用`Cache-Control`，它能够更加精细地控制缓存策略。

### 其他
 
* 300（Multiple Choices）
* 305（Use Proxy）
* 307（Temporary Redirect）

## 4xx

这类的状态码代表了客户端看起来可能发生了错误，妨碍了服务器的处理。
除非响应的是一个HEAD请求，否则服务器就应该返回一个解释当前错误状况的实体。

### 400（Bad Request）

由于包含语法错误，当前请求无法被服务器理解。400通常在服务器端表单验证失败时返回。

### 401（Unauthorized）

当前请求需要用户验证，响应中会包含一个`WWW-Authenticate`字段来询问用户的授权信息。
而客户端的下次请求需要提供包含`Authorization`头的请求。

HTTP Basic Auth就是这样实现的。当服务器返回401时浏览器会弹出窗口：

![][basic-auth]

输入验证信息并点击确定，浏览器会根据你的输入填写`Authorization`头并重新发送请求。对于Basic Auth看起来是这样的：

```
Authorization:Basic eWFuZ2p2bjp5YW5nanZuaGFydA==
```

### 403（Forbidden）

服务器已经理解请求，但是拒绝执行它。与401响应不同的是，身份验证并不能提供任何帮助。

> 403和401一样，需要在相应消息体中需要给出原因。除非是一个HEAD请求。

通常用于服务器已经知道用户的身份的情况。比如从请求的Cookie得到的Session中可以得知当前用户无权进行该操作。
通常的Web应用中，对于401的情况应当重定向至登录页面，403的情况应当直接告知错误（这属于前端Bug）。

### 404（Not Found）

这太常见了。就是请求所希望得到的资源未被在服务器上发现。

当通常用于当服务器不想揭示到底为何请求被拒绝时，比如应当返回500时服务器不愿透露自己的错误。

### 405（Method Not Allowed）

请求行中指定的请求方法不能被用于请求相应的资源。

在Web开发中通常是因为客户端和服务器的方法不一致，比如客户端通过PUT来修改一个资源，而服务器把它实现为POST方法。
开发中统一规范就好了。

### 413（Request Entity Too Large）

服务器拒绝处理当前请求，因为该请求提交的实体数据大小超过了服务器愿意或者能够处理的范围。

一般的服务器都会设置HTTP请求消息体的最大长度，当然这是一种阻挡攻击的手段。
例如你在使用HTTP方式来访问Git仓库，如果你在仓库中加入了大的二进制文件（通常为目标文件或多媒体文件），
在Push时服务器很可能会返回413错误。如果切换为ssh协议就不会有这样的问题了，服务器只能限制整个仓库的大小。

### 414（Request-URI Too Large）

当URI太长时，服务器可以返回414. 当HTTP协议并未规定URI应当有多长。这取决于浏览器和服务器的设置，
在服务器中当然你想设置多长都可以，但是浏览器是你决定不了的，而且不同的厂商在采用不同的长度限制，可以认为最短的是2K：

> The limit is in MSIE and Safari about 2KB, in Opera about 4KB and in Firefox about 8KB, (255 bytes if we count very old browsers) . 

当然URI长度的这一点限制会使得HTTP GET方法的能力有限，不能传输超过2K的数据。另外因为GET方法的所有数据都体现在URI上，
对于用户是可见的。这一点不太安全。

> 其实HTTP GET传输数据理论上并不比POST安全更多，因为POST的Entity Body也是明文传输的。只是GET的数据用户直接可见而已。

### 其他

* 402（Payment Required）
* 406（Not Acceptable）
* 407（Proxy Authentication Required）
* 408（Request Time-out）
* 409（Conflict）
* 410（Gone）
* 411（Length Required）
* 412（Precondition Failed）
* 415（Unsupported Media Type）
* 416（Requested range not satisfiable）
* 417（Expectation Failed）

## 5xx

这类状态码代表了服务器在处理请求的过程中有错误或者异常状态发生，也有可能是服务器意识到以当前的软硬件资源无法完成对请求的处理。
并且响应消息体中应当给出理由，除非是HEAD请求。

### 500（Internal Server Error）

通常是代码出错，后台Bug。一般的Web服务器通常会给出抛出异常的调用堆栈。
然而多数服务器即使在生产环境也会打出调用堆栈，这显然是不安全的。

### 502（Bad Gateway）

作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。

如果你在用HTTP代理来翻墙，或者你配置了nginx来反向代理你的应用，你可能会常常看到它。

### 504（Gateway Time-out）

作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器收到响应。

注意与502的区别：502是接收到了无效响应比如`Connection Refused`；
504是响应超时，通常是被墙了。

很多国外站点都会使用CDN来Serve静态文件，但我大中华墙掉了一些CDN。导致这些资源文件的请求会一直处于Pending状态直到超时。
表现为浏览器显示空白页面，长时间处于等待状态。这时在控制台看到HTML已经载入了就可以点击停止按钮了，停止载入那些资源。
页面会立即显示出来，虽然样式和交互可能有问题。

说到这里想吐槽GFW简直没有行业道德，即使不允许我们访问也返回一个错误嘛，不要让浏览器一直处于等待的状态。

## 其他

* 501（Not Implemented）
* 503（Service Unavailable）
* 505（HTTP Version not supported）


[http]: {% post_url 2014-10-01-http %}
[basic-auth]: /assets/img/blog/basic-auth@2x.png
