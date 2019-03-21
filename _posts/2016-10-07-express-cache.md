---
title: Express.js 性能优化
tags: Express.js Chrome HTTP 缓存 性能
---

本文讨论如何提高Express在生产环境的性能，包括HTTP响应的压缩与缓存，
视图与样式的缓存，以及调试信息优化。

## 静态文件缓存

可通过缓存静态文件来提高页面载入速度，同时也减轻了服务器负载。
比如设置缓存时间为一天：

```javascript
var app = express();
app.use(express.static('./assets', {
    maxAge: 864000  // one day
}));
```

<!--more-->

对于不常改变的静态文件可以在`Cache-Control`上设置 `max-age` 来避免不必要的服务器请求。
`Cache-Control` 与 `If-Modified-Since` 等头字段的区别可参考
["使用 HTTP 缓存：Etag, Last-Modified 与 Cache-Control"](/2017/04/04/using-http-cache.html) 一文。

## 响应体压缩

在HTTP页面很大，或者静态资源很大时页面载入可能需要较长时间。
尤其是当你使用较低性能的VPS或云主机时。
使用`compression`可以对响应体进行gzip压缩，使用非常简单：

```javascript
const compression = require('compression');
app.use(compression());
```

至此你再次访问Express服务的URL时，响应体会明显减小，响应头也会多一个字段：

```
Content-Encoding: gzip
```

> 通常在性能优化之前应当先找到性能瓶颈，而不是将精力耗费在90%的无用优化上。
> 具体是响应时间长，下载时间长，还是渲染速度慢可以通过Chrome调试工具的Timeline分析。
> 参考：[Web性能优化：prefetch, prerender][webcache]

## 环境变量

Harttle曾经认为`NODE_ENV`环境变量只是为了方便业务代码在生产环境和开发环境切换。
于是也没在意保持这个环境变量的名字，甚至用配置文件来代替环境变量。
万万没想到`NODE_ENV`会对Express的性能有很大影响，将`NODE_ENV`设置为"production"会使 Express：

- 缓存视图模板。
- 缓存从 CSS 插件生成的 CSS。
- 生成简短的错误信息。

这些优化可以让Express快若干倍！

## 避免同步方法

在单线程的Express应用中应当极力避免同步方法，同步调用会使整个Express停止响应其他请求。
这里最容易忽略的是同步日志：如果我们单纯地将访问日志同步写入文件会大大降低性能。

像[Winston][winston]之类的日志工具早就实现了异步日志写入，在生产环境推荐使用成熟的日志工具。

## 调试信息

将`NODE_ENV`可以减少错误信息的生成，Express的错误处理也会更快一些。
然而我们在开发调试时也会打印很多信息到控制台，这些IO都会极大地影响性能。

推荐使用类似[debug][debug]的调试日志工具，它们有环境变量作为开关。
可以只在开发环境下开启，而在生产环境中关闭。

## 扩展阅读

<http://expressjs.com/en/advanced/best-practice-performance.html>

<http://blog.modulus.io/nodejs-and-express-static-content>

[webcache]: /2015/10/06/html-cache.html
[debug]: https://www.npmjs.com/package/debug
[winston]: https://www.npmjs.com/package/winston
