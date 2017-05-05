---
title: 异步脚本载入提高页面性能
tags: DOM async defer JavaScript 异步 性能
---

可能很多人都知道JavaScript的载入和渲染会暂停DOM解析，但可能仍缺乏直观的体验。
本文通过几个例子详述脚本对页面渲染的影响，以及如何使用异步脚本载入策略提供页面性能和用户体验。
包括在脚本载入缓慢或错误时尽早显示整个页面内容，以及早点结束浏览器忙提示（进度条、旋转图标、状态栏等）。

# DOM 渲染流程

要理解异步脚本载入的用处首先要了解浏览器渲染DOM的流程，以及各阶段用户体验的差别。
一般地，一个包含外部样式表文件和外部脚本文件的HTML载入和渲染过程是这样的：

<!--more-->

1. 浏览器下载HTML文件并开始解析DOM。
3. 遇到样式表文件`link[rel=stylesheet]`时，将其加入资源文件下载队列，继续解析DOM。
4. 遇到脚本文件时，暂停DOM解析并立即下载脚本文件。
5. 下载结束后立即执行脚本，在脚本中可访问当前`<script>`以上的DOM。
5. 脚本执行结束，继续解析DOM。
6. 整个DOM解析完成，触发`DOMContentLoaded`事件。

上述步骤只是大致的描述，你可能还会关心下面两个问题：

* 资源文件下载队列。样式表、图片等资源文件的下载不会暂停DOM解析。浏览器会并行地下载这些文件，但通常会限制并发下载数，一般为3-5个。可以在开发者工具的Network标签页中看到。
* 执行脚本文件前，浏览器可能会等待该`<script>`之前的样式下载完成并渲染结束。详见[外部样式表与DOMContentLoaded事件延迟][stylesheet-dom-ready]一文。

# 脚本载入暂停DOM渲染

脚本载入真的会暂停DOM渲染吗？非常真切。
比如下面的HTML中，在脚本后面还有一个`<h1>`标签。

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Hello</h1>
  <script src="/will-not-stop-loading.js"></script> 
  <h1>World!</h1>
</body>
</html>
```

我们编写服务器端代码（见本文最后一章），让`/will-not-stop-loading.js`始终处于等待状态。
此时页面的显示效果：

![js block dom render](/assets/img/blog/dom/js-block-dom-render@2x.png)

脚本等待下载完成的过程中，后面的`World`不会显示出来。直到该脚本载入完成或超时。
试想如果你在`<head>`中有这样一个下载缓慢的脚本，整个`<body>`都不会显示，
势必会造成空白页面持续相当长的时间。
所以**较好的实践方式是将脚本放在`<body>`尾部。**

> 很多被墙的网站加载及其缓慢就是因为DOM主体前有脚本被挡在墙外了。

# DOMContentLoaded 延迟

既然脚本载入会暂停DOM渲染，OK我们把脚本都放在`<body>`尾部。
这时页面可以被显示出来了，**但是在脚本载入前，`DOMContentLoaded`事件仍然不会触发。**
请看：

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Hello</h1>
  <h1>World!</h1>
  <script>
    document.addEventListener('DOMContentLoaded', function(){
      alert('DOM loaded!');
    });
  </script>
  <script src="/will-not-stop-loading.js"></script> 
</body>
</html>
```

这时`Wrold!`会显示，但浏览器忙指示器仍在旋转。
这是因为 DOM 仍然没有解析完成，毕竟最后一个`<script>`标签还未获取到嘛！
当然`DOMContentLoaded`事件也就不会触发。`DOM loaded!`对话框也不会弹出来。

![dom not loaded with script pending](/assets/img/blog/dom/dom-not-loaded-with-script-pending@2x.png)

直到超时错误发生，`DOMContentLoaded`才会触发（在我的Chrome里超时用了好几分钟！），
此时对话框也会弹出：

![dom-loaded-as-script-timeout](/assets/img/blog/dom/dom-loaded-as-script-timeout@2x.png)

# 浏览器忙提示

本文关心的核心问题是页面性能和用户体验，现在来考虑一个问题：

> 对于非必须的页面脚本，在它的载入过程中如何取消浏览器的忙提示。

首先想到的办法一定是从HTML中干掉那些`<script>`，然后在JavaScript中动态插入`<script>`标签。
比如：

```javascript
var s = document.createElement('script');
s.src = "/will-not-stop-loading.js";
document.body.appendChild(s);
```

