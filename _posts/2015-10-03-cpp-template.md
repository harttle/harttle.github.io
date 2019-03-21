---
title: C++模板的偏特化与全特化
tags: C++ 模板 特化 编译
excerpt: 模板机制为C++提供了泛型编程的方式，在减少代码冗余的同时仍然可以提供类型安全。特化必须在同一命名空间下进行，可以特化类模板也可以特化函数模板，但类模板可以偏特化和全特化，而函数模板只能全特化。模板实例化时会优先匹配"模板参数"最相符的那个特化版本。
---

模板机制为C++提供了泛型编程的方式，在减少代码冗余的同时仍然可以提供类型安全。
特化必须在同一命名空间下进行，可以特化类模板也可以特化函数模板，但类模板可以偏特化和全特化，而函数模板只能全特化。
模板实例化时会优先匹配"模板参数"最相符的那个特化版本。

> C++的模板机制被证明是图灵完备的，即可以通过[模板元编程（template meta programming）][meta]的方式在编译期做任何计算。

<!--more-->

## 模板的声明

类模板和函数模板的声明方式是一样的，在类定义/模板定义之前声明模板参数列表。例如：

```cpp
// 类模板
template <class T1, class T2>
class A{
    T1 data1;
    T2 data2;
};

// 函数模板
template <class T>
T max(const T lhs, const T rhs){   
    return lhs > rhs ? lhs : rhs;
}
```

## 全特化

通过[全特化][full]一个模板，可以对一个特定参数集合自定义当前模板，类模板和函数模板都可以全特化。
全特化的模板参数列表应当是空的，并且应当给出"模板实参"列表：

```cpp
// 全特化类模板
template <>
class A<int, double>{
    int data1;
    double data2;
};

// 函数模板
template <>
int max(const int lhs, const int rhs){   
    return lhs > rhs ? lhs : rhs;
}
```

注意类模板的全特化时在类名后给出了"模板实参"，但函数模板的函数名后没有给出"模板实参"。
这是因为编译器根据`int max(const int, const int)`的函数签名可以推导出来它是`T max(const T, const T)`的特化。

## 特化的歧义

上述函数模板不需指定"模板实参"是因为编译器可以通过函数签名来推导，但有时这一过程是有歧义的：

```cpp
template <class T>
void f(){ T d; }

template <>
void f(){ int d; }
```

此时编译器不知道`f()`是从`f<T>()`特化来的，编译时会有错误：

```
error: no function template matches function template specialization 'f'
```

这时我们便需要显式指定"模板实参"：

```cpp
template <class T>
void f(){ T d; }

template <>
void f<int>(){ int d; }
```

## 偏特化

类似于全特化，偏特化也是为了给自定义一个参数集合的模板，但偏特化后的模板需要进一步的实例化才能形成确定的签名。
值得注意的是函数模板不允许偏特化，这一点在[Effective C++: Item 25][item25]中有更详细的讨论。
偏特化也是以`template`来声明的，需要给出剩余的"模板形参"和必要的"模板实参"。例如：

```cpp
template <class T2>
class A<int, T2>{
    ...
};
```

函数模板是不允许偏特化的，下面的声明会编译错：

```cpp
template <class T1, class T2>
void f(){}

template <class T2>
void f<int, T2>(){}
```

但函数允许重载，声明另一个函数模板即可替代偏特化的需要：

```cpp
template <class T2>
void f(){}              // 注意：这里没有"模板实参"
```

多数情况下函数模板重载就可以完成函数偏特化的需要，一个例外便是`std`命名空间。
`std`是一个特殊的命名空间，用户可以特化其中的模板，但不允许添加模板（其实任何内容都是禁止添加的）。
因此在`std`中添加重载函数是不允许的，在[Effective C++: Item 25][item25]中给出了一个更详细的案例。

[meta]: /2015/09/16/effective-cpp-48.html
[partial]: http://en.cppreference.com/w/cpp/language/partial_specialization
[full]: http://en.cppreference.com/w/cpp/language/template_specialization
[item25]: /2015/08/23/effective-cpp-25.html
