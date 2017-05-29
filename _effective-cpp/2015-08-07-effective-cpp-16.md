---
layout: blog
title: Item 16：使用同样的形式来new和delete

tags: C++ 引用 指针 数组 动态内存 构造函数
excerpt: 如果你用`new`申请了动态内存，请用`delete`来销毁；如果你用`new xx[]`申请了动态内存，请用`delete[]`来销毁。
---

> Item 16: Use the same form in corresponding uses of new and delete.

这是C++界中家喻户晓的规则：**如果你用`new`申请了动态内存，请用`delete`来销毁；如果你用`new xx[]`申请了动态内存，请用`delete[]`来销毁**。
不必多说了，来个例子吧：

```cpp
int* p = new int[2]{11, 22};
printf("%d, %d", *p, *(p+1));
delete[] p;
```

输出是：

```
11, 22
```

如果`delete`的形式不同于`new`，则会产生未定义的行为。
因为`delete`需要调用相应的构造函数，所以它需要知道被删除的是数组还是单个对象。
即使是基本数据类型，错误的调用也会导致未定义行为。

不过在Homebrew gcc 5.1.0中，在`int`数组上调用`delete`不会引发严重后果。只是后面的动态内存未被释放而已。
但是用`delete`来删除`string`数组，会有如下错误：

```
malloc: *** error for object 0x7fcd93c04b38: pointer being freed was not allocated
```

不管怎样，只需要记住用使用同样的形式来new和delete就好了。唯一的问题在于：`typedef`。请看例子：

```cpp
typedef string address[4];  // 每个地址是四个字符串

string* addr = new address;
delete[] addr;
```

注意！此时用`new`来申请空间，却需要使用`delete[]`来释放。可能你会想这样写：

```cpp
address* addr = new address;
delete addr;
```

问题在于`addr`的初始化语句中，等号两边的类型不兼容：

* 等号右边：`new address`的返回值与`new string[4]`具有同样的类型：`string*`。
* 等号左边：`addr`的类型是数组指针：`string (*)[4]`。关于数组指针可参考：[C++手稿：指针与引用][pointers]

最终的解决办法还是避免使用`typedef`来定义数组，你可以使用更加面向对象的`vector`、`string`等对象。

[pointers]: /2015/07/05/cpp-pointers-and-references.html
