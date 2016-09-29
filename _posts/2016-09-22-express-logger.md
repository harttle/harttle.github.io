---
title: 为Express.js编写一个Logger
tags: Express JSON JavaScript Node.js
---

[Express.js][express]是Node.js下最基础最灵活的Web服务器。
Express的日志工具有很多，比如默认的访问日志工具[morgan][morgan]，
通用日志工具[winston][winston]等等。

本文便来发掘一下这些日志工具的优秀特性，并一一给出实现：
对象输出、日期前缀、访问日志，模块名前缀，以及彩色输出等。

<!--more-->

# JSON Stringify

JavaScript服务器输出JSON真是再平常不过了，输出可读的JSON在开发中非常有用。
为了输出可读的JSON，我们将所有对象类型的参数[`stringify`][stringify]即可。

```javascript
function log(){
    var args = Array.prototype.slice.call(arguments).map(stringify);
    console.log.apply(console, args);
}
function stringify(arg) {
    return typeof arg === 'object' ?
        JSON.stringify(arg, null, 4) : arg;
}
log({foo: ["bar", "foo"]});
// 输出：
// {
//     foo: ["bar", "foo"]
// }
```

> 我们希望`log`函数像`console.log`一样接受多个参数，因此我们需要对所有参数进行map。

# 日期前缀

当日志用于服务器环境时，我们希望知道日志的输出时间，
这在性能调试和调试因果关系时非常重要。
尤其是在使用像pm2这样的进程监视器时，错误和标准输出是分开存储的。
如果没有时间戳很难得知顺序关系。

```javascript
function parse(str) {
    // 为每行都添加时间戳
    return str.split('\n')
        .map(prefixify)
        .join('\n');
}

function prefixify(str){
    var now = new Date();
    var prefix = `[${now.toLocaleString()}]`;
    // 将时间戳放在行首
    return prefix + ' ' + str;
}
```

> 时间日期的格式化可以使用[strftime][strftime]。

# 提供类console对象

我们的logger的使用方式最好与console相同以获得最好的兼容与可用性。
于是需要提供`.log()`, `.warn()`, `.error()`, `.info()`等方法，
同时也需要支持多参数的情形。我们需要做的是封装所有的`console`方法：

```javascript
function parse(argvs) {
    return Array.prototype.slice.call(argvs)
        .map(stringify).join(' ')
        .split('\n').map(prefixify).join('\n');
}
function prefixify(str){
    var now = new Date();
    var prefix = `[${now.toLocaleString()}]`;
    return prefix + ' ' + str;
}
function stringify(arg) {
    return typeof arg === 'object' ?
        JSON.stringify(arg, null, 4) : arg;
}
module.exports = {
    log:   function(){ console.log(parse(arguments)) },
    warn:  function(){ console.warn(parse(arguments)) },
    info:  function(){ console.info(parse(arguments)) },
    error: function(){ console.error(parse(arguments)) }
};
```

# 彩色的输出

在开发环境中输出彩色的日志可以让我们更快地获取信息，在终端中输出彩色需要使用特殊字符。
自定义过[PS1][ps1]的童鞋一定会感受到手写这些字符的费劲，在Node.js中我们可以使用[colors][colors]库来完成这件事情。

```bash
npm install colors
```

然后在输出时便可以先调用`colors`提供的API做字符串转换，现在来把日期前缀变成青色的：

```javascript
const colors = require('colors/safe');

function prefixify(str){
    var now = new Date();
    var prefix = `[${now.toLocaleString()}]`;
    // 将时间戳放在行首
    return colors.cyan(prefix) + ' ' + str;
}
```

> 带颜色的输出只是具有特殊字符的字符串，可以像普通字符串一样进行操作。

# Express访问日志

现在我们Express访问日志与普通日志格式一致，这需要监听Express请求和响应。
需要用到[`on-headers`][on-headers]来监听写Response Header事件。

```javascript
const onHeaders = require('on-headers');
// 访问日志
app.use(function(req, res, next) {
    req.receivedAt = Date.now();
    onHeaders(res, function() {
        var duration = Date.now() - req.receivedAt;
        // 这里调用我们的logger
        // 示例输出: [2016-07-28 10:23:02] GET / 200 21ms
        logger.log(req.method.toUpperCase(),
            req.originalUrl,
            res.statusCode,
            duration + 'ms');
    });
    next();
});
// use 路由
```

> 可能你发现Express的默认访问日志工具[morgan][morgan]会输出访问耗时。
> 这需要同时封装`console.time和`console.timeEnd`，本文就不赘述了。

# 模块名绑定

标准的Logger大多可以绑定一个模块名（或者Trace ID），
模块名会在该模块的每条日志的前缀部分出现，以方便跟踪Log是哪个模块（或业务线）输出的。
其用法大致如下：

```javascript
var logger = Logger('account:factory');
logger.log('create account error');
// 输出：
// [account:factory] create account error
```

如何实现呢？来一个简单的闭包即可：

```javascript
function Logger(traceId){
    return {
        log: function(str){
            console.log(`[${traceId}] ${str}`);
        }
    }
}
```

> 你还可以将`[account:factory]`显示为灰色，并支持多参数的输出（见上文）。

[express]: http://expressjs.com/
[morgan]: https://github.com/expressjs/morgan
[winston]: https://github.com/winstonjs/winston
[stringify]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[on-headers]: https://www.npmjs.com/package/on-headers
[ps1]: https://wiki.archlinux.org/index.php/Bash/Prompt_customization
[colors]: https://www.npmjs.com/package/colors
[strftime]: https://www.npmjs.com/package/strftime
