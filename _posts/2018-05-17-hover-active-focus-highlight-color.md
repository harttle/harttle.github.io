---
title: 点击态样式：focus, active, hover 的区别与兼容性
tags: focus hover active CSS
---

本文的核心问题是 **如何实现点击态效果**。移动端浏览器中没有鼠标的概念，
但滚动、点击等概念仍然成立，于是鼠标相关的这些伪类就不太容易理解。
在阅读本文的同时可以用手头的浏览器尝试 [这个 Demo][demo]。**TL;DR**：

* PC 上使用 `:hover` 判断鼠标悬停；使用 `:active` 匹配鼠标左键（primary button）按下。
* 移动上使用 `:active` 判断手指按下，要兼容 iOS 需要绑一个 [touch 类事件][touchevents]。
* 使用 `-webkit-tap-highlight-color` 禁用移动浏览器的默认（UA-defined）点击态。

<!--more-->

## focus

[:focus](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus) 匹配获得焦点状态。
获得焦点有很多方式，比如用户点击或 tap 一个控件，比如按 Tab 键切换选中。

* 在 PC 浏览器中，通过 Tab 和鼠标点击都可以选中元素，除非点击页面其他地方让它失去焦点，否则 `:focus` 伪类一直生效。
* 在移动浏览器中，`:focus` 只在 Android 下生效 iOS 下不起作用。参见这个讨论：<https://stackoverflow.com/questions/49434808/safari-anchor-tags-with-href-attribute-not-getting-focus>

事实上，并非所有元素都可以获得焦点，比如一个简单的 `<p>Hello</p>` 就无法获得焦点，点击和 Tab 都不会让它选中。
哪些元素可以获得焦点定义在 [DOM Level 2][dom-l2] 中，大概包括这几类：

* 有 href 的 A 标签
* Input, Select 等表单控件
* Iframe
* 指定了 tabindex 属性的元素

> 参考这个列表：<https://gist.github.com/jamiewilson/c3043f8c818b6b0ccffd>

## hover

[:hover](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover) 匹配用户鼠标悬停状态。

* 在 PC 浏览器中，只要鼠标移动到元素上，它的 `:hover` 伪类就会立即生效，鼠标移走就会立即失效。
* 在移动浏览器中，`:hover` 的表现类似 PC 下的 `:focus`：在用户点击页面其他位置时，`:hover` 态才会消失。

## active

[:active](https://developer.mozilla.org/en-US/docs/Web/CSS/:active) 匹配激活的元素，典型地就是正在于用户进行交互的元素。

* 在 PC 浏览器中，按下鼠标即可激活元素 `:active` 生效，松开鼠标就会取消激活状态 `:active` 失效。
* 在移动浏览器中，手指按下就会激活 `:active` 状态，手指松开就会取消激活状态 `:active` 失效。

但是：在 Safari 下如果你的元素没有绑定 `touchstart`, `touchmove`, 或 `touchend`，元素就不会进入 `:active` 状态。
可以通过 `addEventListener` 或 `ontouchstart=""` 的方式给它添加这个事件，或者使用这个 npm 包：<https://www.npmjs.com/package/active-touch>。

尽管如此，`:active` 是上述几种伪类中唯一的可以在移动浏览器中匹配按下状态的伪类。兼容性还不错，可以用你的手机浏览 [这个例子][demo]。

## Tap Highlight

细心的你可能发现了，在几乎所有移动浏览器中手指按下时浏览器默认会进行高亮，这个高亮颜色会叠加在背景色上。
尤其是在 iOS 下，高亮块的大小还超过了 CSS 盒子本身的大小。这是 Webkit 内核实现的私有 CSS 属性：
[-webkit-tap-highlight-color](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-tap-highlight-color)。

`-webkit-tap-highlight-color` 在 Android 下多为蓝色，在 iOS 下多为灰色且大小略大于当前元素，
iOS 下高亮背景的激活还会略晚于 `:active`。要禁用它可以设置为透明：

```css
a {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
```

这个高亮颜色块是直接盖在目标元素之上的。所以如果要设置为其他颜色，注意要添加透明度，否则元素内容会被高亮色完全盖住。

## 总结

浏览器                | PC                           | iOS<sup>\*</sup>           | Android<sup>\*</sup>
---                   | ---                          | ---                        | ---
`:focus`              | 持续到失去焦点               | 不可用                     | 松开时进入，持续到失去焦点
`:hover`              | 悬停期间                     | 按下时进入，持续到失去焦点 | 按下时进入，持续到失去焦点
`:active`             | 鼠标左键<sup>*</sup>按下期间 | 按下期间，但需绑定事件     | 按下期间
`tap-highlight-color` | 不可用                       | 按下期间，进入时稍有延迟   | 按下期间

其中，

* **iOS** 指最新 iOS 下的绝大多数浏览器，它们对上述四者的表现完全一致。包括 UIWebview 实现的 UC Browser、手机百度，也包括 WkWebview 实现的 QQ 浏览器、Chrome。
* **Android** 指 Android 下绝大多数浏览器，它们对上述四者的表现完全一致。
* **鼠标左键** 是指 Primary Button，也就是右手鼠标的左键。

[demo]: https://harttle.land/active-focus-hover-highlight
[dom-l2]: https://www.w3.org/TR/DOM-Level-2-HTML/html.html
[touchevents]: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
