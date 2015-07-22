---
layout: blog
categories: reading
title: Effective C++笔记：那些被C++默默地声明和调用的函数
tags: c++ 
---

> Item 5:  Know what functions C++ silently writes and calls
> 
> Item 6: Explicitly disallow the use of compiler-generated functions you do not want.

在C++中，编译器会自动生成一些你没有显式定义的函数，它们包括：构造函数、析构函数、复制构造函数、`=`运算符。
有时为了符合既有设计，我们不希望自动生成这些函数，我们可以把它们显式声明为`private`。
此时在使用这些类的客户看来，它们就像不存在一样。

```cpp
class Empty{
public:
    // 默认构造函数
    Empty(){}   
    // 拷贝构造函数
    Empty(const Empty& rhs){}   
    // 析构函数
    ~Empty(){}
    // 赋值运算符
    Empty& operator=(const Empty& rhs){}
};
```

# 调用时机

当我们没有显式地定义上述这四种函数时，编译器会自动帮我们定义。这些函数它们调用的时机如下：

1. 构造函数：对象定义；使用其他兼容的类型初始化对象时（可使用 `explicit` 来避免这种情况）
2. 复制构造函数：用一个对象来初始化另一对象时；传入对象参数时；返回对象时；
3. 析构函数：作用域结束（包括函数返回）时；`delete`
4. `=`运算符：一个对象赋值给另一对象

为了更清晰地说明它们的调用时机，来个例子吧：

```cpp
Empty e1;               // 默认构造函数
Empty e2(e1);           // 拷贝构造函数
Empty e3 = e1;          // 拷贝构造函数
e2 = e1;                // = 运算符

void func(Empty e){     // 拷贝构造函数，拷贝一份参数对象
    return e;           // 拷贝构造函数，拷贝一份返回对象
                        // 析构函数，拷贝得到的参数对象被析构
}

e2 = func(e1);          // = 运算符
                        // 析构函数，返回值被析构
```

# 引用成员

当对象包含引用成员时，拷贝和赋值行为将会变得非常有趣，考虑这样一个类：

```cpp
class Person{
public:
    string & name;
    Person(string& str): name(str){ }
};
string s1 = "alice", s2 = "bob";
Person p1(s1), p2(s2);

s1 = s2;
```

赋值后，`p1.name`会指向`p2.name`吗？我们知道在C++中引用本身是不可修改的。
即使`p1.name`指向了`p2.name`，那么对`p1.name`的赋值将会影响到`p2`？
于是，C++拒绝编译上述代码，此时我们需要手动定义一个赋值运算符。

# 禁用函数

我们通过把自动生成的函数设为`private`来禁用它，
[Effective C++笔记：确保变量的初始化](/2015/07/22/effective-cpp-4)
提到的单例是一个例子。这里我们来实现一个不可拷贝的类`Uncopyable`，
需要声明其复制构造函数与`=`运算符为`private`：

```cpp
class HomeForSale{
private:
	HomeForSale(const HomeForSale&);
	HomeForSale& operator=(const HomeForSale&);
};
```
