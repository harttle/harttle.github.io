---
title: 异步渲染的下载和阻塞行为
tags: CSS Chrome DOM DOM解析 异步 Firefox
---

在[CSS/JS对DOM渲染的影响](/2016/11/26/static-dom-render-blocking.html)一文
探讨了静态页面中的JavaScript/CSS的载入和解析对DOM渲染的影响。
本文接着讨论异步渲染场景下JavaScript/CSS对DOM解析（Parsing）和渲染（Rendering）的影响。

# TL;DR

* 动态插入的外部样式表或脚本不阻塞DOM解析或渲染。
* 动态插入的内联样式表或脚本会阻塞DOM解析和渲染。
* 未连接到DOM树的样式表或脚本（外部或内联）不会被下载、解析或执行。
* 可以通过`onload`和`onerror`监听HTML资源标签载入结果，兼容IE需要`onreadystatechange`。

<!--more-->

# 外部样式表

动态插入的外联样式表不阻塞DOM渲染，当然也不阻塞解析。
我们可以通过插入一个样式表、再插入一些脚本和文字来测试：

```javascript
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.jsdelivr.net/npm/animate.css@3.5.2/animate.css';

var script = document.createElement('script');
script.text = 'console.log("after link[rel=stylesheet]")';

var h2 = document.createElement('h2');
h2.innerHTML = 'Hello World';

document.body.innerHTML = '';
document.body.appendChild(link);
document.body.appendChild(script);
document.body.appendChild(h2);
```

在外部样式表仍在下载的过程中，后续的脚本（`"after link[rel=stylesheet]"`）已经执行，
文本也已经渲染（`<h2>Hello World</h2>`）：

![dynamic-link-not-block-rendering][dynamic-link-not-block-rendering]

# 内联样式表

与外链样式表不同，内联样式表会阻塞DOM解析（当然渲染也会被阻塞）。
其实不能叫阻塞啦，因为不涉及网络请求，内联样式表的解析本来就是同步的。

我们可以通过`document.styleSheets`来检测样式表是否已经解析（Parse）：

```javascript
var style = document.createElement('style');
style.textContent = '*{ color: red }';

document.head.innerHTML = document.body.innerHTML = '';
console.log(document.styleSheets.length);
document.body.appendChild(style);
console.log(document.styleSheets[0].rules[0].cssText);
```

注意上述有两处`console.log`。第一处是在`<style>`尚未连接到DOM树时读取样式表的数目；
第二处是在插入`<style>`标签后立即读取被解析的CSS规则：

![dynamic-style-block-parsing][dynamic-style-block-parsing]

* 插入前样式表为空，说明未连接到DOM树的内联样式不会被解析。
* 插入后样式表会被立即解析，甚至不会进入下一个[事件循环][event-loop]。

# 外部脚本

动态插入的外部脚本的载入是异步的，不会阻塞解析或者渲染。
这意味着动态插入一个外部脚本后不可立即使用其内容，需要等待加载完毕。
例如：

```javascript
var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/react@15.4.0/dist/react.js';
document.body.appendChild(script);
console.log('after script', window.React);
```

我们会发现`window.React`是空，等它加载结束后`window.React`才可用：

![dynamic-external-script-wont-block][dynamic-external-script-wont-block]

# 内联脚本 

与静态内联脚本一样，动态插入内联脚本也会阻塞DOM解析（Parsing）。

```javascript
var script = document.createElement('script');
script.text = "console.log('from script');"
console.log('before script');
document.body.appendChild(script);
console.log('after script');
```

注意我们在插入脚本前后各输出一条记录，执行结果如下图：

![dynamic-inline-script-block-parsing][dynamic-inline-script-block-parsing]

1. `"before script"`出现在`"from script"`之前，说明未连接到DOM树的脚本不会被执行。
2. `"after script"`出现在`"from script"`之后，说明内联脚本的插入会阻塞DOM解析。

# 未连接的CSS/JS不会被载入

通过上述实验我们知道没有连接到DOM树的内联CSS/JS不会被解析，
事实上没有连接到DOM树
（即[browsing-context connected][browsering-context-connected]）
的外部CSS/JS也不会加载。

> `browsing-context connected`比*连接到DOM树*更加准确，
> 比如连接到了以当前DOM树中节点为根的ShadowDOM中也称`browsing-context connected`。

也就是说如果你创建了一个`<link rel="stylesheet">`（或`<script>`）但并未连接到DOM树，那么它不会被加载。
这是标准行为与浏览器实现方式无关，因此你可以放心地利用该特性。
该特性很容易测试，只需创建一个`<link rel="stylesheet">`（或`<script>`）标签并查看是否产生网络请求：

```javascript
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.jsdelivr.net/npm/animate.css@3.5.2/animate.css';
var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/react@15.4.0/dist/react.js';
```

很显然，未连接到DOM树的`<link rel="stylesheet">`（或`<script>`）根本没有被下载：

![unconnected-css-js-wont-load][unconnected-css-js-wont-load]

如果将这两个资源标签连接到DOM树，你会立即看到Network记录：

```javascript
document.body.append(link);
document.body.append(script);
```

> `Image`与CSS/JS的行为非常不一样，只要设置`src`属性图片便会立即加载（`(new Image).src = 'foo'`）。
> 这一特性常被用来发送[跨域][cors]访问日志。

# 资源载入事件

脚本和样式载入事件可以直接监听到，当然这只对非阻塞的资源获取有效。
需要注意的是浏览器兼容性：绝大多数情况监听`onload`和`onerror`即可，
为了支持IE浏览器，可以监听`onreadystatechange`事件：

```javascript
createScript('https://cdn.jsdelivr.net/npm/react@15.4.0/dist/react.js');
createScript('https://harttle.land/this/will/404.js');
function createScript(src){
    var el = document.createElement('script');
    el.src = src;
    el.onload = () => console.log('load', el);
    el.onerror = () => console.log('error', el);
    el.onreadystatechange = () => console.log('readystatechange', el);
    document.body.append(el);
}
```

对于这三个事件，在多数浏览器（包括Firefox和Chrome）下**只会**触发`onload`和`onerror`，
只有在IE下**只会**触发`onreadystatechange`。请看：

![resource-load-event][resource-load-event]

嗯，在Chrome下触发了`onload`和`onerror`。

# 扩展阅读

* WHATWG Rendering: <https://html.spec.whatwg.org/multipage/rendering.html>
* WHATWG Stylesheet: <https://html.spec.whatwg.org/multipage/semantics.html#link-type-stylesheet>

[dynamic-link-not-block-rendering]: /assets/img/blog/dom/dynamic-link-not-block-rendering@2x.png
[dynamic-style-block-parsing]: /assets/img/blog/dom/dynamic-style-block-parsing@2x.png
[dynamic-external-script-wont-block]: /assets/img/blog/dom/dynamic-external-script-wont-block@2x.png
[dynamic-inline-script-block-parsing]: /assets/img/blog/dom/dynamic-inline-script-block-parsing@2x.png
[unconnected-css-js-wont-load]: /assets/img/blog/dom/unconnected-css-js-wont-load@2x.png
[resource-load-event]: /assets/img/blog/dom/resource-load-event@2x.png
[event-loop]: https://html.spec.whatwg.org/#event-loops
[browsering-context-connected]: https://html.spec.whatwg.org/multipage/infrastructure.html#browsing-context-connected
[stylesheet]: https://html.spec.whatwg.org/multipage/semantics.html#link-type-stylesheet
[cors]: /2015/10/10/cross-origin.html
