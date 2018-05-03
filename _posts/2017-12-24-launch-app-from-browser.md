---
title: Deep Linking：从浏览器调起 APP
subtitle: URI Scheme, Universal Links, Android App Links, 以及 Chrome Intent
tags: URI-Scheme Universal-Links Intent iOS Android
---

[Deep Linking][deep-linking] 只是一个概念，
是指通过一个链接进入另一个网站/App，并直接浏览其内部的某个页面。
Deep Linking 给用户带来的是非常顺滑的浏览体验，尤其在 Web 世界中 Deep Linking 的实现非常容易。

但如果要进入 App 并定位到对应的页面则较为困难，URI Scheme, Universal Links, Android App Links, 以及 Chrome Intent 都是为了解决从 Web 页面 Deep Linking 到 App 而做的尝试。
本文从 Web 一侧的视角总结调起 App 的各种实现方式，能达到的效果，以及对应的兼容性问题。

<!--more-->

## 实现方式概述

每种实现方式都有其适用的平台和浏览器，要兼容多数浏览器需要根据 User Agent 应用不同的策略。
这些实现方式的行为也不一致，可能需要配合产品需求才能确定结合哪几种实现方式。
这些实现在下文有详细的介绍，下表中先大概列举各种实现的区别：

技术 | Universal Link | Android App Link | URI Scheme | Chrome Intent
--- | --- | --- | --- | ---
平台要求 | >= iOS 9 | >= Android 6 | Chrome<sup>1</sup> < 25, iOS |  Chrome<sup>1</sup> >= 25
未安装表现 | 打开 Web 页面 | 打开 Web 页面 | 发生错误 | 可以打开 Web 页面
能否不发生跳转 | 不能 | 不能 | 能 | 能
能否去下载页面 | 能 | 能 | 不能 | 能
iframe 触发 | 不支持 | 不支持 | Chrome<sup>1</sup> <= 18, iOS < 9 | 不支持
链接格式 <sup>2</sup> | 正常的 URL | 正常的 URL | 自定义协议的 URL | intent 协议的 URL

1. 本文只针对移动端浏览器，其中 Chrome 表示 Chrome for Android，以及 Android Browser 的对应版本。
2. 链接的作用方式有3种：用户点击这样的 `<a>` 标签；脚本中进行页面重定向；设置 `iframe` 的 `src`。

## URI Scheme

URI Schema 是这几种调起方式中最原始的一种，协议名由 App 开发者命名。
路径可以表示具体要打开的页面或功能。例如：

```html
<a href="harttle://about"></a>
```

URI Scheme 较为简单容易理解，但它的缺点也比较明显：

* 命名可能冲突。如果两款软件都叫 `harttle` 就会产生问题，因此这项技术是有设计缺陷的。
* 调起失败时会直接发生错误，没有回调 URL。Android 和 iOS 都会弹框提示 URL 无效。

由于 iOS 下失败弹框不会阻塞，因此 [JavaScript 做 Fallback][uri-scheme-fallback] 可能会提前执行，体验会很糟糕。但相比于 Universal Link 调起失败后页面可以继续使用，也被广泛使用。比如京东的 Web 页面：

![ios uri scheme failed alert](/assets/img/blog/app/uri-scheme-not-installed-ios@2x.png)

在 Chrome for Android <= 18 以及 iOS < 9 的环境下可以避免上述错误弹框，
通过设置 `iframe` 的 `src` 来触发 URI Scheme：

```html
<iframe src="harttle://about"> </iframe>
```

如果 APP 已安装，仍然需要用户点击确认才能跳转到 App。比如手机百度的跳转：

![ios uri scheme installed](/assets/img/blog/app/uri-scheme-installed-ios@2x.png)

## Universal Link

[Universal Link][universal-link] 是一个普通的，可以用任何浏览器打开的 Web URL。
在 iOS >= 9 的系统中这些 URL 可以绑定到对应 App 中，如果安装有对应 App 就会调起，否则会直接打开该 URL。
例如：

