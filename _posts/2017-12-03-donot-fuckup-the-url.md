---
title: 怎样合理地设计你的网站 URL
subtitle: 常见的 URL 失败设计和 REST 的简要介绍
tags: HTTP URL 路由
---

URL 是 Web 三大基石之一，在 Web 开发、运维和使用过程中随处可见。
而且在 Web 开发中遇到的第一个设计问题，可能就是 URL 的设计。
在很多 MVC 架构下的开发者眼中它的作用却只是路由到一个控制器，这正是一切罪恶的开端。

<!--more-->

## 常见的失败设计

这是一篇关于 REST 的文章，但是在介绍这种设计之前我们先来探讨糟糕的 URL 设计会带来哪些问题。
下文的案例有的来自创业公司和外包公司，也有的来自 BAT 等公司的 Web 站点，
但进行了一次抽象假装不针对任何人。

### 滥用路径

URL 分为协议、域名、路径、查询字符串、锚点几部分，其中锚点只由浏览器使用不发往服务器。
Internet 早期 URL 路径会映射到文件系统路径，对应于资源位置，
MVC 架构的动态站点中路径直接对应于控制器而不是静态文件。
这使得 URL 路径事实上可以做任何事情而不只是定位资源。

比如用 URL 承载数据：

```
/from=harttle/to=alice/message
```

这个 URL 表示从 Harttle 发往 Alice 的一条消息，消息内容可能在 HTTP body 中。
这确实是一个 [合法的 URL][url]，但它承载了动态的数据内容。这意味着：

* 流量转发和负载均衡配置会更复杂（比如 [正则][reg] 而不是前缀），同时业务统计相关实现也会更困难。
* 基于路径的 Web 技术不可用。比如 [Cookie][cookie] 的 Path 机制、带 Scope 的 [Service Worker][sw]。
* 给路径相关的前端 JavaScript 带来困难。虽然 OP 可能不关心 JavaScript 代码如何编写，业务 JavaScript 也不应依赖当前路径，但是一旦前端 JavaScript 需要判断路径（比如前端路由配置）这样的 URL 设计将会带来噩梦。

### 不表示 anything

URL 是用来定位资源的，偏有人设计 URL 不表示 anything。
把用来定位资源的数据放到别的地方，比如 Cookie 中。看这个例子：

```
URL: /admin-search
Cookie: word=harttle
```

这是一个搜索页面，搜索词是 `harttle`。
这样 HTTP 缓存会很难做，也让页面无法被收藏和分享。总之破坏了 Web：超链接不通了。

### 随意命名

比起滥用路径，命名带来的问题会小很多：最坏情况就是没人看得懂，但仍然机器可读。
但命名问题仍然值得探讨，至少会让开发者和用户直观地看到它指向的资源。设想你的登录页面 URL 是：

```
/page3/process0.html
```

那么要打开或者指向一个登录页面一定会很头疼，设计成 `/account/login` 则会轻松很多。
命名上的建议非常简单：使用可读的名词。

* 可读。要别人能看懂，不然要 URL 干嘛。我甚至觉得拼音也 OK。
* 名词。`/user-list` 比 `/show-users` 要好。设想你 POST 到 `/show-users` 语义如何解释呢？

## REST 架构风格

Web 最初用于共享静态的科学数据文件，随着用户和商业涌入，尤其是 Web Application 的出现，
开发者和用户对 Web 的使用方式逐渐超出了 Web 的基础架构。
R. T. Fielding 是 [HTTP 1.0][http] 和 Apache httpd 的作者，
他在 [2000 年的博士论文][rt] 中提出的 REST 架构风格重申了 Web 应有的架构风格。

这篇论文总结了 Web 早期架构中那些合理的架构约束，
并提出国际互联网的超媒体系统还应具有的架构约束，形成 REST 架构风格。
REST 被广泛用于指导 HTTP 和 URI 设计。

### 相关概念

REST（Representational State Transfer）是指使用对应的 **representation** （表示）来操作 **resource**（资源）。与其他架构风格的核心区别在于所有组件采用统一的接口，
这在 Web 应用架构中要求 URL 的设计（资源定位），HTTP 方法（资源的操作）都符合标准的语义。

**resource** 在 REST 中是指信息的抽象，任何信息都可以称作一个资源。比如一个图片，一个文档，甚至现在的天气。

**representation** 在 REST 中是指资源（*resource*）的当前状态或目标状态。包括一些字节，以及对应的 *representation metadata*，比如我们说的 HTML 就是资源的一个 representation。

### URL/Web Server 设计

