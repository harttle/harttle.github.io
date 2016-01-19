---
layout: blog
title: CSS 外边距合并
tags: CSS HTML inline-block
---

外边距合并是CSS中一个特殊的概念。当两个外边距相邻时，它们会合并为较大的那一个。
无论是相邻元素的上下边距，还是父子元素的上边距，甚至是同一元素的上下边距。

## 相邻元素

当两个元素上下相邻时，上面的下外边距会与下面元素的上外边距会合并。

![contain@2x][ct]

<!--more-->

## 父子元素

父子元素如果都有上边距，会合并为其中较大的那一个。

![top-bottom@2x][tp]

当然，只有两个外边距直接相邻时才会合并。如果父元素有内边距（`padding`）或边框（`border`），那么它们不会被合并。

## 单个元素

如果一个元素没有内容，也没有内边距和边框，那么它的上下外边距也会合并。

![self][self]

很奇怪对吧，还有更奇怪的：连续相邻的外边距都是可以合并的。
空元素的上下边距合并时，如果紧接着另一个元素的外边距，它们都会合并到一起。

![all][all]

这就是为什么连续的`<p></p>`其实占位很小。它们的上下边距会合并，
空元素的上下边距也会合并。这一布局行为在这个场景下是非常有用的。

[tp]: /assets/img/blog/css/margin-collapsing-top-bottom.png
[ct]: /assets/img/blog/css/margin-collapsing-contain.png
[self]: /assets/img/blog/css/margin-collapsing-self@2x.png
[all]: /assets/img/blog/css/margin-collapsing-all@2x.png
