---
title: Mocha 下测试异步代码
tags: JavaScript NPM Promise 回调函数 Chai Mocha 测试 BDD 异步
---

在[利用 Mocha 进行 BDD 风格测试][mocha-bdd]中介绍了[Mocha][mocha]测试框架和
[Chai][chai]断言库的使用。JavaScript天生就是异步的，
这意味着在JavaScript测试中往往会需要异步断言。
本文介绍如何使用[Chai][chai]和[chai-as-promised][chai-ap]来测试Promise。

# Mocha测试异步代码

[Mocha][mocha]本身是支持异步测试的。只需要为`describe`回调函数添加一个`done`参数，
成功时调用`done()`，失败时调用`done(err)`。例如：

```javascript
var expect = require('chai').expect;
describe('db', function() {
    it('#get', function(done) {
        db.get('foo', function(err, foo){
            if(err) done(err);        
            expect(foo).to.equal('bar');
            done();
        });
    });
});
```

<!--more-->

* 如果未调用`done`函数，Mocha会一直等待直到超时。
* 如果未添加`done`参数，Mocha会直接返回成功，不会捕获到异步的断言失败。例如：

```javascript
it('#get', function(){
    setTimeout(function(){
        expect(1).to.equal(2);
    }, 100);
});
```

运行上述测试[Mocha][mocha]总会提示Passing。

> Mocha怎么知道是否要等待异步断言呢？因为JavaScript中的[Function][mdn-function]有一个`length`属性，
> 通过它可以获得该函数的形参个数。Mocha通过传入回调的`length`来判断是否需要等待。

# Mocha测试Promise

测试Promise有两种方式：可以采用上述`done`的方式，也可以直接返回该Promise。
注意Promise也属于异步代码，如果未采用上述方式，Mocha将无法捕捉到异步的断言失败。

## done回调的方式

```javascript
describe('#find()', function() {
    it('respond with matching records', function(done) {
        db.find({ name: 'harttle' })
            .then(function(user){
                expect(user.name).to.equal('harttle');
                done();
            })
            .catch(err => done(err));
    });
});
```

## 直接返回Promise的方式

```javascript
describe('#find()', function() {
    it('respond with matching records', function() {
        return db.find({ name: 'harttle' }).then(function(user){
            expect(user.name).to.equal('harttle');
        });
    });
});
```

`expect`失败或`db.find`失败都会导致Promise失败（Rejected），
这时Mocha判定测试失败，否则判定测试成功。

> 注意两种方式不可同时使用，即返回了Promise就不要调用`done`，否则Mocha会报错。

# Chai As Promised

[chai-as-promised][chai-ap]是Chai的一个断言库插件，
该插件可以大大简化Promise相关的断言。
它为Promise提供了`.should.eventrually`属性，
通过该属性可以使用任何Chai提供的BDD断言方法。

先使用NPM安装`chai-as-promised`：

```bash
npm install --save-dev chai-as-promised
```

现在我们用[chai as promised][chai-ap]重写上述测试逻辑：

```javascript
var chai = require('chai');
chai.use(require("chai-as-promised"));

describe('#find()', function() {
    it('respond with matching records', function() {
        return expect(db.find({ name: 'harttle' }))
            .to.eventually.have.property('name', 'harttle');
    });
    it('should be fulfilled', function(){
        return expect(db.remove('user')).to.eventually.be.fulfilled;
    });
});
```

# 参考阅读

* Mocha Should/Expect API: <http://chaijs.com/api/bdd/>
* Chai As Promised Document: <https://github.com/domenic/chai-as-promised>
* MDN-Function: <https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function>

[mocha]: https://mochajs.org/
[should.js]: https://github.com/shouldjs/should.js
[expect.js]: https://github.com/LearnBoost/expect.js
[chai]: http://chaijs.com/
[chai-ap]: https://www.npmjs.com/package/chai-as-promised
[mocha-bdd]: /2016/06/23/mocha-chai-bdd.html
[mdn-function]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function
