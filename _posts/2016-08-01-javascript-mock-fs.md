---
title: 在Node.js测试中Mock文件系统
tags: NPM Node.js 测试 Mock
---

在Node.js测试中，常常会需要构造某种项目目录。
为每个测试用例添加相应的目录结构既费时又难以维护。
这时Mock文件系统便是最佳选择，相关的工具包括：

* Mock [`fs`][fs] 模块的工具[`mock-fs`][mock-fs]。
* Mock [`require`][require] 模块的工具[`mock-require`][mock-require]。

<!--more-->

# 安装

[`mock-fs`][mock-fs]和 [`mock-require`][mock-require]
都是NPM软件包，在项目中可通过`npm`直接安装：

```bash
npm install mock-fs mock-require --save
```

# Mock fs 模块

通过`mock()`方法可以创建多个文件的Mock并立即生效，
此后对[`fs`][fs]的调用都会访问这些Mock文件。
调用`mock.restore()`可取消Mock并恢复[`fs`][fs]。

```javascript
var fs = require('fs');
var mock = require('mock-fs');

describe('fs', function() {
    beforeEach(function() {
        mock({
            './CNAME': 'harttle.com',
            './_config.yml': 'empty'
        });
    });
    afterEach(function() {
        mock.restore();
    });
    describe('#readFileSync()', function() {
        it('should read all content', function() {
            var str = fs.readFileSync('CNAME', 'utf8');
            expect(str).to.equal('harttle.com');
        });
    });
});
```

# Mock require 机制

[`mock-fs`][mock-fs]的原理是重写[`fs`][fs]模块的文件读写功能，重定向到Mock文件。
所以对[`require`][require]并不起作用。
为了让`require`读取Mock文件，只能重写[`require`][require]方法。
[`mock-require`][mock-require]便是封装了该操作。

通过`mock`方法进行Mock，通过`mock.stopAll`停止Mock并恢复[`require`][require]。

```javascript
const mock = require('mock-require');

describe('parser', function() {
    beforeEach(function() {
        mock('/package.json', {
            "name": "sample-module",
            "version": "1.0.0",
            "view": "htmls/my-html.hbs",
            "router": "svr.js"
        });
    });
    afterEach(function() {
        mock.stopAll();
    });
```
 

[mock-fs]: https://github.com/tschaub/mock-fs
[mock-require]: https://github.com/boblauer/mock-require
[require]: https://nodejs.org/api/modules.html
[fs]: https://nodejs.org/api/fs.html
