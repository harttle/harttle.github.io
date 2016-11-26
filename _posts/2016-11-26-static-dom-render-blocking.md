---
title: CSS/JS对DOM渲染的影响
tags: CSS DOM HTML JavaScript DOM渲染
---

我们知道页面样式一般写在HTML头部，而页面脚本放在HTML尾部。
这是因为脚本和样式会阻塞DOM渲染。
本文具体分析了包括脚本和样式在内的资源元素对DOM渲染的影响，
并给出具体的示例代码。

> 本文只讨论服务器端渲染的DOM（以下称为同步渲染）资源载入时机。
> 关于动态插入HTML标签（异步渲染）的阻塞情况请参考
> [异步渲染DOM元素的加载时机][async]一文。

# TL;DR

* CSS（外链或内联）会阻塞**整个**DOM的渲染（Rendering），然而DOM解析（Parsing）会正常进行
* 很多浏览器中，CSS会延迟脚本执行和`DOMContentLoaded`事件
* JS（外链或内联）会阻塞**后续**DOM的解析（Parsing），后续DOM的渲染（Rendering）也将被阻塞
* JS前的DOM可以正常解析（Parsing）和渲染（Rendering）

<!--more-->

# CSS阻塞DOM渲染

**无论是外链CSS还是内联CSS都会阻塞DOM渲染（Rendering），然而DOM解析（Parsing）会正常进行**。
这意味着在CSS下载并解析结束之前，它后面的HTML都不会显示。
这也是为什么我们把样式放在HTML内容之前，以防止被呈现内容发生样式跳动。
当然代价就是显示延迟，所以性能攸关的站点都会内联所有CSS。

然而，很多浏览器中CSS还会延迟脚本执行和`DOMContentLoaded`事件触发（该事件就是jQuery的dom ready）。
下表列出了不同浏览器是否会延迟脚本执行，具体的解释可参考
[CSS载入与DOMContentLoaded事件延迟](/2016/05/15/stylesheet-delay-domcontentloaded.html)
一文。

渲染引擎 | 样式表之前的脚本 | 样式表之后的外部脚本 | 样式表之后的行内脚本
--- | --- | --- | --- 
Presto (Opera)           | 否 | 否 | 否
Webkit (Safari, Chrome)  | 否 | 是 | 是
Gecko (Firefox)          | 否 | 是 | 是
Trident (MSIE)           |    | 是 | 是

有些情况下，可以尝试添加媒体查询来避免不必要的阻塞。
尤其是响应式站点可以做此优化：

```html
<link href="other.css" rel="stylesheet" media="(min-width: 40em)">
```

# CSS阻塞DOM渲染：案例

为了验证CSS阻塞渲染但不阻塞解析以及脚本延迟行为，设计下列HTML。
同步和异步地打印当前DOM内容，以及在样式表后添加测试脚本。

```html
<html>
<body>
  <h2>Hello</h2>
  <script> 
    function printH2(){
        console.log('first script', document.querySelectorAll('h2')); 
    }
    printH2();
    setTimeout(printH2);
  </script>
  <link rel="stylesheet" href="http://cdn.bootcss.com/bootstrap/4.0.0-alpha.4/css/bootstrap.css">
  <h2>World</h2>
  <script> console.log('second script'); </script>
</body>
</html>
```

需要打开Chrome开发者工具的`Disable Cache`和`Throttling`来模拟较慢的网络。
然后在样式表载入过程中可以观察到以下现象：

![stylesheet links block rendering][css-block-rendering]

1. 两个`<h2>`标签均为显示，说明样式表会阻塞和延迟整个DOM的渲染。
2. 第一次输出只有一个`<h2>`，说明DOM解析会延迟脚本的执行。
3. 第二次输出有两个`<h2>`，说明样式载入过程中DOM已解析完毕，即样式表不会阻塞DOM解析。
4. `"second script"`未被打印出来，说明在Chrome中样式表之后的行内脚本被延迟了。

# JS阻塞DOM解析

**不论是内联还是外链JavaScript都会阻塞后续DOM解析（Parsing），当然后续DOM的渲染（Rendering）也被阻塞了。**
之所以DOM解析（Parsing）需要暂停，
是因为脚本中可能会包含类似`document.write`的语句，即脚本有可能改变当前DOM树。

> 当然现代浏览器不会这么傻，可以推测式地继续解析以提高性能。当然这些优化不应改变DOM应有的行为。

值得注意的是JavaScript只会阻塞后续的DOM而非整个DOM，这意味着前面的DOM可以被正确地解析以及渲染。
这也是为什么我们把脚本放在页面底部：脚本仍在下载时页面已经可以正常地显示了。
但浏览器的载入标识仍然会提示页面正在载入，这件事情其实可以Hack，
见[异步脚本载入提高页面性能](/2016/05/18/async-javascript-loading.html)一文。

# JS阻塞DOM解析：案例

为了验证JS阻塞DOM解析，设计下列HTML。
仍然是同步和异步地打印当前DOM内容，以及在外部脚本后添加测试脚本。

```html
<html>
<body>
  <h2>Hello</h2>
  <script>
    function printH2(){
        console.log('first inline script', document.querySelectorAll('h2')); 
    }
    printH2();
    setTimeout(printH2);
  </script>
  <script src="http://cdn.bootcss.com/bootstrap/4.0.0-alpha.4/js/bootstrap.js"></script>
  <h2>World</h2>
  <script> console.log('second inline script'); </script>
</body>
</html>
```

同样打开Chrome的`Disable Cache`和`Throttling`选项，这次看到`Hello`已经显示了：

![scripts block parsing][js-block-parsing]

1. `Hello`已经显示且第一次输出已有一个`<h2>`，说明脚本下载不影响之前的DOM解析和渲染。
2. 第二次输出仍然只有一个`<h2>`说明DOM解析被阻塞。
3. `"second inline script"`未被输出，说明脚本执行依赖于DOM解析（很显然）。

[async]: /2016/11/26/dynamic-dom-render-blocking.html
[css-block-rendering]: /assets/img/blog/dom/css-block-rendering@2x.png
[js-block-parsing]: /assets/img/blog/dom/js-block-parsing@2x.png
