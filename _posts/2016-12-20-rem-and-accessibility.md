---
title: 使用 rem 提供一致的字体大小 
tags: CSS Chrome 字体 font-size
---

# REM 的用途

猴子都知道在 Web 页面中可以用 px (1/100英寸) 来做字体或宽高的单位，
虽然 px 的字面含义是像素但它早已不是指物理像素，而是跨操作系统的、跨浏览器的长度单位。
比如在 2x 像素密度的Ritina 屏上 `1px` 会自动占据两倍的长度。

> pt 常被用于打印字体，为 1/72 英寸，类似的还有`in`, `cm`, `mm`, `pc`。
> 这类绝对像素因[渲染不一致且无法被 UA 缩放][w3c-tips]而
> 很少在 Web 中应用。当然浏览器并没有那么笨，下文有对此更详细的讨论。

而 px 的问题在于我们想让整个页面字体变大一些的时候需要更改所有的字体。
于是我们开始使用相对于父元素的像素单位`em`，
在标签嵌套时这样层级的继承（compounding problem）会令人相当困惑。
为此建议使用`rem`作为像素单位，该像素单位只相对于根元素`<html>`。
这样一来问题的关键便是**控制根元素的字体大小**。

# 根元素默认字体大小

[CSS3 标准][css3-font-size]并未提及`font-size`的默认值，但 [MDN][mdn-font-size] 指出浏览器默认值通常为 16px：

> If you haven't set the font size anywhere on the page, then it is the browser default, which is often 16px. So, by default 1em = 16px, and 2em = 32px. If you set a font-size of 20px on the body element, then 1em = 20px and 2em = 40px. Note that the value 2 is essentially a multiplier of the current em size. -- MDN

多数浏览器的行为也确实如此：

浏览器 | 版本 | 默认 `font-size`
--- | --- | ---
Chrome OSX | 55.0.2883.95 (64-bit) | 16px
Chrome iOS | 55.0.2883.79 | 16px
QQ iOS | 7.1.1.2771 | 16px
UC iOS | UC 不显示版本 | 16px
Chrome Android | 49.0.2623 | 16px
QQ Android | 7.1.1.2865 | 16px
UC Android | UC 不显示版本 | 16px

我们可以认为根元素的默认字体就是`16px`，如果使用它作为基准像素单位转换会相当麻烦。
例如对 UE 给出的`10px`设计宽度，我们需要转换为`0.625rem`。

# 根元素字体设置

实践中往往通过设置根元素字体为`10px`来方便转换，下面是 MDN 给的例子：

```css
html {
  /* 当设置根元素字体大小为百分比时，相对于浏览器默认设置（16px） */
  font-size: 62.5%; /* font-size 1em = 10px on default browser settings */
}
span {
  /* 10px */
  font-size: 1rem;
  /* 25px */
  font-size: 2.5rem;
}
```

更改根元素字体大小可能会受到浏览器限制，比如中文 Chrome（Android、OSX版本）
的最小字体默认为`10px`。根元素的`10px`字体大小就会失效，但并非简单地重置为`12px`。
Chrome OSX 55.0.2883.95 (64-bit) 中`font-size:10px`根元素的行为如下：

* 以`rem`为单位设置的字体大小拥有`12px`的下限，如`font-size:1rem`将被显示为`12px`，`font-size:2rem`将被显示为`20px`。
* 以`rem`为单位设置的宽高将以`12px`作为基，如`height:1rem`将被现实为`12px`，`height:2rem`将被显示为`24px`。

因此 MDN 的方案在国内并不合适，当然可以设置一个很大的`font-size`来绕过该问题，
例如目前百度结果页的`font-size`设为`100px`，仍然保证了较容易的单位转换。
除此之外，设置根`font-size`还会有其他问题：
本来未设置`font-size`的元素它的大小依赖于浏览器默认，设置根元素字体大小会改变它们的大小，这意味着你需要重设所有元素的字体。可能需要遍历地改动站点内所有的 CSS。

# 可访问性的讨论

本文讨论的可访问性具体是指使用图形用户代理的用户，
可以按照自己的需求暂时或永久地设置自己的字体大小偏好。

由于相对长度单位总是可以被浏览器缩放的，
原则上只要我们使用相对的长度单位都可以达到这一目的，
[W3C 给出的相对单位][w3c-relative]包括：

* `em`：相对于当前元素的实际`font-size`。
* `ex`：相对于第一个可用自体的`x-height`。
* `ch`：相对于"0"的 advanced measure，即考虑所有字体设置（包括`text-orientation`, `text-transform`等）后的大小。
* `rem`：相对于根元素的实际`font-size`。

**对开发者而言，使用这些相对长度单位就不会有可访问性问题**。
并非只有使用`rem`才能获得浏览器的缩放支持
（见 Gion Kunz 的这篇文章： [R.I.P. REM, Viva CSS Reference Pixel][gk] ），
即便是 CSS3 标准也未提及推荐使用`rem`而抛弃`px`。

> 事实上，即使是`pt`这样的绝对单位浏览器也可以进行缩放
> （当然不应依赖于浏览器来兼容我们的代码）。

# 常见实践

任何一种相对长度单位都没有可访问性问题，但使用`rem`可以使你有能力动态地进行整页缩放。
比如在某些（逻辑）像素密度很高的设备上，可以适当调大根元素字体。
所以我们有两种选择：`font-size:100px`，或者接受浏览器默认（`16px`）。

`font-size` | 优点 | 缺点
--- | --- | ---
`100px` | 方便的单位转换 | 会破坏未设置`font-size`的元素的样式，仍然可能被浏览器限制
浏览器默认 | 未设置`font-size`的元素仍然正常，不会有兼容性问题 | 需要去习惯`16px`作为长度单位

[css3-font-size]: https://drafts.csswg.org/css-fonts-3/#propdef-font-size
[mdn-font-size]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
[w3c-tips]: https://www.w3.org/QA/Tips/font-size
[w3c-relative]: https://www.w3.org/TR/css-values-3/#relative-lengths
[gk]: https://mindtheshift.wordpress.com/2015/04/02/r-i-p-rem-viva-css-reference-pixel/
