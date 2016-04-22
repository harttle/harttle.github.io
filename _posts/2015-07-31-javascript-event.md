---
layout: blog
title: DOM 事件与 jQuery 源码：捕获与冒泡
tags: DOM HTML JavaScript jQuery 事件
excerpt: 本文来讨论DOM标准中是如何规定这些JavaScript事件的，以及jQuery源码中DOM事件的实现方式。
---

> 本文中的JavaScript事件是指：在浏览器中，DOM标准提供的JavaScript事件集与接口集。

在项目开发中通常会使用类似jQuery的工具来绑定事件处理函数，
也可以设置捕获，或者中断事件流，正如这篇文章锁讨论的：
[jQuery事件：bind、delegate、on的行为与性能]({% post_url 2015-06-26-jquery-event %})。
本文来讨论[DOM标准][dom-spec]中是如何规定这些JavaScript事件的，以及jQuery源码中DOM事件的实现方式。

# JavaScript 事件

首先我们来回顾一下DOM事件的行为，事件从发生开始经历了三个阶段：

1. 捕捉阶段（capture phase）：从最上层元素，直到最下层（你点击的那个target）元素。路过的所有节点都可以捕捉到该事件。
2. 命中阶段（target phase）：如果该事件成功到达了target元素，它会进行事件处理。
3. 冒泡阶段（bubbling phase）：事件从最下层向上传递，依次触发父元素的该事件处理函数。

如何中断事件传播，以及禁止事件发生时的浏览器默认行为，参考：[jQuery事件：bind、delegate、on的行为与性能][jquery-event]

<img src="/assets/img/blog/javascript/event-flow.svg" height="400px">

<small>图片来源：http://www.w3.org/TR/DOM-Level-3-Events/#dom-event-architecture</small>


DOM标准中，定义了一系列的JavaScript事件，以及事件接口。其中，DOM Level 0 Event提供了类似`onclick`的属性来支持事件，
DOM Level 2 Event提供了`addEventListener`, `removeEventListener`, `dispatchEvent`，还有IE<9的`attachEvent`。

两种事件处理模型的区别在于，

* 前者（`onclick`）是一次性的事件处理，而且是通过操作DOM元素的属性来完成，因而只能绑定一个处理函数。
* 后者（`addEventListener`）更加高级，不仅可以添加多个事件处理函数，还支持事件的捕获。

<!--more-->

# DOM Level 0 Event

DOM Level 0 Event从Netscape浏览器开始就有支持，最初是通过在HTML中写入`onclick`属性来完成事件绑定：

```html
<div onclick="clickHandler()"></div>
<script>
function clickHandler(){
    console.log('clicked');
}
</script>
```

后来随着Web技术的进步，我们可以在JavaScript定义并且绑定事件了。此后我们可以做到事件处理和页面展示的分离，
在不支持JavaScript的浏览器中，以及搜索引擎看来，页面变得更加地兼容。请看：

```javascript
document.getElementById("#foo").onclick = function(){
    console.log('clicked');
}
```

即时支持在JS中绑定事件，DOM Level 0 事件也存在一些问题。例如：


```javascript
var el = document.getElementById("#foo");
el.onclick = function(){
    console.log('clicked 1');
}
el.onclick = function(){
    console.log('clicked 2');
}
```

是因为`el.onclick`的本质是对DOM元素属性的赋值，后一次时间绑定会使得前一次事件绑定失效。

# addEventListener

2000年11月，W3C发布了DOM (Document Object Model) Level 2 Event，提供了更复杂的事件处理模型：

```javascript
el.addEventListener("click", func, false);
```

在版本小于9的IE中，通过`attachEvent`来添加事件处理函数。然而从IE11开始，`attachEvent`已经不受支持，天煞的IE啊：

> [MSDN attachEvent][ie]: AttachEvent is no longer supported. Starting with Internet Explorer 11, use addEventListener.

通过`addEventListener`添加任意多个事件处理函数，第三个参数用来设置是否捕获（请看下一节）来自子元素的事件，默认为`false`。

```javascript
el.addEventListener("click", function(){
    console.log('clicked 1');
});

el.addEventListener("click", function(){
    console.log('clicked 2');
});
```

这样，两个事件处理函数都会得到执行。

# removeEventListener

DOM Level 2 Event还提供了`removeEventListener(type, listener[, useCapture])`方法，用来移除事件处理函数。
`callback`是必选参数！`capture`默认值为`false`：

> 如果同一个监听事件分别为“事件捕获”和“事件冒泡”注册了一次，一共两次，这两次事件需要分别移除。两者不会互相干扰。

```javascript
var div = document.getElementById('div');
var listener = function (event) {
  /* do something here */
};
div.addEventListener('click', listener, false);
div.removeEventListener('click', listener, false);
```

# 捕获与冒泡

本文最开始已经给出了事件处理的三个阶段：捕获、目标、冒泡。在DOM Level 2 Event中，
如果`addEventListener`第三个参数为`true`则为添加捕获阶段的事件处理函数，否则为添加冒泡阶段的事件处理函数。

> 如果当前对象就是目标对象本身时，添加的事件处理函数只在目标阶段起作用，第三个参数无效。

