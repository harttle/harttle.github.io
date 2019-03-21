---
title: 浏览器前进/后退缓存（BF Cache）
tags: Chrome Firefox JavaScript DOM XHR 缓存
---

[浏览器前进/后退缓存][bfc]（Backward/Forward Cache，BF Cache）是指浏览器在前进后退过程中，
会应用更强的缓存策略，表现为 DOM、window、甚至 JavaScript 对象被缓存，以及同步 XHR 也被缓存。
这一现象在移动端浏览器尤为常见，除 Chrome for Android、Android Browser 之外的浏览器基本都会触发。

BF Cache 本来是一项浏览器优化，但在某些情况下（比如前端路由的 Web App）会引起困惑。
本文主要讨论 BF Cache 的行为、如何检测 BF Cache 缓存、以及如何 workaround。

<!--more-->

## 缓存行为

BF Cache 是一种浏览器优化，HTML 标准并未指定其如何进行缓存，因此缓存行为是与浏览器实现相关的。

> User agents may discard the Document objects of entries other than the current entry that are not referenced from any script, reloading the pages afresh when the user or script navigates back to such pages. This specification does not specify when user agents should discard Document objects and when they should cache them. -- [Session history and navigation][spec-history], WHATWG

* Desktop Chrome：阻塞的资源和同步发出的 XHR 都会被缓存，但不缓存渲染结果。因此可以看到明显的载入过程，此时脚本也会重新执行。
* Chrome for Android：有些情况下不会缓存，缓存时与 Desktop Chrome 行为一致。
* Desktop Firefox：页面会被 [Frozen][bfc]，定时器会被暂停，DOM、Window、JavaScript 对象会被缓存，返回时页面脚本重新开始运行。
* iOS Safari：渲染结果也会被缓存，因此才能支持左右滑动手势来前进/后退。

Desktop Firefox 暂停计时器的行为非常有趣，以下 HTML 中显示一个每秒加一的数字。
当页面导航时就会暂停，返回时继续增加（因此直接使用 `setInterval` 倒计时不仅不精确，而且不可靠）：

```html
<span id="timer-tick"></span>
<a href="https://harttle.land">External Link</a>
<script>
  var i = 0
  setInterval(() => document.querySelector('#timer-tick').innerHTML = i++, 1000)
</script>
```

## pagehide/pageshow 事件

会话（Session）中的某一个页面显示/隐藏时，会触发 `pagehide` 和 `pageshow` 事件。
这两个事件都有一个 `persisted` 属性用来指示当前页面是否被 BF Cache 缓存。
因此可以通过 `persisted` 属性来达到禁用 BF Cache 的效果：

```javascript
window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload() 
    }
};
```

注意 `pageshow` 不仅在显示被缓存的页面时触发，在第一次加载页面时也会触发。
因此需要检测事件的 `persisted` 属性，页面第一次加载时它的值是 `false`。

另外 `pageshow` 的时机总是在 `load` 事件之后。
这一点很容易检测，比如下面的代码中 `pageshow` 日志总在 `load` 之前打印：

```javascript
window.addEventListener('pageshow', function () {
  console.log('on pageshow')
})
window.addEventListener('load', function () {
  console.log('load')
})
```

## XHR 缓存

同步（阻塞加载的）脚本发出的 XMLHttpRequest 也会被 Chrome 强制缓存，
因此即使在断网的情况下后退到访问过的页面仍然是可以完美渲染的。
如果页面中有这样一段外部脚本：

```javascript
sendXHR();

function sendXHR () {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', '/data.json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE &&
     xhr.status === 200) {
      console.log('xhr arrived', xhr.responseText)
    }
  }
  xhr.send()
}
```

超链接跳转后回来，该 xhr 也会被缓存。注意下图中的 XHR 一项 size 为 “from disk cache”：

![xhr BF cache][xhr]

为了强制发送 xhr，可以将 xhr 改为异步发送，或者加一个不重要的 query。

```javascript
setTimeout(sendXHR, 1000)
```

这样就能看到 xhr 真正发送出去了 :) 异步 xhr 缓存时机未经兼容性测试，
还是建议读者使用一个随机产生的 query。

![async xhr BF cache][xhr-async]

[bfc]: https://developer.mozilla.org/en-US/docs/Working_with_BFCache
[spec-history]: https://html.spec.whatwg.org/multipage/browsers.html#history
[pageshow]: https://developer.mozilla.org/zh-CN/docs/Web/Events/pageshow
[pagehide]: https://developer.mozilla.org/zh-CN/docs/Web/Events/pagehide
[xhr-async]: /assets/img/blog/javascript/bf-cache-async-xhr@2x.png
[xhr]: /assets/img/blog/javascript/bf-cache-xhr@2x.png
