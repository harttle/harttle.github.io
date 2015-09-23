---
layout: blog
categories: reading
title: Item 53：注意编译警告
subtitle: Effective C++笔记
tags: C++ 编译 名称隐藏
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

[pointers]: {% post_url 2015-07-05-cpp-pointers-and-references %}
[args]: {% post_url 2015-07-07-cpp-functions-and-arguments %}
[item2]: {% post_url 2015-07-20-effective-cpp-2 %}
[item3]: {% post_url 2015-07-21-effective-cpp-3 %}
[item4]: {% post_url 2015-07-22-effective-cpp-4 %}
[item6]: {% post_url 2015-07-23-effective-cpp-6 %}
[item7]: {% post_url 2015-07-24-effective-cpp-7 %}
[item11]: {% post_url 2015-07-30-effective-cpp-11 %}
[item12]: {% post_url 2015-08-01-effective-cpp-12 %}
[item13]: {% post_url 2015-08-02-effective-cpp-13 %}
[item15]: {% post_url 2015-08-05-effective-cpp-15 %}
[item16]: {% post_url 2015-08-07-effective-cpp-16 %}
[item18]: {% post_url 2015-08-09-effective-cpp-18 %}
[item20]: {% post_url 2015-08-13-effective-cpp-20 %}
[item22]: {% post_url 2015-08-19-effective-cpp-22 %}
[item24]: {% post_url 2015-08-22-effective-cpp-24 %}
[item28]: /2015/08/26/effective-cpp-28.html
[item25]: /2015/08/23/effective-cpp-25.html
[item30]: /2015/08/28/effective-cpp-30.html
[item31]: /2015/08/29/effective-cpp-31.html
[item32]: /2015/08/30/effective-cpp-32.html
[item33]: /2015/08/31/effective-cpp-33.html
[item35]: /2015/09/02/effective-cpp-35.html
[item36]: /2015/09/03/effective-cpp-36.html
[item38]: /2015/09/05/effective-cpp-38.html
[item39]: /2015/09/06/effective-cpp-39.html
[item42]: /2015/09/09/effective-cpp-42.html
[item43]: /2015/09/10/effective-cpp-43.html
[item47]: /2015/09/15/effective-cpp-47.html
[item49]: /2015/09/17/effective-cpp-49.html
[item50]: /2015/09/19/effective-cpp-50.html
