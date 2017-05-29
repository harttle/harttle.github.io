---
layout: blog
title: Item 28：不要返回对象内部的句柄

tags: C++ 内存 封装 引用 指针 迭代器
excerpt: 这里的“句柄”（handle）包括引用、指针和迭代器。这样可以增加类的封装性、使得`const`函数更加`const`，也避免了空引用的创建（dangling handles）。
---

> Item 28: Avoid returning "handles" to object internals.

不要返回对象私有成员的句柄。这里的“句柄”（handle）包括引用、指针和迭代器。
这样可以增加类的封装性、使得`const`函数更加`const`，
也避免了空引用的创建（dangling handles）。

> 为了方便起见，下文中统一用指针来称呼这三类句柄。

<!--more-->

# 返回私有成员的指针

在继续Scott Meyers的讨论之前，先来回顾一下类成员指针的行为。
首先如果不加限制，直接返回私有成员的指针会导致私有成员被完全暴露。例如：

```cpp
class Rectangle {
  int _left, _top;
public:
  int& left() { return _left; }
};
Rectangle rec;
rec.left() = 3;   // rec._left被修改
```

其实这已经足以说明**返回私有成员指针相当于完全暴露了私有成员。**

# 暴露私有成员为常量

如果是为了保护私有成员不被修改，只是为了让外界可以不通过函数就可以访问`_left`，
可以将`left()`声明为`const`：

```cpp
int& left() const{ return _left; }
```

上述代码还有问题~ 编译器会产生如下错误：

```
error: binding of reference to type 'int' to a value of type 'const int'
      drops qualifiers
```

这是因为常量方法不能修改当前对象，其返回值也应该是`const`的。应该这样写：

```cpp
const int& left() const{ return _left; }
```

由于返回值声明了`const`，客户修改内部变量便会编译错了。我们成功地在开放了内部变量的同时防止了内部变量被修改。但是问题没有到此为止！还记得吗？C++的常量定义为"bitwise constness"，只要当前对象没被修改就算常量。所以如果我们将`left`和`top`存在类的外面，常量方法的返回值类型检查便会失效，比如把数据存在`Point`里面：

```cpp
class Point{
public:
    int left, right;
};
class Rectangle {
    Point* p;
public:
    int& left() const { return p->left; }
};
...
const Rectangle rec;
rec.left() = 3;     // rec明明是const对象，但我们可以修改它~
```

现在`Rectangle`的大小是`sizeof(void*)`（指针大小），
即`p->left`并不在这个对象的内存里，
因而常量方法的返回值可以不声明`const`。
这时客户便可以通过这个返回的`left`来修改对象私有成员了。
所以返回对象内部的指针，会导致常量方法的`const`属性被破坏。
根本原因在于C++的"bitwise constness"语法检查风格。

> 注意如果`p`被声明为`Point`而非`Point*`时，`p->left`仍处于当前类的内存区域内，
> 编译器会要求`left() const`返回值为`const int&`。

# 空悬指针问题

可能你已经注意到了，我们完全可以稍微改善一下上面的代码来实现私有成员的写保护。
既然是由于"bitwise constness"编译器不提供类型检查，
我们手动限制返回值为`const`即可：

```cpp
const int& left() const{ return p->left; }
```

很多情况下问题确实是这样解决的，比如实现`operator[]() const`时。
但下标运算符只是一个特例，一般情况我们是不会返回内部指针的。
因为返回的指针和拥有者对象具有同样的生命周期，
返回的指针很容易被悬空，比如有一个返回`Rectangle`的`bounding`函数：

```cpp
const Rectangle bounding();
```

我们希望获得那个`Rectangle`的`left`，可能会这样写：

```cpp
const int& left = bounding().left();
```

问题在哪里呢？`left`被悬空了，它并没有保持`left`的值！
因为`bounding()`返回的对象没有赋值给任何变量它是一个临时对象。
临时对象在语句执行后立即销毁，那个私有成员的引用也将失效。

