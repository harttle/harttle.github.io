---
title: 动态插入外部样式表
tags: DOM HTML 事件 异步 CSS innerHTML
---

相比于[动态插入外部脚本](/2017/01/16/dynamic-script-insertion.html)，
动态插入外部样式表（`<link rel="stylesheet">`）的行为简单很多：
只要插入到当前 DOM 树时，浏览器总会异步地立即下载并应用该样式表，
被从 DOM 树移除时样式消失并立即触发重绘。

> 内联样式表（这里指`<style>`标签）除了不需要去下载之外，其他行为与外部样式表相同。
> 因此下文略过对内联样式表的讨论。

<!--more-->

# 插入方式

鉴于浏览器的样式处理模型，即使是以`innerHTML`的方式插入的 `<link>` 
也会被解析为 [外部样式表资源][ex-link-res] 并立即开始下载。
所以下面两种插入方式效果上等价：

方式一

```javascript
document.body.innerHTML = '<link rel="stylesheet" href="foo.css">';
```

方式二

```javascript
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = "foo.css";
document.body.appendChild(link);
```

> 上述情形对`<script>`却会不一样，`<script>`会被解析但不会执行。
> 详细的讨论见[在DOM中动态插入脚本](/2017/01/16/dynamic-script-insertion.html)。

# 触发下载

可能你不会注意到外部样式表的下载是有条件的，浏览器以此来避免下载不必要的样式文件。
最为重要的一个条件是`<link>`必须与当前[浏览上下文相连接][bcc]，
也就是说新创建的 `<link>` 标签必须在插入到当前 DOM 树之后才会触发下载，
或者为已经在 DOM 树中的 `<link>` 改变其资源地址。
参见 [WHATWG link type "stylesheet"][lts]

> The appropriate times to obtain the resource are:
>
> When the external resource link is created on a link element that is already browsing-context connected.
> 
> When the external resource link's link element becomes browsing-context connected.
>
> ...

例如下面的 HTML 中创建了一个`<link>`标签：

```html
<html>
  <body>
   <script>
     var link = document.createElement('link');
     link.rel = 'stylesheet';
     link.href = "foo.css";
   </script>
  </body>
</html>
```

这时浏览器还不会去下载`foo.css`，只有插入到 DOM 时浏览器才会立即开始下载：

```javascript
document.body.appendChild(link);
```

# 加载状态

如果需要在脚本中获取外部样式表的加载状态，可以绑定其`onload`和`onerror`事件。
为了兼容 IE 还可以绑定 `onreadystatechange ` 事件。
需要注意的是`<link>`元素是没有`readyState`属性的（[除了IE][readystate-ie]）。

```javascript
document.body.appendChild(link);
link.onload = link.onerror = link.onreadystatechange = function(e) {
    console.log('loading state changed:', e.type);
};
```

细心的读者可能会发现上述代码在插入到 DOM 之后才绑定事件，
由于样式的下载是异步的，所以这是没有问题的。
关于资源载入时机更详细的讨论请参考：
[异步渲染的下载和阻塞行为](/2016/11/26/dynamic-dom-render-blocking.html)


[ex-link-res]: https://whatwg-cn.github.io/html/#external-resource-link
[bcc]: https://html.spec.whatwg.org/#browsing-context-connected
[lts]: https://html.spec.whatwg.org/#link-type-stylesheet
[readystate-ie]: https://msdn.microsoft.com/zh-cn/library/ms534359(v=vs.85).aspx
