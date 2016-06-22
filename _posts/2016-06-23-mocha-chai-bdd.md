---
title: 利用 Mocha 进行 BDD 风格测试
tags: Mocha JavaScript NPM Node.js Chai 测试 BDD
---

[Mocha][mocha]是一个简单易用的JavaScript测试框架，可以运行在Node.js中，也可以运行在浏览器中。
[Mocha][mocha]提供了多种类型的测试报告，支持多种断言库（包括[should.js][should.js]，[expect.js][expect.js]，[chai][chai]，等等）。
本文介绍利用[chai][chai]在[Mocha][mocha]中进行BDD风格的单元测试。

<!--more-->

> 对于Github仓库，利用Mocha组织的测试还可以利用Git做持续集成，在Github上显示实时的代码测试状态，详见[跟踪Github项目的持续集成状态][github-ci]一文。

# 编写一项测试

## 环境配置

创建一个叫做`my-project`的项目，以及一个空的测试文件`test.js`。
[Mocha][mocha]可以通过NPM来安装，我们需要一个全局的`mocha`以供命令行调用，以及一个本地的`mocha`以供代码中`require`。

```bash
mkdir my-project && cd my-project
npm install -g mocha
npm install mocha chai
```

## 编写测试文件

现在来编写第一个测试文件`my-project/test.js`：

```javascript
var expect require('chai').expect;
describe('Array', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            expect([1, 2, 3].indexOf(5)).to.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.equal(-1);
        });
    });
});
```

在`my-project`目录中，运行`mocha`即可运行所有的测试项（当然这里只有一项）。

```
➜  my-project mocha

  Array
    #indexOf()
      ✓ should return -1 when the value is not present

  1 passing (11ms)
```

# 测试代码组织

有时一个模块可能会非常复杂，单个测试文件可能会很长：

```javascript
var expect require('chai').expect;
describe('Array', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            expect([1, 2, 3].indexOf(5)).to.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.equal(-1);
        });
        it('should return index when the value exist', function () {
            expect([1, 2, 3].indexOf(2)).to.equal(1);
            expect([1, 2, 3].indexOf(3)).to.equal(2);
        });
    });
    describe('#map()', function () {
        ...
    });
    ...
});
```

每个`describe`可以单独组织为文件，例如：

```javascript
// file: test.js
describe('Array', function() {
    require('./array/indexOf.js');
    require('./array/map.js');
    ...
});
// file: array/indexOf.js
describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
        expect([1, 2, 3].indexOf(5)).to.equal(-1);
        expect([1, 2, 3].indexOf(0)).to.equal(-1);
    });
    ...
});
// file: array/map.js
describe('#map()', function () {
    ...
});
```

# BDD：should 还是 expect

[Chai][chai]为Mocha提供了BDD风格的断言库，
BDD（Behaviour Driven Development）是TDD的一种，
倾向于断言被测对象的行为特征而非输入输出。
[Chai][chai]的BDD风格断言库包括两部分：`expect`和`should`。
Harttle推荐使用`expect`。先看例子：

## expect测试

```javascript
var expect = require('chai').expect;
it('should return -1 when the value is not present', function () {
    expect([1, 2, 3].indexOf(5)).to.equal(-1);
    expect([1, 2, 3].indexOf(0)).to.equal(-1);
});
```

> 可见`expect`是个函数，它接受的输入是被测试的值，返回值拥有`.to`属性。

## should测试

上述测试也可以使用`should`断言库来编写：

```javascript
var should = require('chai').should();
it('should return -1 when the value is not present', function () {
    [1, 2, 3].indexOf(5).should.equal(-1);
    [1, 2, 3].indexOf(0).should.equal(-1);
});
```

> 可见`should`为`Object.prototype`增加了一个`.should`属性。
> 该操作是在`require('chai').should()`的`should()`函数调用中完成的。

## 区别之处

`should`和`expect`只是语法有细微区别，都属于BDD风格测试断言。
但Harttle推荐使用`expect`，因为当被测对象为空时`should`就会失效，
而`expect`仍然能够给出有效的调试信息。例如：

```javascript
// foo === undefined
foo.should.equal('bar');
```

`should`给出的错误信息是：`TypeError: Cannot read property 'should' of undefined`。
而使用`expect`写法时：

```javascript
// foo === undefined
expect(foo).to.equal('bar');
```

[Mocha][mocha]给出的错误信息更加有用：`AssertionError: expected undefined to equal 'foo'`。

[mocha]: https://mochajs.org/
[should.js]: https://github.com/shouldjs/should.js
[expect.js]: https://github.com/LearnBoost/expect.js
[chai]: http://chaijs.com/
[github-ci]: /2016/04/30/github-ci.html
