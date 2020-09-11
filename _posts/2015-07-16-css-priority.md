---
title: CSS 选择器优先级
tags: CSS HTML 伪类 选择器
---

由于 CSS 规则之间可以互相覆盖、子元素会继承父元素的规则，CSS 规则很容易冲突。
此时要想强制应用某个规则，除了加 `!important` 外，我们就需要理解 CSS 优先级的计算方式。那么优先级究竟是如何定义的呢？

**TL; DL**

1. *ID 选择器* 高于 *类/伪类/属性选择器* 高于 *标签名或伪元素*，忽略 *通配选择器*
2. 外链样式文件（link[rel=stylesheet]）和内联样式（style 标签）优先级相同
3. style 属性（Attribute）拥有最高优先级，浏览器默认样式（UA Default）优先级最低
4. 优先级相同的规则，后面的会覆盖前面的

<!--more-->

## CSS 标准

根据 [CSS3 标准中关于选择器优先级的说明][css3-spec]，CSS 选择器的优先级计算方式如下：

1. 记 ID 选择器的个数为 `a`
2. 记类选择器、属性选择器、伪类选择器的个数为 `b`
3. 记标签名选择器、伪元素选择器的个数为 `c`
4. 忽略所有的通配选择器（`*`）

注意：

* 将 `a`, `b`, `c` 连接起来构成整个选择器的优先级。
* 否定伪类选择器 `:not()` 中的选择器同样会被计算优先级，但否定选择器本身不计算。
* 外部样式表与当前文件内样式表具有同样的优先级。
* [CSS2.1 标准][css21-spec] 中指出，HTML `style` 属性比样式表拥有更高的优先级。
* 重复同样的选择器可用来增加优先级（例如 `.active.active`）。

## 一个例子

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

## 外部样式表

外部样式表（`<link>`）与文件内样式表（`<style>`）具有相同的优先级。
Demo 如下：

```
// file: index.html
<h2>hello</h2>
<style>
  h2 {
    color: red;
  }
</style>
<link rel="stylesheet" href="./index.css">

// file: index.css
h2{
  color: blue;
}
```

`index.html` 的 `<h2>` 在 Chrome 中显示为蓝色，证明 `<style>` 优先级并不比 `<link>` 高。

## 参考阅读

* <http://www.w3.org/wiki/CSS/Training/Priority_level_of_selector>
* <http://www.hongkiat.com/blog/css-priority-level/>
* <https://www.w3.org/TR/css3-selectors/#specificity>
* <https://www.w3.org/TR/2011/REC-CSS2-20110607/cascade.html#specificity>

[css3-spec]: https://www.w3.org/TR/css3-selectors/#specificity
[css21-spec]: https://www.w3.org/TR/2011/REC-CSS2-20110607/cascade.html#specificity
