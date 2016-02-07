---
layout: blog
title: JavaScript 实现原型继承
tags: 原型继承 JavaScript 作用域 继承
---

在原型继承模式中，我们不需要定义任何的类，
其实在概念上原型继承比类继承要简单许多。
毕竟不需要设计一整套嵌套的抽象类的层级。
在原型继承中，对象直接继承其他对象。

> JavaScript支持多种面向对象编程风格，在[JavaScript实现类的继承][classical]一文中介绍了JavaScript如何模拟基于类层级的继承机制。

<!--more-->

# 实现原型继承

实现原型继承的第一步便是创建一些有用的、用来被继承的对象。比如：

```javascript
var person = {
    name: 'no man',
    gender: 'unknown',
    greet: function(){
        return 'Hi, I am' + name;
    },
    work: function(org){
        do_work_for(this, org);
    }
};
```

接着定义一个新对象`Man`继承自`Person`类，并进行一些自定义：

```javascript
var man = Object.create(person);
man.name = 'bob';
man.fuck = function(){};
```

这里的`Man`拥有`Person`的所有属性，并且经过了特化。
`Object.create`相当于设置`prototype`并`new`一个对象：

```javascript
Object.method('create', function(base){
    var f = function(){};
    f.prototype = base;
    return new f();
});
```

# 一个有用的场景

在多数编程语言中，一对大括号定义一个作用域。
子作用域继承自父作用域，并且拥有自己的标识符。
子作用域中的标识符在父作用域不可见。
在语法分析时，遇到一个前大括号便开启一个子作用域。
如果我们用`block`函数来分析，代码可能是这样的：

```javascript
function block(){
    var oldScope = scope;
    scope = Object.create(scope);

    advance('{');
    parse(scope);
    advance('}');

    scope = oldScope;
}
```

在遇到`{`时，应用一个新的子`scope`，遇到`}`时，退出子作用域，恢复到父`scope`。

[classical]: /2016/02/15/js-classical-inheritance.html
