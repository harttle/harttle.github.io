---
layout: blog
categories: web
title: 事件处理中的this：attachEvent, addEventListener, onclick
tags: JavaScript 事件 DOM
---

事件处理函数中，我们通常使用`this`来获取当前被操作的对象。这无疑是很方便的一个特性，
但对于不同的事件绑定方式，`this`可能不一定是当前被操作的对象。
本文便来分析不同的方式绑定事件处理函数时，函数中`this`的区别。常见的事件绑定方式不外乎4种：

1. `attachEvent`：IE9以下的MSIE中。
2. `addEventListener`：支持DOM Level 2 Event的浏览器中。
3. `el.onclick=function(){}`：这是古老的事件绑定方式。
4. `<a onclick='handle()'>`：这是最古老的事件绑定方式。
5. jQuery：jQuery也提供了很多方法来方便地绑定事件。

`addEventListener`是现代Web应用中绑定事件的终极方法，jQuery从版本2开始也是通过调用`addEventListener`来实现其事件绑定逻辑
（源码分析参见：[DOM Level 2 Event与jQuery源码][js-event]）。
jQuery的所有时间绑定最终调用的是`on`方法，参见：[jQuery事件：bind、delegate、on的行为与性能][jquery-event]。

<!--more-->

# attachEvent与addEventListener的区别

坦白地讲我从不使用`attachEvent`，就连jQuery也更新到了版本2，并无支持IE的习惯。但基于面试中常常问到，
还是来谈谈`attachEvent`与`addEventListener`的区别吧！它和`addEventListener`有何区别呢？

1. 当然支持的浏览器不同，`attachEvent`在IE9以下的版本中受到支持。其它的都支持`addEventListener`。
2. 参数不同。`addEventListener`第三个参数可以指定是否捕获，而`attachEvent`不支持捕获。
3. 事件名不同。`attachEvent`第一个参数事件名前要加`on`，比如`el.attachEvent('onclick', handleClick);`
4. `this`不同。我们知道`this`总之指向当前函数的调用者，对于事件处理函数这一点较为复杂，这是本文的重点所在。

# attachEvent方式的事件绑定

`attachEvent`的`this`总是`Window`。例如：

```javascript
el.attachEvent('onclick', function(){
    alert(this);
});
```

执行后会弹出对话框：`[object Window]`。

# 脚本设置onclick方式的事件绑定

在javascript中设置DOM对象的onclick属性，`this`总是指向被设置的DOM元素。例如：

```javascript
document
  .getElementById('l1')
  .onclick = function(){
    console.log(this);
  };
```

点击`div#l1`后控制台输出为：

```
<div id="l1">...</div>
```

# HTML中设置onclick方式的事件绑定

在HTML中设置`onclick`属性相当于让Window来调用该处理函数，于是`this`总是`Window`。例如：


```html
<div onclick="clickHandler()"></div>
<script>
function clickHandler(){
    console.log(this);
}
</script>
```

点击这个`div`后的控制台输出为：

```
Window {top: Window, location: Location, document: document, window: Window, external: Object…}
```


# addEventListener方式的事件绑定

`addEventListener`的`this`总是当前正在处理事件的那个DOM对象。
DOM Level 2 Event Model中提到，事件处理包括捕获阶段、目标阶段和冒泡阶段
（关于捕获和冒泡机制的详情请参见[DOM Level 2 Event与jQuery源码][js-event]）。如下图：


<img src="/assets/img/blog/javascript/event-flow.svg" height="400px">

<small>图片来源：http://www.w3.org/TR/DOM-Level-3-Events/#dom-event-architecture</small>

事件当前正在流过哪个元素，`this`便指向哪个元素。比如对于两级的DOM：

```html
<div id="l1">
  <div id="l2"></div>
</div>
<script type="text/javascript">
  var l1 = document.getElementById('l1'),
      l2 = document.getElementById('l2');

  l1.addEventListener('click', function () {
    console.log('l1 capture', this);
  }, true);
  l1.addEventListener('click', function () {
    console.log('l1 bubbling', this);
  });
  l2.addEventListener('click', function () {
    console.log('l2 target', this);
  });
</script>
```

点击`div#l2`后控制台输出为：

```
l1 capture <div id=​"l1">​…​</div>​
l2 target <div id=​"l2">​</div>​
l1 bubbling <div id=​"l1">​…​</div>​
```

# target与currentTarget

`addEventListener`的事件处理函数中`this`不一定指向事实上被点击的元素，
但事件处理函数的参数Event对象提供了`target`和`currentTarget`属性来区分这当前对象与目标对象。
我们可以把它们都全部输出：

```
l1.addEventListener('click', function (e) {
  console.log('l1 capture', this, e.currentTarget, e.target);
}, true);
l2.addEventListener('click', function (e) {
  console.log('l2 target', this, e.currentTarget, e.target);
});
l2.addEventListener('click', function (e) {
  console.log('l2 target, invalid capture', this, e.currentTarget, e.target);
}, true);
```

结果是：

```
l1 capture  <div id=​"l1">​…​</div>​  <div id=​"l1">​…​</div>​  <div id=​"l2">​</div>​
l2 target   <div id=​"l2">​</div>​   <div id=​"l2">​</div>​   <div id=​"l2">​</div>​
l1 bubbling <div id=​"l1">​…​</div>​  <div id=​"l1">​…​</div>​  <div id=​"l2">​</div>​
```

可见`currentTarget`总是和`this`相同，而`target`指向事实上被点击的目标DOM对象。

[jquery-event]: {% post_url 2015-06-26-jquery-event %}
[js-event]: {% post_url 2015-07-31-javascript-event %}