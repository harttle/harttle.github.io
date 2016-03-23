---
layout: blog
title: JavaScript实现函数式继承
tags: JavaScript 封装 继承 闭包 作用域 原型继承 函数式编程
---

在[『JavaScript实现原型继承』][proto]和[『JavaScript实现类的继承』][class]
中介绍了两种JavaScript实现面向对象中继承机制的方式。
本文介绍在JavaScript中更加优雅的继承方式：函数是继承。
利用[JavaScript的闭包现象][closure]完美地解决了信息隐藏的问题，
也提供了访问父类对象的机制。

<!--more-->

# 对象封装

首先我们需要提供一种封装对象的方式，支持私有的属性/方法，以及公有属性/方法。
既然是函数式编程，那就用一个函数来创建对象。
后面将会看到，JavaScript的函数非常擅长这件事情。

```javascript
var constructor = function(args){
    // 私有属性、私有方法
    var private_property;
    function private_method(){}

    // 创建新对象
    var obj = {description: 'a new object'};

    // 公有属性、公有方法
    obj.public_property = 'xxx';
    obj.public_method = function(){};

    return obj;
};
```

## 私有属性

这里我们通过闭包变量来存放私有属性，闭包函数来存储私有方法。
由于[JavaScript的函数作用域][closure]，它们在`constructor`外部完全不可见，而在`obj`的创建和自定义过程中完全可见。

## 公有属性

为`obj`添加的公有属性则在`constructor`外部可以通过`obj.public_property`访问。

# 对象继承

只需要在对象封装的代码上稍作改动便可实现对象继承，同时可以支持对`super`的访问。
下面我们将看到JavaScript函数极具灵活性。

## 一个例子

在『创建新对象』时，我们调用另一个`constructor`即可完成对象继承。例如：

```javascript
var make_person = function(args){
    // 这些是私有的
    var hobbies, age;
    // 创建一个对象
    var person = {
        name: args.name,
        greet: function(){ 
            console.log('Hi, I am ' + this.name);
        }
    };
    return person;
}

var make_man = function(args){
    // 这些是私有的
    var girl, property;
    // 创建一个父级对象
    var man = make_person(args);
    // 自定义
    man.fuck = function(){}
    return man;
}
```

## 访问super

函数式的对象继承还有另外一个好处：我们可以控制父级对象的创建过程，
并且访问`super`属性，即使它们被同名属性所隐藏。
例如在`man`中访问`person`的`greet`方法：

```javascript
var make_man = function(args){
    var man = make_person(args),
        super_greet = man.greet.bind(man);
    man.greet = function(){
        super_greet();
        console.log('And I am a man.');
    }
    return man;
}
```

把`greet`函数绑定到`man`是必要的，否则`super_greet`中的`this`将会绑定到`global`。
是为了为了简化这一过程，可以定义一个工具函数：

```javascript
Object.method('super', function(name){
    var method = this[name];
    return function(){
        return method.apply(this, arguments);
    };
});
```

然后重新实现`make_man`：

```javascript
var make_man = function(args){
    var man = make_person(args),
        super_greet = man.super('greet');
    man.greet = function(){
        super_greet();
        console.log('And I am a man.');
    }
    return man;
}
```

[closure]: /2016/02/05/js-scope.html
[proto]: /2016/02/17/js-prototypal-inheritance.html
[class]: /2016/02/15/js-classical-inheritance.html

