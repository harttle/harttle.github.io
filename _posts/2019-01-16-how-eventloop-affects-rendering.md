---
title: 事件循环是如何影响页面渲染的？
tags: JavaScript Microtask setTimeout requestAnimationFrame Promise
---

JavaScript 是单线程的，但提供了很多异步调用方式比如
`setTimeout`，`setInterval`，`setImmediate`，`Promise.prototype.then`，`postMessage`，`requestAnimationFrame`，
I/O，DOM 事件等。
这些异步调用的实现都是[事件循环][event-loop]，但根据插入的队列不同和取任务的时机不同他们的表现也不同。
尤其在涉及与页面渲染的关系时。

## TL;DR

* 页面渲染/交互任务也会插入在 Task Queue 中，会与各种异步机制插入的任务交错执行。
* Microtask Queue 会在下一个任务开始之前清空。
* 单个耗时任务和 Microtask Queue 都会阻塞页面交互，Task Queue 则不影响。
* 渲染时机可以通过 requestAnimationFrame 精确控制。
* setImmediate 与 setTimeout 一样使用 Task Queue，但克服了 4ms 限制。

<!--more-->

## 任务与队列的概念

JavaScript 的异步机制由 [事件循环][event-loop] 实现，这些 API 的不同表现在进入和离开任务队列的时机。
为了讨论方便，先解释几个概念。

* **任务与调用栈**。由于单线程的特性，每个 JavaScript 执行上下文只有一个调用栈，其中保存着当前任务中所有未执行完的函数。只要调用栈非空，JavaScript 引擎就会持续地、不被打断地（从进程内的角度来看）执行完当前栈中的所有函数，因此 JavaScript 有 "run-to-completion" 的特性。调用栈被清空时意味着当前任务执行结束。
* **Task Queue** 是事件循环的主要数据结构。当前调用栈为空时（上一个任务已经完成），事件循环机制会持续地轮询 Task Queue，只要队列中有任务就拿出来执行。在任务执行期间插入的任务会进入 Task Queue 尾部。会加入 Task 队列的包括：setTimeout, setInterval, setImmediate，postMessage，MessageChannel，UI 事件，I/O，页面渲染。
* **Microtask Queue** 在 Task Queue 的每个任务执行结束后，下一个任务执行开始前，会执行并清空 Microtask Queue 中的所有任务。在 Microtask 执行期间插入的任务也会进入当前 Microtask Queue。会加入 MicroTask 队列的包括：[Promise](/2016/08/10/promise.html), MutationObserver，process.nextTick。

> 上述异步 API 的分类依据的是最新标准或最新实现。存在一些例外，比如：Node &lt; 9 的 process.nextTick 实现的是 Task 语义（而非 Microtask）；IE8 中的 postMessage 是同步的；Edge 浏览器在点击事件处理函数之间不会清空 Microtask Queue。

无论是 Task Queue 还是 Microtask Queue，其中的 task 和 microtask 的执行都是异步的。
为了对上述两个队列有更直观的认识，这里举个例子：

```javascript
setTimeout(() => console.log('setTimeout'));
Promise.resolve().then(() => {
    console.log('Promise');
    Promise.resolve().then(() => console.log('Promise queued by Promise'));
});
console.log('stack');
```

上述代码片段中有两个Task（stack, setTimeout），两个 Microtask（Promise、Promise queued by Promise）。
stack 是当前任务会先执行；setTimeout 是第二个任务，在它执行前会清空 Microtask Queue。
这时 Microtask Queue 只有一个 Microtask（Promise），
在它执行的过程中会插入第二个 Microtask（Promise queued by Promise）。
这些 Microtask 都会在下一个 Task（setTimeout）之前执行。因此输出为：

```
stack
Promise
Promise queued by Promise
setTimeout
```

* 注意与 `.then` 的回调不同，`new Promise` 的回调是同步执行的。可参考 [Promise 回调的执行](/2017/06/26/promise-callback-execution.html) 一文。
* 在 Jake 的 [Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) 一文中有更加详细的例子，感兴趣的读者可前往观摩。

## 何时会阻塞 UI

UI 渲染和交互的处理是通过 Task Queue 来调度的，因此耗时任务会导致渲染和交互任务得不到调用，也就是页面“卡死”。
典型的浏览器会在每秒插入 60 个渲染帧，也就是说每 16ms 需要一次渲染。
如果存在一个任务在 16ms 内未能执行结束，页面就会掉帧给人卡顿的感觉。
渲染帧的详细讨论可以参考 [浏览器的 16ms 渲染帧](/2017/08/15/browser-render-frame.html) 一文，
这里 Harttle 给一个例子：

