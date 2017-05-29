---
layout: blog
categories: web
title: CSS选择符总结
tags: CSS DOM HTML 伪类 选择符
---

我们知道CSS是由选择符和属性/值列表构成的，选择符的重要性自然不言而喻。
作为前端开发者选择符想必不是问题，然而前几天面试还真问到了`~`和`+`是干吗用的！
长时间不用的选择符自然就会忘了，来总结一下吧！

> 万维网联盟在 HTML 4.0 之外提出层叠样式表（CSS），使用CSS完成样式与内容的分离。**层叠样式表（Cascading Style Sheets，CSS）**，
> 又称串样式列表、层次结构式样式表文件，一种用来为结构化文档（如HTML文档或XML应用）添加样式（字体、间距和颜色等）的计算机语言，由W3C定义和维护。

CSS共有5种基本选择器：

1. 类型选择器（`h1`,`p`等）：用于选择指定类型的HTML标签；
2. 类选择器（`.classname`）：用于选择指定class的HTML标签；
3. ID选择器（`#idname`）：用于选择指定id的HTML标签；
4. 通配符选择器（`*`）：用于选择所有类型的HTML标签；
5. 属性选择器（`[foo='bar']`）：用于选择某属性为指定值的HTML标签；

和2种伪选择器：

1. 伪类选择器：用于选择特定状态的元素。
2. [伪元素选择器][pseudo-ele]：如`:before`,`:first-letter`，用于向某些选择器设置特殊效果，以实现复杂的样式。

还有各种组合选择符（例如` `, `+`, `>`, `~`），用来选择拥有特定层级的元素。至于CSS选择器发生冲突时它们的优先级，参见另一篇文章：
[CSS规则的优先级匹配][css-pri]

<!--more-->

# 类型/类/ID

类型选择器、类选择器和ID选择器是最常用的，不解释了：

```css
body{
  margin: 20px;
}
.avatar{
  width: 100px;
  height: 100px;
}
#btn-save{
  color: green;
}
```

# 伪类

**伪类**（如`:hover`,`:focus`）是浏览器生成的，不出现在HTML文件中，通常用于标识用户操作造成的元素状态改变。

```css
.avatar:hover{
  cursor: pointer;
}
```

伪类选择器还有很多：

* `:active`：向被激活的元素添加样式 
* `:focus`：向拥有键盘输入焦点的元素添加样式 
* `:hover`：当鼠标悬浮在元素上方时，向元素添加样式 
* `:link`：向未被访问的链接添加样式 
* `:visited`：向已被访问的链接添加样式 
* `:first-child`：向元素的第一个子元素添加样式
* `:lang`：  向带有指定 lang 属性的元素添加样式

`:first-child`在表格上会很好用，比如我们希望表格的第一列高亮：

```css
table tr td:first-child{
  background: yellow;
}
```

`nth-child(an+b)`是`first-child`的增强版，可用于在画廊布局中清除浮动。
比如我们堆叠地显示位置数目的块每行显示3个，那么为了避免因高度不一致产生怪异的流式布局，
我们希望第3n+1个元素清除左浮动：

```css
.block:nth-child(3n+1){
  clear: left;
}
```

> 注意`nth-child`是在Selectors Level 3才加入的，IE9一下不支持哦！

参考：

* http://www.w3school.com.cn/css/css_pseudo_classes.asp
* https://developer.mozilla.org/zh-CN/docs/Web/CSS/%3Anth-child

# 属性

**属性选择器** 用来选择特定属性值的元素，例如`div[class=avatar]`可以选择`class`属性为`avatar`的`<div>`元素，当然HTML元素的属性很多，属性选择器可以匹配任何属性。
属性选择器还支持更复杂的匹配，例如：

* `[src]`：选择所有定义了 src 属性的元素
* `[abc^="def"]`：选择 abc 属性值以 "def" 开头的所有元素
* `[abc$="def"]`：选择 abc 属性值以 "def" 结尾的所有元素
* `[abc*="def"]`：选择 abc 属性值中包含子串 "def" 的所有元素
* `img[src|="figure"]`：选择 src 属性的第一个单词是 "figure" 的元素，例如 "figure-1", "figure-2"
* `[title~=flower]`：选择 titile 属性包含单词 "flower" 的元素

# 组合选择符

**组合选择符** 可描述元素之间的层级关系，例如：`A > B`表示是`A`的子元素的所有`B`。组合选择符也有很多：

* `ul li`：空格表示*后代选择器*，选择所有出现在`ul`上下文里的`li`；
* `ul>li`：`>`表示*子元素选择器*，比后代选择器缩小了范围，只选择（下一级）子元素；
* `h1+p`：`+`表示*相邻兄弟选择器*，选择紧接在 h1 元素后出现的段落，h1 和 p 元素拥有共同的父元素；
* `h1~p`：`~`表示*通用兄弟选择器*，同上，但 p 不一定是紧跟 h1。

> 有人认为`,`也属于组合选择符，我认为它只是方便写CSS的一个语法，允许同时给多个选择符定义一套样式。

参考：

* http://www.w3school.com.cn/css/css_selector_type.asp

[pseudo-ele]: http://www.w3school.com.cn/css/css_pseudo_elements.asp
[css-pri]: /2015/07/16/css-priority.html

