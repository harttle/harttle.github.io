---
title: 获取 DOM 内容的 API 接口
tags: DOM HTML jQuery innerHTML textContent 重排
---

Web 开发者可能会使用 jQuery [`.html()`][jq-html] 和 [`.text()`][jq-text]
方法来设置 DOM 内容，但他们的实现仍然依赖于 DOM API。
本文来梳理一下这些用来获取 DOM 内容的 DOM 属性（attribute），
比较它们的区别：`innerHTML`, `outerHTML`, `innerText`, `outerText`, `text`, `textContent`，
以及 jQuery 中`.html()`和`.text()`的实现。

<!--more-->

# innerHTML/outerHTML

[`outerHTML`][outerHTML] 和 [`innerHTML`][innerHTML]
DOM 属性用来设置 DOM 的 HTML 内容。
其中 `innerHTML` 返回元素内容的 HTML 片段，而 outerHTML 返回的 HTML 片段则包括元素本身、以及元素内容的。
其中 `innerH ` 常常用于清空元素内容。

```javascript
document.body.innerHTML = '';
```

需要注意`innerHTMl`设置的脚本内容将不会被执行，参考[在 DOM 中动态插入并执行脚本][script-insert]。
另外 `innerHTML` 获取 HTML 内容时会执行 DOM 的序列化，序列化结果与源码不一定相同。
即一次 Parse + 一次序列化得到的结果可能与 HTML 源码不同。例如对于下面的 HTML 片段：

```html
<div id="foo">></div>
```

`document.getElementById('foo').innerHTML` 的结果是 `&gt;`。
正因为转义的存在，使用 `<template>` 容纳的模板字符串是安全的。这也是为什么 [AMP 可以在保证安全的同时引入模板引擎][amp-mustache]。

# innerText/outerText

与 `innerHTML`,  `outerHTML` 相同，inner 只会设置内容而 outer 会更改整个元素。
不同的是，[`innerText`][innerText] 与 `outerText` 则用来获取和设置渲染后的结果。
例如设置的 HTML 特殊字符会被转义，换行会被解析为`<br/>`。例如：

```javascript
document.body.innerText = '<h2>header</h2>\nparagraph'
```

的渲染结果为：

```
&lt;h2&gt;header&lt;/h2&gt;<br>paragraph
```

利用 `innerText` 可以方便地进行 HTML 转义：

```javascript
function escape(str){
  var el = document.createElement('div');
  el.innerText = str;
  return el.innerHTML;
}

// 返回 &lt;h2 id="foo"&gt;
escape('<h2 id="foo">');
```

# text/textContent

[`textContent`][textContent] 与 `innerText` 表现相似，但有一些细节不同：

* `textContent` 是定义在 Node 上的，Element 继承了该属性。
* `textContent` 可以获取不渲染的内容而`innerText`不可以。包括`<style>`, `<script>`, 以及被 CSS 隐藏的元素。
* 因 `innerText` 排除了隐藏元素，它会引起重排（Reflow）。
* IE11 及以下的 `innerText` 会销毁被移除的元素，而`textContent`不会。

[text][text] 只在特定的几个元素上有定义，比如`<a>`和`<script>`：

* `<a>`元素的 `text` 用来设置其文本内容。其表现完全等同于`textContent`:

    > The text IDL attribute, on getting, must return the same value as the textContent IDL attribute on the element, and on setting, must act as if the textContent IDL attribute on the element had been set to the new value. -- [W3C HTML5][text]

* `<script>` 元素的 `text` 用来设置其脚本的内容，这时完全等同于`textContent`,`innerText`,`innerHTML`。

# jQuery .html()

jQuery 的 [.html()][jq-html] 用来设置 HTML 元素的 HTML 内容。
不同于 `innherHTML`，jQuery 的 `.html()` 会执行字符串中的脚本。
几乎所有操作 DOM 内容的 jQuery 方法都有这一行为，包括 `.after()`, `.append()`, `.before()` 等等。

当然这不是 Magic，jQuery 在设置 innerHTML 的同时，找到了里面所有的`<script>`并进行强制加以执行。
在 `.html()` 的定义在 [/src/manipulation.js][src/manipulation] 中，
它调用了`.append()` 来进行进行 DOM 操作，最终调用到
[domManip( collection, args, callback, ignored )][domManip] 函数：

```javascript
function domManip( collection, args, callback, ignored ) {
    // ...
    if ( hasScripts ) {
        // ...
        if ( node.src ) {
            // Optional AJAX dependency, but won't run scripts if not present
            if ( jQuery._evalUrl ) {
                jQuery._evalUrl( node.src );
            }
        } else {
            DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
        }
    }
}
```

这里调用了 DOMEval 来强制执行脚本，其代码在 [/src/core/DOMEval.js][domeval] 中：

```javascript
function DOMEval( code, doc ) {
    doc = doc || document;

    var script = doc.createElement( "script" );

    script.text = code;
    doc.head.appendChild( script ).parentNode.removeChild( script );
}
```

[`.appendChild()`][appendChild] 并立即 [`.removeChild()`][removeChild]
会导致立即执行（以及必要的下载）脚本。对于动态执行脚本在
[DOM 中动态插入并执行脚本](/2017/01/16/dynamic-script-insertion.html) 一文有详细讨论。

# jQuery .text()

jQuery [.text()][jq-text] 就非常简单，它的实现只有 11 行，
使用的 DOM API 正是上文中讨论的 `textContent`：

```javascript
text: function( value ) {
    return access( this, function( value ) {
        return value === undefined ?
            jQuery.text( this ) :
            this.empty().each( function() {
                if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                    this.textContent = value;
                }
            } );
    }, null, value, arguments.length );
},
```

# 扩展阅读

* <http://stackoverflow.com/questions/24427621/innertext-vs-innerhtml-vs-label-vs-text-vs-textcontent-vs-outertext>
* <https://w3c.github.io/DOM-Parsing/>
* <https://www.w3.org/TR/html5/single-page.html>
* <https://github.com/jquery/jquery>

[outerHTML]: https://w3c.github.io/DOM-Parsing/#dom-element-outerhtml
[innerHTML]: https://w3c.github.io/DOM-Parsing/#dom-element-innerhtml
[script-insert]: http://harttle.land/2017/01/16/dynamic-script-insertion.html
[innerText]: https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
[textContent]: http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-textContent
[text]: https://www.w3.org/TR/html5/single-page.html#dom-a-text
[jq-html]: http://api.jquery.com/html/
[src/manipulation]: https://github.com/jquery/jquery/blob/master/src/manipulation.js
[domManip]: https://github.com/jquery/jquery/blob/b442abacbb8464f0165059e8da734e3143d0721f/src/manipulation.js#L126
[domeval]: https://github.com/jquery/jquery/blob/b442abacbb8464f0165059e8da734e3143d0721f/src/core/DOMEval.js
[appendChild]: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
[removeChild]: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
[jq-text]: http://api.jquery.com/text/
[amp-mustache]: https://www.ampproject.org/docs/reference/components/dynamic/amp-mustache
