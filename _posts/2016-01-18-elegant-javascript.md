---
layout: blog
title: 那些 JavaScript 的优秀特性
tags: DOM JavaScript Lambda Promise 继承 闭包 作用域 弱类型 原型链
---

说起编程语言，理科生们最初接触的应当是C++。那是P校的必修课。
事实上第一个让我认真去用的语言是.NET C#，
我学习了几乎所有的语言特性、窗口控件以及WPF样式字典。
这样便可以成为一个C#伪专家，去解答别人关于C#的各种问题 :)

此后由于各种原因去学习JavaScript、Python、Ruby，逐渐地发现成功使用一门语言的关键不在于熟悉所有语言特性，而是学着只用那些优雅的、表达力强的语言特性来完成整个工程。

那么JavaScript能否进化为一个只包含有点的语言呢？
在这一点上标准化协会其实也无能为力，去除任何语言特性都会造成依赖于该特性的工程失效。
我们可以使用JSLint等工具来提示我们，确保项目中没有使用那些糟糕的语言特性。

<!--more-->

# JavaScript 的诟病

> JavaScript可以是天使，也可以是魔鬼！

多数语言都有自己的优势和缺憾，JavaScript也不例外。
我们能做的就是尽量去使用那些优雅的部分，而避免使用那些复杂的、易出错的特性。

*JavaScript的成长过程并不完美*。我们知道Java语言的设计经过了完整的标准化和设计流程，
堪称是完美的面向对象编程语言。
而JavaScript被Netscape浏览器引入之后便迅速地被全球开发者采用，
甚至都没有实验室的测试期。虽然JavaScript没有完美的成长过程，
但它仍然包含了非常多优雅的、表达力强的语言特性，这也是它能打败Java Applet的原因之一。

*JavaScript并不是非常难用的语言*。浏览器成就了JavaScript的流行，
而DOM的糟糕也使得JavaScript广受诟病。
DOM甚至还没有完整的标准，不同浏览器实现也不一致，
这使得任何语言都很难操作DOM，这并非JavaScript的问题。
与此相反，JavaScript的神奇之处在于任何人都可以马上上手，
不需要了解多少JavaScript语言特性，甚至不需要会编程。

# JavaScript 的两面

JavaScript的设计中包含了优秀的部分和糟糕的部分。
其中优秀的特性包括：函数、弱类型、动态对象、优雅的对象表示法；
全局变量则是最糟糕的特性之一。

*函数是JavaScript的一级对象*，可以被传参、返回以及赋值。
同时JavaScript函数也是特殊的，它拥有*词法作用域*，这也是闭包的原理。

*弱类型*。当今编程语言都比较偏向强类型，其设计思想是将错误的发现提前到编译期。
尤其是C++：如果编译通过，那么程序就应当正确运行，否则就是代码设计有问题。
但任何强类型语言都少不了测试，那么为何不使用更轻松的弱类型语言呢？
况且强类型语言给出的编译错误大多不是代码中真正的问题所在。

> Java给出的数百行调用堆栈纯属无用，除非程序员是一台电脑。

*JavaScript对象*。JavaScript的对象表示法启发了JSON数据格式，
列举属性的方式确实更加直观，更加具有表达力。
JavaScript的原型继承方式却是一个备受争议的特性。

*全局变量应当是最糟糕的设计*。JavaScript需要全局变量来完成链接。JavaScript链接时会将所有编译单元的全局变量合并到`global`对象（在浏览器中，通常是`window`对象）下。

# JavaScript代码片段

下面给出一段JavaScript来感受一下JavaScript中的优雅。
这是[brick.js][brick]项目中的JavaScript代码片段，它们的用途分别是更新`this.modules`以及合并编译LESS代码。

```javascript
Static.prototype.update = function(type) {
    var staticFile = type === 'css' ? 'cssPath' : 'cltPath';

    var ps = _.map(this.modules, mod =>
        file.read(mod[staticFile])
        .catch(e => false)
        .then(file => mod[type] = file || '')
    );
    return Promise.all(ps);
};

Static.prototype.getCss = function() {
    var modules = this.modules,
        comment = this.config.css.comment;
    var src = _.reduce(modules, (res, mod) =>
        res + lessForModule(mod, comment), '');
    return compileLess(src, {
        compress: this.config.css.compress
    });
};
```

上述代码使用了[ES6的新特性][es6]，包括Lambda表达式、内置Promise等（当然我引入了`promise-helper`）。
JavaScript取默认值的`||`操作符，数组的`map`, `reduce`等操作也非常简洁。

[brick]: https://github.com/harttle/brick.js
[es6]: https://nodejs.org/en/docs/es6/
