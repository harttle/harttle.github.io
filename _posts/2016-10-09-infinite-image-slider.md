---
title: JS实现无限划动的图片全屏浏览
tags: Android jQuery 事件 滑动窗口 全屏
---

本文意在解释如何使用jQuery实现一个全屏的图片浏览，
并解释其中的加载策略，兼容问题，以及性能相关问题。
如果你需要在生产代码中使用，请直接搜索并使用既有的全屏浏览插件。

> 本文只探讨如何加载和划动全屏的图片，关于图片如何打开至全屏请参考：
> [全屏预览图片的动画和自适应布局][fullscreen]


# 无限加载策略

既然是无限划动，就不能获取所有图片同时加载；
因为要有划动效果，因此当前图片的左右两张需要预加载。
所以可以用三张图片作为一个窗口，使用轮换策略来实现一个无限划动的列表。

```html
<div class="lightbox">
  <div class="container">
    <div class="lightbox-item prev"></div>
    <div class="lightbox-item current"></div>
    <div class="lightbox-item next"></div>
  </div>
</div>
```

<!--more-->

其中`.lightbox`[全屏布局][fullscreen]，
其中的`.lightbox-item`包含了上一张、当前、下一张图片。
每当图片划动时我们把下一张变成上一张，当前图变成上一张，
把原来的上一张作为下一张并预先载入下一张图片资源。

> 注意这里添加了额外的一层`.container`并让它包装所有图片。
> 这样当我们需要图片进行整体滑动时，就可以给它做一个动画。

# 布局样式

我们将`.lightbox`设为全屏，`.prev`放到当前屏幕的左边，而`.next`放到右边。

```css
.lightbox, .container .lightbox-item{
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background-color: #000;
}
.container{
    position: absolute;
}
.lightbox-item{
    /* 我们用背景图来显示图片 */
    position: absolute;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}
.lightbox-item.prev{
    left: -100%;
    right: 100%;
}
.lightbox-item.next{
    left: 100%;
    right: -100%;
}
```

在某些浏览器下（例如某款三星的自带浏览器），它会发现页面内容其实有页面的三倍宽。
于是就把页面变宽使得三张图都显示出来。设置`overflow`可修复该问题：

```css
.lightbox{
    overflow: hidden;
}
```

# 绑定触摸事件

图片划动效果的关键在于用户的触摸事件，因为是全屏浏览所以可以直接绑定到`window`上。
但绑定到`window`上我们便要注意冲突和解绑的问题，可以`.off`你注册的函数，
也可以添加一个命名空间，例如：

```javascript
$(window)
    .on('mouseup.lightbox touchend.lightbox', onTouchEnd)
    .on('mousemove.lightbox touchmove.lightbox', onTouchMove)
    .on('mousedown.lightbox touchstart.lightbox', onTouchStart)
$(window)
    .off('mouseup.lightbox touchend.lightbox')
    .off('mousemove.lightbox touchmove.lightbox')
    .off('mousedown.lightbox touchstart.lightbox')
```

这里面有6个重点的事件，分别是：

* `mousedown`, `mousemove`, `mouseup`: 鼠标按下，移动和放松；
* `touchstart`, `touchmove`, `touchend`: 触摸按下，移动和离开。


# 图片滑动动画

其实图片随着手指移动并非动画，只需在`touchmove`时更新其位置即可。

```javascript
// 起始位置，划动距离
var beginX, translateX;
function onTouchStart(e){
    beginX = getCursorX(e);
}
function getCursorX(e) {
    // 如果是鼠标事件
    if (['mousemove', 'mousedown'].indexOf(e.type) > -1) {
        return e.pageX;
    }
    // 如果是触摸事件
    return e.changedTouches[0].pageX;
}
function onTouchMove(e){
    translateX = getCursorX(e) - beginX;
    $('.container')
        .attr('transform:translate3d(' + translateX + ')');
        .attr('-webkit-transform:translate3d(' + translateX + ')');
}
```

这里的`-webkit-transform`是为了兼容Android UC浏览器，其他貌似都OK。
另外需要注意`translate3d`会启用硬件加速，而`translateX`则没有。
因此`translateX`在普通的Android浏览器性能都很差。

> 当遇到兼容性问题时，真想说天煞的UC。但转念一想至少不用兼容IE6，也不必抱怨太多了。

# 判断滑动目标

上述代码还差一个`onTouchEnd`，即用户划动了一段距离后松手将会发生什么？
如果划动距离已经足够大，那么就继续动画滑动到下一张，否则就恢复原来的位置。
同时也需要检测划动速度，如果距离很短但速度非常大，也应当进行图片切换。

> 我们平时划动图片时是否从未考虑过这里的细节？

在`onTouchStart`中记录开始时间，在`onTouchEnd`中即可计算速度。

```javascript
var beginTime, endTime;
function onTouchStart(e){
    beginTime = Date.now();
}
function onTouchEnd(e){
    endTime = Date.now();
    animateTo(getTarget());
}
```

这里`getTarget()`用来计算划动到的图片，而`animateTo`则调用一个划动动画。

