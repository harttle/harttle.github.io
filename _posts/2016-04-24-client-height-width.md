---
title: 视口的宽高与滚动高度
tags: DOM scrollHeight scrollTop clientHeight innerHeight outerHeight offsetHeight
---

很多场景下会需要在JavaScript中获取窗口或DOM元素的宽高，以及滚动高度。
例如：实现滚动效果、创建全屏布局、动态绝对定位等等。
本文就来介绍相关的DOM API：`window.innerHeight`, `window.outerHeight`,`clientHeight`,
`offsetHeight`, `scrollHeight`, `scrollTop`等（当然每个属性都有对应的Width）。

# 整个窗口大小

## innerHeight与outerHeight

通过`window.innerHeight`和`window.outerHeight`可以得到整个窗口的高度。其中：

* `innerHeight`是DOM视口的大小，包括滚动条。
* `outerHeight`是整个浏览器窗口的大小，包括窗口标题、工具栏、状态栏等。

![innerHeight and outerHeight](/assets/img/blog/css/inner-outter-height.png)

把`Height`改为`Width`同样有效，分别是`innerWidth`和`outerWidth`。

> 注意：IE8及以下不支持本节介绍的`window.innerHeight`等属性。

<!--more-->

## clientHeight

在不支持`window.innerHeight`的浏览器中，可以读取`documentElement`和`body`的高度，
它们的大小和`window.innerHeight`是一样的（其实不太一样，见下一小节）。

```javascript
document.documentElement.clientHeight
document.body.clientHeight
```

其中`documentElement`是文档根元素，就是`<html>`标签。

> The Document.documentElement read-only property returns the Element that is the root element of the document (for example, the <html> element for HTML documents).  -- MDN

`body`顾名思义就是`<body>`标签了。这两种方式兼容性较好，可以一直兼容到IE6，就是写起来费劲。

## 最佳实践

既然获取窗口大小存在浏览器兼容问题，在实践中通常使用下面的代码来兼容所有浏览器：

```javascript
var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
```

事实上后两种方式获取的高度和`window.innerHeight`是不一样的，这3个属性的值逐个变小。
具体说来，`window.innerHeight`包括整个DOM：内容、边框以及滚动条。

* `documentElement.clientHeight`不包括整个文档的滚动条，但包括`<html>`元素的边框。
* `body.clientHeight`不包括整个文档的滚动条，也不包括`<html>`元素的边框，也不包括`<body>`的边框和滚动条。

> 其实使用`offsetHeight`作为Fallback要比`clientHeight`更好，更多的讨论请见下文。

# 滚动高度

在使用JavaScript控制页面滚动时（例如回到顶部），需要知道页面当前滚动到了哪里，以及滚动到的目标是哪里。
这便是滚动高度。这涉及到4个DOM属性，`clientHeight`, `offsetHeight`, `scrollHeight`, `scrollTop`。

> 所有DOM元素都有上述4各属性，只需要给它固定大小并设置`overflow:scroll`即可表现出来。

* `clientHeight`: 内部可视区域大小。

    > returns the inner height of an element in pixels, including padding but not the horizontal scrollbar height, border, or margin

* `offsetHeight`：整个可视区域大小，包括border和scrollbar在内。

    > is a measurement which includes the element borders, the element vertical padding, the element horizontal scrollbar (if present, if rendered) and the element CSS height.

* `scrollHeight`：元素内容的高度，包括溢出部分。

    > is a measurement of the height of an element's content including content not visible on the screen due to overflow

* `scrollTop`：元素内容向上滚动了多少像素，如果没有滚动则为0。

    >  the number of pixels that the content of an element is scrolled upward. 

如下图：

![][height]

> 对应的横向属性为：`clientWidth`, `offsetWidth`, `scrollWidth`, `scrollLeft`。

# 参考阅读

* Window - W3School: <http://www.w3school.com.cn/js/js_window.asp>
* Window.innerHeight - MDN：<https://developer.mozilla.org/zh-CN/docs/Web/API/Window/innerHeight>
* Element.clientWidth - MDN：<https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight>
* Document.documentElement - MDN：<https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement>
* Document.body - MDN：<https://developer.mozilla.org/en-US/docs/Web/API/Document/body>

[height]: /assets/img/blog/css/height.png
