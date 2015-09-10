---
layout: blog
categories: reading
title: C++中哪些变量会自动初始化？
tags: C++ 构造函数 动态内存 静态变量 全局变量
excerpt: 如果没有显式地初始化，栈中的变量（函数体中的自动变量）和堆中的变量（动态内存）会保有不确定的值；而全局变量和静态变量（包括局部静态变量）会初始化为零。
---

在C语言中的全局变量和静态变量都是会自动初始化为0，堆和栈中的局部变量不会初始化而拥有不可预测的值。
C++保证了所有对象与对象成员都会初始化，但其中基本数据类型的初始化还得依赖于构造函数。
下文来详细探讨C风格的"默认初始化"行为，以及C++中成员变量的初始化规则。

<!--more-->

# 初始化的语法

很多人至今不知道C++中如何正确地初始化一个变量，我们首先来解决语法的问题。
C语言中在声明时用`=`即可完成初始化操作。但我们偏向于使用C++风格（本文中均指面向对象程序设计风格）来初始化内置类型：

```cpp
// C 风格
int i = 3;
int arr[] = {1, 2, 3};

// C++ 风格
int i(3);
int i = int(3);
int *p = new int(3);
int[] arr = new int[]{1, 2, 3};
```

在C语言中`int a;`表示声明了整型`a`但未初始化，而C++中的对象总是会被初始化的，无论是否写了圆括号或者是否写了参数列表，例如：

```cpp
int basic_var;      // 未初始化：应用"默认初始化"机制
CPerson person;     // 初始化：以空的参数列表调用构造函数
```

# 默认初始化规则

定义基本数据类型变量（单个值、数组）的同时可以指定初始值，如果未指定会**默认初始化**(default-initialization)，什么是"默认初始化"呢？

* 栈中的变量（函数体中的自动变量）和堆中的变量（动态内存）会保有不确定的值；
* 全局变量和静态变量（包括局部静态变量）会初始化为零。

> C++11: If no initializer is specified for an object, the object is default-initialized; if no initialization is performed, an
> object with automatic or dynamic storage duration has indeterminate value. 
> Note: Objects with static or thread storage duration are zero-initialized, see 3.6.2.

所以函数体中的变量定义是这样的规则：

```cpp
int i;                    // 不确定值
int i = int();            // 0
int i = new int;          // 不确定值
int i = new int();        // 0
```

# 静态和全局变量的初始化

未初始化的和初始化为零的静态/全局变量编译器是同样对待的，把它们存储在进程的BSS段（这是全零的一段内存空间）中。所以它们会被"默认初始化"为零。

> 关于进程的内存空间分配见[进程的地址空间：TEXT，DATA，BSS，HEAP，STACK][mem]一文。

来看例子：

```cpp
int g_var;
int *g_pointer;
static int g_static;

int main(){
    int l_var;
    int *l_pointer;
    static int l_static;

    cout<<g_var<<endl<<g_pointer<<endl<<g_static<<endl;
    cout<<l_var<<endl<<l_pointer<<endl<<l_static<<endl;
};
```

输出：

```
0                   // 全局变量
0x0                 // 全局指针  
0                   // 全局静态变量
32767               // 局部变量
0x7fff510cfa68      // 局部指针
0                   // 局部静态变量
```

动态内存中的变量在上述代码中没有给出，它们和局部变量（自动变量）具有相同的"默认初始化"行为。

# 成员变量的初始化

成员变量分为成员对象和内置类型成员，其中成员对象总是会被初始化的。而我们要做的就是在构造函数中初始化其中的内置类型成员。
还是先来看看内置类型的成员的"默认初始化"行为：

```cpp
class A{
public:
    int v;
};
A g_var;

int main(){
    A l_var;
    static A l_static;
    cout<<g_var.v<<' '<<l_var.v<<' '<<l_static.v<<endl;
    return 0;
}
```

输出：

```
0 2407223 0
```

可见**内置类型的成员变量的"默认初始化"行为取决于所在对象的存储类型，而存储类型对应的默认初始化规则是不变的**。
所以为了避免不确定的初值，通常会在构造函数中初始化所有内置类型的成员。[Effective C++: Item 4][item4]一文讨论了如何正确地在构造函数中初始化数据成员。
这里就不展开了，直接给出一个正确的初始化写法：

```cpp
class A{
public:
    int v;
    A(): v(0);
};
```

# 封闭类嵌套成员的初始化

再来探讨一下当对象聚合发生时成员变量的"默认初始化"行为，同样还是只关注于基本数据类型的成员。

```cpp
class A{
public:
    int v;
};

class B{
public:
    int v;
    A a;
};

B g_var;
int main(){
    B l_var;
    cout<<g_var.v<<' '<<g_var.a.v<<endl;
    cout<<l_var.v<<' '<<l_var.a.v<<endl;
    return 0;
}
```

输出：

```
0 0
43224321 -1610612736
```

规则还是是一样的，默认初始化行为取决于它所属对象的存储类型。
**封闭类中成员对象的内置类型成员变量的"默认初始化"行为取决于当前封闭类对象的存储类型，而存储类型对应的默认初始化规则仍然是不变的**。


[item4]: {% post_url 2015-07-22-effective-cpp-4 %}
[mem]: {% post_url 2015-07-22-memory-segment %}

