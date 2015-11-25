---
layout: blog
categories: web
title: 各种CSS选择器的优先级
tags: CSS HTML 盒模型
---

CSS规则之间可以互相覆盖，这一点我们应该已经习以为常了。然而正是由于规则之间可以互相覆盖、子元素继承父元素的默认行为，导致了CSS冲突的问题。
碰到CSS冲突时，通常我们会加入一些更加详细的规则来明确如何显示，以此解决冲突。通常越详细的规则优先级会越高，但优先级究竟是如何定义的呢？

首先根据CSS定义位置来区别，优先级从低到高如下：

* 浏览器默认样式（Browser Default Style）
* 外部样式表
* 内部样式表
* 行内样式 (e.g., style="font-weight:bold")

同样定义位置的规则，根据不同类型选择器的个数来确定。选择器的优先级从低到高如下规则：

* F: Universal selectors (e.g., *)
* E: Type selectors (e.g., h1)
* D: Class selectors (e.g., .example)
* C: Attributes selectors (e.g., [type="radio"])
* B: Pseudo-classes (e.g., :hover)
* A: ID selectors (e.g., #example)

> 即 ID > 伪类 > 属性 > 类 > 元素 > 通配符，首先我们数规则中ID的个数，ID个数越多的规则优先级越高。如果相同，再数伪类，以此类推。

<!--more-->

来个例子：

```css
article p span{
  color: blue;
}
#red{
  color: red;
}
```

* `article p span`的优先级："A=0, B=0, C=0, D=0, E=3, F=0 (000030)"
* `#red`的优先级："A=1, B=0, C=0, D=0, E=0, F=0 (100000)"（更高！）

再比如：

```css
#wrapper header div nav #gnavi{
  list-style-type: none;
}
#top #hright #gnavi{
  list-style-type: square;
}
```

* `#wrapper header div nav #gnavi`的优先级："A=2, B=0, C=0, D=0, E=3, F=0 (200030)"
* `#top #hright #gnavi`的优先级："A=3, B=0, C=0, D=0, E=0, F=0 (300000)"（更高！）

此外，**最高优先级的是`!import`的属性**，如果都加了`!important`那就继续数规则中属性和元素的个数。

> 能避免`!important`的话就不要这样写了，这样的样式太难扩展了。

参考链接： 

* http://www.w3.org/wiki/CSS/Training/Priority_level_of_selector
* http://www.hongkiat.com/blog/css-priority-level/
