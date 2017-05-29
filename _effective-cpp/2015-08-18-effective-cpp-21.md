---
layout: blog
title: Item 21：需要返回对象时，不要返回引用

tags: C++ 内存 引用 指针 数组 线程 栈空间 堆空间 动态内存 静态变量 拷贝构造函数
excerpt: 永远不要返回局部对象的引用或指针或堆空间的指针，如果客户需要多个返回对象时也不能是局部静态对象的指针或引用。
---

> Item 21: Don't try to return a reference when you must return an object

Item 20中提到，多数情况下传引用比传值更好。追求这一点是好的，但千万别返回空的引用或指针。
一个典型的场景如下：

```cpp
class Rational{
  int n, d;
public:
  Raitonal(int numerator=0, int denominator=1);
};

// 返回值为什么是const请参考Item 3
friend const Rational operator*(const Rational& lhs, const Rational& rhs);

Rational a, b;
Rational c = a*b;
```

<!--more-->

注意`operator*`返回的是`Rational`实例，`a*b`时便会调用`operator*()`，
返回值被拷贝后用来初始化`c`。这个过程涉及到多个构造和析构过程：

1. 函数调用结束前，返回值被拷贝，调用拷贝构造函数
2. 函数调用结束后，返回值被析构
3. `c`被初始化，调用拷贝构造函数
3. `c`被初始化后，返回值的副本被析构

我们能否通过传递引用的方式来避免这些函数调用？这要求在函数中创建那个要被返回给调用者的对象，而函数只有两种办法来创建对象：在栈空间中创建、或者在堆中创建。在栈空间中创建显然是错误的：

```cpp
const Rational& operator*(const Rational& lhs, const Rational& rhs){
  Rational result(lhs.n*rhs.n, lhs.d*rhs.d);
  return result;
}
```

客户得到的`result`永远是空。因为引用只是一个名称，当函数调用结束后`result`即被销毁。
它返回的是一个`ex-result`的引用。那么在堆中创建会是怎样的结果？

```cpp
const Rational& operator*(const Rational& lhs, const Rational& rhs){
  Rational *result  = new Rational(lhs.n*rhs.n, lhs.d*rhs.d);
  return *result;
}
```

问题又来了，既然是`new`的对象，那么谁来`delete`呢？比如下面的客户代码：

```cpp
Rational w, x, y, z;
w = x*y*z;
```

上面这样合理的代码都会导致内存泄露，那么`operator*`的实现显然不够合理。此时你可能想到用静态变量来存储返回值，也可以避免返回值被再次构造。但静态变量首先便面临着线程安全问题，除此之外当客户需要不止一个的返回值同时存在时也会产生问题：

```cpp
if((a*b) == (c*d)){
  // ...
}
```

如果`operator*`的返回值是静态变量，那么上述条件判断恒成立，因为等号两边是同一个对象嘛。如果你又想到用一个静态变量的数组来存储返回值，那么我便无力吐槽了。。。

挣扎了这许多，我们还是返回一个对象吧：

```cpp
inline const Rational operator*(const Rational& lhs, const Rational& rhs){
  return Rational(lhs.n*rhs.n, lhs.d*rhs.d);
}
```

事实上拷贝构造返回值带来的代价没那么高，C++标准允许编译器做出一些客户不可察觉(without changing observable behavior)的优化。在很多情况下，返回值并未被析构和拷贝构造。

**永远不要返回局部对象的引用或指针或堆空间的指针，如果客户需要多个返回对象时也不能是局部静态对象的指针或引用。**
[Item 4：确保变量的初始化][4]指出，对于单例模式，返回局部静态对象的引用也是合理的。

[4]: /2015/07/22/effective-cpp-4.html
