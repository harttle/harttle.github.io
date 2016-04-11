---
layout: blog
title: 为iframe注入脚本的不同方式比较
tags: DOM HTML JavaScript jQuery iframe 
---

最近在开发[天码营前端预览工具](http://tianmaying.com/preview)（类似JSFiddle），
需要将CSS、HTML与JavaScript一起注入到ifame中。
借此研究一下iframe中注入脚本的不同方式之间的区别。

# 访问iframe内容

在父窗口中可以通过iframe DOM节点获取其`window`与`document`（需要同域）。
获取iframe的`window`对象（所有全局变量、函数都在该对象下）：

```javascript
var iframe = $('iframe').get(0);
var iwindow = $('iframe').prop('contentWindow');
// 相当于
var iwindow = document.getElementsByTagName('iframe')[0].contentWindow;
```

获取iframe的`document`有两种写法：

```javascript
var idocument = $('iframe').prop('contentDocument');
// 相当于
var idocument = $('iframe').prop('contentWindow').document;
```

> `contentDocument`属性在 IE 8 才开始支持，为了支持 IE 7，推荐使用`contentWindow.document`。

<!--more-->

# 通过appendChild注入

## 实现方式

iframe中脚本的上下文无非两种：1）与父元素共享`window`，2）与父元素隔离的`window`。
为了检查该上下文，我们设置父元素`window.id`并在iframe中打印出来。

```javascript
window.id = 'parent window';
var injected_script = 'console.log("window.id ==", window.id)';
```

通过上述`idocument`可以访问iframe的DOM，借用`appendChild()`API来注入脚本：

```javascript
var el = idocument.createElement('script');
el.text = injected_script;
idocument.body.appendChild(el);
```

## 执行结果

```
window.id == undefined
```

脚本样式文件被正常载入并执行，脚本的运行上下文也是与父容器隔离的。

> 注意：使用jQuery`.append()`方法注入：`$(idocument.body).append(el)`，
> 上下文总是当前jQuery所在的`window`，因为jQuery总是用`eval`来执行注入的脚本。
> 见：[jQuery2.2 iframe 脚本注入的上下文 Bug][jquery-script-bug]。

## 缺点

难以显示完整的HTML。因为`appendChild`是`document.body`的方法，
如果要在`<head>`下添加元素或操作整个`<html>`则会比较困难。

另外，只能与同域iframe进行互操作。

# 通过innerHTML注入

## 实现方式

DOM元素都有`innerHTML`属性可以设置其HTML内容，
我们利用`body.innerHTML`即可注入脚本。

```javascript
var html = "<script>" + injected_script + "</script>";
idocument.body.innerHTML = html;
```

## 执行结果

```

```

上述代码没有任何输出，因为以`innerHTML`注入的HTML中的脚本不会执行。
你可能知道为`<script>`设置`innerHTML`也不会执行脚本内容，需要设置`script.text`属性才可以执行。
设置`innerHTML`的方法只适用于给DOM注入文本内容。

## 缺点

注入内容中的脚本不会被执行。如果非要执行的话，需要为所有脚本一一设置`script.text`属性，非常麻烦。

另外，只能与同域iframe进行互操作。

# 通过data src注入

## 实现方式

`<img>`标签接受data URI类型的`src`，你一定见过！data URI的语法如下：

```
data:[<mime type>][;charset=<charset>][;base64],<encoded data>
```

同样地，`<iframe>`也可以设置data类型的`src`属性，
这是iframe页面内容和脚本注入最通用最健壮的办法。

```javascript
var html = '<script>' + injected_script + '</script>';
var html_src = 'data:text/html;charset=utf-8,' + encodeURI(html);
iframe.src = html_src;
```

## 执行结果

```
window.id == undefined
```

脚本样式文件被正常载入并执行，脚本的运行上下文也是与父容器隔离的。

另外，通过Data URI设置内容会使得iframe与容器跨域，没有脚本注入问题，但也不允许互操作。

## 缺点

### 跨域问题

由于设置了`src`，iframe和父容器是跨域的。
在父容器的上下文中，无法通过`contentWindow.document`访问`iframe`内容

```
Uncaught DOMException: Blocked a frame with origin "https://xxx" from accessing a cross-origin frame.
```

### IE不兼容

在Microsoft IE中，只有五类DOM元素可以设置Data URI：

* object (images only)
* img
* input type=image
* link
* CSS declarations that accept a URL, such as background, backgroundImage, and so on.

为iframe设置Data URI之后iframe会显示『无法显示该页面』。

参见：<https://msdn.microsoft.com/en-us/library/cc848897(v=VS.85).aspx>

# 通过document.write注入

## 实现方式

使用DOM API`document.open()`方法打开并擦除一个文档，
然后调用`document.write()`写入内容，
最后调用`document.close()`关闭文档，迫使文档进行渲染和显示。

```javascript
idocument.open();
idocument.write($html.prop('outerHTML'));
idocument.close();
```

参见：<http://www.w3school.com.cn/jsref/met_doc_open.asp>

## 执行结果

```
window.id == undefined
```

脚本样式文件被正常载入并执行，脚本的运行上下文也是与父容器隔离的。
`document.write`的方式主流浏览器均可支持，包括：MSIE、Chrome、Safari、Firefox。

## 缺点

通过DOM API互操作，要求iframe与父容器是同域的。
与前面所有DOM操作的注入方式同样会存在XSS安全问题。

[jquery-script-bug]: /2016/04/07/jquery-script-context-bug.html
