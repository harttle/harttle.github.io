---
layout: blog
title: Item 6：禁用那些不需要的缺省方法

tags: C++ 继承 运算符 构造函数 析构函数 赋值运算符 运算符重载 拷贝构造函数
excerpt: 有时候我们希望禁用掉这些函数。比如对于一个单例而言，我们不希望它能够被直接构造，或者拷贝。我们通过把自动生成的函数设为`private`来禁用它。
---

> Item 6: Explicitly disallow the use of compiler-generated functions you do not want.

在C++中，编译器会自动生成一些你没有显式定义的函数，它们包括：构造函数、析构函数、复制构造函数、`=`运算符。
关于这些函数是的调用时机可以参考：[那些被C++默默地声明和调用的函数](/2015/07/23/effective-cpp-5)。

这些默认生成的函数给我们的类提供了缺省的功能，比如赋值、复制、构造、析构等；
同时也给我我们重载这些函数的机会，借此实现更加复杂的对象行为。

然而有时候我们希望禁用掉这些函数。比如对于一个单例而言，我们不希望它能够被直接构造，或者拷贝。
我们通过把自动生成的函数设为`private`来禁用它，
[Effective C++笔记：确保变量的初始化](/2015/07/22/effective-cpp-4.html)
提到的单例是一个例子。这里我们来实现一个不可拷贝的类`Uncopyable`，
需要声明其复制构造函数与`=`运算符为`private`：

```cpp
class Uncopyable{
private:
	Uncopyable(const Uncopyable&);
	Uncopyable& operator=(const Uncopyable&);
public:
    Uncopyable(){}
};
```

值得一提的是，`Uncopyable`的不可拷贝特性是可以继承的。例如：

```cpp
class Homeforsale: private Uncopyable{
    ...
};
```

> 这里改为`public`继承仍然可行，但语义上不正确，`Uncopyable`更像是一种实现方式或者接口，而不是一个基类。

在编译器默认生成的拷贝构造函数和赋值运算符中，会调用父类的相应函数。
然而这些调用将会被拒绝，因为对父类这些函数的访问将被拒绝。

