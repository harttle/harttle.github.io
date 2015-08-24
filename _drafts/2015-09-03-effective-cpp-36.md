---
layout: blog
categories: reading
title: Item 36：不要重写继承来的非虚函数
subtitle: Effective C++笔记
tags: C++ 虚函数 继承 名称隐藏
excerpt: Never redefine an inherited non-virtual function.
---

> Item 36: Never redefine an inherited non-virtual function.

我们还是在讨论public继承，比如`Derived`继承自`Base`。如果`Base`有一个非虚函数`func`，那么客户会倾向认为下面两种调用结果是一样的：

```cpp
Derived d;
Base* pb = &d;
Derived* pd = &d;
// 以下两种调用应当等效
pb->func();
pd->func();
```

为什么要一样呢？因为public继承表示着"is-a"的关系，每个`Derived`对象都是一个`Base`对象（见[Item 32][item32]）。

<!--more-->

然而重写（override）非虚函数`func`将会造成上述调用结果不一致：

```cpp
class Base{
public:
    void func(){}
};
class Derived: public Base{
public:
    void func(){}   // 隐藏了父类的名称func，见Item 33
};
```

因为`pb`类型是`Base*`，`pd`类型是`Derived*`，对于普通函数`func`的调用是静态绑定的（在编译期便决定了调用地址偏移量）。
总是会调用指针类型定义中的那个方法。即`pb->func()`调用的是`Base::func`，`pd->func()`调用的是`Derived::func`。

> 当然虚函数不存在这个问题，它是一种动态绑定的机制。

在子类中重写父类的非虚函数在设计上是矛盾的：

* 一方面，父类定义了普通函数`func`，意味着它反映了父类的不变式。子类重写后父类的不变式不再成立，因而子类和父类不再是"is a"的关系。
* 另一方面，如果`func`应当在子类中提供不同的实现，那么它就不再反映父类的不变式。它就应该声明为`virtual`函数。

[strategy-pattern]: /assets/img/blog/effective-cpp/strategy-pattern@2x.png
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
[item18]: {% post_url 2015-08-09-effective-cpp-18 %}
[item20]: {% post_url 2015-08-13-effective-cpp-20 %}
[item22]: {% post_url 2015-08-19-effective-cpp-22 %}
[item25]: /2015/08/23/effective-cpp-25.html
[item32]: /2015/08/30/effective-cpp-32.html
[item33]: /2015/08/31/effective-cpp-33.html

