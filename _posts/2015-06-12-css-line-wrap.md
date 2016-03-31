---
layout: blog 
title: CSS Line Box：块级元素与行内元素
tags: CSS DOM HTML inline inline-block overflow text-overflow white-space 盒模型
---

CSS 将 DOM 树转换为由矩形 Box 构成的树，并通过设置这些 Box 的属性来改变其位置和大小，描述每个元素或文本的布局。这些 Box 分为三个级别：

* `block-level` Box：`display`属性为`block`的Box，比如段落标签`<p>`；
* `inline-level` Box：`display`属性为`inline-block`的Box，它们就像一行中的单词一样布局。它里面可以包含其他`inline-level`的Box，也可以包含`block-level`的Box；
* Line Box：一行单词就构成一个LineBox，这种Box是自动生成的，可以看做是`inline-level`Box的容器。

溢出、折行、断词是Line Box中常见的问题，设置这些行为的CSS属性包括`white-space`、`line-spacing`、`text-overflow`、`word-wrap`、`word-break`等。
下面几小节中详细介绍这些属性的取值与对应的行为、以及常见的使用方法。

更多信息请参考：[W3C 标准：CSS3-Box][css-box]

# line Box

下面的小节中介绍的CSS属性只适用于LineBox，那么什么是LineBox呢？请看下面的HTML片段：

```html
<ul>
 <li>The first item in the list.
 <li>The second item.
</ul>
```

`ul`会生成一个`block-level`的 Box，然后为每个`li`元素生成一个`block-level`的 Box。
而每个`li`的 Box 中有一个Line Box，它包含了两个`inline-level`的 Box：
一个用来显示“ &middot; ”，一个用来显示文本。

> 如果`li`产生了换行，将会变成多个`inline-level`Box，如果在`ul`中间产生了分页，那么`ul`会显示为两个`block-level`Box。

<!--more-->

# white-space

[white-space][white-space]属性描述了如何处理空白（空格、制表、换行）字符。它有5种取值：

```css
white-space: normal | pre | nowrap | pre-wrap | pre-line;
```

* `normal`：连续的空白符会被合并，换行符会被当作空白，宽度不够时会折行。
* `nowrap`：同`normal`，但不会折行。
* `pre`：连续的空白符会被保留，换行符、`<br>`也会引起换行，但不会折行。
* `pre-wrap`：同`pre`，但是会折行。
* `pre-line`：同`pre-wrap`，但是连续的空白符会被合并。

> 合并的空白宽度由`word-spacing`属性设置。

# word-wrap

只有出现空白字符时，才可以设置`white-space`来折行。如果需要切分单词，你需要设置[word-wrap][word-wrap]属性。
`word-wrap`指定了当一个不能被分开的单词太长引起溢出时，是否允许中断换行。有两种取值：

```css
word-wrap: normal | break-word;
```

默认为`normal`，设置为`break-word`后，当单词太长要溢出时中断换行，如下图：

![@2x](/assets/img/blog/css/word-break-break-word.png)

# word-break

[word-break][word-break]指定了怎样在单词内换行。有三种取值：

```css
word-break: normal | break-all | break-word | keep-all
```

* `normal`：使用浏览器默认行为，不做任何断词，但会优先考虑在空白字符处折行。如下图。

    ![@2x](/assets/img/blog/css/word-break-normal.png)

* `break-word`：与设置`word-wrap:break-word`的效果相同。


* `break-all`：可在任意字符间断行。此时不会优先考虑在空白字符处折行，而是平铺所有字符，需要折行时断词，如图。

    ![@2x](/assets/img/blog/css/word-break-break-all.png)

* `keep-all`：同`normal`，但 CJK 文本不断行。

# text-overflow

[text-overflow][text-overflow]指定了溢出的内容如何显示，只在`inline`方向溢出时起作用，有3种取值：

```css
text-overflow: clip|ellipsis|string;
```

`clip`为隐藏溢出的部分，`ellipsis`为显示省略号，`string`为使用给定的字符串来代替被剪掉的文本。
其中`ellipsis`最为常用，通常设置`text-overflow`的同时需要设置`white-space: nowrap; overflow: hidden`：

![@2x](/assets/img/blog/css/text-overflow-ellipsis.png)

[css-box]: http://www.w3.org/TR/css3-box/
[word-wrap]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-wrap
[word-break]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-break
[white-space]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/white-space
[text-overflow]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow
