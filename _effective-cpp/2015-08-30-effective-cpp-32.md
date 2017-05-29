---
layout: blog
title: Item 32：确保public继承是"is a"的关系

tags: C++ 封装 异常 接口 继承
excerpt: C++类的继承比现实世界中的继承关系更加严格：任何适用于父类的性质都要适用于子类！
---

> Item 32: Make sure public inheritance models "is-a".

C++面向对象程序设计中，最重要的规则便是：public继承应当是"is-a"的关系。当`Derived` public继承自`Base`时，
相当于你告诉编译器和所有看到你代码的人：`Base`是`Derived`的抽象，`Derived`就是一个`Base`，任何时候`Derived`都可以代替`Base`使用。

> 当然这只适合public继承，如果是private继承那是另外一回事了，见[Item 39][item39]。

比如一个`Student`继承自`Person`，那么`Person`有什么属性`Student`也应该有，接受`Person`类型参数的函数也应当接受一个`Student`：

```cpp
void eat(const Person& p);
void study(const Person& p);

Person p; Student s;
eat(p); eat(s);
study(p); study(s);
```

<!--more-->

# 语言的二义性

上述例子也好理解，也很符合直觉。但有时情况却会不同，比如`Penguin`继承自`Bird`，但企鹅不会飞：

```cpp
class Bird{
public:
    vitural void fly();
};
class Penguin: public Bird{
    // fly??
};
```

这时你可能会困惑`Penguin`到底是否应该有`fly()`方法。但其实这个问题来源于自然语言的二义性：
严格地考虑，鸟会飞并不是所有鸟都会飞。我们对会飞的鸟单独建模便是：

```cpp
class Bird{...};
class FlyingBird: public Bird{
public:
    virtual void fly();
};
class Penguin: public Bird{...};
```

这样当你调用`penguin.fly()`时便会编译错。当然另一种办法是`Penguin`继承自拥有`fly()`方法的`Bird`，
但`Penguin::fly()`中抛出异常。这两种方式在概念是有区别的：前者是说企鹅不能飞；后者是说企鹅可以飞，但飞了会出错。

哪种实现方式好呢？[Item 18][item18] 中提到，接口应当设计得不容易被误用，最好将错误从运行时提前到编译时。所以前者更好！

# 错误的继承

生活的经验给了我们关于对象继承的直觉，然而并不一定正确。比如我们来实现一个正方形继承自矩形：

```cpp
class Rect{...};
void makeBigger(Rect& r){
    int oldHeight = r.height();
    r.setWidth(r.width()+10);
    assert(r.height() == oldHeight);
}
class Square: public Rect{...};

Square s;
assert(s.width() == s.height());
makeBigger(s);
assert(s.width() == s.height());
```

根据正方形的定义，宽高相等是任何时候都需要成立的。然而`makeBigger`却破坏了正方形的属性，
所以正方形并不是一个矩形（因为矩形需要有这样一个性质：增加宽度时高度不会变）。即`Square`继承自`Rect`是错误的做法。
C++类的继承比现实世界中的继承关系更加严格：**任何适用于父类的性质都要适用于子类！**

> 本节我们谈到的是"is-a"关系，类与类之间还有着其他类型的关系比如"has-a", "is-implemented-in-terms-of"等。这些在Item-38和Item-39中分别介绍。

[item18]: /2015/08/09/effective-cpp-18.html
[item39]: /2015/09/06/effective-cpp-39.html
