---
title: "使用 HTTP 缓存：Etag, Last-Modified 与 Cache-Control"
tags: Chrome HTTP Node.js 性能 缓存 浏览器
---

整个 Web 系统架构在 [HTTP 协议][2616] 之上，
利用 HTTP 的缓存机制不仅可以极大地减少服务器负载，
更重要的是加速页面的载入，以及减少用户的流量消耗。
快速到达和易于访问是 Web 与生俱来的特性，
其缓存机制也早已被服务器和浏览器厂商广泛地实现，
我们作为 Web 内容的作者何乐而不为呢？

Web 服务器（比如 Tomcat、Apache、Virgo）或服务器端框架（比如 Django、Express.js）
都会实现 HTTP 缓存机制，但本文不借助这些框架，
而是直接以基本的 Node.js 程序与 Chrome 浏览器来描述 HTTP 中最基本的缓存机制，
涉及到的 HTTP [头字段][2616] 包括 `Cache-Control`, `Last-Modified`, `If-Modified-Since`, `Etag`, `If-None-Match` 等。

<!--more-->

> 除 HTTP 缓存之外，Web 性能优化还有很多其他途径，比如 [预加载和预渲染](/2015/10/06/html-cache.html)、[脚本异步载入](/2016/05/18/async-javascript-loading.html) 等。

# HTTP 缓存简介

谈起 HTTP 缓存你首先想到的一定是磁盘缓存，以及 304 [状态码][status-code]。
这是浏览器处理缓存的两种情况：

* 浏览器询问服务器缓存是否有效，服务器返回 304 指示浏览器使用缓存。
* 资源仍然处于有效期时，浏览器会直接使用磁盘缓存（在刷新时稍有不同，见下文）。

![cache source](/assets/img/blog/http/cache-source@2x.png)

图中 `favicon.ico` 直接来自磁盘缓存，而 `localhost` 文档则来自 304 缓存。
上述行为中涉及到 3 个 HTTP 响应头字段：

* [`Cache-Control`][cc] 响应头表示了资源是否可以被缓存，以及缓存的有效期。
* [`Etag`][et] 响应头标识了资源的版本，此后浏览器可据此进行缓存以及询问服务器。
* [`Last-Modified`][lm] 响应头标识了资源的修改时间，此后浏览器可据此进行缓存以及询问服务器。

# Cache-Control

`Cache-Control` 在 HTTP 响应头中，用于指示代理和 UA 使用何种缓存策略。
比如`no-cache`为不可缓存、`private`为仅 UA 可缓存，`public`为大家都可以缓存。

> The Cache-Control general-header field is used to specify directives that MUST be obeyed by all caching mechanisms along the request/response chain.  --14.9, [RFC 2616][2616]

当`Cache-Control`为可缓存时，同时可指定缓存时间（比如`public, max-age:86400`）。
这意味着在 1 天（60x60x24=86400）时间内，浏览器都可以直接使用该缓存（此时服务器收不到任何请求）。
当然浏览器也有权随时丢弃任何一项缓存，因此这里可能有[一致性问题][best-practice]。
注意下图中状态码附近的 `from disk cache` 标识。

![cache-control](/assets/img/blog/http/cache-control@2x.png)

其服务器代码如下：

```javascript
import http from 'http'

let server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.end('harttle.com')
})

server.listen(3333)
```

> 除了 `Cache-Control` 中的 `max-age` 外，[`Expires`][expires]，[`Vary`][vary] 等头字段也可用来设置缓存的有效性。

# Etag

如果资源本身确实会随时发生改动，还用 `Cache-Control` 就会使用户看到的页面得不到更新。
但如果还希望利用 HTTP 缓存（万一资源没变呢），这就需要有条件的（conditional）HTTP 请求。

`Etag` 响应头字段表示资源的版本，浏览器在发送请求时会带 `If-Non-Match` 头字段，
来询问服务器该版本是否仍然可用。如果服务器发现该版本仍然是最新的，
就可以返回 304 状态码指示 UA 继续使用缓存。注意下图中的 `If-Non-Match` 字段。

![if-non-match](/assets/img/blog/http/if-non-match@2x.png)

其服务器端代码如下：

```javascript
import http from 'http'

let server = http.createServer((req, res) => {
  console.log(req.url, req.headers['if-none-match'])
  if (req.headers['if-none-match']) {
    // 检查文件版本
    res.statusCode = 304
    res.end()
  }
  else {
    res.setHeader('Etag', '00000000')
    res.end('harttle.com')
  }
})

server.listen(3333)
```

# Last-Modified

与 `Etag` 类似，`Last-Modified` HTTP 响应头也用来标识资源的有效性。
不同的是使用修改时间而不是实体标签。对应的请求头字段为`If-Modified-Since`，
见下图：

![if-modified-since](/assets/img/blog/http/if-modified-since@2x.png)

其服务器端代码如下：

```javascript
import http from 'http'

let server = http.createServer((req, res) => {
  console.log(req.url, req.headers['if-modified-since'])
  if (req.headers['if-modified-since']) {
    // 检查时间戳
    res.statusCode = 304
    res.end()
  }
  else {
    res.setHeader('Last-Modified', new Date().toString())
    res.end('harttle.com')
  }
})

server.listen(3333)
```

# 浏览器刷新

撰写这篇文章的过程中，Harttle 使用了很多 Chrome 浏览器的截图。
如果你使用浏览器调试，可能也需要了解刷新按钮的行为。

## 正常重新加载

按下刷新按钮或快捷键（在 MacOS 中是 Cmd+R）会触发浏览器的“正常重新加载”（normal reload），
此时浏览器会执行一次 [Conditional GET][cond]。
`Cache-Control` 等缓存头字段会被忽略，并且带`If-Non-Match`, `If-Modified-Since`等头字段。
此时服务器总会收到一次 HTTP GET 请求。
在 Chrome 中按下刷新，浏览器还会带如下请求头：

```
Cache-Control:max-age=0
```

注意：在地址栏重新输入当前页面地址并按下回车也会当做刷新处理，
这意味着只有从新标签页或超链接打开时，才能观察到直接使用硬盘缓存的情况。

## 强制重新加载

在 Chrome 中按下 Cmd+Shift+R （MacOS）可以触发强制重新加载（Hard Reload），
此时包括页面本身在内的所有资源都不会使用缓存。
浏览器直接发送 HTTP 请求且不带任何条件请求字段。

[2616]: /2014/10/01/http.html
[status-code]: /2015/08/15/http-status-code.html
[cc]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[et]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
[lm]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Last-Modified
[2616]: https://www.ietf.org/rfc/rfc2616.txt
[expires]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Expires
[vary]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/vary
[cond]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Conditional_requests
[best-practice]: /2017/04/04/http-cache-best-practice.html
