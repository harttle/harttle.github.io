---
layout: blog
categories: web
title: 页面回流与重绘（Reflow & Repaint）
tags: 回流 重绘
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

# 回流的实现

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

# 最佳实践

前面首先介绍了HTML布局的过程，此后谈到了浏览器对回流的实现。
对我们Web开发者最有用的还是如何去做，而不是浏览器的实现细节。现在便来总结一下。

计算frame的图形显示时浏览器会维护一个回流原因，那么这些原因对应着哪些操作呢？

1. 调整窗口大小
2. 改变字体大小
3. 样式表变动
4. 元素内容变化，尤其是输入控件
5. CSS伪类激活
6. DOM操作
7. `offsetWidth`和`offsetHeight`的计算

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

[height]: /assets/img/blog/css/height.png
[css-display]: {% post_url 2015-05-28-css-display %}

