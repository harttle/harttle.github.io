---
layout: blog
title: Item 2：避免使用define

tags: C++ 宏 封装 常量 编译 模块化
excerpt: 尽量使用常量、枚举和内联函数，代替`#define`。
---

> Item 2: Prefer consts, enums, and inlines to #defines

尽量使用常量、枚举和内联函数，代替`#define`。我们知道`#define`定义的宏会在编译时进行替换，属于模块化程序设计的概念。
宏是全局的，面向对象程序设计中破坏了封装。因此在C++中尽量避免它！

接着我们具体来看`#define`造成的问题。

# 不易理解

众所周知，由于预处理器会直接替换的原因，宏定义最好用括号括起来。`#define`函数将会产生出乎意料的结果：

```cpp
#define MAX(a,b) a>b?a:b
MAX(i++,j)
```

`i`自加次数将取决于`j`的大小，然而调用者并不知情。宏的行为不易理解，本质上是因为宏并非C++语言的一部分，它只是源代码的预处理手段。

<!--more-->

# 不利于调试

宏替换发生在编译时，语法检查之前。因此相关的编译错误中不会出现宏名称，我们不知道是哪个宏出了问题。例如：

```cpp
#define PERSON alice
PERSON = bob;
```

如果`alice`未定义，`PERSON=bob;`便会出错：`use of undeclared identifier 'alice'`。
然而我们可能不知道`alice`是什么东西，`PERSON`才是我们定义的“变量”。

宏替换是在预处理过程中进行的，原则上讲编译器不知道宏的概念。然而，在现代的编译器中（例如`Apple LLVM version 6.0`），
编译器会记录宏替换信息，在编译错误中给出宏的名称：

```
test.cpp:8:5: error: use of undeclared identifier 'alice'
    PERSON  = bob;
    ^
test.cpp:4:16: note: expanded from macro 'PERSON'
#define PERSON alice;
               ^
```

于是，Meyers提到的这个问题已经不存在了。然而作者的本意在于：尽量使用编译器，而不是预处理器。
因为`#define`并不是C++语言的一部分。

# enum 比 const 更好用

既然`#define`不能封装在一个类中，我们可以用`static const`来定义一个常量，并把它的作用于局限在当前类：

```cpp
class C{
    static const int NUM = 3;
    int a[NUM];
};
```

通常C++要求所有的声明都给出定义，然而数值类型（`char`, `int`, `long`）的静态常量可以只给声明。这里的`NUM`就是一个例子。
然而，如果你想取`NUM`的地址，则会得到编译错误：

```
Undefined symbols for architecture x86_64:
  "C::NUM", referenced from:
      _main in a-88bbac.o
ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

因此如果你要取地址，那么就给出它的定义：

```cpp
class C{
    static const int NUM = 3;
    int a[NUM];
};
const int C::NUM;
```

> 因为声明`NUM`时已经给定了初始值，定义时不允许再次给初始值。

如果使用`enum`，事情会简单很多：

```cpp
class C{
    enum { NUM = 3 };
    int a[NUM];
};
```

