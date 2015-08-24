---
layout: blog
categories: web
title: 页面回流与重绘（Reflow & Repaint）
tags: 回流 重绘 HTML CSS JavaScript
---

如果你的HTML变得很大很复杂，那么影响你JavaScript性能的可能并不是JavaScript代码的复杂度，而是页面的回流和重绘。

**回流**（Reflow）是指布局引擎为frame计算图形的过程。
frame是一个矩形，拥有宽高和相对父容器的偏移。frame用来显示盒模型（content model），
但一个content model可能会显示为多个frame，比如换行的文本每行都会显示为一个frame。

> 关于CSS盒模型的介绍请参考：[CSS 盒模型及其呈现方式][css-display]

**重绘**（Repaint）发生在元素的可见性发生变化时，比如背景色、前景色等。
因此回流必然会引起重绘。

<!--more-->

# HTML 布局

HTML使用流式布局模型（flow based layout），
这意味着多数情况下一次扫描就可以计算所有的图形显示。
处于流后面的元素一般不会影响前面元素的图形，
所以布局过程可以从左到右、从上到下来进行。

所有的HTML回流都是从根frame开始（HTML标签）的，递归地处理部分或全部子frame。
回流过程中也可能创建新的frame，比如文本发生了换行。
一个frame的回流会导致它的所有父节点以及所有后续元素的回流。

有些HTML回流是立即执行的（immediate to user or script）并且会影响整个frame树，
比如窗口大小变化、更改文档的默认字体；有些HTML回流则是异步的、渐进的（incremental），
比如更多的文档流从网络中到达，这些渐进的回流可以入队列进行批量处理。

# 回流的原因

浏览器在实现回流时，会递归地处理frame。 每个frame的回流都有一个原因，
这个原因会随着frame逐级向下传递（传递过程中可能会改变）。
回流的原因决定了当前frame的回流行为，有这样5种原因：

1. 初始化（Initial）。DOM载入后的第一次回流，将会遍历所有frame。
2. 渐进（Incremental）。当一个frame发生渐进回流时，意味着它前面的元素都没有变，
    而是它里面的元素变了。这会引起自底向上的作用。
3. 改变大小（Resize）。元素的容器边界发生变化时，此时元素内部状态没变。
    在计算自顶向下的布局约束的同时，可以复用内部状态。
4. 样式改变（StyleChange）。整个frame树都应得到遍历。
5. Dirty。当一个容器已经缓存了多个子元素的Incremental回流时，该容器出于Dirty的状态。

前面四种原因的回流都是在Presentation Shell中立即调用的，
而最后一种回流只有Incremental回流已经到达目标frame时才进行。
（因为这时自底向上的影响才被计算出来，才能决定容器的图形显示）

如果你是Web开发者，可能更关注的是哪些具体原因会引起浏览器的回流，下面罗列一下：

1. 调整窗口大小
2. 改变字体大小
3. 样式表变动
4. 元素内容变化，尤其是输入控件
5. CSS伪类激活
6. DOM操作
7. `offsetWidth`, `width`, `clientWidth`, `scrollTop/scrollHeight`的计算，
    会使浏览器将渐进回流队列Flush，立即执行回流。

既然提到了`offsetHeight`，来总结一下这几个容易混淆的HTML元素属性吧：

* `clientHeight`: 内部可视区域大小。

    > returns the inner height of an element in pixels, including padding but not the horizontal scrollbar height, border, or margin

* `offsetHeight`：整个可视区域大小，包括border和scrollbar在内。

    > is a measurement which includes the element borders, the element vertical padding, the element horizontal scrollbar (if present, if rendered) and the element CSS height.

* `scrollHeight`：元素内容的高度，包括溢出部分。

    > is a measurement of the height of an element's content including content not visible on the screen due to overflow

* `scrollTop`：元素内容向上滚动了多少像素。

    >  the number of pixels that the content of an element is scrolled upward. 

![][height]

# 最佳实践

对我们Web开发者最有用的还是如何去做，才能减少页面回流。先来个例子：

```javascript
var s = document.body.style; 

s.padding = "2px"; // 回流+重绘
s.border = "1px solid red"; // 再一次 回流+重绘

s.color = "blue"; // 再一次重绘
s.backgroundColor = "#ccc"; // 再一次 重绘

s.fontSize = "14px"; // 再一次 回流+重绘

// 添加node，再一次 回流+重绘
document.body.appendChild(document.createTextNode('abc!'));
```

可以看到每次DOM元素的样式操作都会引发重绘，如果涉及布局还会引发回流。
该例子来源于：http://www.blogjava.net/BearRui/archive/2010/05/10/320502.html

避免大量页面回流的手段也有很多，其本质都是尽量减少引起回流和重绘的DOM操作：

1. 避免逐项更改样式。最好一次性更改`style`属性，或者将样式列表定义为`class`并一次性更改`class`属性。
2. 避免循环操作DOM。创建一个`documentFragment`或`div`，在它上面应用所有DOM操作，最后再把它添加到`window.document`。
    
    > 也可以在一个`display:none`的元素上进行操作，最终把它显示出来。因为`display:none`上的DOM操作不会引发回流和重绘。
3. 避免循环读取`offsetLeft`等属性。在循环之前把它们存起来。
4. 绝对定位具有复杂动画的元素。绝对定位使它脱离文档刘，否则会引起父元素及后续元素大量的回流。
    
    > 使用CSS3的transition也可以获得不错的性能。

[height]: /assets/img/blog/css/height.png
[css-display]: {% post_url 2015-05-28-css-display %}

