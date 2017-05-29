---
layout: blog
title: Item 29：追求异常安全的代码

tags: C++ 内存 异常 指针 线程 智能指针
excerpt: 异常安全是指当异常发生时，不会泄漏资源，也不会使系统处于不一致的状态。通常有三个异常安全级别：基本保证、强烈保证、不抛异常（nothrow）保证。
---

> Item 29: Strive for exception-safe code.

**异常安全**是指当异常发生时，1) 不会泄漏资源，2) 也不会使系统处于不一致的状态。
通常有三个异常安全级别：基本保证、强烈保证、不抛异常（nothrow）保证。

* **基本保证**。抛出异常后，对象仍然处于合法（valid）的状态。但不确定处于哪个状态。
* **强烈保证**。如果抛出了异常，程序的状态没有发生任何改变。就像没调用这个函数一样。
* **不抛异常保证**。这是最强的保证，函数总是能完成它所承诺的事情。

<!--more-->

# 一个抛出异常的场景

现在实现一个菜单类，可以设置它的背景图片，提供切换背景计数，同时提供线程安全。

```cpp
class Menu{
    Mutex m;
    Image *bg;
    int changeCount;
public:
    void changeBg(istream& sr);
};
```

`changeBg`用来改变背景图片，可能是这样实现的：

```cpp
void Menu::changeBg(istream& src){
    lock(&mutex);
    delete bg;
    ++ changeCount;
    bg = new Image(src);
    unlock(&mutex);
}
```

因为C++继承自C，完全避免抛异常是不可能的。比如申请内存总是可能失败的，如果内存不够就会抛出`"bad alloc"`异常。加入`new Image(src)`抛出异常，
那么异常安全的两个条件都会破坏：

1. `mutex`资源被泄露了。没有被`unlock`。
2. `Menu`数据一致性被破坏。首先`bg`变成了空，然后`changeCount`也错误地自增了。

# 提供强烈的保证

通常来讲提供强烈保证是不困难的。首先我们把资源都放到智能指针里去，通常`shared_ptr`比`auto_ptr`更加符合直觉，
这样可以保证资源不被泄露（见[Item 13：使用对象来管理资源][item13]）；再调整`++changeCount`的位置来保证异常发生后对象仍然一致（valid）。

> 一个好的状态变更策略是：只有当某种事情（比如背景变更）已经发生了，才去改变某个状态来指示它发生了。

```cpp
class Menu{
    shared_ptr<Image> bg;
    ...
};
void Menu::changeBg(istream& src){
    Lock m1(&m);
    bg.reset(new Image(src));
    ++changeCont;
}
```

智能指针的`reset`是用来重置其中的资源的，在其中调用了旧资源的`delete`。这时如果`new Image`发生了异常，便不会进入`reset`函数，因而`delete`也不会被调用。
事实上，上述代码并不能提供完美的**强烈保证**，比如`Image`构造函数中移动了`istream& src`的读指针然后再抛出异常，那么系统还是处于一个被改变的状态。
这是一种对整个系统的**副作用**，类似的副作用还包括数据库操作，因为没有通用的办法可以撤销数据库操作。
不过这一点可以忽略，我们暂且认为它提供了完美的强烈保证。

# copy & swap 范式

一个叫做`"copy and swap"`的设计策略通常能够提供异常安全的强烈保证。当我们要改变一个对象时，先把它复制一份，然后去修改它的副本，改好了再与原对象交换。
为了更好地示例这个过程，我们将`Menu`的实现改变一下，采用`"pimpl idiom"`把它的实现放在`MenuImpl`中。

```cpp
class Menu{
    ...
private:
    Mutex m;
    std::shared_ptr<MenuImpl> pImpl;
};
Menu::changeBg(std::istream& src){
    using std::swap;            // 见 Item 25
    Lock m1(&mutex);

    std::shared_ptr<MenuImpl> copy(new MenuImpl(*pImpl));
    copy->bg.reset(new Image(src));
    ++copy->changeCount;

    swap(pImpl, copy);
}
```

这样我们的操作都是在`copy`上的，发生任何异常都不会影响到当前对象。只有改好了之后我们才`swap`它们。`swap`应当提供**不抛异常**的异常安全级别。
见：[Item 25：考虑实现一个不抛异常的swap][item25]。

使用`"copy and swap"`策略我们可以实现要么改变整个状态，要么维持所有状态不变。但它并不能为整个函数提供强烈的异常安全保证。例如：

```cpp
void Menu::changeBg(istream& src){
    ...
    f1();
    f2();
}
```

因为其它的函数调用例如`f1()`一旦不提供强烈的保证，那么整个函数不可能提供强烈的保证（因为`changeBg`无法修复`f1`造成的资源泄漏和不一致性）。
所以**一个函数的异常安全级别不会高于它调用的所有函数中安全级别最低的那个**。这也是为什么我们为什么要为自己的函数提供强烈的安全保证，
否则这些函数的使用者无法提供更高的安全级别，最终整个系统都是不安全的。

# 总结

异常安全保证（exception-safe guarantee）是函数接口的一部分，它也是客户可见的，
我们需要像设计其他接口（比如函数名、参数等）一样设计一场安全保证。

* 异常安全函数不会产生资源泄漏和数据破坏。异常安全分三个级别，其中**强烈的保证**是不难实现的。
* 可以用`"copy and swap"`设计策略来实现**强烈的保证**。
* 你调用的最低安全级别的函数决定了当前函数的最高安全级别。

[item13]: /2015/08/02/effective-cpp-13.html
[item25]: /2015/08/23/effective-cpp-25.html
