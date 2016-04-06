---
layout: blog
title: 如何使用 CSS 截断文本？ 
tags: CSS HTML 盒模型 text-overflow overflow line-clamp 优雅降级 inline
---

在很多UI设计中会限制文本长度，这时需要我们适当地截断文本显示省略号。
同时响应式布局也要求动态的文本长度，在大屏幕中显示较长文本，而在小屏幕中显示较少文本。
显然用CSS比JS能够更简洁地完成这项工作。
下文介绍了对单行/多行文本如何进行截断，以及何种情况下截断不起作用。先看图：

![@2x](/assets/img/blog/css/text-overflow-ellipsis.png)

<!--more-->

# text-overflow

`text-overflow: ellipsis`属性作用于块级元素，当文本溢出时显示省略号。
要注意的是，设置`ellipsis`的同时需要禁止换行，并隐藏溢出部分：

```css
.ellip{
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
```

> 什么是块级元素？参考：[CSS Display属性与盒模型][css-display]

# line-clamp

有时我们希望显示两行文本，第二行溢出部分显示省略号。怎么办呢？
其实这在理论上是不可能办到的，标准CSS并未提供这样的行为。
但我们可以在webkit浏览器中近似实现，并在其他浏览器中优雅降级。
下图中显示了三行文本：

![line clamp][line-clamp]

需要设置`display`为`-webkit-box`以及方向为纵向，
然后使用`-webkit-line-clamp`来只显示三行文本，溢出部分会显示为省略号。
在非webkit内核的浏览器中降级：设置`max-height`并使用`overflow:hidden`隐藏溢出部分。

```css
.ellip-block{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  /* degradation */
  height: 52px;
  overflow: hidden;
}
```

# 行内元素截断

`text-overflow`只作用于块级元素，所以我们给一个`display:inline|inline-block`
的元素设置该属性是无效的。例如：

```html
<!--span默认以inline显示-->
<span class="ellip">Cras vestibulum erat ultrices neque. Praesent rhoncus</span>
```

> 什么是块级元素/行内元素？参考：[CSS Line Box：块级元素与行内元素][line-wrap]。

为了达到截断效果，我们可以给`<span>`的上层块级元素设置`text-overflow`，比如一个`<div>`：

```html
<div class="ellip">
  <span>Cras vestibulum erat ultrices neque. Praesent rhoncus</span>
</div>
```

除了行内元素，`ellipsis`元素里面的浮动元素也是不会被截断的。

[text-overflow]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow
[line-clamp]: /assets/img/blog/css/line-clamp.png
[css-display]: {% post_url 2015-05-28-css-display %}
[line-wrap]: {% post_url 2015-06-12-css-line-wrap %}

