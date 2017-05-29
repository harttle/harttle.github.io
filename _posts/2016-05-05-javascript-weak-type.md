---
title: 弱类型只是一种信仰
tags: C++ Java JavaScript 接口 弱类型 类型转换
---

最近完成了[brick.js-1.1.2][brk]版本，添加了对预处理器插件的支持。
写越多的JavaScript，越能体会弱类型面向对象语言的优雅。
然而类型系统的争辩并不是一场理性的战争，弱类型只是一种信仰。

# 强类型与弱类型

**类型系统（type system）**是程序设计语言中，为变量、表达式、函数等程序结构设置*类型*的规则。提出类型系统的初衷是为了减少程序Bug，基本思想是用接口来描述模块边界，使得程序员或编译器更方便地检查模块之间是否兼容。

现在看到的绝大多数编程语言都是有类型的编程语言（typed programming language）。
但根据是否允许隐式类型转换，这些语言可以分为强类型语言和弱类型语言（Strong and weak typing）。

> C语言属于弱类型语言，因为`void*`可转换为任何类型的指针。面向对象语言往往是强类型的，
> 它们通过接口和共同父类来识别兼容的类型，很少需要类型转换。

在旷日持久的强弱类型的争辩中，支持强类型的一方似乎占据了上风。
C11花费大量力气维护完美的类型系统，把所有破坏类型系统的行为都严格标识出来：
`const_cast`, `dynamic_cast`, `reinterpret_cast`, `static_cast`
（见[最小化类型转换-Effective C++][min-cast]）。

然而在V8引擎和Node.js出现不久，JavaScript软件包却在Github和NPM迅速兴起。
弱类型带来的不仅仅是快乐，还有更加迅速的开发周期。

<!--more-->

# 强类型的面向对象语言

强类型的编程语言试图让编译器去检查程序Bug，这在面向过程程序设计中较为有用
（比如浮点变量不小心赋值给整数）。
然而在面向对象语言中，类型错误往往不是程序Bug的真正来源。

比如下面C++语句：

```cpp
map<string> m = str.begin();
```

```
error: no viable conversion from 'iterator' (aka '__wrap_iter<std::__1::basic_string<char> *>') to 'map<string>' (aka 'map<basic_string<char, char_traits<char>, allocator<char> > >')
```

大意是对该变量不存在合适的类型转换，然后精确地列出了赋值运算符两端的类型。
其实这只是一个拼写错误...

面向对象设计中，最有效的Debug信息莫过于一个表示异常的消息字符串。
为了支持具有消息字符串的异常，只需要一个`Error`对象足以，何必来一套强类型系统。

# 无缝的适配器

JavaScript是弱类型语言，其中的对象是用**隐式接口**来规约的，
也就是说接口不需要提前声明，其调用方式规约了接口。这一点与C++模板的隐式接口类似。
隐式接口为接口变化带来了『十分』的方便。考虑如下情形：

在一个『Java』程序中，普遍使用一个`Promise`的类。
有一天我们需要用另一个实现`BetterPromise`来取代它。
可能后者有更丰富的方法或者更高效的实现，这时至少需要如下工作：

1. 定义一个`IPromise`接口，所有使用`Promise`之处更改为`Ipromise`接口。或者你有远见的话已经实现做了这件事情。
2. 为`BetterPromise`写一个适配器(`BetterPromiseAdapter`)实现`IPromise`接口。
3. 所有构造`Promise`对象之处改为构造`BetterPromiseAdapter`对象。

再来看看JavaScript中如何利用*隐式接口*来做这件事情：

1. 编写一个`enhancePromise`方法，直接增强或者覆盖`function Promise`。
2. 在程序入口（或你需要的地方）执行`enhancePromise`方法。
3. 既有代码无需任何改动。

# 模块间通信

在一个成熟的软件系统中，往往需要基于HTTP或TCP Socket的通信。
软件的各部分互相传递一些对象数据。考虑使用面向对象C++来开发的情形：

一个模块为了解析通信对方传来的数据，需要定义一套通信数据的类型声明。
然而这会有可维护性问题：对方更新了数据格式，岂不是需要跟着更新？否则解析失败会引起程序错误。

那么双方共享一份数据声明如何？典型的做法就是引入通信对方的数据类型声明文件。
比如`/usr/local/include/xxx.h`。
同步的问题解决了，但同时引入了编译依赖，我们知道编译依赖不是一件好事。
带来的问题包括代码膨胀、编译时间长等（见[Item 31：最小化文件之间的编译依赖][compile-dep]）。

JavaScript却不存在这样的问题。只有业务变化时才需要更新代码，
通信对方无关紧要的变化大可以不去理睬。例如AngularJS中获取一个User对象：

Template:

```html
<div>
    <h3>{{user.name}}</h3>
    <p>{{user.description}}</p>
</div>
```

Controller:

```javascript
$http.get('/user/harttle').then(function(user){
    $scope.user = user;
});
```

只有`name`和`description`字段发生变化时（真正影响到了业务），才需要更新上述代码。
根本没有类型声明，更不存在解析错误。

# 混合类型的逻辑运算

弱类型不仅仅是允许类型转换，在JavaScript中类型本身就是模糊的。
这意味着JavaScript对象可以在不进行类型转换的同时被作为不同的类型来使用。
例如C++中一个简单的缓存过程：

```cpp
if(cacheEnabled && cache[key]){
    return cache[key];
}
else{
    return read(key);
}
```

在JavaScript中允许混合类型的逻辑运算，少些很多代码：

```javascript
return cacheEnabled && cache[key] || read(key);
```

该表达式返回的类型仍然是`cach[key]`和`read(key)`的类型，而不是`Boolean`。
在逻辑运算的同时没有进行隐式类型转换，仍然保留着原有的类型信息。

[brk]: https://github.com/brick-js/brick.js
[type-sys]: https://en.wikipedia.org/wiki/Type_system
[min-cast]: /2015/08/25/effective-cpp-27.html
[compile-dep]: /2015/08/29/effective-cpp-31.html
