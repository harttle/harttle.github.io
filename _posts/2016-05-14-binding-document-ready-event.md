---
title: 兼容所有浏览器的 DOM 载入事件
tags: Chrome DOM HTML JavaScript jQuery 事件 Firefox Safari IE
---

本文就页面载入问题讨论`DOMContentLoaded`、`load`、`readyState`等DOM事件的浏览器兼容性，
并给出怎样绑定DOM载入事件以兼容所有的浏览器。
接着介绍jQuery对该问题的实现源码，以及jQuery中`$(document).ready()`和`$(window).load()`方法的区别。

在讨论页面载入事件之前，首先需要区分的两个概念：DOM就绪和渲染结束。

* *DOM就绪*是指浏览器已经接收到整个HTML并且DOM解析完成；
* *渲染结束*是指浏览器已经接收到HTML中引用的所有样式文件、图片文件、以及Iframe等资源并渲染结束。

<!--more-->

# DOM API 提供的事件

DOM API 在页面载入问题上主要提供了三个接口：

* `DOMContentLoaded`事件；
* `load`事件；
* `document.readyState`属性，及其对应的`readystatechange`事件。

我们看看这三者有什么区别：

## DOMContentLoaded

```javascript
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM ready!");
});
```

页面文档（DOM）完全加载并解析完毕之后，会触发`DOMContentLoaded`事件，
HTML文档不会等待样式文件，图片文件，Iframe页面的加载。
此时DOM元素可能还未渲染结束，位置大小等状态可能不正确，
但DOM树已被创建，多数JavaScript已经操作DOM并完成功能了。
**所以绝大多数场景下都应当使用`DOMContentLoaded`事件，
jQuery也采用了这种实现。**

> This (DOMContentLoaded) event fires after the HTML code has been fully retrieved from the server, the complete DOM tree has been created and scripts have access to all elements via the DOM API. -- [molily.de][molily]

其实样式文件的加载会阻塞后续脚本执行，
此时多数浏览器都会推迟`DOMContentLoaded`事件的触发，
在[样式表的载入会延迟DOM载入事件][css-delay-dom]一文中详细地讨论了这一点。

考虑到IE8及以下不支持该事件，因此我们需要后面的两个 DOM 事件作为Fallback。

## load

```javascript
window.addEventListener("load", function(event) {
    console.log("All resources finished loading!");
});
```

页面完全载入时触发`load`事件，此时所有的图片等资源文件都已完全接收并完成渲染。
因此`load`总是在`DOMContentLoaded`之后触发。
`load`事件没有任何兼容性问题。`load`常常被作为最终的Fallback。

> 注意IE8及以下不支持`addEventListener`，需要使用`attachEvent`来绑定事件处理函数。
> 详见：[DOM 事件与 jQuery 源码：捕获与冒泡][event]一文。

## document.readyState

`document.readyState`属性用来表征DOM的加载状态，
该属性值发生变化时会触发`redystatechange`事件。
`document.readyState`属性有三种取值：

* `"loading"`：DOM在加载过程中；
* `"interactive"`：DOM就绪但资源仍在加载中；
* `"complete"`：DOM加载完成。

由于IE8支持`document.readyState`属性，也常常用来在IE8中作为`DOMContentLoaded`的Fallback。

> 注意IE8以前的IE不支持`document.readyState`属性。
> 可以执行 `document.documentElement.doScroll("left")`，
> 当DOM未就绪时执行该方法会抛出错误，以此检测DOM是否就绪。

# jQuery 方法

jQuery提供了三种方法来提供页面载入事件：

1. `$(document).ready(callback)`：在DOM就绪时执行回调，返回值为`document`构成的jQuery集合。
2. `$(function(){})`：这是最常用的写法，参数与返回值同上。
3. `$(window).load()`：DOM就绪，并且页面渲染结束（图片等资源已接收完成）时执行回调。

> 更多jQuery函数`$()`的用法请参考[jQuery中$()函数有几种用法][jq-obj]一文，本文不再赘述。

上述三个方法在事实上相当于只有两个：`.ready()`和`.load()`。

`.ready()`方法的实现在这里：<https://github.com/jquery/jquery/blob/master/src/core/ready.js>

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

`.load()`就是DOM`load`的包装，不再赘述。
[DOM 事件与 jQuery 源码：捕获与冒泡][event]一文详述了jQuery如何包装DOM事件。

# 参考阅读

* jQuery `.ready()`方法：<https://api.jquery.com/ready/>
* MDN `load` 事件：<https://developer.mozilla.org/en-US/docs/Web/Events/load>
* MDN `DOMContentLoaded`事件：<https://developer.mozilla.org/zh-CN/docs/Web/Events/DOMContentLoaded>
* MDN `document.readyState`属性：<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/readyState>

[jq-obj]: /2015/08/06/jquery-object.html
[molily]: http://molily.de/domcontentloaded/
[event]: /2015/07/31/javascript-event.html
[jq-ready]: http://api.jquery.com/ready/
[css-delay-dom]: /2016/05/15/stylesheet-delay-domcontentloaded.html
