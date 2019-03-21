---
layout: blog
title: 利用浮动和清除浮动进行布局
tags: float overflow CSS HTML
---

CSS有三种基本定位方式：正常流（static），浮动（float），绝对定位（absolute、fixed）。
HTML元素默认采取正常流的方式进行布局，而浮动是HTML布局中最常用的定位方式。
下面先探讨浮动定位的行为，然后介绍一个需要清除浮动的场景，以及几种替代方案。

## 浮动

浮动元素会向左/右偏移，直至外边界碰到容器或另一个元素的边缘。
浮动会使得元素脱离文档流，后面元素进行布局时，前面的浮动元素就像不存在一样。

![float right][fr]

如果右侧没有足够空间，浮动元素就会下坠，直到有足够的空间（折行）。
如果浮动元素有着不同的高度，那么可能在下坠过程中卡在某个位置。

![get-stuck][stk]

<!--more-->

## 清除浮动

虽然浮动也会使元素脱离文档流，但与绝对定位不同，后续元素仍然会为浮动元素腾出空间。
这可以导致文字环绕的效果，这也是浮动的初衷之一。

![float-around][around]

如果希望某一行停止环绕，可以为该行设置清除浮动（`clear`）。它有四种值：`left`, `right`, `both`, `none`，表示哪个方向不应当与浮动元素相邻。
CSS渲染器通过添加`margin-top`来达到这个效果。例如：

![float clear][clear]

## 浮动容器

如果你写前端已经有一段时间了，那么一定会发现浮动元素不占据父容器的空间。
这使得父容器大小为零，当然父容器的边框和背景就会失效：

![float container][fc]

但是有没有发现我们为任何一个元素清除浮动都打不到效果。这时我们需要一个额外的空元素，
并设置`clear:both`：

![float container clear][fcc]

通过额外的元素我们达到了效果，为此[Bootstrap][bs]可以提供了`clearfix`类。
Bootstrap中这个空元素可以这样写：

```html
<div class="clearfix"></div>
```

## 替代方案

### 让容器也浮动

但强迫症患者一定不喜欢这个额外的`div`，一个替代方式是将容器也浮动起来。
当然这会造成后续元素的布局也需要浮动，所以有些网站里几乎所有元素都在浮动！

### 设置容器overflow

将容器的`overflow`设置为`auto`或`hidden`也可以达到效果。
但设置`overflow`有时候会产生我们不希望的行为。

### CSS伪元素

为了不要那个额外的空元素，我们可以用CSS来为容器添加一个伪元素：

```css
.clear:after {
    content: ".";
    height: 0;
    visibility: hidden;
    display: block;
    clear: both;
}
```

> 在IE6以下的浏览器中，还需要设置`height: 1%`（IE BUG）。

其实和空元素的原理是一样的...只是这个元素是运行时产生的，不过代码还是整洁了。
之所以`display:block`，是因为`clear`的原理是自动添加`margin-top`，
而该属性对行内元素是不起作用的。

[fr]: /assets/img/blog/css/float-right@2x.png
[stk]: /assets/img/blog/css/float-get-stuck@2x.png
[around]: /assets/img/blog/css/float-arount@2x.png
[clear]: /assets/img/blog/css/float-clear@2x.png
[fc]: /assets/img/blog/css/float-container@2x.png
[fcc]: /assets/img/blog/css/float-container-clear@2x.png
[bs]: http://www.bootcss.com/
