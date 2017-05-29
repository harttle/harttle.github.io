---
layout: blog
title: Item 15：资源管理类需要提供对原始资源的访问

tags: C++ 封装 引用 指针 运算符 智能指针 类型转换 运算符重载
excerpt: 资源管理对象需要提供对原始资源访问。获取资源的方式有两类：隐式地获取和显式地获取。通常来讲，显式的资源获取会更好，它最小化了无意中进行类型转换的机会**
---

> Item 15: Provide access to raw resources in resource-managing classes.

在一个完美的设计中，所有的资源访问都应通过资源管理对象来进行，资源泄漏被完美地克服。然而世界是不完美的，
很多API会直接操作资源，尤其是一些C语言的API。总之，你会时不时地发现有需要直接访问资源，
所以**资源管理对象需要提供对原始资源访问。获取资源的方式有两类：隐式地获取和显式地获取。
通常来讲，显式的资源获取会更好，它最小化了无意中进行类型转换的机会**。

# 显式地获取资源

`shared_ptr`提供了`get`方法来得到资源。

```cpp
shared_ptr<Investment> pInv;
void daysHeld(Investment *pi);

int days = daysHeld(pInv.get());
```

为了让`pInv`表现地更像一个指针，`shared_ptr`还重载了解引用运算符（dereferencing operator）`operator->`和`operator*`：

```cpp
class Investment{
public: 
    bool isTaxFree() const;
};
shared_ptr<Investment> pi1(createInvestment());

bool taxable1 = !(pi1->isTaxFree());
bool texable2 = !((*pi1).isTaxFree());
```

# 隐式地获取资源

提供`get`方法、`operator->`、`operator*`已经让资源访问很方便了。然而不幸的是，程序员是懒惰的，我们还是希望能够更加简便。
隐式转换操作符便可以完成这个工作，比如操作系统提供了`FontHandle`来操作字体：

```cpp
FontHandle getFont();
void releaseFont(FontHandle fh);
void changeFontSize(FontHandle f, int newSize);
```

我们封装了`Font`来管理资源：

```cpp
class Font{
FontHandle f;
public:
    explicit Font(FontHandle fh): f(fh){}
    ~Font(){ releaseFont(f); };
    FontHandle get() const { return f; }
};
```

通过`get`方法来访问`FontHandle`：

```cpp
Font f(getFont());
int newFontSize;
changeFontSize(f.get(), newFontSize);
```

如果提供一个隐式类型转换运算符将`Font`转换为`FontHandle`，那么接受`FontHandle`类型作为参数的函数将会同样地接受`Font`类型。
一切将会变得简单：

```cpp
class Font{
    operator FontHandle() const{ return f;}
};

changeFontSize(f, newFontSize);
```

然而问题也随之出现：

```cpp
FontHandle h2 = f1;
```

用户无意间拷贝了一份资源！该资源并未被管理起来。这将会引发意外的资源泄漏。所以隐式转换在提供便利的同时，
也引起了资源泄漏的风险。在考虑是否提供隐式转换时，需要权衡考虑资源管理类的设计意图，以及它的具体使用场景。
通常来讲，显式的资源获取会更好，它最小化了无意中进行类型转换的机会。

[item13]: /2015/08/02/effective-cpp-13.html
