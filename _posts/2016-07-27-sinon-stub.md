---
title: 利用 Sinonjs 构建测试桩：Spies and Stubs
tags: 事件 异常 类型检查 测试 Mocha 测试桩 Mock
---

在[利用 Mocha 进行 BDD 风格测试][mocha-bdd]一文中介绍了[Mocha][mocha]测试框架的使用，
其中略过了`before()`, `beforeEach()`等钩子。
本文介绍在[Mocha][mocha]下如何利用这些钩子构建测试上下文，
以及如何使用[Sinonjs][sinon]构建测试桩。

# Sinonjs

事实上[Sinonjs][sinon]提供了三种测试桩：Spies, Stubs, Mocks。
以及一些虚拟环境：Timers、JSONP、XHR等。
本文着重介绍如何利用Spies和Stubs的使用。

文档：

* <http://sinonjs.org/docs/>

安装：

```bash
npm install --save-dev sinon
```

<!--more-->

# Spies

Spy 是Sinonjs提供的特殊函数，它会记录被调用时的参数、`this`，调用次数，
以及返回值、异常等等。用来测试一个函数是否被正确地调用。

> A test spy is a function that records arguments, return value, the value of this and exception thrown (if any) for all its calls. A test spy can be an anonymous function or it can wrap an existing function.

Spy共有三种构建方式：

* 匿名函数：`var spy = sinon.spy();`
* 包装一个既有函数：`var spy = sinon.spy(myFunc);`
* 替代一个对象方法：`var spy = sinon.spy(object, "method");`

现在我们测试`PubSub`能否正确地调用监听函数：

```javascript
it('should be called correctly', function () {
    var spy = sinon.spy();
    PubSub.subscribe('message', spy);
    PubSub.publishSync('message', 'start');
    PubSub.publishSync('message', 'stop');
    expect(spy.calledTwice).to.equal(true);
});
```

> 现将`spy`作为监听函数注册到`'message'`事件上，然后发布两条事件。
> 我们希望`spy`被`PubSub`调用了两次。

Sinonjs提供的API远不仅仅这些，比如还可以测试被调用时参数是否正确：

```javascript
expect(spy.calledWith('message', 'start')).to.equal(true);
expect(spy.calledWith('message', 'stop')).to.equal(true);
```

Sinonjs Spies 文档：<http://sinonjs.org/docs/#spies>

# Stubs

Stub（测试桩）是有着预定义好的行为的函数，用来强制软件按照某个路径去执行。
在软件工程中，Stub一般用于给定模块的边界条件。

> Test stubs are functions (spies) with pre-programmed behavior. They support the full test spy API in addition to methods which can be used to alter the stub’s behavior.

Stub（测试桩）有4种构建方式：

* 匿名Stub：`var stub = sinon.stub();`
* 替换对象属性：`var stub = sinon.stub(object, "method");`
* 使用预定义函数替换对象属性：`var stub = sinon.stub(object, "method", func);`
* 替换对象的所有方法：`var stub = sinon.stub(obj);`

例如我们实现了一个`Calculator`，现在我们要测试`Calculator.multiply`。
它会调用`Calculator.plus`来实现，所以开始测试前我们需要一个可正确运行的
`Calculator.plus`，这便是测试桩。

```javascript
it('should calculate multiply', function () {
    var plus = sinon.stub(Calculator, 'plus', function(a, b){
        return a + b;
    });

    var res = Calculator.multiply(123, 3);

    expect(res).to.equal(369);
    expect(plus.calledThrice).to.equal(true);
});
```

如果Stub（测试桩）具有确定的返回值，可以使用`yields`语法。例如：

```javascript
sinon.stub(jQuery, 'ajax').yieldsTo('success', 1, 2);
jQuery.ajax({
    url: 'http://harttle.land',
    success: function(arg1, arg2){
        assert(arg1 === 1);
        assert(arg2 === 2);
    }
});
jQuery.ajax.restore();
```

Sinonjs Stubs 文档：<http://sinonjs.org/docs/#stubs>

# Matchers

Matchers用于辅助`spy.calledWith`，`spy.returned`等断言，用来进一步指定期望的值，
比如正则匹配、类型检查等。

> Matchers can be passed as arguments to spy.calledWith, spy.returned and the corresponding sinon.assert functions as well as spy.withArgs. Matchers allow to be either more fuzzy or more specific about the expected value.

```javascript
var book = {
    pages: 42,
    author: "harttle"
};

var spy = sinon.spy();
spy(book);

expect(spy.calledWith(sinon.match({ author: "harttle" }))).to.equal(true);
expect(spy.calledWith(sinon.match.has("pages", 42))).to.equal(true);
```

上述断言有更方便的写法：`spy.calledWithMatch(arg1, arg2, ...);`，
相当于：`spy.calledWith(sinon.match(arg1), sinon.match(arg2), ...)`。

Sinonjs Matchers 文档：<http://sinonjs.org/docs/#matchers>

# 测试上下文

[Mocha][mocha]测试框架中，每个`describe`块都可以有自己的
`before()`, `beforeEach()`, `after()`, `afterEach()`钩子定义。
它们通常被用来创建或清理上下文，具体包括数据库连接、初始化与关闭，
测试桩的构建与销毁等。其中：

* `before`代码块会在该`describe`的所有测试执行前执行一次。
* `beforeEach`代码块会在该`describe`的每项测试执行前执行一次。
* `after`代码块会在该`describe`的所有测试执行后执行一次。
* `afterEach`代码块会在该`describe`的每项测试执行后执行一次。

`before`通常会初始化测试过程中不会发生改变的上下文或测试桩，
而`beforeEach`是为了在每一项测试前都重新初始化特定的上下文或测试桩。
`after`与`afterEach`以此类推。例如：
在[liquidjs][sl]的标签测试中，在每项测试运行前都初始化上下文
（因为像`assign`这样的标签可能会更改上下文）：

```javascript
describe('tags', function() {
    beforeEach(function() {
        ctx = {
            one: 1,
            leq: '<=',
            arr: [-2, 'a']
        };
    });
    it('should support assign', function() { ...  });
    it('should support raw', function() { ...  });
});
```

Mocha Hooks文档：<https://mochajs.org/#hooks>

[mocha-bdd]: /2016/06/23/mocha-chai-bdd.html
[mocha]: https://mochajs.org/
[sinon]: http://sinonjs.org/docs/#stubs
[sl]: https://github.com/harttle/liquidjs
