---
layout: blog
title: Item 53：注意编译警告

tags: C++ 编译 虚函数 名称隐藏
excerpt: 请严肃对待所有warning，要追求最高warning级别的warning-free代码；但不要依赖于warning，可能换个编译器有些warning就不在了。
---

> Item 53: Pay attention to compiler warnings.

编译警告在C++中很重要，因为它可能是个错误啊！
不要随便忽略那些警告，因为编译器的作者比你更清楚那些代码在干什么。
所以，

* 请严肃对待所有warning，要追求最高warning级别的warning-free代码；
* 但不要依赖于warning，可能换个编译器有些warning就不在了。

> 其实在多数项目实践中，不仅要消除所有编译警告，消除所有代码风格检查警告也是常见惯例。

<!--more-->

还是看一个常见的错误吧，编译器会帮你发现它。比如我们想在`D`中重写`B`中的虚函数`f()`：

```cpp
class B{
public:
    virtual void f() const;
};
class D:public B{
public:
    virtual void f();
};
```

我们忘记写`const`了！这已经不是重写虚函数了，而是定义同名函数而彻底隐藏父类中的`void f() const`。
所以编译器会给警告；

```
warning: D::f() hides virtual B::f()
```

编译器的意思是`B`中没有声明过这样一个`f`。但很多无知的程序员会想：当然`D::f`隐藏了`B::f`，这就是我要的结果啊！
却没有想到是自己忘写了`const`。这里犯的错误可能会导致长时间的debug，就因为你忽略了编译器早就发现的一个问题。

当你有很多经验时便能识别那些warning到底在说什么，但最好的习惯还是消除多有warning。因为当warning井喷时很容易忽略其中的严重问题。
至少当你忽略一个warning时，要确保你已经完全理解了它在说什么。
