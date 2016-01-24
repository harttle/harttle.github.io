---
layout: blog
title: JavaScript 对象有哪些用法？
tags: JavaScript 原型继承 继承 反射
---

JavaScript是面向对象语言，通过原型机制实现继承，通过『闭包』等方式可以实现封装。
本文来探讨JavaScript对象的特殊之处：原型链、引用、反射、属性遍历等特性。

# 对象创建

JavaScript拥有非常直观的对象创建方式：

```javascript
var emptyObject = {};
var person = {
    name: 'harttle',
    age: 24
};
```

相当于：

```javascript
var xx = new Object(); 
xx.name = 'hartle'; 
xx.age = 24;
```

# 属性访问

属性可以通过两种语法访问：

* `person.age`
* `person['age']`

当属性名不存在时JavaScript会沿着原型链去查找。
赋值可以更新或创建一个属性，属性可以通过`delete person.age`来删除。

对`undefined`获取属性会引发`TypeError`，一般通过`&&`来解决：

```javascript
// person.girl === undefined
person.girl.name;                // TypeError
person.girl && person.girl.name; // undefined
```

<!--more-->

# 原型

JavaScript的原型继承方式有些繁琐，在[ES6][es6]中提供了`Object.create`方法，
原型继承变得更加简单。它的实现大致是这样的：

```javascript
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}
var obj = Object.create(proto);
```

如果被赋值/删除的属性来自于原型，JavaScript也会为当前对象创建/删除对应属性，
原型的属性不会受到影响。

网传`person.age = undefined`来删除属性的方式，其实相当于创建一个属性，其值为`undefined`。而`delete person.age`则会真正删除属性，就像从未声明过那个属性一样。

例如：

```javascript
var prot = { name: 'harttle' };
// 以 prot 为原型创建 p
var p = Object.create(prot);

delete p.name;          // p.name === 'harttle', 原型链的对象属性不受影响
p.name = undefined;     // p.name === undefined
delete p.name;          // p.name === 'harttle'，获取了原型的属性
```

> `undefined`属于基本数据类型Undefined，该类型的取值只有一种，即`undefined`。

# 对象引用

JavaScript中对象是通过引用传递的，它们不会被拷贝：

```javascript
var a = b = {};
a.name = 'harttle';
b.name === 'harttle'    // true
```

通过原型继承时，原型也是作为引用进入原型链的，原型属性不会被拷贝：

```javascript
var prot = {girl: {name: 'alice'}};
var p1 = Object.create(prot);
var p2 = Object.create(prot);

p1.girl.name = 'fuck';  // p2.girl.name === 'fuck'
```

可见原型关系是一种动态关系。

# 反射

JavaScript是一门动态语言，通过`typeof`可以在运行时获取类型信息：

```javascript
typeof p.age         // 'number'
typeof p.name        // 'string'
typeof p.toString    // 'function'，来自原型：Object.prototype
typeof p.wing        // 'undefined'
```

当然，`typeof`的能力有限，只能检查基本数据类型。
为了支持面向对象设计，我们需要更复杂的类型判断机制，可以参考
[如何检查JavaScript的类型？][js-type]一文。

# 属性遍历

可以通过`for in`遍历对象属性（包括原型属性）：

```javascript
var person = {name: 'harttle', age: 24};
for(var prop in person){
    console.log(p[prop);
}
```

为了只获取当前对象的属性，可以通过`hasOwnProperty`来判断：

```javascript
for(var prop in person){
    if(person.hasOwnProperty(prop)){
        console.log(p[prop);
    }
}
```

`for in`不保证属性的顺序，如果需要保证顺序可以使用`Array`来代替。
还避免了判断来自原型的属性。

# 避免全局变量

对全局变量的依赖是JavaScript的设计缺陷之一。避免使用全局变量有很多方法，
其中最简单的便是为你的项目定义一个全局变量，并且只定义一个全局变量：

```javascript
var APP = {};

APP.foo = 'xxx';
APP.bar = 'xxx';
```

这样代码更容易维护和变更，毕竟`APP.foo`一眼看去就是一个全局变量。

> 闭包是另一个避免全局变量的方式，以后再谈。

[js-type]: /2015/09/18/js-type-checking.html
[es6]: https://nodejs.org/en/docs/es6/
