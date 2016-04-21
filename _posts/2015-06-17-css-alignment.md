---
layout: blog 
title: inline元素的对齐问题
tags: CSS HTML inline inline-block 盒模型
---

元素对齐是CSS中最常见的问题之一，控制元素对齐的属性包括`text-align`, `verticle-align`, `margin`, `line-height`等。
本文便来探讨inline元素的对齐行为，以及`text-align`和`verticle-align`的使用方法，并给出实例。

# text-align

[text-align][ta]指定了行内内容（例如文字）如何相对它的块父元素对齐。**作用于当前元素的子元素，且子元素需是`inline`的**。例如：

常用的取值有：`left`, `right`, `center`。

```html
<style>
.right{
  text-align: right;
}
</style>
<div class="right">
  <span>Gesetz zur Änderung des Fernstra</span>
</div>
```

![css: pull right](/assets/img/blog/css/pull-right@2x.png)

# vertical-align

[vertical-align][va]指定行内（inline）元素或表格单元格（table-cell）元素的垂直对齐方式。
与`text-align`不同，**`vertical-align`作用于当前元素**。

> 为什么要是行内元素呢？因为如果是块元素的话，它总是会占据整行，就无所谓谁和谁垂直对齐了。

常用的取值有：`top`, `bottom`, `middle`，默认值为`baseline`。

<!--more-->

```html
<style>
  .block1 {
    display: inline-block;
    height: 150px;
    background: gold;
  }

  .block2 {
    display: inline-block;
    vertical-align: bottom;
  }
</style>

<div class="block1">Be holographic for whoever lures</div>
<div class="block2">Eheu, rector!</div>
```

让`.block2`对齐整行的底部：

![vertical bottom](/assets/img/blog/css/vertical-bottom@2x.png)

注意：`vertical-align`指定的对齐顶部、底部或中间是**相对于当前行而不是父元素**。例如：

```html
<style>
  .block {
    height: 150px;
    background: gold;
  }
  .block span{
    vertical-align: bottom;
  }
</style>

<div class="block">
  <span>Be holographic for whoever lures</span>
</div>
```

上面的CSS不会将`span`对齐到父元素的底部，因为`span`单独构成了一行。效果如下：

![vertical bottom failed](/assets/img/blog/css/vertical-bottom-failed@2x.png)

# 实例：表单元素对齐

输入控件（`input`）和标签（`label`）之间的对齐是Web开发中最常见的问题之一。来个例子：

```html
<form>
  <input placeholder="Input your username...">
  <button>Submit</button>
</form>
```

上述的表单中，有一个输入空间和一个按钮。因为`vertical-align`的默认值为`baseline`，所以它们的文字基线是对齐的：

![form baseline](/assets/img/blog/css/form-baseline@2x.png)

假设由于种种原因，我们给`button`添加了上下不对称的`padding`：

```css
form button{
  padding-bottom: 20px;
}
```

可以看到它仍然是按照`baseline`对齐的：

![form baseline vertical padding](/assets/img/blog/css/form-baseline2@2x.png)

然而，我们希望的是整个`button`和`input`的中线对齐，此时便可以重设它的`vertical-align`属性：

```css
form button{
  padding-bottom: 20px;
  vertical-align: middle;
}
```

现在它们终于居中对齐啦！

![form middle](/assets/img/blog/css/form-middle@2x.png)

[ta]: https://developer.mozilla.org/zh-CN/docs/CSS/text-align
[va]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/vertical-align