```javascript
function getTarget(){
    // 首先检测划动距离，返回 -1, 0, 1 表示上一张，当前，下一张
    var direction = getDirection(translateX, 0.3 * $(window).width());
    // 如果划动距离检测为0，继续检测速度
    if (direction === 0) {
        var deltaT = Math.max(endTime - beginTime, 1);
        var v = translateX / deltaT;
        direction = getDirection(v, 0.3);
    }
    return ['.prev', '.current', '.next'][direction + 1];
}
function getDirection(offset, max) {
    if (offset > max) return -1;
    if (offset < -max) return 1;
    return 0;
}
```

# 划动结束后的动画

划动结束后，我们需要将`.container`滑动到目标图片。
为了避免生硬地将当前图片替换为目标图片，我们设置`transform`动画到目标位置，再悄然替换。
下面便是`animateTo`的主要逻辑：

```javascript
// 计算划动到的目标图片对应的translateX
var translateX = $(window).width() * (1 - idx);
$('.container').animate({
    'transform': 'translate3d(' + translateX + 'px, 0px, 0px)'
    '-webkit-transform': 'translate3d(' + translateX + 'px, 0px, 0px)'
}, {
    duration: 1000,
    complete: function() {
        // 动画结束后进行图片轮换
        var $wps = $('.container').find('.lightbox-item');
        var $prev = $wps.filter('.prev');
        var $curr = $wps.filter('.current');
        var $next = $wps.filter('.next');
        if (target === '.prev') {
            idx--;
            $prev.attr('class', 'lightbox-item current');
            $curr.attr('class', 'lightbox-item next');
            $next.attr('class', 'lightbox-item prev');
            prefetch('.prev', idx - 1);
        } else if (target === '.next') {
            idx++;
            $next.attr('class', 'lightbox-item current');
            $curr.attr('class', 'lightbox-item prev');
            $prev.attr('class', 'lightbox-item next');
            prefetch('.next', idx + 1);
        }
        $(.container).css('transform', 'none');
        $(.container).css('-webkit-transform', 'none');
    }
});
```

还记得吗？我们在图片滑动后需要去预取下一张。如此图片才能连续地进行划动。
`prefetch`的操作便是从服务器预取下一张图片地址，然后替换掉滑动窗口中最旧的那张图。
其具体实现也和服务器有关，这里不再赘述了。

> 注意！当动画结束时对`.prev`,`.current`,`.next`进行轮换并重置`transform`。
> 如果重置为`translate3d(0,0,0)`则动画仍会继续，页面就会跳一下。
> 如果重置为`none`则会非常平滑，同时别忘了`-webkit-transform`来兼容更多浏览器。

# touchstart 的兼容性

在 Android ICS 下如果`touchstart`和第一个`touchmove`中都未调用
[`preventDefault`][jqevent]，
后续的`touchmove`和`touchend`就不会被触发。
解决办法当然是在`onTouchStart`中进行`preventDefault()`，
然而这样`click`事件（点击关闭全屏啊！）就不会被触发了：

```javascript
function onTouchStart(e) {
    e.preventDefault();
}
```

所以我们需要在`onTouchMove`中来判断这是否是一个Click，并手动触发它的行为。

```javascript
function onTouchMove(e){
    if(isClick()) onClick(); 

    function isClick() {
        var deltaT = endTime - beginTime;
        var deltaX = Math.abs(translateX);
        // 时间很短，并且移动距离很小，那么应该是个点击！
        return deltaT < 700 && deltaX < 7;
    }
}
```

注意很多移动端浏览器的窗口高度是弹性的，即你在滑到页面底部后继续滑动，
浏览器仍会显示一块空白。这样图片浏览变得相当费劲。
因此在`onTouchMove`中我们还需要禁止这一行为：

```javascript
function onTouchMove(e) {
    e.preventDefault();
}
```

# 图片渐进载入

当网速很慢时，连续划动就可能使得旧的图片显示出来（因为预取请求仍未返回）。
常见的一个实践是：立即使用一个已经载入的图片来作为Placeholder，
当目标图片载入后用它替换掉当前的Placeholder。

```javascript
function loadImage($img, src){
    // 先设置一个Placeholder
    $img.attr('src', 
        'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
    // 载入图片到临时变量
    var tmp = new Image();
    tmp.onload = function(){
        // 资源载入后，将资源显示到目标的img
        $img.src = src;
    };
    tmp.src = src;
}
```

> 设置背景图与设置`src`属性一样，均可以使用该策略。浏览器会复用那个资源。

# 图片到底提示

在第一张图片右划和最后一张图片左划时，应当给出提示。
可以做一张带有提示信息的Placeholder：

```javascript
$lightbox.attr('style', 'top:0;left:0;right:0;bottom:0;');
$lightbox.append($('<p class="alert-nomore">').html('没有更多了..'));
```

然后让文字居中：

```css
.lightbox-item .alert-nomore{
    position: absolute;
    text-align: center;
    bottom: 50%;
    left: 0;
    right: 0;
    color: #777;
    font-size: 20px;
}
```

[fullscreen]: /2016/09/12/fullscreen-image-animation-and-layout.html
[jqevent]: /2015/06/26/jquery-event.html
