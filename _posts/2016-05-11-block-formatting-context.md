---
layout: blog
title: 利用overflow控制float元素（BFC）
tags: CSS HTML float overflow BFC
---

HTML采用流式布局方式，CSS的`float`在这种环境下非常重要。
`float`常与`overflow`配合使用都是因为`overflow`会创建新的BFC，进而影响布局。
本文从三个方面介绍`overflow`对浮动的影响：清除环绕，包裹浮动元素，以及独立布局环境。在此之前先来了解一下什么是BFC：

**BFC**（Block Formatting Context，布局上下文）
是CSS渲染过程中进行布局的盒子，所有浮动子元素都在盒子内进行布局。
也就是说BFC内的浮动元素不会影响到BFC外部，BFC外部的环境也不会影响BFC内的布局。
MDN共列出8类元素可以生成一个BFC，包括浮动和绝对定位元素、行内块，以及`overflow`不为`visible`的元素。
可见，**设置`overflow:hidden`可以开启一个BFC**。

参考：<https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context>

# 清除环绕效果

和其他的流式文档（包括Microsoft Word文档）一样，
为了支持环绕布局CSS引入了浮动的概念。
使得后续的文档流能够环绕在浮动元素的周围。例如：

```html
<div style="border:1px solid #000;width:300px;">
  <div style="float:left;background: yellow;height:100px;width:150px;">float:left</div> 
  <div> Eros. Nunc ac tellus in sapien molestie rhoncus. Pellentesque nisl. Praesent venenatis blandit velit. Fusce rutrum.  Leo diam interdum ligula, eu scelerisque sem purus in tellus.</div>
</div>
```

<!--more-->

左侧`<div>`浮动，右侧`<div>`会环绕左侧的浮动元素。

<div style="border:1px solid #000;width:300px;margin-bottom:15px;">
<div style="float:left;background: yellow;height:100px;width:150px;">float:left</div> 
<div> Eros. Nunc ac tellus in sapien molestie rhoncus. Pellentesque nisl. Praesent venenatis blandit velit. Fusce rutrum.  Leo diam interdum ligula, eu scelerisque sem purus in tellus.</div>
</div>

但是当我们需要分栏布局时，就要清除环绕效果。有多种方式可以做到这一点：

* 给右侧`<div>`添加`margin-left`。
* 给父容器的`::after`设置`clear:both`（见[利用浮动和清除浮动进行布局][float]一文）。

本文要介绍的方法是为右侧`<div>`设置`overflow:hidden`。这样右侧就会形成一个BFC其内部布局不受外部浮动的影响，因此也就不会环绕左侧`<div>`了。

```html
<div style="float:left;border:1px solid #000;width:300px;">
  <div style="background: yellow;height:100px;width:150px;">float:left</div> 
  <div style="overflow:hidden"> Eros. Nunc ac tellus in sapien molestie rhoncus. Pellentesque nisl. Praesent venenatis blandit velit. Fusce rutrum.  Leo diam interdum ligula, eu scelerisque sem purus in tellus.</div>
</div>
```

效果如下：

<div style="border:1px solid #000;width:300px;">
<div style="float:left;background:yellow;height:100px;width:150px;">float:left</div> 
<div style="overflow:hidden"> Eros. Nunc ac tellus in sapien molestie rhoncus. Pellentesque nisl. Praesent venenatis blandit velit. Fusce rutrum.  Leo diam interdum ligula, eu scelerisque sem purus in tellus.</div>
</div>
<p></p>

# 包裹浮动元素

> 如果一个父元素内只包含浮动元素，那么如何让父元素包裹子元素呢？

这是一个前端开发中很常见的布局问题。
存在浮动子元素时，父元素的高度是可能小于子元素的。
比如我们给父元素设置红色背景：

```html
<div style="background:red;width:300px;">
  <div style="width:150px;height:100px;float:left;border:1px solid #000;">Child</div>
  Parent
</div>
```

子元素超出来啦！父元素的红色背景没有完全应用到子元素上。

<div style="background:red;overflow:visible;width:300px;">
  <div style="width:150px;height:100px;float:left;border:1px solid #000;">Child</div>
  Parent
</div>
<div style="clear: both;margin-bottom:15px;"></div>

这时为父元素设置`overflow:hidden`，它便成为一个BFC。

```html
<div style="overflow:hidden;background:red;width:300px;">
  <div style="width:150px;height:100px;float:left;border:1px solid #000;">Child</div>
  Parent
</div>
```

BFC内部元素不能影响外部，因此浮动子元素不可显示在父元素之外。
而父元素高度为零，难道不显示子元素了吗？
CSS决定这时就用父元素来包裹子元素吧！
于是父元素便和子元素等高了，红色背景也就显示出来。

<div style="overflow:hidden;background:red;width:300px;">
  <div style="width:150px;height:100px;float:left;border:1px solid #000;">Child</div>
  Parent
</div>

# 独立布局环境

`overflow:hidden`可以开启一个布局上下文（BFC），内部布局不会受外部影响。这在嵌套的浮动布局中非常有用。
考虑如下场景：

> 整个页面采用两栏布局：左侧是Sidebar定宽且向左浮动，右侧是Content自适应。
> 我们计划在右侧Content中显示用户列表。

```html
<div style="width:320px;border:1px solid black;">
  <div style="float:left;width:100px;background:yellow;height:200px;">Sidebar</div>
  <div>
    <p style="background:lightblue;"> User: Alice </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Bob </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Charlie </p>
  </div>
</div>
```

假如每个用户内部布局存在着某种浮动，于是我们需要在每个用户之后清除浮动。
这会发生什么？

<div style="width:320px;border:1px solid black;">
  <div style="float:left;width:100px;background:yellow;height:200px;">Sidebar</div>
  <div>
    <p style="background:lightblue;"> User: Alice </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Bob </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Charlie </p>
  </div>
</div>
<div style="margin-bottom:15px;"></div>

用户列表中的`clear:both`将整个页面布局的浮动清除了！
从第2个用户开始，都跑到边栏Sidebar的下面了。
为了给右侧容器创建独立的布局环境，我们给右侧容器添加`overflow:hidden`：

```html
<div style="width:320px;border:1px solid black;">
  <div style="float:left;width:100px;background:yellow;height:200px;">Sidebar</div>
  <div style="overflow:hidden">
    <p style="background:lightblue;"> User: Alice </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Bob </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Charlie </p>
  </div>
</div>
```

设置`overflow:hidden`的右侧`<div>`会被渲染成一个BFC（布局上下文），
外部浮动元素（Sidebar）就不会影响BFC内部布局了：

<div style="width:320px;border:1px solid black;">
  <div style="float:left;width:100px;background:yellow;height:200px;">Sidebar</div>
  <div style="overflow:hidden">
    <p style="background:lightblue;"> User: Alice </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Bob </p>
    <div style="clear: both;"></div>
    <p style="background:lightblue;"> User: Charlie </p>
  </div>
</div>


[float]: {% post_url 2016-01-28-css-floating %}
