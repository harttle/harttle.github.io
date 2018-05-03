---
title: JavaScript 方法的 4 种调用方式
tags: JavaScript 原型链 闭包 构造函数 JSON
---

**函数**（Function）是JavaScript的基本模块单元，JavaScript的代码重用，
信息隐藏，对象组合等都可以借助函数来实现。
JavaScript中的函数有4种调用模式：

* 方法调用（Method Invocation Pattern）
* 函数调用（Function Invocation Pattern）
* 构造函数调用（Constructor Invocation Pattern）
* apply调用（Apply Invocation Pattern）

与其他语言不通，JavaScript的函数是一种特殊的对象
（事实上，JavaScript函数是一级对象）。
这意味着函数可以有属性，可以有方法，也可以传参、返回、赋值给变量、加入数组。
与对象不同的是函数可以被调用。

既然是对象便会有原型。我们知道通过花括号语法创建的对象的原型是`Object.prototype`。
通过函数语法（`function`关键字或`new Function()`）创建的函数，其原型自然是`Function.prototype`。
而`Function.prototype`的原型是`Object.prototype`。

> 注意上述『原型』指的是原型链上的隐式原型，区别于`prototype`原型属性。

<!--more-->

# 调用模式

我们知道在函数里可见的名称包括：函数体内声明的变量、函数参数、来自外部的闭包变量。
此外还有两个：`this`和`arguments`。

`this`在面向对象程序设计中非常重要，而它的值在JavaScript中取决于**调用模式**。
JavaScript中的函数有4种调用模式：方法调用、函数调用、构造函数调用、apply调用。

`arguments`是一个类数组变量（array like），拥有`length`属性并可以取下标，
它存着所有参数构成的有序数组。
在JavaScript中，函数调用与函数签名不一致（个数不正确、类型不正确定）
时不会产生运行时错。少了的参数会被置为`undefined`，多了的参数会被忽略。

# 方法调用模式

在面向对象程序设计中，当函数（Function）作为对象属性时被称为方法（Method）。
方法被调用时`this`会被绑定到对应的对象。在JavaScript中有两种语法可以完成方法调用：
`a.func()`和`a['func']()`。

```javascript
var obj = {
    val: 0,
    count: function(){
        this.val ++;
        console.log(this.val);
    }
};

obj.count();    // 1
obj.count();    // 2
```

值得注意的是，`this`到`obj`的绑定属于极晚绑定（very late binding），
绑定发生在调用的那一刻。这使得JavaScript函数在被重用时有极大的灵活性。

# 函数调用模式

当函数不是对象属性时，它就会被当做函数来调用，比如`add(2,3)`。
此时`this`绑定到了全局对象`global`。

> 在[那些 JavaScript 的优秀特性][elegant-js]一文中曾提到，
> JavaScript的编译（预处理）需要`global`对象来链接所有全局名称。

其实`this`绑定到`global`是JavaScript的一个设计错误（可以说是最严重的错误），
它导致了对象方法不能直接调用内部函数来做一些辅助工作，
因为内不函数里的`this`的绑定到了`global`。
所以如果要重新设计语言，方法调用的`this`应该绑定到上一级函数的`this`。

然而共有方法总是需要调用内部辅助函数，于是产生了这样一个非常普遍的解决方案：

```javascript
man.love = function(){
    var self = this;
    function fuck(){
        self.happy++;
    }
    function marry(){
        self.happy--;
    }
    fuck() && marry();
}
```

有些场景下用`Function.prototype.bind`会更加方便：

```javascript
man.love = function(){
    function fuck(girl1, girl2, ...){
        this.happy++;
    }
    fuck.bind(this)();
    ...
}
```

# 构造函数调用模式

> Classically inspired syntax obscures the language’s true prototypal natur.

JavaScript中，那些用来`new`对象的函数成为构造函数。

JavaScript采用原型继承方式。这意味着一个对象可以从另一个对象直接继承属性，
JavaScript是class free的~ 但JavaScript为了迎合主流的基于类声明的继承方式，
同时也给出了构造函数机制：使用`new`关键字，便会创建一个对象，
根据`prototype`属性创建原型链，并以该对象为`this`执行指定的（构造）函数。

```javascript
function Man(name, age){
    this.sex = 'man';
    this.name = name;
    this.age = age;
}
Man.prototype.fuck = function(girl1, girl2, ...){}
var man = new Man();
man.fuck();
```

当构造函数有很多参数时，它们的顺序很难记住，所以通常使用对象进行传参：

```javascript
var man = new Man({
    name: 'bob',
    age: 18
});
```

给参数起名字以达到顺序无关的做法在Python中也存在，但JavaScript的对象传参还将带来另一个好处：
JSON兼容。因为JavaScript常常需要数据库（例如MongoDB）或网络（`application/json`）传来的JSON数据，这一点使得对象构造非常方便。

# Apply 调用模式

JavaScript函数是一种特殊的对象，而对象可以有属性和方法。
其中的`apply`方法提供了一个更加特殊的调用方式。
它接受两个参数：第一个是该函数要绑定的`this`，第二个是参数数组。

```javascript
var args = [girl1, girl2];
var animal = new Animal();
Man.prototype.fuck.apply(animal, args);
```

Apply使得一个方法可以用不同的对象对象来调用，比如`animal`也可以用`Man`的方式来`fuck`。

[elegant-js]: /2016/01/18/elegant-javascript.html


