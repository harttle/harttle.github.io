---
layout: blog
categories: reading
title: Item 24：用非成员函数来支持所有元的类型转换

tags: C++ 运算符 类型转换 运算符重载
excerpt: 如果运算符的所有“元”都需要隐式转换时，请重载该运算符为友函数。
---

> Item 24: Declare non-member functions when type conversions should apply to all parameters.

虽然[Item 15：资源管理类需要提供对原始资源的访问][item15]中提到，最好不要提供隐式的类型转化。
但这条规则也存在特例，比如当我们需要创建数字类型的类时。正如`double`和`int`能够自由地隐式转换一样，
我们的数字类型也希望能够做到这样方便的接口。
当然这一节讨论的问题不是是否应当提供隐式转换，而是**如果运算符的所有“元”都需要隐式转换时，请重载该运算符为友元函数**。

通过运算符重载来扩展用户定义类型时，运算符函数可以重载为成员函数，也可以作为友元函数。
但如果作为了成员函数，`*this`将被作为多元操作符的第一元，这意味着第一元不是重载函数的参数，它不会执行类型转换。
仍然拿有理数类作为例子，下面的`Rational`类中，将运算符`*`重载为成员函数：

```cpp
class Rational{
public: 
    Rational(int n = 0, int d = 1);
    int numerator() const;
    int denominator() const;
    const Rational operator*(const Rational& rhs) const;
...
```

<!--more-->

我们看下面的运算符调用能否成功：

```cpp
Rational oneHalf(1, 2);

Rational result = oneHalf * oneHalf;   // OK
result = oneHalf * 2;                  // OK
result = 2 * oneHalf;                  // Error
```

第一个运算符的调用的成功是很显然的。我们看第二个调用：

当编译器遇到运算符`*`时，它会首先尝试调用：

```cpp
result = oneHalf.operator*(2);
```

编译器发现该函数声明（它就是定义在`Rational`类中的方法）存在，
于是对参数`2`进行了隐式类型转换（`long`->`Rational`）。所以第二个调用相当于：

```cpp
Rational tmp(2);
result = oneHalf.operator*(tmp);
```

> 将`Rational`的构造函数声明为`explicit`可以避免上述隐式转换，这样第二个调用也会失败。

对于第三个调用，编译器仍然首先尝试调用：

```cpp
result = 2.operator*(oneHalf);
```

`2`属于基本数据类型，并没有成员函数`operator*`。于是编译器再尝试调用非成员函数的运算符：

```cpp
result = operator*(2, oneHalf);
```

再次失败，因为并不存在与`operator*(long, Rational)`类型兼容的函数声明，所以产生编译错误。
但如果我们提供这样一个非成员函数：

```cpp
const Rational operator*(const Rational& lhs, const Rational& rhs);
```

这时候第一个参数也可以进行隐式转换。第三个调用（`result = 2 * oneHalf`）便会成功，该表达式相当于：

```cpp
Rational tmp(2);
result = operator*(tmp, oneHalf);
```

只有当运算符的元出现在运算符函数的参数列表时，它才会被隐式类型转换。所以当我们需要运算符的所有“元”都可以被隐式转换时，
应当将运算符声明为非成员函数。
在JavaScript或者C#中，这个规则是不需要的，因为编译器/解释器在这里做了更多的工作。比如JavaScript中`2.toFixed(3)`
会被解释为Number(2).toFixed(3)`，该表达式的值为`"2.000"`。

[item15]: /2015/08/05/effective-cpp-15.html
