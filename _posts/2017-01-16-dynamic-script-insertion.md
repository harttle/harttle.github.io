---
title: 在 DOM 中动态执行脚本
tags: DOM HTML JavaScript jQuery innerHTML
---

在 HTML 中脚本以 `<script>` 来标记，通过设置其内容或`src`属性执行内联脚本或外部脚本。
本文讨论动态地插入脚本标签时浏览器对它的解析、下载和执行行为。
动态插入脚本的场景可能包括使用 AJAX 获取脚本并动态执行（多用于性能优化），
以及运行时决定执行页面模板中的某段脚本（多用于单页异步）。

> 动态执行脚本还有其他方式，比如`eval`和`new Function`，这些不在本文的讨论范围。

<!--more-->

## 执行内联脚本

为了插入内联脚本，可以创建一个`script`元素并设置其内容，插入到 DOM 即可 **立即执行**。例如：

```javascript
var script = document.createElement('script');
script.text = 'console.log("foo")';
// 等价于
// script.text = 'console.log("foo")';
// script.innerText = 'console.log("foo")';
// script.innerHTML = 'console.log("foo")';
document.body.appendChild(script);
console.log("bar");
```

**立即执行** 是指 `.appendChild` 方法是阻塞的，脚本运行结束才返回。因此上述脚本的输出是：

```
foo
bar
```

此外，内联脚本是否能够被浏览器执行还取决于 [CSP策略指令][csp] 设置，
该策略是由`Content-Security-Policy`响应头([rfc7762][rfc7762])控制的。
例如下列设置将会禁止执行`harttle.land`以外的任何内联脚本。

```
Content-Security-Policy: script-src harttle.land;
```

## 执行外部脚本

插入并执行外部脚本的方法与内联脚本类似，只需设置`script.src`属性并插入到 DOM。
例如：

```javascript
var script = document.createElement('script');
script.src = 'foo.js';
document.body.appendChild(script);
```

与内联脚本不同的是，外部脚本的插入是异步的不会阻塞 DOM 解析。
详见[异步渲染的下载和阻塞行为](/2016/11/26/dynamic-dom-render-blocking.html)一文。

> 此外有一个细节可能需要注意：一旦设置了`src`属性，`<script>` 标签本身的所有内容就不会再被执行了。

## innerHTML

`innerHTML`属性可用来设置 DOM 内容，但不可用来插入并执行`<script>`。
下面的内联脚本和外部脚本都不会被执行：

```javascript
document.body.innerHTML = '<script src="foo.js"></script>'
document.body.innerHTML = '<script>console.log("foo")</script>'
```

在设置 `innerHTML` 时，浏览器会初始化一个新的 HTML Parser 来解析它。
只要与该 Parser 关联的 DOM 启用了 JavaScript（通常是启用的），脚本的 `scripting flag` 就为真，
但是即便如此，[HTML 片段的解析过程中，脚本是不会执行的][psf]。


> Create a new HTML parser, and associate it with the just created Document node. -- 12.4 [Parsing HTML fragments][phf], WHATWG 
> 
> The scripting flag can be enabled even when the parser was originally created for the HTML fragment parsing algorithm, even though script elements don't execute in that case.
> -- 12.2.3.5 [Other parsing state flags][psf], WHATWG

事实上，设置`innerHTML`和`outerHTML`都不执行脚本，但`document.write()`是会同步执行的。

> When inserted using the document.write() method, script elements execute (typically blocking further script execution or HTML parsing), but when inserted using innerHTML and outerHTML attributes, they do not execute at all. -- 4.12.1 [The script element][script] WHATWG

## jQuery DOM Eval

我们知道使用 jQuery `html()` 方法时插入的脚本总是执行的，jQuery 会检查传入的内容，并执行其中的每一个脚本。
源码在[src/core/DOMEval.js][domeval]：

```javascript
function DOMEval( code, doc ) {
    doc = doc || document;
    var script = doc.createElement( "script" );
    script.text = code;
    doc.head.appendChild( script ).parentNode.removeChild( script );
}
```

## 扩展阅读

* CSP 策略指令：<https://developer.mozilla.org/zh-CN/docs/Web/Security/CSP/CSP_policy_directives>
* MDN createDocumentFragment: <https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment>
* jQuery DOMEval: https://github.com/jquery/jquery/blob/master/src/core/DOMEval.js

[csp]: https://developer.mozilla.org/zh-CN/docs/Web/Security/CSP/CSP_policy_directives
[rfc7762]: https://tools.ietf.org/html/rfc7762
[phf]: https://html.spec.whatwg.org/#parsing-html-fragments
[psf]: https://html.spec.whatwg.org/#other-parsing-state-flags
[script]: https://html.spec.whatwg.org/#the-script-element
[domeval]: https://github.com/jquery/jquery/blob/master/src/core/DOMEval.js
