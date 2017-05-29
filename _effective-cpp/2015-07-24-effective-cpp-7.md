---
layout: blog
title: Item 7：将多态基类的析构函数声明为虚函数

tags: C++ 内存 多态 指针 编译 虚函数 字节对齐 析构函数
excerpt: 析构函数声明为虚函数恐怕是面试中最常见的问题之一。目的在于以基类指针调用析构函数时能够正确地析构子类部分的内存。
---

# 虚析构函数

> Item 7: Declare destructors virtual in polymorphic base classes

析构函数声明为虚函数恐怕是面试中最常见的问题之一。目的在于以基类指针调用析构函数时能够正确地析构子类部分的内存。
否则子类部分的内存将会泄漏，正确的用法如下：

```cpp
// 基类
class TimeKeeper{
public:
    virtual ~TimeKeeper();
    ...
};
TimeKeeper *ptk = getTimeKeeper():  // 可能返回任何一种子类
...
delete ptk;
```

值得一提的是虚函数表指针的内存占用问题，我们知道所有存在虚方法的对象中都会存有一个虚函数表指针`vptr`，
用来在运行时定位虚函数。同时，每个存在虚方法的类也会对应一个虚函数列表的指针`vtbl`。
函数调用时会在`vtbl`指向的虚函数表中寻找`vptr`指向的那个函数。

为了准确地描述`vptr`的大小，先来了解一下对象的`sizeof`计算方式，以及字节对齐问题：

> 编译器：gcc version 5.1.0，目标平台：x86_64-apple-darwin14.3.0

<!--more-->

# 空对象大小为1

没有任何成员的对象也需要有地址，否则怎么定位它呢？所以编译器会给它一字节的大小：

```cpp
class C0{};     
sizeof(C0);     // 1

class C1{
    char i;     
};
sizeof(C1);     // 1
```

只有一个`char`成员的对象大小也是1

# 字节对齐

说道对象大小，来总结一下字节对齐的问题吧，也是笔试面试的常见题型。字节对齐有三个准则：

1. 结构体变量的首地址能够被其最宽基本类型成员的大小所整除；
2. 结构体每个成员相对于结构体首地址的偏移量都是成员大小的整数倍，如有需要编译器会在成员之间加上填充字节；
3. 结构体的总大小为结构体最宽基本类型成员大小的整数倍，如有需要编译器会在最末一个成员之后加上填充字节。

例如：

```cpp
class C2{
    char i, j;     
};
sizeof(C2);     // 2

class C3{
    char i, j;
    int k;
};
sizeof(C3);     // 8
```

因为`int`大小是4，两个`char`大小是2，故总的大小以4为基对齐，大小为4*2 = 8。
另外可以通过编译指令`#pragma pack(N)`指定N字节对齐，此时每个数据项将会按照`min(N, sizeof(TYPE))`进行对齐。
例如：

```cpp
#pragma pack (2) /*指定按2字节对齐*/
struct C
{
  char b;
  int a;
  short c;
};
#pragma pack ()   /*取消指定对齐，恢复缺省对齐*/
```

上述例子来自： http://www.linuxsong.org/2010/09/c-byte-alignment/

# 虚函数表指针

```cpp
class C4{
    char i;
    virtual void func();
};
sizeof(C4);     // 16
```

因为我的Target是64位平台，故`vptr`的大小为8，`char`大小为1，故总的大小以8为基对齐，大小为8*2 = 16。
虚函数指针不仅使得对象更加占用内存空间，同时会造成可移植性问题。
问题很明显：一个包含`vptr`的C++对象传递给Fortran时，由于Fortran中没有`vptr`的概念，
因此需要重新计算对象大小，然而`vptr`的大小是平台相关的。。。

# 封闭类

包含对象成员的类称为封闭类，封闭类以对象成员中最大的基本数据类型的长度进行字节对齐。例如：

```cpp
class C5{
    C4 c4;
    char i;
};
sizeof(C5);     // 24
```

C4和C5中最大的基本数据类型是`void*`（`vptr`的类型），其大小为8，故以8为基对齐的结果是8*3 = 24。
