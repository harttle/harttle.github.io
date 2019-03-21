---
title: 浏览器的 16ms 渲染帧
tags: DOM JavaScript 异步 性能 重绘
---

由于现在广泛使用的屏幕都有固定的刷新率（比如最新的一般在 60Hz），
在两次硬件刷新之间浏览器进行两次重绘是没有意义的只会消耗性能。
浏览器会利用这个间隔 16ms（1000ms/60）适当地对绘制进行节流，
因此 16ms 就成为页面渲染优化的一个关键时间。
尤其在[异步渲染][async-render]中，要利用 [流式渲染][css-js-render] 就必须考虑到这个渲染帧间隔。

### TL;DR

为方便查阅源码和相关资料，本文以 Chromium 的 [Blink][blink] 引擎为例分析。如下是一些分析结论：

* 一个渲染帧内 commit 的多次 DOM 改动会被合并渲染；
* 耗时 JS 会造成丢帧；
* 渲染帧间隔为 16ms 左右；
* 避免耗时脚本、交错读写样式以保证流畅的渲染。

<!--more-->

## 渲染帧的流程

渲染帧是指浏览器一次完整绘制过程，帧之间的时间间隔是 DOM 视图更新的最小间隔。
由于主流的屏幕刷新率都在 60Hz，那么渲染一帧的时间就必须控制在 16ms 才能保证不掉帧。
也就是说每一次渲染都要在 16ms 内页面才够流畅不会有卡顿感。
这段时间内浏览器需要完成如下事情：

* 脚本执行（JavaScript）：脚本造成了需要重绘的改动，比如增删 DOM、请求动画等
* 样式计算（CSS Object Model）：级联地生成每个节点的生效样式。
* 布局（Layout）：计算布局，执行渲染算法
* 重绘（Paint）：各层分别进行绘制（比如 3D 动画）
* 合成（Composite）：合成各层的渲染结果

最初 Webkit 使用定时器进行渲染间隔控制，
2014 年时开始 [使用显示器的 vsync 信号控制渲染][remove-timer]（其实直接控制的是合成这一步）。
这意味着 16ms 内多次 commit 的 DOM 改动会合并为一次渲染。

## 耗时 JS 会造成丢帧

JavaScript 在并发编程上一个重要特点是“Run To Completion”。在事件循环的一次 Tick 中，
如果要执行的逻辑太多会一直阻塞下一个 Tick，所有异步过程都会被阻塞。
一个流畅的页面中，JavaScript 引擎中的执行队列可能是这样的：

```
执行 JS -> 空闲 -> 绘制（16ms）-> 执行 JS -> 空闲 -> 绘制（32ms）-> ...
```

如果在某个时刻有太多 JavaScript 要执行，就会丢掉一次帧的绘制：

```
执行很多 JS...（20ms）-> 空闲 -> 绘制（32ms）-> ...
```

例如下面的脚本在保持 JavaScript 忙的状态（持续 5s）下每隔 1s 新增一行 DOM 内容。

```html
<div id="message"></div>
<script>
var then = Date.now()
var i = 0
var el = document.getElementById('message')
while (true) {
  var now = Date.now()
  if (now - then > 1000) {
    if (i++ >= 5) {
      break;
    }
    el.innerText += 'hello!\n'
    console.log(i)
    then = now
  }
}
</script>
```

可以观察到虽然每秒都会写一次 DOM，但在 5s 结束后才会全部渲染出来，明显耗时脚本阻塞了渲染。

![js block render](/assets/img/blog/dom/js-block-render.gif)

## 测量渲染帧间隔 

浏览器的渲染间隔其实是很难测量的。即使通过 [clientHeight][client-size] 这样的接口也只能强制进行Layout，是否 Paint 上屏仍未可知。

幸运的是，最新的浏览器基本都支持了 [requestAnimationFrame][requestAnimationFrame] 接口。
使用这个 API 可以请求浏览器在下一个渲染帧执行某个回调，于是测量渲染间隔就很方便了：

