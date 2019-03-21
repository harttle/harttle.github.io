---
title: 所以 JS 是怎样一门语言？
tags: JavaScript Node.js 浏览器
background: 'linear-gradient(to right, #24C6DC,#514A9D)'
redirect_from: /2016/01/18/elegant-javascript.html
---

[JavaScript][wiki] 俗称 JS，又称借S。起源于 Netscape 浏览器支持的页面脚本，目前已经被 TC39 标准化为 ECMAScript。
所以我们说的 JavaScript 是 ECMAScript 的一种实现，或者说符合 ES 标准的 JavaScript 就是 ECMAScript。

<!--more-->

## JS 的地位

要讨论 JS 的地位必须要提起“网页”（Web Page），顾名思义是 Web 中的一个页面，而 Web 是一个巨大的分布式文档。
这一架构的基石是 [HTML][http]、HTTP 和 URI。之所以没有 JavaScript 或 Flash、CSS 这些东西，
是因为没有 HTML 就没有 Web，没有 HTTP 就没有 Web，没有 URI 就没有 Web，但没有 JavaScript 时确实有 Web。

JavaScript 给 HTML 页面带来了交互，是 Web2.0 的重要推动技术。在中文圈里，可以说 Web 就是借 S 和 H5。
JS 的地位如此之高，要归功于 Web App 的繁荣和开放网页的衰落。现在已经很少有网页开放访问了，大多需要登录甚至身份认证。

综上，**JS 是 Web App 的开发语言**。

## JS 的繁荣

Web 的设计是成功的，可链接的、人人可访问的分布式文档。
原本只希望在欧洲核子中心共享数据，短短几年内连接了整个世界，并成功地推动了互联网的普及。
以至于“互联网”、“上网”经常就是指 Web，鲜有人知 [互联网][wiki-internet] 指的其实是 IP/TCP 的国际网络互联。

**Web 是互联网上最成功的平台。**虽然 iOS、Android 在逐渐取代网页与用户交互，
但这些平台始终无法取代 Web 的优势：比如可链接、比如快速发版。
Native App 也在越来越多地采用 Web 技术和概念，比如 React、小程序、[Deep Link][deeplinking]、
甚至 Hybrid 直接嵌入。

JavaScript 是让 WebPage 变成 WebApp 的推手，类似 jQuery、Backbone、Angular 的框架直接推动了 Web2.0，
更多的用户直接在 Web 上生产内容。从此 JS 走上了“历史的快车道”：

1. 这一过程中出现的 JS 框架（比如 jQuery）彻底改变了 JavaScript 开发方式。我们可以专注业务而不是浏览器兼容。
2. WHATWG 的成立和 HTML5 的发布，浏览器之间的协作加速了 Web 标准的迭代。
3. Node.js 的流行（09年已经发布），从此 JavaScript 名正言顺地成为通用（General Purpose）编程语言。
4. ECMA 组织重新关注 ECMAScript 标准，从 ES6（2015）开始加速迭代。

## 繁荣的代价

**Web 的成功一部分来自开放和互联的初始设计，另一部分则来自向后兼容的原则。**
很难想象 Android 2.0 的软件能够运行在今天的 Android 平台上，
或者为 [Macintosh][Macintosh] 开发的软件能够运行在当今的 Mac 平台上，
但 1991 年的 HTML 页面可以非常好地展现在最新的浏览器中，而且比现在绝大多数网页都快速、安全和无障碍，这就是向后兼容。
向后兼容意味着数以亿计的网页、各种商业的或开源的浏览器、服务器、代理仍然可以正常运行，
像开放和可链接一样，向后兼容也是 Web 的本质特征之一。

HTML 标准的迭代在 1998 年就已经停滞了，2000 年前后 W3C 开始聚焦于 XHTML2，XForm 等新技术，
由于需要浏览器提供一种不向后兼容的引擎，XHTML 标准最终不了了之。
这正是 HTML5 成功的关键：完全兼容既有的 HTML 标准，尤其是既有的浏览器实现。
甚至提出如果实现和标准不一致，我们应当更改标准而非实现。以下来自 HTML Living Standard：

