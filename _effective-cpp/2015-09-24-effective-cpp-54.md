---
title: Item 54：熟悉一下标准库，比如TR1

tags: C++ STL Boost traits 智能指针 正则表达式
excerpt: 标准C++库是由STL, iostream, 本地化，C99组成的。TR1添加了智能指针、通用函数指针、哈希容器、正则表达式以及其他10个组件。 TR1在是一个标准(standard)，为了使用TR1你需要一个TR1的实现(implementation)，Boost就是一个很好的TR1实现。
---

> Item 54: Familiarize yourself with the standard library, including TR1.

C++这个名字是在1983年由Rick Mascitti提出的，C++的曾用名还有"new C", "C with Classes"。
1998年ISO/IEC 14882发布了第一个C++标准，就是我们常讲的C++98。后续的标准还包括C++03，C++TR1，C++11，C++14。
值得一提的是C++11标准，它已经被主流编译器支持。包含了核心语言的新机能，而且扩展C++标准程序库，并入了大部分的C++ TR1程序库。
Effective C++ Edition 3中大部分`std::tr1`都可以在`std`下直接访问了。

<!--more-->

我们来回顾一下C++98中的内容：

* STL（standard template library），包括容器迭代器和算法。
* IOstream，支持标准IO，用户定义IO，以及预定义对象：`cin`, `cout`, `cerr`, `clog`。
* 国际化支持。如`wchar_t`为16位Unicode字符。
* 数字处理。加入了`complex`, `valarray`等。
* 异常成绩。包括基类`exception`, 子类`logic_error`, `runtime_error`等。
* C89的标准库。1989年的C标准库都并入了C++98。

Effective C++ Edition 3中提到了很多TR1(technical report 1)的概念：

* 智能指针：`TR1::shared_ptr`, `TR1::weak_ptr`, `TR1::auto_ptr`等，见[Item 13][item13]。
* `TR1::function`：可以代表一个可调用的实体，可以是函数、函数对象等，见[Item 35][item35]。
* `TR1::bind`：将某个函数绑定到某个对象上（即替换`this`），见[Item35][item35]。
* 哈希表：`TR1::unordered_set`, `TR1::unordered_multiset`, `TR1::unordered_map`, `TR1::unordered_multimap`。
* 正则表达式
* 元组：在STL中本已有一个`pair`模板来包含两个元素，在TR1中提出了不限元素数量的`TR1::tuple`。
* `TR1::array`：STL风格的数组。
* `TR1::mem_fn`：提供了统一的方式来适配成员函数指针。
* `TR1::reference_wrapper`：使得引用更像一个对象，原本在容器中只能存储指针和对象的。
* 随机数：C++的`rand`来自于C89标准中，TR1给出了更好的随机数算法。
* 特殊数学函数：拉格朗日多项式、贝塞尔函数、椭圆积分等。
* C99兼容的扩展：引入了很多C99的特性。
* 类型特征（traits）：一个类模板，用来在编译期标识类型信息，见[Item 47][item47]。
* `TR1::result_of`：一个模板，用来推导函数调用的返回类型。

Boost是一个值得我们去探索的社区，TR1中14个部分有10个是从Boost社区来的。Boost提供给的是一个模板库，只需要指定INCLUDE PATH即可，
安装Boost甚至不需要build。因为TR1里的特性在Boost基本都有，你可以告诉你的编译器把`tr1`当做`boost`：

```cpp
namespace std{
    namespace tr1 = ::boost;
}
```

> [Item 25][item25]中提到，如果你在`std`下私自添加东西会导致未定义行为。但上述的代码在实践中通常没什么问题。

总之，标准C++库是由STL, iostream, 本地化，C99组成的。TR1添加了智能指针、通用函数指针、哈希容器、正则表达式以及其他10个组件。
TR1在是一个标准(standard)，为了使用TR1你需要一个TR1的实现(implementation)，Boost就是一个很好的TR1实现。

[item13]: /2015/08/02/effective-cpp-13.html
[item25]: /2015/08/23/effective-cpp-25.html
[item35]: /2015/09/02/effective-cpp-35.html
[item47]: /2015/09/15/effective-cpp-47.html