不贴图了，标签页上的图标确实在旋转，和上一小节中的图一样 :(

那么等`DOMContentLoaded`会后再来插入呢？

```javascript
document.addEventListener('DOMContentLoaded', function(){
    var s = document.createElement('script');
    s.src = "/will-not-stop-loading.js";
    document.body.appendChild(s);
});
```

上述代码仍然无法阻止浏览器忙提示。这充分说明浏览器JavaScript执行是单线程的，DOM事件机制也不例外。

# 异步加载脚本

为了阻止浏览器忙提示，应当可以使用异步加载脚本的策略。先看一个简单的示例：

```javascript
setTimeout(function(){
    var s = document.createElement('script');
    s.src = "/will-not-stop-loading.js";
    document.body.appendChild(s);
});
```

`setTimeout`未指定第二个参数（延迟时间），会立即执行第一个参数传入的函数。
但是JavaScript引擎会将该函数插入到执行队列的末尾。
这意味着正在进行的DOM渲染过程完全结束后（此时浏览器忙提示当然会消失），才会调用上述函数。
看图：

![async script loading](/assets/img/blog/dom/async-script-loading@2x.png)

其中`/will-not-stop-loading.js`仍处于`pending`状态，但浏览器忙提示已经消失。
然而在Chrome中，如果插入`<script>`时仍有其他资源正在载入，那么上述做法仍然达不到效果
（浏览器会判别为页面仍未完全载入）。
总之：**异步加载脚本来禁止浏览器忙提示的关键在于让DOM先加载完毕**。

# 最佳实践

不要沮丧，在实际的项目中有两种成熟的办法可以禁止浏览器忙提示。

## AJAX + Eval

使用AJAX获取脚本内容，并用Eval来运行它。
因为AJAX一般不会触发浏览器忙提示，脚本执行只可能让浏览器暂停响应也不会触发忙提示。

首先在需要异步加载的脚本设置`type="text/defered-script"`，并用`data-src`代替`src`防止浏览器直接去获取：

```html
<script type="text/async-script" data-src="http://foo.com/bar.js">
```

然后在站点的公共代码中加入『异步脚本加载器』：

```javascript
$('[type="text/defered-script"]').each(function(idx, el){
    $.get(el.dataset.src, eval);
});
```

> 注意：使用AJAX GET脚本文件时不要设置`Content-Type: "application/javascript"`
> （包括`jQuery.getScript`）。
> 这会使浏览器发现你是在加载脚本，进而触发忙提示指示器。
> 当然，如果此时页面已然载入完毕，任何AJAX都不会触发忙提示了。

上述方法的缺点在于，一旦被引入的JavaScript中需要以相对路径的方式载入其他JavaScript就会引发错误。
因为被Eval的脚本中，当前路径变成了页面所在路径，不再是原来的`<script>`中`src`所指的路径。
这在使用第三方库时非常常见。

## Load 事件

既然禁止浏览器忙指示器的关键在于让DOM加载完毕，那就绑定页面载入完毕的事件：`load`。
例如：

```javascript
$(window).load(function(){
    $('script[type="text/async-script"]').each(function(idx, el){
        var $script = $('<script>');
        if(el.dataset.src) $script.attr('src', el.dataset.src);
        else $script.html(el.text);
        $script.appendTo('body');
        el.remove();
    });
});
```

* 对于外部`<script>`，生成一个新的包含正确`src`的`<script>`。
* 对于行内`<script>`，生成一个新的包含正确内容的`<script>`，`type`默认即为`"application/javascript"`。

该方法采用DOM中`<script>`加载的方式，没有AJAX+Eval改变脚本中当前路径的缺点。
<http://harttleland.com>中的Google Analytics、MathJax等脚本都采用这种处理方式。

# 服务器工具

本文所做实验服务器端都使用Node.js写成：

```javascript
const http = require("http");
const fs = require('fs');
const port = 4001;

var server = http.createServer(function(req, res) {
    switch (req.url) {
        case '/':
            var html = fs.readFileSync('./index.html', 'utf8');
            res.setHeader("Content-Type", "text/html");
            res.end(html);
            break;
        case '/will-not-stop-loading.js':
            break;
    }
});

server.listen(port, e =>
    console.log(`listening to port: ${port}`));
```

# 参考阅读

* MDN Element.dataset: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset>
* jQuery.getScript <http://api.jquery.com/jQuery.getScript/>

[dom-ready]: /2016/04/27/document-ready-event.html
[stylesheet-dom-ready]: /2016/05/15/stylesheet-delay-domcontentloaded.html
