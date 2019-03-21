---
title: 使用 Supertest 测试 Express.js 应用
tags: Node.js 缓存 工厂方法 Mocha Express.js 测试
---

[supertest][st]提供了简单易用的客户代理，可以方便地用来测试Express.js应用。
本文介绍如何在[Mocha][mocha]中使用[supertest][st]，
以及测试 Express.js 应用涉及到的一些问题：
包括如何在每个测试项之前正确地关闭上一个Express.js Server，
以及如何避免`require`缓存造成的环境差异。

<!--more-->

> 关于如何使用Mocha测试Node.js代码，请参考[利用 Mocha 进行 BDD 风格测试][mocha]一文。

## 一个简易的Express应用

先来写一个简单的Express应用，绑定`/`目录并返回`200 harttle`。
下文中便来讨论如何正确地测试该应用。

```javascript
var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.status(200).send('harttle');
});
var server = app.listen(3000, function () {
  var port = server.address().port;
});
module.exports = server;
```

## Supertest

`supertest`提供了`.get()`, `.expect()`等方法来测试 Express `server`。
下面给出一个简单的`supertest`使用示例。

文档：<https://github.com/visionmedia/supertest>

```javascript
var request = require('supertest');
describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('./server');
  });
  afterEach(function () {
    server.close();
  });
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});
```

## 正确关闭 Express

通常我们希望每项测试都在初始的环境中进行，
于是在每项测试后使用`server.close()`关闭服务器，
在每项测试前使用`server = require('./server')`重新开启。
然而`server.close()`不会立即关闭服务器，这使得测试中常发生`EADDRINUSE`错误。

但`server.close()`可以接受一个回调来通知服务器正确关闭事件。
可以利用该回调来使Mocha顺序执行异步过程。只需要将`afterEach`改为：

```javascript
afterEach(function (done) {
  server.close(done);
});
```

## 清除 require 缓存

尽管我们重启了Express`server`，当`require('./server')`时Node.js
仍然会返回上次`require`的缓存。通常的实践中应当用工厂方法来解决，
比如给出`makeServer()`方法：

```javascript
function makeServer() {
  var express = require('express');
  var app = express();
  app.get('/', function (req, res) {
    res.status(200).send('harttle');
  });
  var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Example app listening at port %s', port);
  });
  return server;
}
module.exports = makeServer;
```

这样每次调用`makeServer()`都会重新执行上述代码。
然而为了写测试去更改代码结构有时并不可行，正确的方式是通过Node.js API来清除缓存：

```javascript
beforeEach(function () {
  delete require.cache[require.resolve('./server')];
  server = require('./server');
});
```

其实有一个NPM库[really-need][rn]已经封装了上述代码，导入该工具即可覆盖`require`的默认行为。

```javascript
require = require('really-need');
beforeEach(function () {
  server = require('./server', { bustCache: true });
});
```

## 最终代码

最终的测试代码如下：

```javascript
var request = require('supertest');
require = require('really-need');
describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('./server', { bustCache: true });
  });
  afterEach(function (done) {
    server.close(done);
  });
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});
```

本文翻译自：<https://glebbahmutov.com/blog/how-to-correctly-unit-test-express-server/>

[st]: https://github.com/visionmedia/supertest
[rn]: https://www.npmjs.com/package/really-need
[mocha]: /2016/06/23/mocha-chai-bdd.html