REST 的思想被用于 URI、HTTP、HTML 等标准的定义，以及众多 http 服务器和客户端的实现。
在实践中 REST 表现出充分的简单性、可扩展性以及伸缩性（这里省略 10 个架构优势 orz）。
那么 Web 站点的开发者如何根据 REST 风格进行设计呢？

* 一个 URL 表示一个资源。实践中还有好多设计，比如 URL 层级表示资源的层级等。
* HTTP 方法表示对资源的操作。比如 GET 表示获取，POST 表示创建，PUT 表示修改，DELETE 表示删除。

HTTP 方法的语义有明确的 [定义][http-spec]，比如 GET 不应对资源进行修改，
PUT 操作应该幂等，等等。
它们的可缓存性在 [HTTP 标准][http-spec] 中也有明确的定义，
你在设计 Web Server 时也需要满足这些要求。

## 优秀的设计

在说了这么多抽象的东西之后，在这里列举一些我喜欢的 URL 设计，以供参考。

### 资源层级

URL 层级表示资源的层级，这给用户和开发者都带来很大的方便。

* 对于用户。可以方便地手动拼 URL， 或者从 URL 了解到当前资源的位置。
* 对于开发者。可以方便地从 URL 定位对应的模块。

这里以 Github 为例。Github 中有两个重要的概念：用户和仓库。
所有仓库必须属于某个用户（或组），每个仓库又有 Issue、Wiki 等资源。
Github 是这样设计的：

* 用户： <https://github.com/harttle>
* 用户的仓库： <https://github.com/harttle/liquidjs>
* 用户的 Pages：<https://harttle.github.io>
* 仓库的 pages：<https://harttle.github.io/liquidjs>

这里要提一个重要前提：产品和 URL 设计是强相关的。
假如 PM 说我就要一个仓库不属于任何用户，你怎么破？

### 资源与 ID

在 Web 的 Stateless-Client-Server 架构中，每个请求都需要携带足够的信息，
这时 ID 的重要性不言而喻。比如用来标识一个用户，一个图片，或者一条评论等等。

一般情况下使用顺序的 ID （比如递增的数字）或用户指定的 ID （比如 username）较为可读。
比如 Github 使用顺序的 Issue ID，既简单又方便：

* Issue 的 ID：48
* Issue 的 URL：<https://github.com/harttle/liquidjs/issues/48>
* 在 Commit Message 中添加 `fix #48` 可以关闭该 Issue。
* 在其他讨论中，可以使用 `#48` 来引用这个 Issue。

不敢想象如果 ID 使用 Hash 字符串，或者干脆存在 Session 中会让使用和开发变得多复杂。

### HTTP 方法

用 HTTP 方法来表示对资源的操作，这会很大程度上简化 HTML 和服务器实现。
因为 Web 就是这样设计的。常见的 CRUD 操作对应的 HTTP 方法如下：

方法 | 操作
--- | ---
GET | 查询
POST | 创建
PUT | 修改
DELETE | 删除

例如创建 Github Issue 的表单：

```html
<form accept-charset="UTF-8" action="/harttle/liquidjs/issues" method="post">
  <div class="discussion-create clearfix">
    <input type="text" class="form-control input-block" name="issue[title]" placeholder="Title" value="">
    <textarea class="form-control input-block" name="issue[body]" rows="5" placeholder="Leave a comment"></textarea>
    <button type="submit" class="btn btn-block" data-disable-with="Submitting…">Submit new issue</button>
  </div>
</form>
```

只需定义 `method=post` 与 `button[type=subimit]` 即可。
HTTP `<button>` 的语法和语义请参考 [表单提交：button input submit 的区别](/2015/08/03/form-submit.html)，
如果感兴趣表单的编码方式，请移步 [HTTP 表单编码 enctype](/2016/04/11/http-form-encoding.html)。

由于历史原因 HTML 的 `<form>` 只支持 GET 和 POST，`XMLHttpRequest` 也不支持所有的 HTTP 方法。
通常会引入一个 [method overide][method-override] 来 Workaround，
虽然引入了 Trick 但至少保持了设计上的简单。

[rt]: https://www.ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation_2up.pdf
[url]: https://url.spec.whatwg.org/
[sw]: /2017/04/09/service-worker-now.html
[cookie]: /2015/08/10/cookie-session.html
[reg]: /2016/02/23/javascript-regular-expressions.html
[http]: /2014/10/01/http.html
[http-spec]: https://www.w3.org/Protocols/HTTP/1.0/spec.html
[method-override]: https://github.com/expressjs/method-override