<http://harttle.github.io/async-and-render>

在 “Loop for 10 seconds” 部分我们写了 4 种不同的循环，它们的表现如下：

循环 API | 队列类型 | 期间页面能否交互 &ast; | 每秒执行次数
--- | --- | --- | ---
while(true) | 当前任务 | 否 | 701665.8
Promise | Microtask Queue | 否 | 609555.4
setTimeout | Task Queue | 是 | 208.3
requestAnimationFrame | Task Queue | 是 | 59

* 页面不可交互是指：无法点击其他按钮、无法操作输入控件、无法选择/赋值页面文本。
* 以 PC Chrome 为例，iOS Safari 尤其是 [UIWebview](/2018/06/23/uiwebview-bugs.html) 的表现可能会不同。

单个的耗时任务和 Microtask Queue 都会阻塞页面交互，Task 则不影响。
因为 Task 之间浏览器有机会会插入 UI 任务。
这里还可以观察到 `setTimeout` 虽然设置了 0 延时但调用次数远小于 while，甚至远小于 Microtask。
下文 setImmediate 章节会详细讨论原因。

## 渲染任务的时机

有时我们希望精确地控制浏览器在每一帧的绘制，这时就要了解浏览器绘制的时机。
首先举个例子，我们希望页面背景闪现一下红色：

```javascript
document.body.style.background = 'red';
document.body.style.background = 'white';
```

上述代码一定达不到效果，背景会稳定地呈现白色。
因为 JavaScript “run-to-completion” 的特性，在上述两行代码之间不可能插入渲染任务。
这时可能有人想到 setTimeout：

```javascript
document.body.style.background = 'red';
setTimeout(function () {
    document.body.style.background = 'white';
})
```

这样两次背景设置会在不同的任务中执行，如果这两个任务之间插入了渲染任务背景就会发生闪动。
但渲染任务是 16ms 一次，你怎么知道浏览器会正好插入在这两个任务之间？
因此上述代码只会几率性起作用，背景闪动的几率大概 4/16.67 = 25%。
16.67 是渲染帧间隔，那为什么是 4ms 呢？请看下文 setImmediate。

想要增大几率到 100% 怎么办？setTimeout 100ms 呗… 
其实 HTML5 中给出了 [requestAnimationFrame][requestAnimationFrame] API，使得脚本有机会精确地控制动画：

```javascript
requestAnimationFrame(function () {
    document.body.style.background = 'red';
    requestAnimationFrame(function () {
        document.body.style.background = 'white';
    })
})
```

插入的任务会在每次渲染任务**之前**执行，因此等待渲染之后需要调用两次来插入到第二次渲染之前。
这样背景一定会闪现红色。同样下面页面的 “Switch background red and white” 部分给了例子，可以点点看：

<http://harttle.github.io/async-and-render>

## 所以 setImmediate 是啥

[setImmediate][setImmediate] 是由 IE 提出的，
目前尚未形成标准。当前状态是 [Proposal][setImmediate-proposal] 且只有 IE 有实现。
setImmediate 是为了让脚本更快地执行，与 [setTimeout][setTimeout] 一样都使用 Task Queue。
为了解 setImmediate 的用途，我们先看 setTimeout 为什么不够快。
下面的文本来自 [HTML5 Living Standard](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout) 的 timer initialization steps:

> 10. If timeout is less than 0, then set timeout to 0.
> 11. If nesting level is greater than 5, and timeout is less than 4, then set timeout to 4.
> 12. Increment nesting level by one. 

其中 nesting level 是指 [timer nesting level](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timer-nesting-level)，
每一级可能是 setTimeout 也可能是 setInterval。也就是说在嵌套 5 层以上时，会设置最小 4ms 的延迟。
setImmediate 意在让脚本有机会在 UA 事件和渲染发生后立即得到调用，从渲染的角度上类似于渲染之后调用的 requestAnimationFrame。
由于没有广泛实现，使用 setImmediate 需要引入 Polyfill。请参考：

<https://github.com/YuzuJS/setImmediate/blob/master/README.md>

[event-loop]: https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model
[setTimeout]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setTimeout
[setImmediate]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate
[setImmediate-proposal]: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html#sec-efficient-script-yielding
[requestAnimationFrame]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
