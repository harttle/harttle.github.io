---
layout: blog
title: JavaScript 内置对象与原型链结构
tags: Chrome JavaScript 原型继承 原型链
excerpt: 本文便来介绍使用JavaScript进行面向对象编程的核心概念：原型链。 不同于Java、C#等面向对象语言，JavaScript采用基于原型的继承方式。
---

JavaScript是一门直译式脚本语言，是一种动态类型、基于原型的语言。
JavaScript的灵活性不亚于C++，你可以使用JavaScript尝试不同的程序设计范型。
比如类jQuery风格的函数式编程、基于过程的指令式编程、以及基于原型的面向对象编程。

**不同于Java、C#等面向对象语言，JavaScript采用基于原型的继承方式。
本文便来介绍使用JavaScript进行面向对象编程的核心概念：原型链。**

<!--more-->

# 用户定义类型的原型链

[如何检查JavaScript变量类型？][type-check]一文指出，[instanceof][instanceof]关键字可以基于原型链来检测变量的类型。
马上来看看`instanceof`的使用方式：先构造一个原型链，再用`instanceof`来检测类型：

```javascript
function Animal(){}
function Cat(){}
Cat.prototype = new Animal
function BadCat(){}
BadCat.prototype = new Cat

BadCat cat
cat instanceof Cat      // true
cat instanceof Animal   // true

Cat instanceof Function         // true 
Function instanceof Object      // true 
```

由上述的`instanceof`的结果，可以判断这些类型的继承层级：

```cpp
Object -> Function -> Animal -> Cat -> BadCat
```

事实上`instanceof`是通过原型链来检测类型的，例如`L instanceof R`：
如果`R.prototype`出现在了`L`的原型链上则返回`true`，否则返回`false`。
用JavaScript来描述`instanceof`的实现逻辑是这样的：

```javascript

function instance_of(L, R) {
    for(L = L.__proto__; L; L = L.__proto__){
        if (L === R.prototype) return true;
    } 
    return false; 
}
```

# 两个特殊的内置对象

我们知道JavaScript除了5中基本数据类型（见[如何检查JavaScript变量类型？][type-check]）外，
还提供了一系列的内置对象（如`Object`, `Function`, `Number`, `String`, `Date`, `RegExp`），
虽然同为内置对象，但它们拥有不同的原型链结构，你看：

```javascript
Cat instanceof Cat              // flase
Number instanceof Number        // false 
String instanceof String        // false 
Date instanceof Date            // false

Object instanceof Object        // true, why??
Function instanceof Function    // true, why??
```

> 原因见下文：原型链。

如果你没写过JavaScript，看到这里你可能已经决定远离JavaScript了。。
不过对于写JavaScript读者和我，这一点却是需要理解的：
**JavaScript类型包括基本数据类型（5种）和对象（无数种），而`Object`和`Function`是两种特殊的对象**。

* `Object`特殊在`Object.prototype`是凭空出来的。语法上，所有的`{}`都会被解释为`new Object()`；
* `Function`特殊在`__proto__ == prototype`。语法上，所有的函数声明都会被解释为`new Function()`。

除了这两个特殊的对象，其他对象和用户定义类型拥有一样的原型链结构。

# JavaScript原型链

我用下图给出JavaScript的原型链结构。悄悄告诉你理解原型链的小技巧：
将`__proto__`箭头视作泛化（子类到父类）关系！那么图中所有的虚线将构成一个继承层级，而实线表示属性引用。

![](/assets/img/blog/javascript/js-proto.png)

图中给出了`Object.prototype.__proto__ == null`，但它还没有标准化，在Chrome、Safari和Node.js下它是不同的东西。
但可以看到JavaScript中所有对象的共同隐式原型为`Object.prototype`，它的上一级隐式原型是什么已经不重要了，
因为它不会影响所有内置对象以及用户定义类型的原型链结构。

上图其实已经解释了不同内置对象`instanceof`的行为，我们来看`Function`和`Object`的特殊之处：

1. `Object`是由`Function`创建的：因为`Object.__proto__ === Funciton.prototype`；
2. 同理，`Function.prototype`是由`Object`创建的；
3. `Funciton`是由`Function`自己创建的！
4. `Object.prototype`是凭空出来的！

现在我们可以解释特殊对象的`instance`行为了：

```javascript
// 因为 Function.__proto__ === Function.prototype
Function instanceof Function == true

// 因为 Object.__proto__.__proto__ === Object.prototype
Object instanceof Object == true

// 因为 Function.prototype Object.prototype同时位于Function和Object的原型链上
Object/Function instanceof Object/Function === true
```

另外可以看到当你声明一个函数（比如`Animal`）时，`Animal.prototype`会自动被赋值为一个继承自`Object`的对象，
而且该对象的`constructor`等于`Animal`。即：

```cpp
function Animal(){}
Animal.prototype.constructor === Animal     // true
```

值得注意的是`Animal`如果被`Cat`继承，`Cat`实例（比如`cat`）的`constructor`仍然是`Animal`。

```javascript
function Cat(){}
Cat.prototype = new Animal
var cat = new Cat

cat.constructor 
    === Cat.prototype.constuctor 
    === (new Animal).constructor 
    === Animal.prototype.constructor
    === Animal
```

[instanceof]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof
[type-check]: /2015/09/18/js-type-checking.html
