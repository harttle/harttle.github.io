---
layout: blog
title: Item 41：隐式接口与编译期多态

tags: C++ 多态 虚函数 函数重载 模板 继承 编译 运算符重载
excerpt: 面向对象设计中的类（class）考虑的是显式接口（explicit interface）和运行时多态，而模板编程中的模板（template）考虑的是隐式接口（implicit interface）和编译期多态。
---

> Item 41: Understand implicit interfaces and compile-time polymorphism.

面向对象设计中的类（class）考虑的是**显式接口**（explicit interface）和**运行时多态**，
而模板编程中的模板（template）考虑的是**隐式接口**（implicit interface）和**编译期多态**。

* 对类而言，显式接口是由函数签名表征的，运行时多态由虚函数实现；
* 对模板而言，隐式接口是由表达式的合法性表征的，编译期多态由模板初始化和函数重载的解析实现。

<!--more-->

# 显式接口和运行时多态

一个类的显式接口是由public成员函数签名（包括函数名、参数类型、返回值类型等）、类型定义（typedef）、public数据成员构成的。

```cpp
class Widget{
public:
    Widget();
    virtual ~Widget();
    virtual size_t size() const;
    virtual void normalize();
    void swap(Widget& other);
};
void doProcessing(Widget& w){
    if(w.size() > 10 && w != someOne){
        Widget tmp(w);
        tmp.normalize();
        tmp.swap(w);
    }
}
```

对于`doProcesing`中的`w`，我们可以知道：

* `w`应支持`Widget`的接口，包括：`normalize()`, `swap()`等。这些接口在源码中是可以找到的，称为显式接口。
* `Widget`有些成员函数是`virtual`的，会表现出运行时多态：具体的被调用者会根据`Widget`的动态类型而决定。

# 隐式接口和编译期多态

在模板和类属编程（generic programming）中这一点完全不同，在这里隐式接口和编译期多态更为重要：

```cpp
template<typename T>
void doProcessing(T& w){
    if(w.size() > 10 && w!= someOne){
        T tmp(w);
        tmp.normalize();
        tmp.swap(w);
    }
}
```

现在的`doProcessing`是一个函数模板，其中的`w`有所不同：

* `w`应支持的接口取决于模板中`w`上的操作。比如：`w`（类型`T`）必须支持`size`, `normalize`, `swap`方法；拷贝构造函数；不等运算符。
总之，这些表达式必须合法而且通过编译构成了`w`应支持的接口。
* 其中的`operator>`和`operator!=`要调用成功可能需要实例化一些模板，而使用不同的模板参数实例化模板的过程就是**编译期多态**。

具体来讲，`T`的隐式接口应满足：

* 必须包含一个返回值为整型的成员函数；
* 支持一个接受`T`类型的`operator!=`函数。

但由于C++的运算符重载和隐式类型转换特性，上述两个条件都不需要满足。
首先`size`可能是继承来的函数而非`T`的成员函数，但它不需要返回一个`int`，甚至不需要返回一个数字类型，返回类型也不需要定义`operator>`。
它需要返回的类型`X`只需满足：`operator>`可以接受`X`和`int`。但`operator>`的第一个参数类型可以不是`X`，只要`X`能隐式转换为它的第一个参数类型即可。
类似地，`operator!=`接口也有极大的灵活性。

当你想到这些约束时可能真的会头大，但实践中比这些直观的多，接口只是由合法的表达式构成的。
例如下面的表达式看起来就很直观：

```cpp
if (w.size() > 10 && w != someOne) ...
```

总之隐式接口和显式接口一样地真实存在，在编译时都会进行检查。正如你错误地使用显式接口会导致编译错一样，
对象不支持模板所要求的隐式接口也会导致编译错。

