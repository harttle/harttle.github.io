---
layout: blog
title: C++手稿：静态和全局变量的作用域
tags: 静态变量 全局变量 C++ 编译 作用域 
excerpt: 全局变量和静态变量的存储方式是一样的，只是作用域不同。静态变量的作用域是当前源文件，全局变量的作用域是整个可执行程序。
---

全局变量和静态变量的存储方式是一样的，只是作用域不同。如果它们未初始化或初始化为0则会存储在BSS段，如果初始化为非0值则会存储在DATA段，见[进程的地址空间分配][mem-seg]一文。
静态变量的作用域是当前源文件，全局变量的作用域是整个可执行程序。 值得注意的是：

* 如果在头文件定义全局变量，在预编译期间`#include`的头文件会被拷贝进源文件中，编译器是不知道头文件的。
* 虽然全局变量是全局作用域，但需要`extern`关键字来声明以通过编译。因为C++是强类型语言，编译时需要根据变量声明做类型检查。

<!--more-->

## 全局变量的引用

C++源文件中引用外部定义的全局变量和引用外部函数是一样的语法，通过`extern`来声明：

```cpp
// file: a.cpp
#include<iostream>
extern int a;
int main() {
    std::cout<<b<<std::endl;
    return 0;
}

// file: b.cpp
#include<iostream>
int a = 2;
```

然后分别编译这两个文件，链接生成`a.out`并执行它：

```bash
$ g++ a.cpp b.cpp
$ ./a.out
b.cpp
2
```

`extern`只是在当前文件中声明有这样一个外部变量而已，并不指定它来自哪个外部文件。所以即使`extern`变量名错误当前源文件也能通过编译，但链接会出错。

## 头文件中定义

因为头文件可能会被多次引用，在预编译时被引用的头文件会被直接拷贝到源文件中再进行编译。一个常见的错误便是把变量定义放在头文件中，例如下面的变量`int a`：

```cpp
// file: a.cpp
#include <iostream>
#include "b.h"
int main() {
    std::cout<<a<<std::endl;
    return 0;
}

// file: b.cpp
#include<iostream>
#include"b.h"
void f(){}

// file: b.h
int a = 2;
```

头文件`b.h`中定义了`int a`，它被`a.cpp`和`b.cpp`同时引入。我们将`a.cpp`和`b.cpp`分别编译是没有问题的，然后链接时会抛出错误：

```
duplicate symbol _a in:
    /tmp/ccqpfU5e.o
    /tmp/ccCRi9nO.o
ld: 1 duplicate symbol for architecture x86_64
collect2: error: ld returned 1 exit status
```

两个`.o`文件中的`_a`名称发生了冗余，这是变量重定义错误。

## 头文件中声明

因为声明操作是幂等的，而多次定义会引发重定义错误。所以 **头文件中不应包含任何形式的定义，只应该包含声明**，
正确的办法是变量定义总是在源文件中进行，而声明放在头文件中：

```cpp
#include <iostream>
#include "b.h"
int main() {
    std::cout<<a<<std::endl;
    return 0;
}

// file: b.cpp
#include<iostream>
#include"b.h"
int a = 2;

// file: b.h
extern a;
```

然后编译链接执行都会通过，输出`2`：

```
$ g++ a.cpp b.cpp
$ ./a.out
2
```

> 编译器看到`g++ a.cpp b.cpp`时会自动去查找`b.h`并进行预编译操作，因此不需要显式指定`b.h`。

## 静态全局变量

非静态全局变量是**外部可链接的**（external linkage），目标文件中会为它生产一个名称供链接器使用；
而静态全局变量是**内部可链接的**（internal linkage），目标文件中没有为链接器提供名称。因此无法链接到其他文件中，因此静态变量的作用域在当前源文件（目标文件）。
虽然静态和非静态全局变量可能存储在同一内存块，但它们的作用域是不同的。 来看例子：

```cpp
// file: a.cpp
#include <iostream>
extern int a;
int main() {
    std::cout<<a<<std::endl;
    return 0;
}

// file: b.cpp
static int a = 2;
```

然后`g++ a.cpp b.cpp`时发生链接错：

```
Undefined symbols for architecture x86_64:
  "_a", referenced from:
      _main in ccPLYjyx.o
ld: symbol(s) not found for architecture x86_64
collect2: error: ld returned 1 exit status
```

链接时未找到名称`_a`，因此静态变量在编译得到的目标文件中没有为链接器提供名称。所以其他目标文件无法访问该变量，静态全局变量的作用域是当前源文件（或目标文件）。

## 全局变量初始化

全局变量比较特殊，初始化有两种方式：

* 静态初始化（static initialization）：对于定义时给出初始化参数的全局变量，其初始化在程序加载时完成。根据是否被初始化、是否被初始化为0会把它存储在BSS或者DATA段中，参见[进程的地址空间分配][mem-seg]。
* 动态初始化（dynamic initialization）：定义变量时可以不给出初始化参数，而是在某个函数中进行全局变量初始化。

对于静态初始化，看这个例子：

```cpp
class C{
public:
    C(){ std::cout<<"init "; }
};
C c;
int main() { std::cout<<"main"; return 0; }
```

在`main()`进入之前，程序加载时动态初始化，程序输出为一行`init main`。

关于**全局变量的初始化顺序**，同一源文件中的全局变量初始化顺序按照定义顺序，不同源文件（编译单元）的全局变量初始化顺序并未规定。
因此软件设计时不要依赖于其他编译单元的静态变量，可以通过单例模式来避免这一点。


[mem-seg]: /2015/07/22/memory-segment.html
