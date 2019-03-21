---
layout: blog
title: jQuery中$()函数有几种用法
tags: DOM HTML JavaScript jQuery 事件 选择符 链式调用
excerpt: DOM选择，可以指定上下文；DOM创建，可以指定所属的document、属性、事件、甚至所有jQuery方法；DOM加载完成事件监听，是`$(document).ready()`的简化写法。
---

[jQuery][jquery]想必是当前前端开发中必不可少的组件。它提供了DOM对象的封装、统一的事件机制、以及一系列的工具函数。
由于面试中突然被问及jQuery中`$()`有几种用法，瞬间有点懵并未答全。
虽说这样的问法颇似孔乙己问“茴香豆的茴有几种写法？”，但还是借此机会来整理知识，伺机学习一把！

首先我们需要引入jQuery，如果你还没有听过jQuery，请移步其他文章或者在你的网站中引入这个：

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
```

jQuery的`$()`函数文档在这里： <http://api.jquery.com/jQuery/>
jQuery的`$()`函数的用法包括：

* DOM选择，可以指定上下文；
* DOM创建，可以指定所属的document、属性、事件、甚至所有jQuery方法；
* DOM加载完成事件监听，是`$(document).ready()`的简化写法。

## DOM选择

最常用的便是通过选择符来选择：

```javascript
jQuery( selector [, context ] )
```

看到没？第二个可选参数可以指定上下文，它的类型可以是DOM对象也可以是jQuery对象。例如，找`ul`下的所有`li`：

```javascript
$ul = $('ul');
$li = $.('li', $ul);
```

相当于：

```javascript
$li = $ul.find('li');
```

除了选择符，还可以用DOM对象、DOM对象数组、jQuery对象、甚至一个普通对象作为参数。它们将会被包装成jQuery对象。

<!--more-->

## DOM创建

用jQuery来创建DOM也是常见操作，例如在`ul`下创建一个`li`：

```javascript
// 方法声明
jQuery( html [, ownerDocument ] )
// 例子
$('<li>').appendTo($ul);
```

注意第二个可选参数，默认值是当前jQuery被载入的那个Document。
如果希望在IFrame中创建的元素，则必须指定Document，因为jQuery是使用`window.document.createElement`来创建DOM元素的。
这里要求知道新元素所属的`document`对象。例如：

```javascript
$("<p>hello iframe</p>", $("#myiframe").prop("contentWindow").document)
```

创建DOM元素时，除了可以指定document，还可以指定元素属性：

```javascript
// 方法声明
jQuery( html, attributes )
// 例子
$('<a>', {
    href: 'http://jquery.com'
});
// 当然你笨笨地写也是可以的：
$( "<a href='http://jquery.com'></a>" );
```

更加有趣的是，从jQuery1.8开始，创建元素时不仅可以指定属性，所有`$.fn.`方法都可以指定，例如：

```javascript
$( "<div/>", {
  "class": "test",
  text: "Click me!",
  click: function() {
    $( this ).toggleClass( "test" );
  }
}).appendTo( "body" );
```

## DOM加载完成

通常JavaScript需要在DOM加载完成后执行，否则DOM操作可能会失效。jQuery提供了一个方便的方法来监听DOM加载完成：

```javascript
// 方法声明
jQuery( callback )
// 例子
$(function(){
    // DOM载入后执行
});
```

`$(callback)`只是`$(document).ready(callback)`的缩写，
两种写法的作用相同，返回值也都是包含`document`的jQuery对象。

这里提一下`$(document).ready`和`$(window).load`的区别：

* 前者会在HTML文档载入后，并且DOM就绪后调用。
* 后者会在HTML文档载入后，DOM就绪后，页面渲染结束（iframe、img加载完成）后调用。

[jquery]: http://api.jquery.com/
