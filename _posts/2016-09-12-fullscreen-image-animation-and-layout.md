---
title: 全屏预览图片的动画和自适应布局
tags: CSS HTML JavaScript innerHeight jQuery scrollTop 事件 兼容性 动画 横屏
---

本文探讨如何在Web浏览器中实现兼容性较好的全屏图片浏览控件，
即要支持绝大多数浏览器，适应不同分辨率的移动设备，
以及适应移动端的横屏、竖屏切换。

文中代码用于阐释原理和探讨机制，如果你在寻找拿来即用的第三方库，
请参考这些项目：

* <http://ashleydw.github.io/lightbox/>
* <http://lokeshdhakar.com/projects/lightbox2/>

<!--more-->

# 全屏和暗色背景

全屏图片浏览最核心的功能就是在全屏的黑色背景中显示一张图片。
HTML非常简单：

```html
<div class="wrapper">
  <img src="http://harttle.land/assets/img/favicon.png">
</div>
```

只需将背景设为黑色，设置很大的`z-index`来防止被遮挡，
并且绝对定位（下面会讨论到为什么`fixed`的兼容性问题）到全屏即可。

```css
.wrapper{
    position: fixed;
    z-index: 1000;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
```

# 图片居中

`<img>`横向与纵向都需要居中，且宽度不可超出容器。
横向居中可以使用左右自动边距，麻烦的是又要在流式的HTML中搞纵向居中。
Harttle能想到这几种实现方式：

* 保持`<img>`为行内元素，硬编码行高为屏幕高度，需要JavaScript。
* 绝对定位到`top:50%`，硬编码上边距为负的图片高度。
* 设置`<img>`为`table-cell`，使用`vertical-aligh:middle`纵向居中。
* 使用传说中的flex。诸多浏览器连border都有问题，flex会打死一片的国产浏览器。

> 感谢[小武][xuexb]评论，通过`fixed + left 50%,top 50% + transform:translate(-50%, -50%)`也可完美实现。

Harttle有洁癖，完成此任务不可使用任何JavaScript，以及硬编码的宽高属性。
因此只有方案三可行，大致代码如下：

```html
<table>
  <td>
    <img src="http://harttle.land/assets/img/favicon.png">
  </td>
</table>
```

也可以不写`table`,`td`标签，用`display: table`, `disply: table-cell`代替。
不管怎样这需要额外的标签，以及臭名昭著的table布局。
我们在下文给出Harttle更喜欢的方案。

# 如何绝对定位？

上文中使用`fixed`来布局整个容器，然而`fixed`总有一些莫名其妙的问题。
例如Android UC浏览器中，`fixed`元素的`z-index`渲染不正常导致内容不会被显示。
总之我们偏好`absolute`绝对定位以获得更好的兼容性。
我们在从`fixed`切换到`absolute`之前先来了解一下它们的区别：

* `fixed`定位相对于屏幕位置，即位置不随页面滚动而变化。
* `absolute`定位相对于第一个非`static`定位的父元素，比如`body`。

> 文档：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/position>

这意味着`absolute`定位的元素与`body`的相对位置是不变的，会随着`body`的滚动而滚动。
这不符合我们的全屏设想，解决办法是在`.wrapper`中捕获到`mousewheel`事件并禁止滚动行为。

```
.wrapper{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
```

```javascript
$('.wrapper').on('mousewheel', function(e){
    e.preventDefault();
});
```

> 关于如何禁止事件传递与事件默认行为，请参考[jQuery事件：bind、delegate、on的区别][jqe]一文。

除此之外，还应注意的是当用户在页面已经发生滚动后（`body.scrollTop`不为零）再初始化全屏控件，
`.wrapper`元素仍然会出现在`body`起始的位置，因为它是相对于`body`定位的。
所以需要在初始化全屏控件后为`.wrapper`元素设置`top`与`height`：

```javascript
$('.wrapper')
    .css('top', document.body.scrollTop + 'px')
    .css('height', window.innerHeight + 'px');
```

# 缩放打开动画

如果能从一个缩略图通过放大动画打开全屏控件，那该是怎样一种体验？
只需要为`.wrapper`元素设置一个从小变大的动画。

```javascript
// 先获取缩略图的位置矩形
var rect = $('img.thumbnail').offset();
// 将全屏控件缩放到缩略图上方
$('.wrapper')
    .css('left', rect.left)
    .css('top', rect.top)
    .css('width', rect.width)
    .css('height', rect.height)
// 等待页面渲染结束
setTimeout(function(){
    // 放大到全屏
    var to = {
        left: 0,
        top: document.body.scrollTop,
        width: window.innerWidth,
        height window.innerHeight
    };
    // 开始动画
    $('.wrapper').animate(to, 1000);
});
```

> 需要注意的是对`width`和`height`做动画也有性能问题，
> 可以考虑使用`scale3d`+`translate3d`的方式，需要不少的计算哈~

上述代码应该在点击缩略图`img.thumbnail`时得到执行，只需要绑定其`onclick`事件。
点击关闭全屏控件也是同样的道理。

# 自适应的布局

绝对定位布局中很容易想到绝对定位`img`元素，这便需要计算图片位置。
而自适应布局的`img`可以减少很多代码，于是也就减少了很多bug。

原理很简单，图片容器`.wrapper`绝对定位，而图片本身在容器中自适应布局。
最方便的实现是使用`background-image`属性：

```css
.wrapper{
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('http://harttle.land/assets/img/favicon.png');
    background-size: contain;
}
```

注意到上述代码中不包含任何对图片宽高和位置的计算，
这意味着在初始化、动画、横屏发生时省略了不少代码。

# 横屏支持

使用`absolute`代替`fixed`意味着需要手动计算位置，该位置(`scrollTop`)在横屏时会发生变化。
所以需要适时地更新：

```javascript
$(window).on('orientationchange', function(){
    // 等待DOM渲染结束
    setTimeout(function(){
        $('.wrapper')
            .css('top', document.body.scrollTop + 'px')
            .css('height', window.innerHeight + 'px');
    }, 200);
    // 时间设为0，在微信浏览器中仍然不能正确获取宽高
    // 参考：http://stackoverflow.com/questions/12452349/mobile-viewport-height-after-orientation-change
});
```

> 当然上面这段代码和全屏控件初始化时是一样的。它们应当被抽取为公用方法，类似`.updatePosition()`。

因为图片是自适应布局的，我们在横屏情况下图片会自动旋转过来，
而不需要重新为之计算宽高和位置。

[jqe]: http://harttle.land/2015/06/26/jquery-event.html
[xuexb]: https://xuexb.com/
