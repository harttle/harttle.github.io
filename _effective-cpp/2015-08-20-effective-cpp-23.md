---
layout: blog
title: Item 23：非成员非友元函数好于成员函数

tags: C++ 多态 封装 虚函数 成员函数
excerpt: 相比于成员函数，非成员函数提供了更好的封装，包的灵活性（更少的编译依赖），以及功能扩展性。
---

> Item 23: Prefer non-member non-friend functions to member functions

在类的是实现中，常常会面临成员函数和非成员函数的选择。比如一个浏览器类：

```cpp
class WebBrowser{
public:
  void clearCache();
  void clearCookies();
  void clearHistory();
};
```

此时你要实现一个`clearEverything()`有两种方式：

```cpp
class WebBrowser{
public:
  void clearEverything(){
    clearCache();
    clearCookies();
    clearHistory();
  }
}
// 或者使用非成员函数：
void clearEverything(WebBrowser& wb){
  wb.clearCache();
  wb.clearCookies();
  wb.clearHistory();
}
```

哪种更好呢？面向对象原则指出，数据和数据上的操作应当绑定在一起，那么前者更好。
这是对面向对象的误解，**面向对象设计的精髓在于封装**，数据应当被尽可能地封装。
**相比于成员函数，非成员函数提供了更好的封装，包的灵活性（更少的编译依赖），以及功能扩展性**。

<!--more-->

# 封装性

封装就是对外界隐藏的意思。如果数据被越好地封装，那么越少的东西可以看到它，我们便有更大的灵活性去改变它。这是封装带来的最大的好处：给我们改变一个东西的灵活性，这样的改变只会影响到有限的客户。

作为粗粒度的估计，数据的封装性反比于可访问该数据的函数数量。这些函数包括成员函数、友元函数和友元类中的函数。
因此**非成员非友元函数会比成员函数提供更好的封装**，
我们应该选择`clearEverything()`的第二种实现。

> Item22提到，如果一个数据成员不是私有的，那么将会有无限数量的函数可访问它。

这里有两点值得注意：

1. 友元函数和成员函数是一样的，因为友元函数也可以访问私有数据成员，它和成员函数对封装具有相同的影响。
2. *非成员函数*并不意味着它不可以是其他类的成员函数。尤其是在像Java，C#之类的语言中，函数必须定义在类中。
3. 静态成员函数也是不错的选择。因为静态函数不能访问对象成员，因此不会影响对象的封装。

# 扩展性

在C++中，可以把这些非成员函数定义在相同的命名空间下。
但问题又来了：这些在命名空间下的函数并不在类中，它们会被传播到所有的源文件中。
而客户并不希望为了使用几个工具函数，就对这样一个庞大的命名空间产生编译依赖。
因此我们可以将不同类别的工具函数放在不同的头文件中，客户可以选择它想要的那部分功能：

```cpp
// file: webbrowser.h
namespace WebBrowserStuff{
  class WebBrowser{};
}

// file: webbrowser-bookmarks.h
namespace WebBrowserStuff{
  ...
}

// file: webbrowser-cookies.h
namespace WebBrowserStuff{
  ...
}
```

这也是C++标准库的组织方式，`std`命名空间下的所有东西都被分在了不同的头文件中：`<vector>`, `<algorithem>`, `<memory>`等。这样客户代码只对它引入的那部分功能产生编译依赖。
为了做到这一点，这些工具函数必须是非成员函数，因为类作为整体必须在一个文件中进行定义。

同一命名空间不同头文件的组织方式，也为客户扩展工具函数提供了可能。
客户可以在同一命名空间下定义他自己的工具函数，
这些函数便会和既有工具函数天然地集成在一起。
这也是成员函数无法做到的一个特性，因为**类的定义对客户扩展是关闭的**。
即使是子类也不能访问封装的（私有）成员数据，
况且有些类不是用来做基类的（见[Item 7：将多态基类的析构函数声明为虚函数][7]）。

[7]: /2015/07/24/effective-cpp-7.html
