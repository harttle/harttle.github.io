---
layout: blog
title: 那些 CSS 背景图的技巧
tags: CSS HTML float 搜索引擎
---

HTML的精髓在于文本的、结构化的数据格式。
这样的设计使得搜索引擎、屏幕阅读器、文本处理软件能够非常方便地读取信息。
尤其是CSS样式的分离与HTML5语义标签的提出，使得HTML的这一特性更加明显。
然而对于Web设计师，他们需要除文本外更加丰富的表示形式。
幸运的是CSS的分离，使得我们在不添加标记的同时，可以在页面上显示图片。
下面来看看这些有用的CSS背景图技术。

<!--more-->

# 基本使用

在CSS中，通过`background`属性可以设置背景图片：

```css
body{
    background: url(bg.gif);
}
```

通过`url`可以指定背景为URL处的图片。默认情况下该图片会随着元素的大小进行横向和纵向的平铺。可以设置只在某个方向平铺，也可以设置不平铺：

```css
body{
    background: url(bg.gif) no-repeat;
}
```

平铺属性有5种取值：

值 | 含义
---|---
`repeat`	| 默认。背景图像将在垂直方向和水平方向重复。
`repeat-x`  |	背景图像将在水平方向重复。
`repeat-y`  |	背景图像将在垂直方向重复。
`no-repeat` |	背景图像将仅显示一次。
`inherit` |	规定应该从父元素继承 background-repeat 属性的设置。

# 无限长背景

有时我们希望设置整页的背景。但图片高度是固定的，
当页面高度大于图片时，背景图便会戛然而止。
当然你可以选择一个非常长的图片，但页面的长度仍然是不可预测的。
但如果设置背景图的同时设置一个与背景图底部相同的背景色，
那么图片和背景色便会无缝连接起来。这是Web设计中非常经典的解决方案。

```css
body{
    background: #ccc url(bg.gif) repeat-x;
}
```

`bg.gif`底部颜色为`#ccc`，当页面向下滚动时颜色过渡便会非常平滑。

# 显示单张图片

显示单张图片当然可以用`<img>`标签，但根据语义标签的精神，
如果图片并非页面内容，而只是用于显示和设计意图时（Logo、标签页、圆角图片等），
使用标签便不太合适了。这时我们也是用CSS的`background`来完成这项工作：

```css
#logo{
    width: 300px;
    height: 50px;
    background: url(logo.png) no-repeat;
}
```

# 项目符号

背景图还可以设置位置，这在为每一行设置项目符号时很有用。例如下图左侧的项目符号：

![bullet][bullet]

需要设置图片位置为水平居左，垂直居中；同时需要将项目文字设置左内边距。

```css
h1{
    padding-left: 30px;
    background: url(bullet.png) no-repeat left center;
}
```

除了`left`, `center`关键字，还可以是像素值，或百分比。
设置像素值时图片左上角会从元素的左上角进行偏移，
而设置百分比时会选择图片中对应的参考点进行偏移：

![background-positioning][background-positioning]

项目符号的CSS等效于：

```css
h1{
    padding-left: 30px;
    background: url(bullet.png) no-repeat 0 50%;
}
```

> 原则上，数值和关键字不可混用。虽然多数时候都没问题，但有些浏览器中这会导致页面无效。这会影响整个页面的渲染，参见：[文档类型与浏览器模式][doctype]

# 圆角

在CSS3提出`border-radius`属性之前，Web设计师需要用背景图完成圆角。
现在不用这样了~ 稍微介绍一下原理吧。首先我们需要两张图片：

* `top-left.png`：包括左上的圆角和足够长的向右延伸的矩形；
* `top-right.png`：只包含右上的圆角。

`top-left.png`位置设置为`left top`，`top-right.png`位置设置为`right top`。
然后`top-right.png`会遮挡`top-left.png`的矩形部分，形成圆角的边框：

![rounded-corner][rounded-corner]

# 阴影

在CSS3提出`box-shadow`属性之前，阴影也是靠背景图完成的。
看代码：

```css
div.img-wrapper{
    background: url(shadow.png) no-repeart bottom right;
    clear: right;
    float: left;
}
```

为什么要`float`呢？因为`<div>`是块级元素会填满整行，背景图会出现在页面最右端。
这是我们不希望的结果。设置`float: left`后该`<div>`的宽度便会收缩为实际大小。
`clear:right`会使得该`<div>`对外的表现仍然像块级元素一样。

# 图片替换技术

HTML文本非常棒，搜索引擎友好，支持复制粘贴，支持屏幕阅读器。
可是Web开发中只有有限的一些字体可用，为了更好地进行排版，
有时需要用图片来替换文字。为了符合HTML5的精神，仍然需要提供对应的文字，
只是不显示而已。
典型的技术包括FIR（Fahrner Image Replacement）、Phark、Gilder/Levin等等。
我们介绍常用的几种。

最直接是FIR技术：设置背景图，并通过`display:none`隐藏文字。

```html
<h2>
    <span>Hello World</span>
</h2>
```

```css
h2 {
    background:url(hello_world.gif) no-repeat;
    width: 150px;
    height: 35px;
}
span {
    display: none;
}
```

这对于搜索引擎是完美的解决方案，但有些屏幕阅读器会忽略隐藏的元素。
Phark方法对屏幕阅读器更加友好：

```html
<h2> Hello World </h2>
```

```css
h2 {
    text-indent: -5000px;
    background:url(hello_world.gif) no-repeat;
    width: 150px;
    height:35px;
}
```

这应当是近乎完美的解决方案。但是与FIR一样有一个特殊场景：
当用户启用CSS但由于带宽原因禁用图片后，用户将访问不到文本信息。
因此，对于关键信息和导航，应避免这两种方法。
这时可以去查阅Gilder/Levin方法、IFR、sIFR技术。

[bullet]: /assets/img/blog/css/bullet@2x.png
[background-positioning]: /assets/img/blog/css/background-positioning@2x.png
[doctype]: /2016/01/22/doctype.html
[rounded-corner]: /assets/img/blog/css/rounded-corner@2x.png
