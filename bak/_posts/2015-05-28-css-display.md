---
layout: blog 
categories: web
title: CSS Display属性与盒模型
tags: CSS HTML
---

因为HTML流式文档的特性，页面布局往往是新手最为头疼的问题之一。
每个HTML元素都会渲染为一个Box，可分为inline Box和block Box。
根据`display`属性的不同，Box的呈现方式又有所不同。
本文首先引入CSS盒模型，然后通过不同的`display`属性分别介绍Box常见的呈现方式。

# Box Sizing：元素大小的计算方式

在HTML中，任何HTML元素都会被呈现为一个矩形。该矩形由内容、内边距、边框、外边距构成。举个例子：

```html
<style>
.box-demo{
  width: 100px;
  height: 100px;
  border: 50px solid green;
  padding: 30px;
  margin: 50px;
  background: yellow;
}
</style>
<div class="box-demo"></div>
```

上述的`<div>`中，内容、边距与边框如下图所示：

![](/assets/img/blog/css/content-box@2x.png)

* 黄色的背景作用于**内容**和**内边距**构成的矩形，其宽高为`160px`：宽度`100px`+两侧的内边距`30px`X2；
* 绿色部分为**边框**，宽度为`50px`；
* 与浏览器边框的距离为**外边距**，宽度为`50px`。

例子中`width`属性定义的是内容的宽度，不包含边距、边框。然而在IE中`width`定义的是内容+内边距+边框的宽度。
这是由`box-sizing`属性来定义的，前者的默认值为`content-box'，后者的默认值为`border-box`。

<!--more-->

# Display：渲染类型

了解了`box-sizing`之后，我们回到**display**属性。`display`指定了元素渲染Box的类型（type of rendering box）。我们来看它常用的取值：

* `none`: 隐藏元素；
* `inline`：行内元素，顾名思义，用于把一个元素放在行的内部；
* `block`：块元素，用于显示占用一行的块；
* `inline-block`：以`block`的方式渲染，以`inline`的方式放置；
* `table-cell`：以表格元素的方式显示。

# 隐藏元素

`none`是最容易理解的取值。当一个元素的`display`CSS属性被设为`none`时，该元素不会被渲染，也不会占位，就像不存在一样。对布局不会产生任何影响。

# 行内元素

行内（`inline`）元素不会打断文本流，默认（UA）显示为`inline`的元素包括：`<span>`，`<a>`，`<em>`等。它们的出现不会使得后续元素另起一行。行内元素可以设置`margin`与`padding`，但`margin`只在水平方向上起作用：

```css
div{
  display: inline;
  background: red;
  padding: 10px;
  margin: 10px;
}
```

![](/assets/img/blog/css/inline@2x.png)

上图中，红色背景的是一个`<div>`，其大小为内容大小+`padding`；左右的空隙即为外边距`margin`。可以看到在Chrome中，这个`inline`的`<div>`遮挡了出现在它前面的文本，同时被出现在它后面的文本所遮挡。这正是流式文档的特性。

另外，对`inline`元素设置`width`与`height`是不起作用的。

# 块元素

块（`block`）元素会中断当前的文本流，另起一行，并在父元素中尽可能地占据最大宽度。常见的块元素有`<p>`,`<div>`,`<section>`等。通常块元素不可包含在行内元素内部。例如下面的两个`<p>`标签，不论内容是否足够，都会占据整个`body`的宽：

![](/assets/img/blog/css/block@2x.png)

# 行内块

行内块（`inline-block`）将会产生一个块元素，并以行内元素的方式放置。什么意思呢？该元素的样式是以块元素的方式来渲染的，例如可以设置宽和高，然后以行内元素的方式放置在其上下文中，就像在行内元素的位置上替换成这个块元素一样。

> MDN：The element generates a block element box that will be flowed with surrounding content as if it were a single inline box.

同样地，我们在一行文本内加入一个`<div>`，这次将它的`display`设为`inline-block`：

```css
div{
  display: inline-block;
  background: yellow;
  padding: 10px;
  margin: 10px;
  height: 20px;
}
```

此时，垂直方向的`margin`和`height`都起作用了：

![](/assets/img/blog/css/inline-block@2x.png)

* 蓝色部分为内容，可以看到其高度为`20px`；
* 绿色部分为`10px`的`padding`；
* 接着，`border`为空；
* 红色为`10px`的`margin`。

`inline-block`与`inline`的不同在于：垂直方向上的`margin`也会起作用，并且可以设置`width`和`height`。`inline-block`是非常常用的样式设置。

# 表格元素

`display`设为`table-cell`的元素与`<td>`标签的行为一致，即：可设置`padding`，不接受`margin`，可伸缩的`width`。

> IE6/7不支持`table-cell`，然而WinXP已经下架。Win7的标配是IE8。现在可以放心地使用`table-cell`了！

利用`table-cell`属性可以在不写`<table>`标签的情况下完成表格布局：

```html
<style>
.left, .right{
  display: table-cell;
  line-height: 50px;
}
.left{
  background: yellow;
  min-width: 150px;
}
.right{
  background: lightgreen;
  width: 100%;
}
</style>

<div>
  <div class="left">This is left cell</div>
  <div class="right">This is right cell</div>
</div>
```

左侧固定`150px`宽度，右侧自适应：

![](/assets/img/blog/css/table-cell@2x.png)

