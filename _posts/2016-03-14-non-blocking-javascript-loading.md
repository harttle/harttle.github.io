---
title: 非阻塞脚本载入的几种方式
tags: Chrome DNS DOM HTML iframe JavaScript XHR 网络
---

当今Web页面和脚本已经越来越复杂，页面性能有时会变得很差。
这常常被误解为网络或浏览器的问题，其实前端技术对页面性能有着非常显著的影响。
前端对页面性能的影响也是多方面的：

* 脚本/样式文件的划分会影响浏览器缓存效率。
* 频繁的DOM操作会占用大量CPU资源。
* 资源链接的先后顺序也会影响页面渲染速度。
* 同步的网络请求会使页面停止响应。

本文将探讨不同的脚本载入方式对页面性能的影响，
包括『浏览器忙提示』、『页面停止渲染』、『光标停止响应』等。
最终给出无阻塞脚本载入的最佳实践。

<!--more-->

# 什么是脚本阻塞

本文的主题是无阻塞脚本载入技术，那么什么是脚本阻塞呢？

在[Web性能优化：prefetch, prerender][network]一文中提到，
浏览器在获取资源时会经过DNS解析、建立连接、下载文件、渲染页面等过程。
浏览器只会同时下载2-8个脚本，然后顺序执行它们。
并且在下载和执行过程中，页面会停止渲染和响应（也就是我们说的页面卡死）。

性能最差的情形是某个脚本下载超时，后面的脚本和样式都会被阻塞很长时间，
浏览器的图标会一直处于忙的状态。
如果这个脚本出现在HTML HEAD标签中，阻塞过程中整个页面都将是空白，用户体验极差。

为了防止脚本阻塞，我们来探讨非阻塞的脚本载入方式。
采用这种脚本在如方式时，浏览器（以Chrome为例）不会显示忙指示器图标，
页面也不会停止响应。

# XHR

> 缺点：不能跨域，容易被劫持

我们知道[XHR][xhr]可以用来执行异步的网络请求，XHR Eval方法的原理便是通过XHR下载整个脚本，通过`eval()`函数来执行这个脚本。

```javascript
$.get('/path/to/sth.js')
    .done(function(src){
        eval(src);
    });
```

因为[XHR][xhr]的下载过程是异步的，所以这个过程中浏览器图标不会显示『忙提示』。
JS的执行时间很短暂，可以认为页面始终不会停止响应。
[XHR][xhr]有跨域问题，因此该方法只适用于资源位于同一域名的情况（或者开启[CORS响应头字段][cors]）。

我们知道`eval()`方法是不安全的，除了使用`eval()`方法，我们还可以创建一个`<script>`标签，并把XHR获取的脚本注入进去。
效果是一样的。

# Iframe 

> 缺点：不能跨域，开销较大，原页面的JS不可直接用于Iframe

通过在DOM中插入一个Iframe，让Iframe里的脚本操作当前页面的DOM。
通过`parent.document`可以获得父页面的DOM。

```javascript
// JS in Iframe
var doc = parent.document;
doc.body.appendChild(xxx);
```

浏览器的同源策略也不允许Iframe的JS访问跨域的父页面，因此该方法也不能跨域。
同时浏览器需要为Iframe创建完整的一套DOM并进行渲染，开销较大。

# DOM Element

> 优点：可跨域

可能读者也想到了，直接在页面里插入一个`<script>`不就可以了吗！
确实可以，还能实现跨域呢。看代码：

```javascript
var script = $('<script>', {src: '/path/to/sth.js'});
$('head').append(script);
```

这是比较流行的解决方案。

# Defer/Async

> 优点：可以灵活控制优先页面渲染还是优先执行脚本。
> 
> 缺点：Opera浏览器尚不支持。

既然在脚本执行时我们插入新的`<script>`标签可以延迟脚本加载；
那么我们能否在编写HTML时直接说明这个`<script>`要延迟加载呢？
是可以的！

HTML的`<script>`标签有两个属性用来声明延迟加载：[defer][script]和[async][script]。
其中[async][script]是HTML5标准提出的，不幸的是这俩属性在Opera中仍未得到支持。

```html
<script src="one.js" async></script>     <!--异步执行-->
<script src="one.js" defer></script>     <!--延迟执行--> 
```

这两者有什么区别呢？请看：

![defer vs async][defer-vs-async]

> 图片来自[peter.sh][peter]。

## 正常执行

在下载和执行脚本时HTML停止解析

## defer执行

在下载脚本时HTML仍然在解析，HTML解析完成后再执行脚本。延迟执行不会阻塞渲染，额外的好处是脚本执行时页面已经渲染结束。

## async执行

在下载脚本时HTML仍然在解析，下载完成后暂停HTML解析立即执行脚本。

[network]: /2015/10/06/html-cache.html
[xhr]: https://en.wikipedia.org/wiki/XMLHttpRequest
[cors]: /2015/10/10/cross-origin.html
[script]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/scrip://developer.mozilla.org/en-US/docs/Web/HTML/Element/script 
[peter]: http://peter.sh/experiments/asynchronous-and-deferred-javascript-execution-explained/
[defer-vs-async]: /assets/img/blog/acyn-vs-defer.jpg
