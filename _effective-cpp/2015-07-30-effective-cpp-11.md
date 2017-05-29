---
layout: blog
title: Item 11：赋值运算符的自赋值问题

tags: C++ 异常 引用 指针 流水线 赋值运算符 运算符重载
excerpt:  赋值运算符的重载要注意自赋值安全和异常安全。有三种方法： 1. 判断两个地址是否相同 2. 仔细地排列语句顺序 3. Copy and Swap
---

> Item 11: Handle assignment to self in operator=

如果我们选择重载一个类的赋值运算符，要注意在自赋值时仍然能够正确工作。自赋值看起来像是不正确的调用方式，
但是在C++中这是合法的而且常常是不可识别的。例如：

```cpp
a[i] = a[j];
*p1 = *p2;
base = derived 
```

> 之所以会出现自赋值的问题，是因为C++允许变量有别名（指针和引用），这使得一个数据可以有多个引用。

首先给一个错误的赋值运算符重载：

```cpp
Widget& Widget::operator=(const Widget& rhs){
    delete pb;                   // stop using current bitmap
    pb = new Bitmap(*rhs.pb);    // start using a copy of rhs's bitmap
    return *this;                // see Item 10
}
```

当`rhs == *this`时，`delete pb`使得`rhs.pb`成为空值，接下来`new`的数据便是空的。
最直接的解决办法很容易想到，**判断两个地址是否相同**：

```cpp
Widget& Widget::operator=(const Widget& rhs){
    if (this == &rhs) return *this;
    delete pb;                   // stop using current bitmap
    pb = new Bitmap(*rhs.pb);    // start using a copy of rhs's bitmap
    return *this;                // see Item 10
}
```

<!--more-->

这是一个*自赋值安全的*实现，但并没有实现*异常安全*。试想一下若`new`出现了异常，当前对象的`pb`便会置空。
空指针在C++中可是会引发无数问题的。。所以这不是一个好的实现，同时我们知道，在C++中**仔细地排列语句顺序通常可以达到异常安全**，
比如我们可以先申请空间，最后再`delete`：

```cpp
Widget& Widget::operator=(const Widget& rhs){
    Bitmap *pOrig = pb;               // remember original pb
    pb = new Bitmap(*rhs.pb);         // make pb point to a copy of *pb
    delete pOrig;                     // delete the original pb
    return *this;
}
```

这样一来自赋值的判断也不需要了，当然如果你关心效率，也可以添加自赋值判断。
但这一点需要权衡：代码量的增加和判断语句都会影响指令的执行效率，例如指令预取、指令缓存、流水线都会变得更低效。

至此问题已经很清楚了，我们的目的便是**自赋值安全**和**异常安全**。一个更加通用的技术便是**复制和交换**（copy and swap）：

```cpp
Widget& Widget::operator=(Widget rhs){
    swap(rhs);                // swap *this's data with
    return *this;             // the copy's
}
```

这里是借助了`swap`的异常安全性，如何实现异常安全的`swap`可以参考Item 29。
注意到这里是传值而不是传引用，传参时编译器会自动copy一份`rhs`进来。
当然你也可以传引用进来再copy一份，但我们还是相信编译器比我们更擅长高效地copy一个对象。

总结一下，赋值运算符的重载要注意自赋值安全和异常安全。有三种方法： 

1. 判断两个地址是否相同
2. 仔细地排列语句顺序
3. Copy and Swap