> The WHATWG was based on several core principles, in particular that technologies need to be backwards compatible, that specifications and implementations need to match even if this means changing the specification rather than the implementations, and that specifications need to be detailed enough that implementations can achieve complete interoperability without reverse-engineering each other. --[Introduction](https://html.spec.whatwg.org/multipage/introduction.html)

Web 平台的向后兼容是很严格的，包括旧的 Bug 也要保持不变。因为有人会依赖这些 Bug。
这就是为什么在今天的 JS 语言和 API 中仍然充斥着早期的设计缺陷，
这就是为什么同样是 JavaScript 可以写出不同时代的代码。
**就是向后兼容的要求让 JS 变得今天这样庞杂。**

## 为什么说庞杂？

**JS 标准较多**，需要理解什么宿主环境支持写怎样的语法，哪些语法需要开解释器参数。
比如 Node 6 中可以写 Arrow function 但不可使用 async/await。

**API 标准较多**，需要理解什么浏览器中可以用哪些接口。
jQuery 解决了当时绝大多数问题，但今天有更多的 API 开放出来，不是 jQuery 所能涵盖的。
比如 HTML 标准停滞后，厂商开始开发 DOM API Level2, Level3,...，W3C 则转而开发 XHTML1、XHTML2；
URI/HTTP Spec 由 IETF 维护，而 HTML Spec 由 W3C 维护，今天 WHATWG 又在提供 URL、HTML 等技术的 Living Standard。

**事实标准较多**，由于 HTML5 之前技术标准的停滞，产生了很多在现有标准框架下解决问题的社区标准。
比如 AMD、Defer、jQuery，还有一些语言增强比如 CoffeeScript
（harttle 宁愿手写一个[liquidjs][liquidjs]都不去开发[liquid-node][liquid-node]）、TypeScript，
这些都有额外的学习成本而且不一定符合长期标准。这也是 JS 比较杂的一个原因。

## JS 的不一致

下面到了举例环节。

* `var`。函数作用域、全局变量和变量提升机制已经无法移除，因此给出 `let`, `const` 并引入各种 Lint 工具来避免使用 `var`。类似的还有 `eval`, `with`。
* `Array.prototype.includes` 为什么不叫 `contains`。因为有一个广泛使用的叫 [MooTools 的工具已经占用了这个方法名](https://bugzilla.mozilla.org/show_bug.cgi?id=789036)。
* `XMLHttpRequest` 这么难用为什么仍然不改？新的 API 叫 [fetch][fetch]。前不久 [W3C webapps 邮件组还在讨论](https://lists.w3.org/Archives/Public/public-webapps/2018JulSep/0029.html) 为什么 `XMLHttpRequest` 在网络错误会直接 throw 而非 reject Promise，原因就是向后兼容：本来是抛异常的，Promise 化之后仍然不能 reject。
* 不一致的[类型转换][type-conv]。`toString()` 会在字符串相加时调用。比如 `{toString:()=>'a'} + 'b' === 'ab'`，但相加的双方类型不同时会相当复杂，这里有个表格：<https://www.andronio.me/2017/10/22/js-operators-incensistency/>
* `Symbol` 定义有 `.toString()` 但不能与字符串相加（会引发 `TypeError`），要手动 `Symbol('foo').toString() + 'b'`。
* `===`。不一致的类型转换使得 `==` 几乎不可用。`""==0` 是真，因为`""`被转换为`0`；`0=="0"` 是真，因为`0`被转换为`"0"`；但`""=="0"`为假，因为两侧都是字符串所以不发生类型转换。
* `typeof` 只能判断[基本数据类型][types]和 `object`，但不能区分 `null` 和 `Object`，但可以区分 `object` 和 `function`（二者都不是基本数据类型）。
* `instanceof` 只检查原型，因此只适用于对象。这导致 `"foo" instanceof String === false`，`"foo"` 不是字符串？。
* `this` 指向调用者，而调用者不一定是所在对象，被调用的函数也不一定是对象方法（可以是全局函数）。这导致了[函数作用域][js-scope]而非块级作用域。
* `Date` API：`.getFullYear()` 获取年份，`.getDate()` 获取日，`.getMonth()` 确实获取月份减一。

无法逐一列举，下面这些链接提供了更多乐趣：

* <https://www.dummies.com/web-design-development/javascript/10-common-javascript-bugs-and-how-to-avoid-them/>
* <http://www.standardista.com/javascript/15-common-javascript-gotchas/>
* <https://www.codeproject.com/Articles/182416/A-Collection-of-JavaScript-Gotchas>
* <https://www.reddit.com/r/ProgrammerHumor/comments/88gniv/old_meme_format_timeless_javascript_quirks/>
* <https://ponyfoo.com/articles/more-es6-proxy-traps-in-depth>

## 技术展望

今天已经很少有人直接写 JavaScript 了，更多的是去写 ES6（遵循 ECMAScript 6th Edition 的 JavaScript），
或者 TypeScript、JSX 等，经过编译得到运行在浏览器或 Node 中的 JavaScript。
**从这个角度看 JavaScript 已经成为底层语言**。上层语言的迭代才会直接影响到开发体验。

另一方面，从 HTML5 和 ES6 开始，HTML 标准、DOM 标准、CSS 标准，和 ECMAScript 标准迭代都在加快。
**这意味着 JavaScript 的各种宿主 API 和语言本身正在快速增强**。
WHATWG 的各种 Living Standard 成为浏览器环境的事实标准，MDN 则是这些标准的官方教程。

综上，开发实践正在远离底层的 JavaScript 转向上层语言；而 JavaScript 也正在变得更好。
当然 JavaScript 的上述“不一致”和遗留问题会长期存在，这也是 JS 繁荣的基础。

[js-scope]: /2016/02/05/js-scope.html
[http]: /2014/10/01/http.html
[deeplinking]: /2017/12/24/launch-app-from-browser.html
[fetch]: /2017/04/22/fetch-api.html
[type-conv]: /2015/08/21/js-type-conv.html
[types]: /2015/09/18/js-type-checking.html
[liquidjs]: https://github.com/harttle/liquidjs
[liquid-node]: https://github.com/sirlantis/liquid-node
[wiki]: https://en.wikipedia.org/wiki/JavaScript
[wiki-internet]: https://en.wikipedia.org/wiki/Internet
[Macintosh]: https://en.wikipedia.org/wiki/Macintosh
