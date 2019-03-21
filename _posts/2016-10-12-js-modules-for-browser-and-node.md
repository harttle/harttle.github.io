---
title: 编写浏览器和Node.js通用的JavaScript模块
tags: 浏览器 AMD CommonJS JavaScript Node.js 模块化
---

长期以来JavaScript语言本身不提供模块化的支持，
ES6中终于给出了`from`, `import`等关键字来进行模块化的代码组织。
但CommonJS、AMD等规范已经被广为使用，如果希望你的JavaScript同时支持浏览器和Node.js，
现在只有这几种方式：

* 通过[browserify][browserify]等工具进行转换。
* 提供浏览器端CommonJS框架，比如这个[简易的 CommonJS 实现](/2016/04/25/commonjs.html)。
* 通过小心的编码来支持多种环境。

[browserify][browserify]几乎可以保证Node.js下测试通过的代码在浏览器中仍然能够正常使用。
但缺点也很显然：很容易产生冗余代码并生成一个巨大的JavaScript库。
对于微型的JavaScript工具，小心地编码再合适不过了！见下文。

<!--more-->

## 避开全局的名称空间

CommonJS中，每个源文件中的局部变量在其他文件中不可见。
然而浏览器中，所有全局名称空间的变量对所有JavaScript文件都可见。
这意味着我们需要包装所有的代码。例如：

```javascript
(function(){
    // your code goes here...
})();
```

不同于常见编程语言，JavaScript采取[函数作用域](/2016/02/05/js-scope.html)，
用一个`function`来包裹你的代码可以隐藏里面的局部变量。

如果你对整个文件都被缩进的代码很反感，可以在构建时再添加上述代码。例如Makefile中：

```make
person.js: index.js
    echo '(function(){' > $@
    cat $^ >> $@
    echo '})();' >> $@
```

> 如果你对Make构建前端项目感兴趣，可以看看Harttle的尝试：[Makefile构建前端项目](/2016/09/21/make-frontend.html)

## 一个简单的类

当然，『类』指的就是一个函数。假设我们的JavaScript模块提供一个叫做`Person`的类：

```javascript
(function(){
    function Person(){
        this.name = 'harttle';
    }
})();
```

下文将会考虑如何将这个类提供给其他模块使用。

## 检测CommonJS环境

要使用`typeof`来检测一个变量是否曾被声明，因为`if`对于未声明的变量会抛出错误。
例如：

```javascript
// Uncaught ReferenceError: foo is not defined
if(foo == undefined){       
    console.log('foo does not exist');
}
// 正常运行
if(typeof foo == 'undefined'){
    console.log('foo does not exist');
}
```

检测CommonJS我们只需要检测`module`, `exports`, `require`是否存在，比如：

```javascript
// CommonJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Person;
}
```

## 检测浏览器环境

浏览器环境也包括引入了AMD框架的，以及没有做模块化的。
对于前者我们应当使用AMD框架来声明一个模块，而对于后者我们只需要暴露一个全局变量。

```javascript
// Browser
if (typeof define === 'function' && define.amd) {
    define('Person', [], function() {
        return Person;
    });
} else {
    window.Person = Person;
}
```

> 当然这些浏览器检测相关逻辑也应当一并包裹在`function`中。

[browserify]: http://browserify.org/
