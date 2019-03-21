---
title: jQuery获取元素内容
tags: DOM HTML iframe jQuery
---

所有人都知道使用`.html()`可以获得元素内容，`.find()`可以获得子元素。
但这两个方法不是万能的，在很多场景我们需要其他的API。例如：

* 获得所有内容节点（包括文本、注释、元素）
* 获得iframe或frame内的document
* 获得所有直接子元素

下文中整理的jQuery获取元素内容的各种方法及其区别，
包括`.html()`, `.text()`, `.children()`, `.contents()`。

<!--more-->

## .html()

获取jQuery集合中首个元素的HTML内容，相当于`HTMLElement.innerHTML`。
该方法通常用于获取`<script>`的内容，设置渲染结果，
以及初始化在线编辑器的内容。

文档：<http://api.jquery.com/html/>

> 注意，设置表单元素的内容需要使用`.val()`方法而非`.html()`。

## .text()

获取jQuery集合中每个HTML元素的文本内容，相当于很多模板引擎中的`strip_html`。
相当于DOM API中的[Node.textContent][textContent]。

常用于从HTML文档获取文本摘要，比如生成分享内容，文档标题，以及文本消息。
例如：

```javascript
<p><b>Test</b> Paragraph.</p>
 
<script>
$("p").text() === 'Test Paragraph.'
</script>
```

文档：<http://api.jquery.com/text/>

## .children()

获取jQuery集合中每个HTML元素的子元素，只获得元素节点（`nodeType===1`）。
与`.find()`唯一的区别就是只取直接子元素。

> 文档：<http://api.jquery.com/children/>

## .contents()

获取所有子节点，包括元素节点（`nodeType===1`）、文本节点（`nodeType===3`）
以及注释节点（`nodeType===8`）。
相当于DOM API中的[ParentNode.children][children]。

这在我们操作文本内容是非常有用，比如把当前页面文本中所有harttle设为大写：

```javascript
$('p').contents()
    .filter(function() { 
        return this.nodeType == 3; 
    })
    .each(function(){
        this.textContent = this.textContent
            .replace(/harttle/, 'HARTTLE');
    });
```

除此之外，`.content()`还可以获取frame元素内容的`document`对象。
看源码[`src/traversing`][src/traversing]：

```javascript
contents: function( elem ) {
    return elem.contentDocument || jQuery.merge( [], elem.childNodes );
}
```

因为`contentDocument`在[操作同域iframe][iframe-script-injection]时才可用，
所以通过`.contents()`获取iframe内容也需要同域iframe。

文档：<https://api.jquery.com/contents/>

[src/traversing]: https://github.com/jquery/jquery/blob/master/src/traversing.js
[children]: https://developer.mozilla.org/zh-CN/docs/Web/API/ParentNode.children
[iframe-script-injection]: /2016/04/14/iframe-script-injection.html
[textContent]: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent
