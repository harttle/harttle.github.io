---
layout: blog
title: Item 50：为什么需要自定义new和delete？

tags: C++ 动态内存 内存 字节对齐
excerpt: 实现一个operator new很容易，但实现一个好的operator new却很难。
---

> Item 50: Understand when it makes sense to replace new and delete.

我们在[Item 49][item49]中介绍了如何自定义`new`的错误处理函数，以及如何为你的类重载`operator new`。
现在我们回到更基础的问题，为什么我们需要自定义`operator new`或`operator delete`？

* 检测使用错误。`new`得到的内存如果没有`delete`会导致内存泄露，而多次`delete`又会引发未定义行为。如果自定义`operator new`来保存动态内存的地址列表，在`delete`中判断内存是否完整，便可以识别使用错误，避免程序崩溃的同时还可以记录这些错误使用的日志。
* 提高效率。全局的`new`和`delete`被设计为通用目的（general purpose）的使用方式，通过提供自定义的`new`，我们可以手动维护更适合应用场景的存储策略。
* 收集使用信息。在继续自定义`new`之前，你可能需要先自定义一个`new`来收集地址分配信息，比如动态内存块大小是怎样分布的？分配和回收是先进先出FIFO还是后进先出LIFO？
* 实现非常规的行为。比如考虑到安全，`operator new`把新申请的内存全部初始化为0.
* 其他原因，比如抵消平台相关的字节对齐，将相关的对象放在一起等等。

<!--more-->

自定义一个`operator new`很容易的，比如实现一个支持越界检查的`new`：

```cpp
static const int signature = 0xDEADBEEF;    // 边界符
typedef unsigned char Byte; 

void* operator new(std::size_t size) throw(std::bad_alloc) {
    // 多申请一些内存来存放占位符 
    size_t realSize = size + 2 * sizeof(int); 

    // 申请内存
    void *pMem = malloc(realSize);
    if (!pMem) throw bad_alloc(); 

    // 写入边界符
    *(reinterpret_cast<int*>(static_cast<Byte*>(pMem)+realSize-sizeof(int))) 
        = *(static_cast<int*>(pMem)) = signature;

    // 返回真正的内存区域
    return static_cast<Byte*>(pMem) + sizeof(int);
}
```

其实上述代码是有一些瑕疵的：

* [Item 49][item49]提到`operator new`应当不断地调用new handler，上述代码中没有遵循这个惯例；
* 有些体系结构下，不同的类型被要求放在对应的内存位置。比如`double`的起始地址应当是8的整数倍，`int`的起始地址应当是4的整数倍。上述代码可能会引起运行时硬件错误。
* 起始地址对齐。C++要求动态内存的起始地址对所有类型都是字节对齐的，`new`和`malloc`都遵循这一点，然而我们返回的地址偏移了一个`int`。

到此为止你已经看到了，实现一个`operator new`很容易，但实现一个好的`operator new`却很难。其实我们还有别的选择：比如去读编译器文档、内存管理的商业工具、开源内存管理工具等。

[item49]: /2015/09/17/effective-cpp-49.html
