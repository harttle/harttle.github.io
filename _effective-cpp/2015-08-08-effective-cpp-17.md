---
layout: blog
title: Item 17：在单独的语句中将new的对象放入智能指针

tags: C++ DLL Windows 异常 指针 编译 动态内存 智能指针
excerpt: 在单独的语句中将new的对象放入智能指针，这是为了由于其他表达式抛出异常而导致的资源泄漏。因为C++不同于其他语言，函数参数的计算顺序很大程度上决定于编译器。
---

> Item 17: Store newed objects in smart pointers in standalone statements.

**在单独的语句中将new的对象放入智能指针，这是为了由于其他表达式抛出异常而导致的资源泄漏。
因为C++不同于其他语言，函数参数的计算顺序很大程度上决定于编译器。**

> 如果你在做Windows程序设计，或者DLL开发，可能会经常碰到类似`__cdecl`，`__stdcall`等关键字。它们便是来指定参数入栈顺序的。
> 关于函数和参数的讨论可以参考：[C++手稿：函数与参数][args]

还是举个例子比较清晰：

```cpp
processWidget(shared_ptr<Widget>(new Widget), priority());
```

上述代码中，在`processWidget`函数被调用之前参数会首先得到计算。可以认为包括三部分的过程：

1. 执行`new Widget`；
2. 构造`shared_ptr<Widget>`；
3. 调用`priority()`。

多数情况下编译器有权决定这三部分过程的顺序，如果很不幸由于某种效率原因，编译器认为顺序应当是`1, 3, 2`，即：

1. 执行`new Widget`；
2. 调用`priority()`。
3. 构造`shared_ptr<Widget>`；

那么如果`priority`抛出了异常，新的`Widget`便永远地找不回来了。虽然我们处处使用智能指针，资源还是泄漏了！

于是更加健壮的实现中，应当将创建资源和初始化智能指针的语句独立出来：

```cpp
shared_ptr<Widget> pw = shared_ptr<Widget>(new Widget);
processWidget(pw, priority());
```

[args]: /2015/07/07/cpp-functions-and-arguments.html
