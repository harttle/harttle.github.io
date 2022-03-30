---
title: CSS/JS 阻塞 DOM 解析和渲染
tags: CSS DOM JavaScript 性能 浏览器渲染
---

页面资源的最佳世间是把页面样式写在 HTML 头部，页面脚本放在 HTML 尾部。这是因为脚本和样式会阻塞 DOM 渲染。
本文具体分析了包括脚本和样式在内的资源元素对 DOM 解析和页面渲染的影响，并给出具体的示例代码。

> 本文只讨论服务器端渲染的 DOM（以下称为同步渲染）资源载入时机。
> 关于在客户端 JavaScript 动态执行插入 HTML 标签（异步渲染）的阻塞情况请参考
> [异步渲染 DOM 元素的加载时机][async] 一文。

## TL; DR

* CSS（外链或内联）会阻塞 **整个** DOM 的渲染（Rendering），然而 DOM 解析（Parsing）会正常进行
* 很多浏览器中，CSS 会延迟脚本执行和 `DOMContentLoaded` 事件
* JS（外链或内联）会阻塞 **后续** DOM 的解析（Parsing），延迟 `DOMContentLoaded`，后续 DOM 的渲染（Rendering）也将被阻塞
* JS 前的 DOM 可以正常解析（Parsing）和渲染（Rendering）

<!--more-->

## DOMContentLoaded 事件

jQuery 时代的 Web 开发者都有一个习惯：写脚本第一行一定是 `$(function(){});`，就像写 C++ 第一行是 `int main() {}` 一样。
这个 jQuery 语句的含义是，在页面 ready 时执行这个函数。

那么什么是 ready 呢？DOM 始终没有提供过叫做 `ready` 的事件，所以这是一个 jQuery 引入的概念。
它的实现其实是 `DOMContentLoaded` 事件（考虑到兼容性，事实上要更复杂一些，请参考 [DOM 载入事件][dom-ready]），该事件表示页面文档（DOM）完全加载并解析完毕，DOM 树已被创建，多数 JavaScript 已经操作 DOM 并完成功能了。

注意页面中可能还有一些图片文件，iframe 等资源，这些资源在 `DOMContentLoaded` 时并未完成，它们全部加载完成的时机对应 `load` 事件。

> This (DOMContentLoaded) event fires after the HTML code has been fully retrieved from the server, the complete DOM tree has been created and scripts have access to all elements via the DOM API. -- [molily.de][molily]

## CSS 阻塞 DOM 渲染

**无论是外链 CSS 还是内联 CSS 都会阻塞 DOM 渲染（Rendering），然而 DOM 解析（Parsing）会正常进行**。
这意味着在 CSS 下载并解析结束之前，它后面的 HTML 都不会显示。
这也是为什么我们把样式放在 HTML 内容之前，以防止被呈现内容发生样式跳动。
当然代价就是显示延迟，所以性能攸关的站点都会内联所有 CSS。

然而在绝大多数场景下，样式文件的载入会延迟 `DOMContentLoaded` 事件的触发，导致页面 functional 的时间会被延迟。
但该行为正是开发者所希望的，因为 JavaScript 作者往往会假设前面的 CSS 规则已经生效，尤其是在进行一些显示相关的操作时，
比如需要得到 DOM 元素的位置和大小的场景。

在多数浏览器中 `DOMContentLoaded` 事件的触发会考虑到外部样式文件（CSS）的载入，
以及在 HTML 中脚本标签和样式标签的相对位置。
如果脚本位于样式之后，浏览器通常会认为该脚本依赖于样式的渲染结果，
也就更倾向于延迟脚本的执行（直到样式渲染结束）。

下表描述了各种情况下脚本是否会被延迟执行，进而延迟触发 `DOMContentLoaded` 事件。
渲染引擎 | 样式表之前的脚本 | 样式表之后的外部脚本 | 样式表之后的行内脚本
--- | --- | --- | --- 
Presto (Opera)           | 否 | 否 | 否
Webkit (Safari, Chrome)  | 否 | 是 | 是
Gecko (Firefox)          | 否 | 是 | 是
Trident (MSIE)           |    | 是 | 是

有些情况下，可以尝试添加媒体查询来避免不必要的阻塞。
尤其是响应式站点可以做此优化（让这个样式在小屏幕上一开始就不要生效，也不会因此阻塞后续脚本了）：

```html
<link href="other.css" rel="stylesheet" media="(min-width: 40em)">
```

