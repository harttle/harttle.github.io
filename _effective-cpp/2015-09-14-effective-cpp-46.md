---
layout: blog
title: Item 46：需要类型转换时，应当在类模板中定义非成员函数

tags: C++ 类型转换 运算符重载 inline 模板 成员函数 
excerpt: 如果所有参数都需要隐式类型转换，该函数应当声明为非成员函数。本文把这个观点推广到类模板和函数模板。但是在类模板中，需要所有参数隐式转换的函数应当声明为友元并定义在类模板中。
---

> Item 46: Define non-member functions inside templates when type conversions are desired.

[Item 24][item24]中提到，如果所有参数都需要隐式类型转换，该函数应当声明为非成员函数。
[Item 24][item24]是以`Rational`和`operator*`为例子展开的，本文把这个观点推广到类模板和函数模板。
但是在类模板中，需要所有参数隐式转换的函数应当声明为友元并定义在类模板中。

<!--more-->

# 模板化的Rational

既然是[Item 24][item24]的推广，那么我们先把Item24中的`Rational`和`operator*`模板化。得到如下代码：

```cpp
template<typename T>
class Rational {
public:
  Rational(const T& numerator = 0, const T& denominator = 1);
  const T numerator() const;           
  const T denominator() const;        
};

template<typename T>
const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs){}
```

> [Item 20][item20]解释了为什么`Rational`的参数是常量引用；[Item 28][item28]解释了为什么`numerator()`返回的是值而不是引用；[Item 3][item3]解释了为什么`numerator()`返回的是`const`。

# 模板参数推导出错

上述代码是Item24直接模板化的结果，看起来很完美但它是有问题的。比如我们有如下的调用：

```cpp
Rational<int> oneHalf(1, 2);            // OK
Rational<int> result = oneHalf * 2;     // Error!
```

为什么第二条会出错呢？因为编译器无法推导出合适的模板参数来实例化`Rational<T>`。
模板参数的推导包括两部分：

* 根据`onHalf`，它的类型是`Rational<int>`，很容易知道接受`oneHalf`的`operator*<T>`中模板参数`T`应该是`int`；
* 根据`2`的模板参数推导却不那么顺利，编译器不知道如何将实例化`operator*<T>`才能使得它接受一个`int`类型的`2`。

可能你会希望编译器将`2`的类型推导为`Rational<int>`，再进行隐式转换。但在编译器中模板推导和函数调用是两个过程：
隐式类型转换发生在函数调用时，而在函数调用之前编译器需要实例化一个函数。而在模板实例化的过程中，编译器无从推导`T`的类型。

# 声明为友元函数

为了让编译器知道`T`是什么，我们可以在类模板中通过`friend`声明来引用一个外部函数。

```cpp
template<typename T>
class Rational {
public:
    friend const Rational operator*(const Rational& lhs, const Rational& rhs);
};

template<typename T>
const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs){}
```

> 在`Rational<T>`中声明的`friend`没有添加模板参数`T`，这是一个简便写法，它完全等价于：
> `friend const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs);`。

因为类模板实例化后，`T`总是已知的，因而那个`friend`函数的签名会被`Rational`模板类声明。
这样，`result = oneHalf * 2`便可以编译通过了，但链接会出错。
虽然在类中声明了`friend operator*`，然而编译器却不会实例化该声明对应的函数。
因为函数是我们自己声明的，那么编译器认为我们有义务自己去定义那个函数。

# 在类中给出定义

那我们就在声明`operator*`时直接给出定义：

```cpp
template<typename T>
class Rational {
public:
    friend const Rational operator*(const Rational& lhs, const Rational& rhs){
        return Rational(lhs.numerator() * rhs.numerator(), lhs.denominator() * rhs.denominator());
    }
};
```

这样混合模式的调用`result = oneHalf * 2`终于可以编译、链接并且运行了。到这里想必问题已经很清楚了：

1. 为了对所有参数支持隐式类型转换，`operator*`需要声明为非成员函数；
2. 为了让编译器推导出模板参数，`operator*`需要在类中声明；
3. 在类中声明非成员函数的唯一办法便是声明为`friend`；
4. 声明的函数的同时我们有义务给出函数定义，所以在函数定义也应当放在`friend`声明中。

# 调用辅助函数

虽然`operator*`可以成功运行了，但定义在类定义中的函数是inline函数，见[Item 30][item30]。
如果`operator*`函数体变得很大，那么inline函数就不再合适了，这时我们可以让`operator*`调用外部的一个辅助函数：

```cpp
template<typename T> class Rational;
template<typename T>
const Rational<T> doMultiply(const Rational<T>& lhs, const Rational<T>& rhs);

template<typename T>
class Rational{
public:
    friend Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs){
        return doMultiply(lhs, rhs);
    }
};
```

`doMultiply`仍然是不支持混合模式调用的，然而`doMultiply`只会被`operator*`调用。
`operator*`将会完成混合模式的兼容，然后用统一的`Rational<T>`类型参数来调用`doMultiply`。

[item3]: /2015/07/21/effective-cpp-3.html
[item20]: /2015/08/13/effective-cpp-20.html
[item24]: /2015/08/22/effective-cpp-24.html
[item28]: /2015/08/26/effective-cpp-28.html
[item30]: /2015/08/28/effective-cpp-30.html
