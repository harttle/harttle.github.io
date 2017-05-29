---
layout: blog
title: Item 13：使用对象来管理资源

tags: C++ RAII STL 内存 异常 作用域 智能指针 析构函数 运算符重载 栈空间 堆空间
excerpt: 创建资源后立即放入资源管理对象中，并利用资源管理对象的析构函数来确保资源被释放。复制一个 auto_ptr 会使它变成空
---

> Item 13: Use objects to manage resources.

熟悉智能指针的人肯定不会对此觉得陌生。利用C++中对象自动析构的特性，自动地释放资源。
C++编译器并未提供自动的垃圾回收机制，因此释放资源的责任落在了开发者的头上。
我们被要求总是成对地使用`new`和`delete`，例如：

```cpp
Investment *pInv = createInvestment();
...
delete pInv;
```

> `createInvestment`这样的方法属于工厂方法（factory function），用来创建一个对象的实例。

上述代码确实能够在不泄漏内存的情况下很好地执行，但问题出在`createInvestment()`函数把释放资源的责任交给了客户，
但并未显式地声明这一点，因而客户有时并不知情。即使客户知道该资源需要销毁，
也可能由于流控制语句或者异常的出现而使得资源未被及时释放。

幸运的是，我们可以用对象来包装资源，并在析构函数中释放它。这样客户便不需要维护资源的内存了。
`std::auto_ptr`便是这样一个对象，它被称为**智能指针**（smart pointer）。
典型的使用场景是，资源在堆空间中存储但只在局部被使用。

```cpp
void f(){
  std::auto_ptr<Investment> pInv(createInvestment());
}
```

> 关于C++中堆空间、栈空间的使用方式，可以参考：[进程的地址空间：TEXT，DATA，BSS，HEAP，STACK][mem]

在`f()`调用结束时`pInv`退出作用域，析构函数被调用，最终使得资源被释放。
事实上，让`createInvestment`直接返回智能指针是更好的设计。
可以看到，使用对象来管理资源的关键在于：**创建资源后立即放入资源管理对象中，并利用资源管理对象的析构函数来确保资源被释放**。

> 资源管理对象的实现框架正是RAII原则：acquisition is initialization，用一个资源来初始化一个智能指针。指针的析构函数中释放资源。

<!--more-->

值得注意的是，为了防止对象被多次释放，`auto_ptr`应当是不可复制的。
**复制一个`auto_ptr`会使它变成空**，资源被交付给另一个只能指针。

```cpp
std::auto_ptr<int> p1 (new int);
*p1.get()=10;

std::auto_ptr<int> p2 (p1);

std::cout << "p2 points to " << *p2 << '\n';
// p2 points to 10
// (p1 is now null-pointer auto_ptr)                           
```

> `.get`方法返回资源的指针。

`auto_ptr`古怪的复制行为导致它并不是管理资源的最佳方式，甚至在STL中`auto_ptr`的容器也是不允许的：
可以创建这样的容器，但往里面添加元素（例如`push_back`）时会导致编译错。

```cpp
auto_ptr<int> p1(new int);

vector<auto_ptr<int>> v;    // OK，可以编译
v.push_back(p1);            // 编译错！
```

此处我们引入一个**引用计数**（reference-counting smart pointer，RCSP）的指针`shared_ptr`。
它在没有任何其他指针引用到该资源时，进行资源的释放。不同于垃圾回收器，`shared_ptr`未能解决环状引用的问题。

值得注意的是`auto_ptr`和`shared_ptr`只能管理单个资源，因为它们是使用`delete`而非`delete[]`来实现资源释放的。常见的错误便是传递数组进去：

```cpp
std::tr1::shared_ptr<int> spi(new int[1024]);
```

> 在最新的C++标准中，智能指针已经归入`std`命名空间了。我们可以这样使用：`std::shared_ptr<int>`。

虽然智能指针有这样的问题，但C++并未提供管理数组的智能指针，因为`vector`等容器就可以很好地完成这个工作。
如果你真的需要，可以求助与Boost社区的`boost::scoped_array`和`boost::shared_array`。

[mem]: /2015/07/22/memory-segment.html
