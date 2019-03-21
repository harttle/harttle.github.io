---
title: Karma 测试异步加载的 JavaScript
tags: JavaScript Karma 测试 AMD 异步
---

[Karma][karma]是Google为AngularJS开发的测试执行工具，为JavaScript提供了非常有效的测试环境。
但Karma会在所有脚本载入之后立即进行测试，这使得异步加载的JavaScript不会被测试到而得到空的测试结果。
异步测试脚本还有着被多次执行、测试覆盖信息缺失等问题。

对于这些问题，可以禁用`__karma__.loaded`方法来实现延迟Karma测试的执行，
通过`files.included`避免重复执行，以及`preprocessors`配置来为`karma-coverage`提供源码信息。

> [Karma][karma]采取客户端-服务器的架构，可启动多个浏览器（或从浏览器主动连接）与命令行进行通信，
> 从而实现测试结果的命令行输出，以及本地测试报告的生成。

<!--more-->

## 延迟Karma执行测试

问题的关键在于一旦所有JavaScript文件就绪，Karma会立即启动测试（甚至不等待[DOM就绪][dom-ready]）。
当浏览器通知Karma测试完成时，我们的异步JavaScript还未载入。
因此会出现测试在浏览器端执行但未显示在Karma命令行的情况。
在使用JavaScript载入器，或异步的前端框架时这样的情形非常常见。

为了禁止Karma在文件就绪后立即执行测试，我们可以在测试入口文件（该文件必须是同步加载的）之前加入这样的代码：

```javascript
window.__karma__.loaded = function(){};
```

> 正是`__karma__.loaded`函数调用了`mocha.run()`使测试得到立即执行。所以我们把它置空。

当我们的异步JavaScript测试脚本已经载入完毕，即所有`describe()`函数都执行过之后，
再调用`__karma__.start()`来手动启动测试：

```
window.__karma__.start();
```

对于AMD规范的载入器而言，测试入口代码可以这样写：

```javascript
window.__karma__.loaded = function() {};
require(['test1', 'test2', ...], window.__karma__.start);
```

## 避免脚本多次执行

加入Karma[`files`][files]配置的脚本默认会被以`<script>`的形式插入在页面中，在页面载入时被执行。
这会导致动态脚本（如AMD模块）被多次执行到。
但把它从`files`中移除，又会影响Karma的监测文件变化自动测试功能。
这时可以仍然将其加入到`files`中，但`files.included`设为`false`。

例如`src/*.js`和`test/*.js`下均为AMD模块时：

```javascript
config.set({
    files: [
        'lib/sea.js',
        'test/index.js', {
            pattern: 'src/**/*.js',
            included: false
        }, {
            pattern: 'test/**/*.js',
            included: false
        },
    ]
});
```

> `files.included`指定了该文件是否需要以`<script>`方式来插入到测试页面中（即启动执行）。

## 异步覆盖测试报告

对于异步测试[`karma-coverage`][coverage]会获取不到源文件信息（instruments），因此也就会生成空的测试报告。
为此我们可以在[`preprocessors`][pre-pro]中为`karma-coverage`生成这些信息。

```javascript
config.set({
    preprocessors: {
        'src/**/*.js': ['coverage']
    },
    reporters: ['coverage'],
    coverageReporter: {
        dir: 'coverage'
    },
    ...
});
```

[karma]: https://karma-runner.github.io/1.0/index.html
[dom-ready]: /2016/05/14/binding-document-ready-event.html
[files]: https://karma-runner.github.io/1.0/config/files.html
[pre-pro]: https://karma-runner.github.io/1.0/config/preprocessors.html
[coverage]: https://github.com/karma-runner/karma-coverage