```javascript
var then = Date.now()
var count = 0

function nextFrame(){
  requestAnimationFrame(function(){
    count ++
    if(count % 20 === 0){
      var time = (Date.now() - then) / count
      var ms = Math.round(time*1000) / 1000
      var fps = Math.round(100000/ms) / 100
      console.log(`count: ${count}\t${ms}ms/frame\t${fps}fps`)
    }
    nextFrame()
  })
}
nextFrame()
```

每次 `requestAnimationFrame` 回调执行时发起下一个 `requestAnimationFrame`，统计一段时间即可得到渲染帧间隔，以及 fps。逼近 16.6 ms 有木有！

![render frame](/assets/img/blog/dom/render-frame.gif)

## 渲染优化建议

现在我们知道浏览器需要在 16ms 内完成整个 JS->Style->Layout->Paint->Composite 流程，那么基于此有哪些页面渲染的优化方式呢？

### 避免耗时的 JavaScript 代码

耗时超过 16ms 的 JavaScript 可能会丢帧让页面变卡。如果有太多事情要做可以把这些工作重新设计，分割到各个阶段中执行。并充分利用缓存和懒初始化等策略。不同执行时机的 JavaScript 有不同的优化方式：

* 初始化脚本（以及其他同步脚本）。对于大型 SPA 中首页卡死浏览器也是常事，建议增加服务器端渲染或者应用懒初始化策略。
* 事件处理函数（以及其他异步脚本）。在复杂交互的 Web 应用中，耗时脚本可以优化算法或者迁移到 Worker 中。Worker 在移动端的兼容性已经不很错了，可以生产环境使用。

### 避免交错读写样式

在编写涉及到布局的脚本时，常常会多次读写样式。比如：

```javascript
// 触发一次 Layout
var h = div.clientHeight
div.style.height = h + 20
// 再次触发 Layout
var w = div.clientWidth
div.style.width = w + 20
```

因为浏览器需要给你返回正确的宽高，上述代码片段中每次 Layout 触发都会阻塞当前脚本。
如果把交错的读写分隔开，就可以减少触发 Layout 的次数：

```javascript
// 触发一次 Layout
var h = div.clientHeight
var w = div.clientWidth
div.style.height = h + 20
div.style.width = w + 20
```

### 小心事件触发的渲染

我们知道 [DOM 事件的触发][dispatchEvent] 是异步的，但事件处理器的执行是可能在同一个渲染帧的，
甚至就在同一个 Tick。例如异步地获取 HTML 并拼接到当前页面上，
通过监听 XHR 的 [onprogress 事件][onprogress] 来模拟流式渲染：

```javascript
var xhr = new XMLHttpRequest(),
  method = 'GET',
  url = 'https://harttle.land'

xhr.open(method, url, true)
xhr.onprogress = function () {
  div.innerHTML = xmlhttp.responseText
};
xhr.send()
```

上述渲染算法在网络情况较差时是起作用的，但不代表它是正确的。
比如当 <https://harttle.land> 对应的 HTML 非常大而且网络很好时，
`onprogress` 事件处理器可能碰撞在同一个渲染帧中，或者干脆在同一个 Tick。
这样页面会长时间空白，即使 `onprogress` 早已被调用过。

> 关于异步渲染的阻塞行为，可参考 <https://harttle.land/2016/11/26/dynamic-dom-render-blocking.html>

## 参考链接

* [Thinking in Animation Frames: Tuning Blink for 60 Hz][thinking-60]
* [The Blink Project][blink]
* [Issue: Remove style recalc timer][remove-timer]

[remove-timer]: https://bugs.chromium.org/p/chromium/issues/detail?id=337617
[blink]: https://chromium.googlesource.com/chromium/blink/
[thinking-60]: https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/bxIPxpzLprQ
[async-render]: https://harttle.land/2016/11/26/dynamic-dom-render-blocking.html
[css-js-render]: https://harttle.land/2016/11/26/static-dom-render-blocking.html
[client-size]: /2016/04/24/client-height-width.html
[requestAnimationFrame]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
[dispatchEvent]: https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/dispatchEvent
[onprogress]: https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequestEventTarget/onprogress
