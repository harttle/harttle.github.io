---
title: 各种CSS选择器的优先级
tags: CSS HTML 伪类 选择符
---

由于规则之间可以互相覆盖、子元素会继承父元素的部分规则，导致了CSS冲突的问题。
碰到CSS冲突时，通常我们会加入一些更加详细的规则或调整规则顺序来解决冲突。
那么优先级究竟是如何定义的呢？

先给出结论：ID>类或伪类或属性>类型或伪元素>通配选择器，
外部样式表和内部样式表拥有相同的优先级，
HTML style属性拥有最高优先级，浏览器默认样式（UA Default）优先级最低。
对于相同优先级的规则，写在后面的会覆盖前面的。

<!--more-->

# CSS标准

根据[CSS3标准中关于选择符优先级的说明][css3-spec]，CSS选择器的优先级计算方式如下：

1. 记ID选择器的个数为`a`
2. 记类选择器、属性选择器、伪类选择器的个数为`b`
3. 记类型选择器（元素名）、伪元素选择器的个数为`c`
4. 忽略所有的通配选择器（`*`）

注意：

* 将`a`, `b`,`c`连接起来构成整个选择符的优先级。
* 否定伪类选择器`:not()`中的选择符同样会被计算优先级，但否定选择器本身不计算。
* 外部样式表与当前文件内样式表具有同样的优先级。
* [CSS2.1标准][css21-spec]中指出，HTML`style`属性比样式表拥有更高的优先级。
* 重复同样的选择符可用来增加优先级（例如`.active.active`）。

# 一个例子

```css
*               /* a=0 b=0 c=0 -> 优先级 =   0 */
li              /* a=0 b=0 c=1 -> 优先级 =   1 */
ul li           /* a=0 b=0 c=2 -> 优先级 =   2 */
ul ol+li        /* a=0 b=0 c=3 -> 优先级 =   3 */
h1 + *[rel=up]  /* a=0 b=1 c=1 -> 优先级 =  11 */
ul ol li.red    /* a=0 b=1 c=3 -> 优先级 =  13 */
li.red.level    /* a=0 b=2 c=1 -> 优先级 =  21 */
#x34y           /* a=1 b=0 c=0 -> 优先级 = 100 */
#s12:not(foo)   /* a=1 b=0 c=1 -> 优先级 = 101 */
```

> 代码来源：<https://www.w3.org/TR/css3-selectors/#specificity>

# 外部样式表

外部样式表（`<link>`）与文件内样式表（`<style>`）具有相同的优先级。
Demo如下：

```
// file: index.html
<h2>hello</h2>
<style>
  h2 {
    color: red;
  }
</style>
<link rel="stylesheet" href="./index.css">

// file: index.csscss
h2{
  color: blue;
}
```

`index.html`的`<h2>`在Chrome中显示为蓝色，证明`<style>`优先级并不比`<link>`高。

# 参考阅读

* http://www.w3.org/wiki/CSS/Training/Priority_level_of_selector
* http://www.hongkiat.com/blog/css-priority-level/
* https://www.w3.org/TR/css3-selectors/#specificity
* https://www.w3.org/TR/2011/REC-CSS2-20110607/cascade.html#specificity

[css3-spec]: https://www.w3.org/TR/css3-selectors/#specificity
[css21-spec]: https://www.w3.org/TR/2011/REC-CSS2-20110607/cascade.html#specificity