```html
<a href="https://harttle.land/about.html"></a>
```

Universal Link 通过 Web 服务器验证的方式避免了 URI Scheme 的命名冲突。
只能通过页面跳转来触发，无法通过 `iframe` 触发，这意味着无论如何页面都要跳转。
它的具体表现如下：

* 如果 App 未安装。会跳转至你给定的 Web 页面，这里可以导流到 iTunes，iOS 会负责启动 App Store。
* 如果用户已安装，且这是第一次调起。会跳转至你给定的 Web 页面，下拉后 Safari 会显示打开 App 按钮（见下图）。
* 如果用户已安装，且已经调起过。会直接打开 App。

![ios universal link first time](/assets/img/blog/app/universal-link-first-time@2x.jpeg)

> 需要服务器端给出 [`apple-app-site-association`][apple-app-site-association] 以验证 App 的 URL 绑定。

## Chrome Intent

在 Chrome for Android >= 25 的环境下，可以使用 [Chrome Intent][android-intent] 来调起 Android App。
例如：

```html
<a href="intent://about/#Intent;scheme=harttle;package=land.harttle;end"></a>
```

相比于 URI Scheme，Chrome Intent 扩展了 `browser_fallback_url` 来定义未安装时的跳转链接。
它的值是一个 [`encodeURIComponent`][encodeURIComponent] 过的 URL，例如：

```html
<a href="intent://about/#Intent;scheme=harttle;package=land.harttle;S.browser_fallback_url=http%3A%2F%2Fharttle.land%2Fabout.html;end"></a>
```

如果已安装，Chrome 会不询问用户直接调起 App。如果未安装，Chrome 会跳转至 `S.browser_fallback_url`。

## Android App Link

类似 Universal Links，[Android App Link][android-app-links] 采取类似的机制：
使用标准的 Web 页面 URL，同时绑定对应的 App。在 Android >=6 的系统中支持这一机制。
例如下面的 URL：

```html
<a href="https://harttle.land/about.html"></a>
```

需要服务器端给出 `assetlinks.json` 以验证 App 的 URL 绑定。

## JavaScript 获取成功与否

上述所有调起方式都必须通过页面请求（除了特定情况下的 `iframe`），
没有 JavaScript API 可用。理论上不存在调起结果回调。

但实践上可以通过 `setTimeout` 来检查页面是否还在运行，以及页面是否中断过。
原理是如果页面切走（这意味着成功调起），`setTimeout` 回调的触发时间点会延迟。
这一方式不够准确，但只有这一种办法。

* 如果被判定为调起成功，则一定是调起成功的。
* 如果被判定为调起失败，则有可能调起成功。

即存在很大概率的 False Negative，但不存在 False Positive。

## 关于国产浏览器

这一部分讨论这三个浏览器的表现：UC, 微信，QQ。它们占据了系统浏览器之外的大多数市场份额，表现也惊人地一致。

* Android 下它们会拦截掉所有页面调起。需要提示用户从系统浏览器中打开。
* iOS 下它们会拦截 URI Scheme，既不会弹框也不会调起。对于 Universal Link 会直接打开 Web 页面而不调起。

其中 UC 浏览器在 iOS <9 的环境下尝试 URI Scheme 调起很可能会直接崩溃。
由于浏览器兼容性问题，以及 App 安装率不可能是 100%，调起成功率一般会很低尤其在 Android 下。

[deep-linking]: https://en.wikipedia.org/wiki/Deep_linking
[uri-scheme-fallback]: https://blog.branch.io/uri-schemes-and-universal-links-for-ios/
[universal-link]: https://developer.apple.com/ios/universal-links/
[android-intent]: https://developer.chrome.com/multidevice/android/intents
[encodeURIComponent]: /2017/05/23/percentage-encoding.html
[android-app-links]: https://developer.android.com/training/app-links/index.html
[apple-app-site-association]: https://developer.apple.com/library/content/documentation/General/Conceptual/AppSearch/UniversalLinks.html