来看例子吧：

```html
<div id="l1">
  <div id="l2"></div>
</div>

<script type="text/javascript">
  var l1 = document.getElementById('l1'), l2 = document.getElementById('l2');

  l1.addEventListener('click', function(){ console.log('l1 capture')}, true);
  
  l1.addEventListener('click', function(){ console.log('l1 bubbling')});
  
  l2.addEventListener('click', function(){ console.log('l2 target')});
  
  l2.addEventListener('click', function(){ console.log('l2 target, invalid capture')}, true);
</script>
```

为元素`l1`添加了一个捕获阶段的处理函数`l1 captured`，一个冒泡阶段的处理函数`l1 bubbling`。为`l2`添加了一个目标阶段的事件处理函数。
运行结果是：

```
l1 capture
l2 target
l2 target, invalid capture
l1 bubbling
```

其中，`l2 target, invalid capture`设置了捕获，但因为当前对象就是目标对象，捕获无效。该函数仍然作用于目标阶段。
既然捕获失效，那么它的执行顺序就按照注册事件的顺序了，不会因为它设置了无效的捕获而提前得到执行。

# DispatchEvent

`target.DispatchEvent(event)`也是DOM Level 2 Event提供的方法。用来从`target`开始分发事件`event`。
例如，我们可以创建一个`click`DOM事件：

```javascript
var event = new MouseEvent('click', {
  view: window,
  bubbles: true,
  cancelable: true
});
l2.dispatchEvent(event);
```

会产生与点击完全相同的输出：

```
l1 capture
l2 target
l2 target, invalid capture
l1 bubbling
```

如果用`l1`来`dispatchEvent`会怎样？

```
l1 capture
l1 bubbling
```

因为`l1`确实拥有子元素，所以事件仍然会下行和冒泡。但事件的`target`并非`l2`，所以`l2`不会触发目标阶段的事件处理函数。

# jQuery Event 源码

好了好了，DOM Level 2 Event的事件处理模型算是清楚了，在[DOM Level 3 Event][level3]的Working Draft中，
仍然沿袭了三阶段的事件处理流程。接着我们来看jQuery的那些事件处理函数是怎样实现的。

我们知道，jQuery中的`bind`, `delegate`, `live`等最终都是通过[.on()][on]来实现的。来看它的声明：

```javascript
.on( events [, selector ] [, data ], handler )
```

* `events`可以是多个事件，空格分隔；
* 如果指定了`selector`，当前事件处理函数将会代理源于`selector`的事件；
* 如果指定了`data`，它将会通过`event.data`传递。

> 这个`selector`是在当前元素的上下文中查找的，见[jquery-2.1-stable/src/event.js][src]第434行：
> `jQuery( sel, this ).index( cur ) >= 0`。

`on`方法定义在[jquery-2.1-stable/src/event.js][src]中（766行），
最终调用`addEventListener`方法（122行）来添加事件处理函数：

```javascript
add: function(elem, types, handler, data, selector){
  ...
  if(elem.addEventListener) {
    elem.addEventListener(type, eventHandle, false);
  }
  ...
}
```

在2.1版本中已经找不到`attachEvent`方法了，jQuery放弃了版本<9的IE。。
不过在旧版本的jQuery中，仍然可以看到对IE的支持。例如在[jquery-1.11-stable/src/events.js][old-src]中：

```javascript
if (elem.addEventListener) {
  elem.addEventListener(type, eventHandle, false);
}else if (elem.attachEvent) {
  elem.attachEvent("on" + type, eventHandle);
}
```

另外值得注意的是，jQuery的`on`方法实现中，`addEventListener`的第三个参数总是`false`。
即**jQuery事件代理是借助事件冒泡实现的，并未使用事件捕获机制**。

再看与`on`对应的[.off()][off]，它的声明为：

```javascript
.off( events [, selector ] [, handler ] )
```

* `events`可以是多个事件，空格分隔；
* `selector`用来移除对某个子元素的代理；
* `handler`用来指定要移除的处理函数，不指定则移除所有。

`off`方法的实现在[jquery-2.1-stable/src/event.js][src]822行，最终调用`removeEventListener`方法（619行）来移除事件处理函数：

```javascript
jQuery.removeEvent = function(elem, type, handle){
	if(elem.removeEventListener) {
		elem.removeEventListener(type, handle, false);
	}
};
```

注意这里设置了第三个参数为`false`，因为`on`绑定的都是非捕获事件处理函数，自然`off`也只需要移除非捕获的事件处理函数。


[on]: http://api.jquery.com/on/
[off]: http://api.jquery.com/off/
[src]: https://github.com/jquery/jquery/blob/2.1-stable/src/event.js
[old-src]: https://github.com/jquery/jquery/blob/1.11-stable/src/event.js
[ie]: https://msdn.microsoft.com/en-us/library/ms536343(v=vs.85).aspx
[level3]: http://www.w3.org/TR/DOM-Level-3-Events/
[dom-spec]: http://www.w3.org/TR/DOM-Level-2-Events/events.html
[jquery-event]: {% post_url 2015-06-26-jquery-event %}
