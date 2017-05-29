---
layout: blog
title: Item 48：了解模板元编程

tags: C++ 模板 traits 编译 矩阵连乘 类型检查
excerpt: 模板元编程（Template Metaprogramming，TMP）就是利用模板来编写那些在编译时运行的C++程序。模板元程序（Template Metaprogram）是由C++写成的，运行在编译器中的程序。当程序运行结束后，它的输出仍然会正常地编译。
---

> Item 48: Be aware of template metaprogramming.

**模板元编程**（Template Metaprogramming，TMP）就是利用模板来编写那些在编译时运行的C++程序。
**模板元程序**（Template Metaprogram）是由C++写成的，运行在编译器中的程序。当程序运行结束后，它的输出仍然会正常地编译。

C++并不是为模板元编程设计的，但自90年代以来，模板元编程的用处逐渐地被世人所发现。

* 模板编程提供的很多便利在面向对象编程中很难实现；
* 程序的工作时间从运行期转移到编译期，可以更早发现错误，运行时更加高效。
* 在设计模式上，可以基于不同的策略，自动组合而生成具体的设计模式实现。

<!--more-->

# 静态类型检查

在[Item 47][item47]中提到了这样一个`std::advance`的实现：

```cpp
template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d) {
  if (typeid(typename std::iterator_traits<IterT>::iterator_category) ==
    typeid(std::random_access_iterator_tag)){
      iter += d;
  }
  ...
}

list<int>::iterator it;
advance(it, 10);
```

其实上述代码是不能编译的，设想以下`advance<list<int>::iterator, int>`中的这条语句：

```cpp
iter += d;
```

`list<int>::iterator`是双向迭代器，不支持`+=`运算。虽然上述语句不会执行，但编译器不知道这一点。
编译时这条语句仍然会抛出类型错误。

# 模板元编程

TMP后来被证明是图灵完全的，这意味着TMP可以用来计算任何可计算的问题。你可以声明变量、执行循环、编写和调用函数等等。
但它的使用风格和普通C++完全不同。

我们来看看TMP中如何执行一个循环：

```cpp
template<unsigned n>
struct Factorial{
    enum{ value = n * Factorial<n-1>::value };
};
template<>
struct Factorial<0>{
    enum{ value = 1 };
};

int main(){
    cout<<Factorial<5>::value;
}
```

这是一个典型的TMP例子，其低位就像是普通编程语言中的"hello world"一样。

# TMP的用途

为了更好地理解TMP的重要性，我们来看看TMP能干什么：

1. 确保量纲正确。在科学计算中，量纲的结合要始终保持正确。比如一定要单位为"m"的变量和单位为"s"的变量相除才能得到一个速度变量（其单位为"m/s"）。
使用TMP时，编译器可以保证这一点。因为不同的量纲在TMP中会被映射为不同的类型。
2. 优化矩阵运算。比如矩阵连乘问题，TMP中有一项*表达式模板*（expression template）的技术，可以在编译期去除临时变量和合并循环。
可以做到更好的运行时效率。
3. 自定义设计模式的实现。设计模式往往有多种实现方式，而一项叫*基于策略设计*（policy-based design）的TMP技术可以帮你创建独立的设计策略（design choices），而这些设计策略可以以任意方式组合。生成无数的设计模式实现方式。

[item47]: /2015/09/15/effective-cpp-47.html
