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

<!--more-->

# 通过appendChild注入

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

执行结果：

```
window.id == undefined
```

这意味着通过DOM API`appendChild()`注入的脚本上下文为iframe上下文，与父容器隔离。

> 注意：使用jQuery`.append()`方法注入：`$(idocument.body).append(el)`，
> 上下文总是当前jQuery所在的`window`，因为jQuery总是用`eval`来执行注入的脚本。
> 见：[jQuery2.2 iframe 脚本注入的上下文 Bug][jquery-script-bug]。

# 通过innerHTML注入

你可能知道为`<script>`设置内容需要用`text`属性，`innerHTML`属性只能设置文本，并不执行内容。
iframe也是同样的问题，通过`innerHTML`给iframe注入的脚本不会被执行：

```javascript
var html = "<script>" + injected_script + "</script>";
idocument.body.innerHTML = html;
```

该方法适用于给DOM注入文本内容，配合CSS用来显示页面效果。注入的页面脚本并不会起作用。

# 通过data src注入

`<img>`标签接受data类型的`src`，你一定见过！data URI的语法如下：

```
data:[<mime type>][;charset=<charset>][;base64],<encoded data>
```

同样地，`<iframe>`也可以设置data类型的`src`属性，
这是iframe页面内容和脚本注入最通用最健壮的办法。
脚本样式文件都会被载入并执行，脚本的运行上下文也是与父容器隔离的。

```javascript
var html = '<script>' + injected_script + '</script>';
var html_src = 'data:text/html;charset=utf-8,' + encodeURI(html);
iframe.src = html_src;
```

执行结果：

```
window.id == undefined
```

当然这种办法也有缺点：由于设置了`src`，iframe和父容器是跨域的。
在父容器的上下文中，无法通过`contentWindow.document`访问`iframe`内容

```
Uncaught DOMException: Blocked a frame with origin "https://xxx" from accessing a cross-origin frame.
```

[jquery-script-bug]: /2016/04/07/jquery-script-context-bug.html
