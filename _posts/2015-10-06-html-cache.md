---
title: Web性能优化：prefetch, prerender
tags: DNS HTML HTTP JavaScript TCP 性能
excerpt: 本文从预加载的角度介绍如何优化页面载入和渲染的性能，介绍`dns-prefetch`, `subresource`, `prefetch`, `prerender`等浏览器性能优化。
---

本文从预加载的角度介绍如何优化页面载入和渲染的性能，在展开内容之前先了解一下浏览器显示页面的过程：
首先是DNS解析，然后建立TCP连接，接着下载HTML内容以及资源文件，最后才是整个页面的渲染。如图：

![@2x](/assets/img/blog/pre-party.png)

图片来源：https://docs.google.com/presentation/d/18zlAdKAxnc51y_kj-6sWLmnjl6TLnaru_WH0LJTjP-o/present?slide=id.gc03305a_0106

> 预加载和缓存是两个概念，缓存通常使用304响应状态码来标识，参考文章：[怎样理解HTTP状态码？][status-code]。

这四个阶段必须是串行的，任何一步的延迟都会最终影响到页面加载时间。但浏览器在这方面已经做了很多优化，例如它会猜测你将要打开的页面，并预先解析DNS甚至直接下载它们。
但浏览器猜测的能力是有限的，作为Web开发者我们可以通过`dns-prefetch`, `subresource`, `prefetch`, `prerender`等指令来帮助浏览器优化性能。

<!--more-->

## dns-prefetch

`dns-prefetch`可以指示浏览器去预先解析DNS域名。这样可以减少将要打开页面的延迟，

```html
<head>
  <link rel='dns-prefetch' href='example.com'>
  ...
</head>
```

对于重定向也是有用的，比如对于：host1.com/resource > 301 > host2.com/resource 也可以设置 `dns-prefetch: host2.com` 来省去最后一个页面访问的DNS延迟。

## prefetch

`prefetch`用来初始化**对后续导航中资源的获取**。`prefetch`指定的资源获取优先级是最低的。

```html
<head>
  <link rel="prefetch" href="checkout.html">
  ...
</head>
```

## subresource

`subresource`用来标识出重要的资源，**浏览器会在当前访问页面时立即下载它们**。

```html
<head>
  <link rel="subresource" href="critical/app.js">
  ...
</head>
```

`subresource`的语义是当前页面的子资源，浏览器会立即下载它们。
**`subresource`的优先级高于`prefetch`**。
参见： <http://stackoverflow.com/questions/29475854/what-is-link-rel-subresource-used-for>

## prerender

合适的适合，你甚至可以**用`prerender`来让浏览器在后台事先渲染好整个页面**，这样它的打开速度将会是0秒！

```html
<head>
  <link rel="prerender" href="checkout.html">
  ...
</head>
```

因为要渲染整个页面，所以它需要的所有资源也会被全部下载。
如果里面的JS需要在页面显示时运行，可以通过[页面可见性API][pva]来实现。
当然只有GET才是可以预先渲染的，预渲染POST当然是不安全的。


[pva]: https://developer.mozilla.org/zh-CN/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
[status-code]: /2015/08/15/http-status-code.html
