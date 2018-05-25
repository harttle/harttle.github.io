---
title: Web 性能优化：异步加载脚本
tags: DOM async defer JavaScript 异步 性能
redirect_from: /2016/03/14/non-blocking-javascript-loading.html
---

本文通过几个例子详述脚本对页面渲染的影响，以及浏览器正在加载提示
（标签页旋转按钮、页面停止渲染、光标停止响应）的行为。
介绍如何使用异步脚本载入策略提前 `load` 事件，提前结束浏览器的正在加载提示。**TL;DR**：

* 脚本会阻塞 DOM 渲染，因此可以把不必要首屏载入的脚本异步载入。
* 载入方式一：使用类似 requirejs 的方案，或在 `load` 事件后再插入外链脚本。
* 载入方式二：XHR 获取内容后 Eval（不安全，且跨域不可用）。
* 载入方式三：使用 `<script>` 的 `async` 和 `defer` 属性。

<!--more-->

# DOM 渲染流程

要理解异步脚本载入的用处首先要了解浏览器渲染DOM的流程，以及各阶段用户体验的差别。
一般地，一个包含外部样式表文件和外部脚本文件的HTML载入和渲染过程是这样的：

1. 浏览器下载HTML文件并开始解析DOM。
3. 遇到样式表文件`link[rel=stylesheet]`时，将其加入资源文件下载队列，继续解析DOM。
4. 遇到脚本文件时，暂停DOM解析并立即下载脚本文件。
5. 下载结束后立即执行脚本，在脚本中可访问当前`<script>`以上的DOM。
5. 脚本执行结束，继续解析DOM。
6. 整个DOM解析完成，触发`DOMContentLoaded`事件。

此外，虽然浏览器会并行地下载资源文件（样式表、图片），但通常会限制并发下载数，一般为3-5个。
资源文件的下载也可以进行优化，请参考：[Web 性能优化：prefetch, prerender][network]。

# 脚本加载阻塞 DOM 渲染

脚本载入真的会暂停DOM渲染吗？非常真切。
比如下面的HTML中，在脚本后面还有一个`<h1>`标签。

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Hello</h1>
  <script src="/will-not-stop-loading.js"></script> 
  <h1>World!</h1>
</body>
</html>
```

我们编写服务器端代码（见本文最后一章），让`/will-not-stop-loading.js`始终处于等待状态。
此时页面的显示效果：

![js block dom render](/assets/img/blog/dom/js-block-dom-render@2x.png)

脚本等待下载完成的过程中，后面的`World`不会显示出来。直到该脚本载入完成或超时。
试想如果你在`<head>`中有这样一个下载缓慢的脚本，整个`<body>`都不会显示，
势必会造成空白页面持续相当长的时间。
所以**较好的实践方式是将脚本放在`<body>`尾部。**

> 很多被墙的网站加载及其缓慢就是因为DOM主体前有脚本被挡在墙外了。

# 异步加载脚本：插入外链脚本标签

浏览器“载入中”的提示会让用户感觉网页慢！事实上我们应该关心的网页性能就是用户感受的性能。
这个“载入中”的提示消失的时机基本就是 `load` 事件发生的时机。所以问题就变成了如何提前 `load` 事件。

除了懒加载图片、视频（Web 上已经有大量教程）之外，延迟加载非必须的页面脚本也很有效。
[Harttle](/) 建议的上策是采用类似 [AMD](http://requirejs.org/) 的模块加载器。
如果你的脚本很简单要手动实现，可以参考下面的代码：

```javascript
document.addEventListener('load', function(){
    var s = document.createElement('script');
    s.src = "/will-not-stop-loading.js";
    document.body.appendChild(s);
});
```

这意味着正在进行的DOM渲染过程完全结束后（此时浏览器忙提示当然会消失），才会调用上述函数。
其中`/will-not-stop-loading.js`仍处于`pending`状态，但浏览器忙提示已经消失。如图：

![async script loading](/assets/img/blog/dom/async-script-loading@2x.png)

注意直接在页面脚本中 `append` 一个 `<script>` 不起作用，新插入的脚本仍然会阻塞 DOM 渲染。
即使在 `DOMContentLoaded` 事件时插入 `<script>` 也不起作用，
因为 `DOMContentLoaded` 事件发生在 `load` 事件之前。

# 异步加载脚本：XHR+Eval

我们知道[XHR][xhr]可以用来执行异步的网络请求，XHR Eval方法的原理便是通过XHR下载整个脚本，通过`eval()`函数来执行这个脚本。

```javascript
$.get('/path/to/sth.js').done(eval);
```

因为[XHR][xhr]的下载过程是异步的，所以这个过程中浏览器图标不会显示『忙提示』。
JS的执行时间很短暂，可以认为页面始终不会停止响应。
[XHR][xhr]有跨域问题，因此该方法只适用于资源位于同一域名的情况（或者开启[CORS响应头字段][cors]）。

因为`eval()`方法是不安全的，可以创建一个`<script>`标签，并把XHR获取的脚本注入进去。
再把 `<script>` 标签插入 DOM 它的内容就会执行。

# 异步加载脚本：Defer/Async

这是 HTML5 中标准的属性，用来在 HTML 标记中声名式地指定异步加载脚本。
除了 Opera 之外的浏览器基本都有支持。这个机制包括两个属性：[defer][script]和[async][script]。
例如：

```html
<script src="one.js" async></script>     <!--异步执行-->
<script src="one.js" defer></script>     <!--延迟执行--> 
```

这两者有什么区别呢？请看下图（图片来自[peter.sh][peter]）：

![defer vs async][defer-vs-async]

* 正常执行（无任何属性）：在下载和执行脚本时HTML停止解析
* 设置 `defer`：在下载脚本时HTML仍然在解析，HTML解析完成后再执行脚本。延迟执行不会阻塞渲染，额外的好处是脚本执行时页面已经渲染结束。
* 设置 `async`：在下载脚本时 HTML 仍然在解析，下载完成后暂停HTML解析立即执行脚本。

# 参考代码

本文所做实验服务器端都使用Node.js写成：

```javascript
const http = require("http");
const fs = require('fs');
const port = 4001;

var server = http.createServer(function(req, res) {
    switch (req.url) {
        case '/':
            var html = fs.readFileSync('./index.html', 'utf8');
            res.setHeader("Content-Type", "text/html");
            res.end(html);
            break;
        case '/will-not-stop-loading.js':
            break;
    }
});

server.listen(port, e => console.log(`listening to port: ${port}`));
```

* MDN Element.dataset: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset>
* jQuery.getScript <http://api.jquery.com/jQuery.getScript/>

[network]: /2015/10/06/html-cache.html
[xhr]: https://en.wikipedia.org/wiki/XMLHttpRequest
[cors]: /2015/10/10/cross-origin.html
[script]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/scrip://developer.mozilla.org/en-US/docs/Web/HTML/Element/script 
[peter]: http://peter.sh/experiments/asynchronous-and-deferred-javascript-execution-explained/
[defer-vs-async]: /assets/img/blog/acyn-vs-defer.jpg
[dom-ready]: /2016/04/27/document-ready-event.html
[stylesheet-dom-ready]: /2016/05/15/stylesheet-delay-domcontentloaded.html
