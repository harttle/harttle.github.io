---
title: 函数式JavaScript编程
tags: JavaScript 函数式编程 级联调用 回调函数 柯里化 Lambda
---

也许你还觉得函数式编程很陌生，但函数式的编程风格已经渗透在 JavaScript 当中。
比如[DOM][dom]中常见的回调函数、[jQuery][jquery]的级联写法、
[lodash][lodash]的partial函数、Java的[Guava][guava]库...
到处都是函数式的编程风格。

> 啥叫函数式编程？Lisp？事实上只要语言将函数作为一等公民（或者借助工具达到类似效果）
> 就可以支持函数式编程。而将函数作为一等公民意味着函数可以像变量一样传参、赋值和返回。

<!--more-->

# 回调函数

这正是函数作为一等公民的一大特征：函数可以作为参数传递。前端人员可能对回调函数非常熟悉，回调在处理不连续的事件时特别方便。例如从浏览器获取服务器的数据并更新页面时，最直接的实现可能是这样：

```javascript
var request = make_request();
var response = send_request_sync(request);
update_view(response);
```

上述代码中发送同步请求意味着脚本阻塞，此时页面会卡死（因为脚本里其他内容都不能运行）。
于是JavaScript允许传递回调函数：

```javascript
var request = make_request();
send_request_async(request, function(response){
    update_view(response);
});
```

回调函数作为参数传递给`send_request_async`方法，该方法会在响应到达时调用该回调函数。
防止了同步方法造成的页面假死，我们知道这就是浏览器中的[AJAX][ajax]技术。

# 模块化

模块化的好处是给出接口的同时隐藏了内部状态和实现细节。
函数式编程的一大好处便是模块化，因为它避免了全局变量。
JavaScript的函数和闭包现象可以支持模块化，几乎所有JavaScript模块化实践都是基于闭包设计的。

利用闭包模块化（封装）的例子已经在[JavaScript的作用域与闭包][js-scope]给出，不再赘述。

# 级联调用

还记得jQuery的级联调用（cascade）么？

```javascript
$('div')
    .css('color', 'red')
    .css('width', 100)
    .click(onClick)
```

如果没有级联调用，我们可能需要重复很多代码：

```javascript
var $el = $('div');
$el.css('color', 'red')
$el.css('width', 100)
$el.click(onClick)
```

级联调用的秘密在于每个函数都返回`this`。

# 柯里化

柯里化（curry）是函数式编程中的概念，指的是将一个多参数函数变成单参数函数的过程。
[lodash][lodash]工具库中的`curry`, `partial`, `partialRight`等方法都属于柯里化工具。
来个例子吧：

```javascript
function greet(name, greeting){
    return greeting + ', ' + name;
}
var greetAlice = _.partial(greet, 'alice');
greetAlice('Hi');       // Hi, alice
greetAlice('Hello');    // Hello, alice
```

柯里化函数的参数是函数，相当于一个补全参数的包装器（本质上柯里化函数属于高阶函数）。
柯里化在实现代理模式，接口适配器等场景下都非常有用。

# Pipeline

利用级联调用，JavaScript可以支持流水线的写法。加上[ES6][es6]给出的Lambda表达式，
流水线可以写得非常优雅。比如数组操作：

```javascript
// 定义一个人的数组
var people = [
    {name: 'alice', age: 1}, 
    {name: 'bob', age: 22},
    {name: 'carol', age: 24}];
// 获取满18岁的名单
var list = people
    .filter(p => p.age >= 18)
    .map(p => p.name)
    .reduce((prev, cur) => prev + ',' + cur);
console.log(list);      // bob,carol
```

除了数组操作，`Promise`在异步的JavaScript中应用良多。
它的设计与[Express.js][express]相似，都采取责任链模式。例如：

```javascript
var output = console.log.bind(console),
    toUpper = str => str.toUpperCase();
Promise
    .resolve({name: 'alice', age: 1})
    .then(p => p.name)
    .then(toUpper)
    .then(output)
```

[ajax]: https://es.wikipedia.org/wiki/AJAX
[dom]: https://en.wikipedia.org/wiki/Document_Object_Model
[jquery]: http://jquery.com/
[guava]: http://code.google.com/p/guava-libraries
[lodash]: https://lodash.com/
[js-scope]: /2016/02/05/js-scope.html
[express]: http://www.expressjs.com.cn/4x/api.html
[es6]: https://nodejs.org/en/docs/es6/
