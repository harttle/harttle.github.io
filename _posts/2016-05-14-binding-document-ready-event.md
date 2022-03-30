---
title: 兼容所有浏览器的 DOM 载入事件
tags: Chrome DOM HTML JavaScript jQuery 事件 Firefox Safari IE
---

本文就页面载入问题讨论 `DOMContentLoaded`、`load`、`readyState` 等 DOM 事件的浏览器兼容性，
并给出怎样绑定 DOM 载入事件以兼容所有的浏览器。
接着介绍 jQuery 对该问题的实现源码，以及 jQuery 中 `$(document).ready()` 和 `$(window).load()` 方法的区别。

在讨论页面载入事件之前，首先需要区分的两个概念：DOM 就绪和渲染结束。

* *DOM 就绪* 是指浏览器已经接收到整个 HTML 并且 DOM 解析完成；
* *渲染结束* 是指浏览器已经接收到 HTML 中引用的所有样式文件、图片文件、以及 Iframe 等资源并渲染结束。

<!--more-->

## DOM API 提供的事件

DOM API 在页面载入问题上主要提供了三个接口：

* `DOMContentLoaded` 事件；
* `load` 事件；
* `document.readyState` 属性，及其对应的 `readystatechange` 事件。

我们看看这三者有什么区别：

### DOMContentLoaded

```javascript
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM ready!");
});
```

页面文档（DOM）完全加载并解析完毕之后，会触发 `DOMContentLoaded` 事件，
HTML 文档不会等待样式文件，图片文件，Iframe 页面的加载。
此时 DOM 元素可能还未渲染结束，位置大小等状态可能不正确，
但 DOM 树已被创建，多数 JavaScript 已经操作 DOM 并完成功能了。
**所以绝大多数场景下都应当使用 `DOMContentLoaded` 事件，
jQuery 也采用了这种实现。**

> This (DOMContentLoaded) event fires after the HTML code has been fully retrieved from the server, the complete DOM tree has been created and scripts have access to all elements via the DOM API. -- [molily.de][molily]

其实样式文件的加载会阻塞后续脚本执行，
此时多数浏览器都会推迟 `DOMContentLoaded` 事件的触发，
在 [样式表的载入会延迟 DOM 载入事件][css-delay-dom] 一文中详细地讨论了这一点。

考虑到 IE8 及以下不支持该事件，因此我们需要后面的两个 DOM 事件作为 Fallback。

### load

```javascript
window.addEventListener("load", function(event) {
    console.log("All resources finished loading!");
});
```

页面完全载入时触发 `load` 事件，此时所有的图片等资源文件都已完全接收并完成渲染。
因此 `load` 总是在 `DOMContentLoaded` 之后触发。
`load` 事件没有任何兼容性问题。`load` 常常被作为最终的 Fallback。

> 注意 IE8 及以下不支持 `addEventListener`，需要使用 `attachEvent` 来绑定事件处理函数。
> 详见：[DOM 事件与 jQuery 源码：捕获与冒泡][event] 一文。

### document.readyState

`document.readyState` 属性用来表征 DOM 的加载状态，
该属性值发生变化时会触发 `redystatechange` 事件。
`document.readyState` 属性有三种取值：

* `"loading"`：DOM 在加载过程中；
* `"interactive"`：DOM 就绪但资源仍在加载中；
* `"complete"`：DOM 加载完成。

由于 IE8 支持 `document.readyState` 属性，也常常用来在 IE8 中作为 `DOMContentLoaded` 的 Fallback。

> 注意 IE8 以前的 IE 不支持 `document.readyState` 属性。
> 可以执行 `document.documentElement.doScroll("left")`，
> 当 DOM 未就绪时执行该方法会抛出错误，以此检测 DOM 是否就绪。

## jQuery 方法

jQuery 提供了三种方法来提供页面载入事件：

1. `$(document).ready(callback)`：在 DOM 就绪时执行回调，返回值为 `document` 构成的 jQuery 集合。
2. `$(function(){})`：这是最常用的写法，参数与返回值同上。
3. `$(window).load()`：DOM 就绪，并且页面渲染结束（图片等资源已接收完成）时执行回调。

因为前两种等价，我们主要分析 `.ready()` 和 `.load()`：

### .ready 方法
`.ready` 会在绑定监听函数时已经错过 `DOMContentLoaded` 事件的情况下也调用监听函数，因此用起来比较方便。另外 `.ready` 还会在不支持 `DOMContentLoaded` 事件的浏览器中自动 fallback 到 `load` 事件，因此比直接监听 `DOMContentLoaded` 兼容性也更好。更多细节可以参考它的实现：<https://github.com/jquery/jquery/blob/master/src/core/ready.js>。

```javascript
if ( document.readyState === "complete" ||
    ( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
    // Handle it asynchronously to allow scripts the opportunity to delay ready
    window.setTimeout( jQuery.ready );
} else {
    // Use the handy event callback
    document.addEventListener( "DOMContentLoaded", completed );
    // A fallback to window.onload, that will always work
    window.addEventListener( "load", completed );
}
```

### .load 方法
`.load()` 就是 DOM `load` 的包装，等价于直接绑定 `load` DOM 事件，不再赘述。另外在 [DOM 事件与 jQuery 源码：捕获与冒泡][event] 一文详述了 jQuery 如何包装 DOM 事件。

## 参考阅读

* jQuery `.ready()` 方法：<https://api.jquery.com/ready/>
* MDN `load` 事件：<https://developer.mozilla.org/en-US/docs/Web/Events/load>
* MDN `DOMContentLoaded` 事件：<https://developer.mozilla.org/zh-CN/docs/Web/Events/DOMContentLoaded>
* MDN `document.readyState` 属性：<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/readyState>

[jq-obj]: /2015/08/06/jquery-object.html
[molily]: http://molily.de/domcontentloaded/
[event]: /2015/07/31/javascript-event.html
[jq-ready]: http://api.jquery.com/ready/
[css-delay-dom]: /2016/05/15/stylesheet-delay-domcontentloaded.html
