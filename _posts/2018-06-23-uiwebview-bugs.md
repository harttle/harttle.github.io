---
title: iOS UIWebView 的 Bug 集锦
tags: iOS 动画 UIWebView scroll
---

Apple 在  [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
中提到 iOS 软件只允许使用其 WebKit 内核，事实上就是只能选择
[UIWebView](https://developer.apple.com/documentation/uikit/uiwebview?changes=_6)
和
[WKWebView](https://developer.apple.com/documentation/webkit/wkwebview?changes=_8)
来实现 Web 浏览。而官方推荐在 iOS 8 之后的系统中使用 WKWebview，UIWebView 已处于 Deprecated 状态：

> In apps that run in iOS 8 and later, use the WKWebView class instead of using UIWebView. Additionally, consider setting the WKPreferences property javaScriptEnabled to false if you render files that are not supposed to run JavaScript. -- [Apple Developer][apple-dev]

尽管如此，**由于商业或技术上的原因很多国内浏览器仍然在使用 UIWebview**。
比如 WKWebview 直到 iOS11 才支持 [WKURLSchemeHandler][WKURLSchemeHandler]
（类似 UIWebView 的 [NSURLProtocol]）影响 Web 页面和 Native 通信的实现。

* QQ 浏览器。曾经是 UIWebView 现在已经切换到 WKWebview（不存在官方 Changelog）。
* 微信内置浏览器。从2017年3月1日切换到 WKWebview，参考：[iOS WKWebview 网页开发适配指南](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1483682025_enmey)。虽然不知道为啥 WKWebview 还要“适配”，WTF
* [UC 浏览器][uc-browser]。目前（版本 12.0.3.1077）仍然是 UIWebView。
* [百度（手机百度）][baidu-browser]。目前（版本 10.8.6）仍然是 UIWebView。

本文描述的是 UIWebview 下的 Bug，Safari 和基于 WKWebview 的浏览器比如 Chrome 不受影响。

<!--more-->

# touch 交互暂停动画

在发生手势交互时，页面中脚本线程会挂起，事件不再触发，动画也不会继续执行。
`animation` 和 `transition` 都会冻结。
可能是因为早期 iOS 手势操作优先的性能策略，UIWebView 的主要问题都集中在手势操作的场景下。
这是一个例子：

1. 用 iOS UC 浏览器访问：<https://harttle.land/animation-bugs/a-normal-animation.html> ，你会看到一个旋转的动画。
2. 手势触发一下页面滚动，在手指未离开屏幕期间动画会被暂停。

这里有一个录屏： <https://harttle.land/animation-bugs/a-normal-animation-uiwebview.mp4>

# 恢复滚动位置不触发 scroll 事件

浏览器都会有一个恢复滚动位置的策略：当你刷新一个已经浏览过的页面时，
页面加载后浏览器会恢复到上次滚动到的位置。
因为这一操作是在页面加载后进行的（显然要先有页面才能进行滚动），
这时浏览器会触发一个 `scroll` 事件。

**但是 UIWebView 下不触发这个事件**，可以按以下步骤复现：

1. 访问这个示例页面：<https://harttle.github.io/scroll-restoration-demos/scroll-event.html>，每次触发 scroll 事件都会显示在页面右上角。
2. 滚动到页面底部，刷新页面。
3. 浏览器会恢复滚动位置到底部，然而右上角并未显示触发了 `scroll` 事件。

# scroll 事件延迟

几乎所有前端都听说过 scroll 事件节流，因为 Webkit 下 `scroll` 事件会非常频繁地触发。
但 UIWebView 下却是每次开始滚动到结束滚动只触发一次 `scroll`。
这意味着滚动期间无法做到任何跟随效果，由于动画、事件都被挂起，根据 [MDN 的描述][mdn-scroll]：

> In iOS UIWebViews, scroll events are not fired while scrolling is taking place; they are only fired after the scrolling has completed. See Bootstrap issue #16202.

同样访问这个示例页面 <https://harttle.github.io/scroll-restoration-demos/scroll-event.html>，
每次滚动都有日志，可以查看 `scroll` 事件的触发频率。

[apple-dev]: https://developer.apple.com/documentation/uikit/uiwebview?changes=_6
[WKURLSchemeHandler]: https://developer.apple.com/documentation/webkit/wkurlschemehandler
[NSURLProtocol]: https://developer.apple.com/documentation/foundation/nsurlprotocol
[uc-browser]: https://itunes.apple.com/cn/app/uc%E6%B5%8F%E8%A7%88%E5%99%A8-%E6%96%B0%E9%97%BB%E5%A4%B4%E6%9D%A1%E6%99%BA%E8%83%BD%E6%B5%8F%E8%A7%88%E5%99%A8/id586871187?mt=8
[baidu-browser]: https://itunes.apple.com/cn/app/%E7%99%BE%E5%BA%A6/id382201985?mt=8
[mdn-scroll]: https://developer.mozilla.org/en-US/docs/Web/Events/scroll
