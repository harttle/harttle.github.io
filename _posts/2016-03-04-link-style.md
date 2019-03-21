---
layout: blog
title: 玩转超链接的样式
tags: CSS HTML inline-block white-space 伪类 字体 盒模型 选择符
---

超链接虽然不起眼，但它却是万维网（Web）的基石，它使得用户可以在整个万维网进行导航。
链接的默认样式却很低调，在富有设计感的网站中通常会重写链接的样式。
下文介绍常用的一些链接样式技巧：链接状态选择符、自定义下划线、设置外链样式、按钮的实现等。

## 链接状态选择符

超链接标签有很多状态：未访问、已访问、悬停、激活。这些都可以通过CSS伪类选择符来识别。
其中悬停和激活是一般HTML元素都具有的状态，对于链接而言，当鼠标悬停时`:hover`生效，
点击后`:active`生效。比如我们设置未访问的链接呈蓝色，已访问的链接呈绿色：

```css
a:link {color: blue;}
a:visited {color: green;}
a:hover, a:active {color: red;}
```

<!--more-->

> 关于伪类选择器的概述可以参考：[CSS选择符总结][selector]

超链接默认的下划线有时会在设计上造成过分的强调和凌乱感，一般倾向于去掉它。
同时在鼠标悬停时我们希望给用户一定的操作反馈。可以这样做：

```css
a:link, a:visited {text-decoration: none;}
a:hover, a:active {text-decoration: underline;}
```

注意上面两行代码的顺序是重要的。如果反过来`:hover`和`:active`是不生效的。

```css
a:hover, a:active {text-decoration: underline;}
a:link, a:visited {text-decoration: none;}
```

这是因为`:link, :visited`与`:hover, :active`选择的元素是存在交集的。
而这四个选择符具有同样的优先级，这时按照CSS的规则最后一条声明生效。
CSS优先级在[各种CSS选择器的优先级][css-prior]一文中有详述。
在使用这四个选择器时，建议使用这样的顺序（从一般到特殊）：

```
:link, :visited, :hover, :active
```

## 自定义下划线

超链接的下划线是由`text-decoration`属性指定的，本身它的样式是不可自定义的。
但我们可以用一个背景图来做到：

```css
a {
    color: #666;
    text-decoration: none;
    background: url(underline.gif) repeat-x left bottom;
}
```

> 设置背景图片的语法可参考[那些 CSS 背景图的技巧][bg]一文。

背景图片也存在缺点，现代页面很少用很多图片来辅助做样式了，
甚至sprite也逐渐由字体文件所代替了。自定义下划线的另一个办法是设置`border-bottom`：

```css
a{
    text-decoration: none;
    border-bottom: 1px dotted #000;
}
```

## 设置外链样式

有时我们希望在样式上标识所有出站的链接，比如在右上角加一个图标：

![ext-link][ext-link]

CSS提供了非常强大的选择符，可以通过属性选择符来判断外链：

```css
a {
    background: url(images/externalLink.gif) no-repeat right top;
    padding-right: 10px;
}
a[href^=/], a[href^=http://hartle.com], a[href^=http://blog.harttle.land]{
    background-image: none;
    padding-right: 0;
}
```

先设置右上角的图片，然后添加另一条规则将自己网站排除在外。
其中`href^=/`匹配的是所有具有以`/`开头属性值的标签。参考：[CSS选择符总结][selector]
当然，还可以单独设置某种文件类型（后缀）的链接，例如`a[href$=".pdf"]{...}`。

## 创建按钮

怎样用CSS创建一个按钮呢？我们来看看Bootstrap是怎样做的：

```css
.btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px
}
```

其中重要的几个设置包括：

* `inline-block`显示，这样才能设置`padding`（准确的说，这时内边距才会影响行高，见[CSS Display属性与盒模型][display]）。
* `cursor:pointer`设置光标为手型，这才是按钮嘛！
* `border`和`border-radius`设置一个有圆角的边框。

除此之外，Bootstrap提供了`.btn-primary`, `.btn-success`等六个类来设置色调。
这些类与`.btn`类同时使用，例如：

```html
<a class="btn btn-success">Click Me</a>
```

同时Bootstrap还通过`:hover`和`:active`来加深色调来给用户反馈：

```css
.btn-success {
    color: #fff;
    background-color: #5cb85c;
    border-color: #4cae4c
}
.btn-success:hover,.btn-success:focus,.btn-success:active{
    color: #fff;
    background-color: #449d44;
    border-color: #398439
}
```

[css-prior]: /2015/07/16/css-priority.html
[selector]: /2015/09/11/css-selector.html
[bg]: /2016/02/27/background-image.html
[ext-link]: /assets/img/blog/css/ext-link@2x.png
[display]: /2015/05/28/css-display.html
