---
title: 客户端渲染有哪些坑？
tags: MVVM 异步渲染 路由 兼容性 pushState popstate
---

从别的角度出发，客户端渲染有很多其他名字比如前端渲染、前端异步、前端 MVC。
今天的 Web 稍有交互的站点都会做一套前端渲染，从早期的 Backbone，AngularJS 1.0，
到现在的流行的 Vue，React。基于这些技术做 MVVM 的同时甚至可以完成服务器端渲染。
但浏览器的客户端渲染（也就是前端 MVC）仍然存在不少限制，这些限制都是前端渲染绕不过的问题。

<!--more-->

# 概述

一个支持客户端渲染的技术架构应当包括这些内容：

* 首屏渲染。服务器端渲染首屏，或者客户端根据当前 URL 渲染对应的页面。
* 前端路由。点击链接时改变页面的 URL，返回/前进时渲染对应页面。
* 异步渲染。在不发生整页重新载入的情况下更新页面内容。

下文中，我们用 [同步渲染][sync] 指代浏览器直接载入 HTML 及其中的资源；用 [异步渲染][async] 指通过 DOM API 去动态插入元素和资源。

# 共享同一个后端服务

**结论**：异步打开的所有 URL 都必须在同一服务器，或者这些服务器都知道所有 URL 对应的页面信息。

**场景**：打开页面A -> pushState 到页面 B -> 刷新 -> 点返回。这时浏览器并没有直接加载 A，而是抛出了 popstate 事件。

如果 A 和 B 在不同的服务器上，那么这时 B 如何处理这个 popstate 事件？
因此无论是页面 A 和页面 B 需要在前端保持同一套页面框架，这个框架能够载入它们中的任何一个。

> 这一限制从某个角度上理解是反 Web 的。作为分布式文档，每个页面都应该互相独立。客户端渲染强制这些页面互相耦合，形成一个前端 App。

# 脚本要符合异步风格

**结论**：所有页面的脚本都必须无副作用、不依赖 `<script>` 顺序。

**场景**：两个页面间异步切换时，对应脚本能够多次执行和卸载。

同步渲染中，所有全局变量、定时器、事件监听器会在一次重新载入后重置，而异步页面则不然。
如果一个脚本依赖于（读写）全局变量，那么多次载入后它的行为可能会发生异常。
比如一个交互统计脚本多次载入后可能会重复计数，因为它每次载入都产生一个事件监听器。

如果一个异步页面有多个 `<script>`，在 [异步渲染时脚本的执行顺序][dynamic-script] 是不保证的。
这一点与 [浏览器同步渲染][static-render] 完全不同。
因此可能需要类似 [RequireJS][req] 之类的模块加载器。

为了解决上述问题，多数前端 MVVM 框架都不建议直接在 HTML 中插入 `<script>` 来编写业务代码。
与此相反，会提供类似 [模块][ng-module]、[组件][comp] 之类的概念来托管脚本的执行。

# PushState API 不完善

**结论**：浏览器的路由相关 API 能力较弱且存在兼容性问题。

**场景**：在用户点击链接时，需要操作 URL；在用户点击浏览器返回/前进时，需要渲染页面。

HTML5 中定义了 pushState API，包括 [pushState 方法][pushState]，[replaceState 方法][replaceState] 和 [popstate 事件][popstate]。
我们不谈这些 API 的接口设计如何，它们的奇怪行为和 Bug 就够你调试一整天：

* [同步渲染的页面资源][static-render] 加载会延迟 `popstate` 事件。这使得页面未加载完时可以点出但无法返回。
* `pushState` 调用不会触发 `popstate` 事件。通常需要一个路由工具来包装这些不一致。
* [PopStateEvent.state][popstate-event] 总是等于 `history.state`。无法获取被 pop 出的 state。
* `popstate` 事件处理函数中无法区分是前进还是后退。考虑刷新页面的场景不能只存储为变量，只能存储在 [`sessionStorage`][local-store] 中，但这无疑会增加路由的延迟。
* 有些浏览器不支持 `history.state`，但支持 `pushState` 和 `popstate`。
* iOS 下所有浏览器中，设置 [scrollRestoration][sr] 为 `manual` 会使得手势返回时页面卡 1s。

[sr]: https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
[static-render]: /2016/11/26/static-dom-render-blocking.html
[sync]: /2016/11/26/static-dom-render-blocking.html
[async]: /2016/11/26/dynamic-dom-render-blocking.html
[dynamic-script]: /2017/01/16/dynamic-script-insertion.html
[req]: http://requirejs.org/
[ng-module]: https://angular.io/api/core/NgModule
[comp]: https://reactjs.org/docs/react-component.html
[static-render]: /2016/11/26/static-dom-render-blocking.html
[pushState]: https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState
[popstate]: https://developer.mozilla.org/zh-CN/docs/Web/Events/popstate
[replaceState]: https://developer.mozilla.org/zh-CN/docs/Web/API/History/replaceState
[popstate-event]: https://developer.mozilla.org/zh-CN/docs/Web/API/PopStateEvent
[local-store]: /2015/08/16/localstorage-sessionstorage-cookie.html
