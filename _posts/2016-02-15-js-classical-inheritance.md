---
layout: blog
title: JavaScript 实现类的继承
tags: JavaScript 继承 原型继承 构造函数
---

JavaScript采取原型继承机制，对象直接继承其他对象；在类继承语言中，类继承其他类，对象是类的实例。事实上JavaScript提供了更加丰富的重用机制，可以模仿类继承，也可以支持更加复杂的代码重用模式。本文关注于如何用JavaScript模拟其他语言中的类继承机制。

> 在传统编程语言中，类继承机制至少提供了两方面的好处：1) 代码重用，只需要编写不同的那部分代码，减少开发成本；2) 引入类型系统，便于编译期类型检查，减少强制转换。

<!--more-->

# new 关键字

在JavaScript中我们通过[构造函数调用模式][func-inv]来完成对象的创建。
下面给出了`new`关键字的大致实现方式：

```javascript
var p = new Person(args);
// 相当于：
var p = Person.new(args);
Function.prototype.new = function(){
    var obj = Object.create(this.prototype);
    var ret = this.apply(obj, arguments);
    return (typeof ret === 'object' && ret) || obj;
};
```

> 如果构造函数返回值是一个对象，那么这个对象将代替`this`成为`new`的结果。

# 构造函数

构造函数中，通过操作`this`可以操作当前对象。

```javascript
function Person(name){
    this.name = name;
}
```

到这里不得不说`new`关键字仅仅是为了迎合那些熟悉类继承的程序员。
这里有很多设计缺陷，比如：

* 构造函数中无法访问`super`，并未提供完整的类继承支持；
* 没有私有成员；
* 如果忘记写`new`，`this`将被绑定到`global`，这时没有警告也没有错误。

所以JavaScript编程中有一个惯例：所有意图用作构造函数的方法名都应该首字母大写，
靠肉眼区分构造函数和普通函数 :)

# 原型增强

除了在构造函数中修改`this`，还可以增强`prototype`属性来添加对象的属性和方法。
我们知道所有的`function`声明都会生成一个`Function`实例。
在`Function`的构造函数中，会执行类似这样的语句：

```javascript
this.prototype = {constructor: this}
```

> 根据`constructor`属性可以判断对象类型（虽然不靠谱），参考[如何检查JavaScript变量类型？][js-type]

所以`prototype`属性总是非空的，我们来给`Person`添加一个方法：

```javascript
Person.prototype.greet = function(){
    console.log('Hi, I am ' + this.name);
}
var p = new Person('Alice');
p.greet();      // Hi, I am Alice
```

作为惯例，对象方法通过增强`prototype`来添加，对象属性通过构造函数来设置。

# 类继承

JavaScript本质上没有类的继承，但可以实现对象继承。
只需要设置`prototype`为另一个『类』的实例对象。

```javascript
function Man(girl){
    this.girl = girl;
};
Man.prototype = new Person();
Man.prototype.sex = 'male';
Man.prototype.fuck = function(){};
```

至此我们用JavaScript模拟了对象创建和类的继承，虽然写法上看起来还是很怪异。
下面定义两个方法来让这个过程更加顺畅：

```javascript
Function.prototype.method = function(name, func){
    this.prototype[name] = func;
    return this;
}
Function.method('inherits', function(Parent){
    this.prototype = new Parent();
    return this;
});
```

然后重新编写`Man`:

```javascript
var Man = function(girl){
    this.girl = girl;
}
    .inherits(Person)
    .method('fuck', function(){})
    .method('sex', 'male');
```

本文给出了JavaScript模拟类继承机制的完整过程，最后还是需要强调：

> 模拟的类继承机制只是为了迎合不熟悉JavaScript的程序员，
> 事实上JavaScript提供了更丰富的更优雅的面向对象解决方案。
> 欲知后事如何，且关注后续的文章！

[func-inv]: /2016/02/03/js-function-invocation.html
[js-type]: {% post_url 2015-09-18-js-type-checking %}