## CSS 阻塞 DOM 渲染：案例

为了验证 CSS 阻塞渲染但不阻塞解析以及脚本延迟行为，设计下列 HTML。
同步和异步地打印当前 DOM 内容，以及在样式表后添加测试脚本。

```html
<html>
<body>
  <h2>Hello</h2>
  <script> 
    function printH2(){
        console.log('first script', document.querySelectorAll('h2')); 
    }
    printH2();
    setTimeout(printH2);
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0-alpha.4/dist/css/bootstrap.css">
  <h2>World</h2>
  <script> console.log('second script'); </script>
</body>
</html>
```

需要打开 Chrome 开发者工具的 `Disable Cache` 和 `Throttling` 来模拟较慢的网络。
然后在样式表载入过程中可以观察到以下现象：

![stylesheet links block rendering][css-block-rendering]

1. 两个 `<h2>` 标签均为显示，说明样式表会阻塞和延迟整个 DOM 的渲染。
2. 第一次输出只有一个 `<h2>`，说明脚本执行会阻塞 DOM 解析（感谢@huahua 指正）。
3. 第二次输出有两个 `<h2>`，说明样式载入过程中 DOM 已解析完毕，即样式表不会阻塞 DOM 解析。
4. `"second script"` 未被打印出来，说明在 Chrome 中样式表之后的行内脚本被延迟了。

## JS 阻塞 DOM 解析

> 上文都在讲渲染，这里讲解析。解析是指浏览器生成 DOM 树结构（此时用户不一定能看到，但脚本比如 `querySelectorAll` 可以访问到）；渲染是指浏览器把 DOM 树与 CSS 结合进行布局并绘制到屏幕（此时用户是可以看到的）。

**不论是内联还是外链 JavaScript 都会阻塞后续 DOM 解析（Parsing），`DOMContentLoaded` 事件会被延迟，后续的 DOM 渲染（Rendering）也会被阻塞。**
这意味着脚本执行过程中插入的元素会先于后续的 HTML 展现，即使脚本是外链资源也是如此。
由于 JavaScript 只会阻塞后续的 DOM，前面的 DOM 在解析完成后会被立即渲染给用户。
这也是为什么我们把脚本放在页面底部：脚本仍在下载时页面已经可以正常地显示了。

但浏览器的载入标识仍然会提示页面正在载入，这件事情其实可以 Hack，
见 [异步脚本载入提高页面性能](/2016/05/18/async-javascript-loading.html) 一文。

## HTML5 标准解释和最佳实践

其实 `DOMContentLoaded` 是 Firefox 中最先提出的，
此后 JavaScript 社区发现它确实比 `load` 事件（要求所有资源完全载入）更好，
于是 Apple 和 Opera 相继开始支持该事件。
但不同浏览器的实现方式有所区别，于是产生了上表所示的复杂情况。

在 HTML5 标准中情况有所好转：`DOMContentLoaded` 是一个纯 DOM 事件，与样式表无关。
与此同时，HTML5 要求：

* 脚本执行前，出现在当前 `<script>` 之前的 `<link rel="stylesheet">` 必须完全载入。
* 脚本执行会阻塞 DOM 解析。

这样的话，假如脚本和样式一起放在 HTML `<head>` 中，
DOM 解析到 `<script>` 标签时会阻塞 DOM 解析，开始如下操作：

1. 获取当前 `<script>` 的脚本文件；
1. 获取并载入前面的所有 `<link rel="stylesheet">`。
2. 执行当前脚本文件。

这些操作完成之后才能继续进行 DOM 解析，解析完毕时再触发 `DOMContentLoaded` 事件。
如果将样式和脚本都放到 `<head>` 中，会使浏览器在渲染 `<body>` 前载入并执行所有样式和脚本。
页面的显示延迟会很高，多数情况下用户体验都很糟糕。
因此在 HTML5 标准的 HTML 页面中，最佳实践应当是：
**所有样式放在 `<head>` 中；所有脚本放在 `<body>` 最后。**

> [jQuery 文档][jq-ready] 中也推荐这样的实践方式。

[async]: /2016/11/26/dynamic-dom-render-blocking.html
[css-block-rendering]: /assets/img/blog/dom/css-block-rendering@2x.png
[js-block-parsing]: /assets/img/blog/dom/js-block-parsing@2x.png
[molily]: http://molily.de/domcontentloaded/
[dom-ready]: /2016/05/14/binding-document-ready-event.html
