---
layout: blog
title: Item 39：明智地使用private继承

tags: C++ 继承 封装 接口 虚函数 字节对齐 对象组合
excerpt: 子类继承了父类的实现，而没有继承任何接口。 private继承和对象组合类似，都可以表示"is-implemented-in-terms-with"的关系。但对象组合往往比继承提供更大的灵活性。
---

> Item 39: Use private inheritance judiciously.

[Item 32][item32]提出public继承表示"is-a"的关系，这是因为编译器会在需要的时候将子类对象隐式转换为父类对象。
然而private继承则不然：

```cpp
class Person { ... };
class Student: private Person { ... };     // inheritance is now private
void eat(const Person& p);                 // anyone can eat

Person p;                                  // p is a Person
Student s;                                 // s is a Student
eat(p);                                    // fine, p is a Person
eat(s);                                    // error! a Student isn't a Person
```

`Person`可以`eat`，但`Student`却不能`eat`。这是private继承和public继承的不同之处：

* 编译器不会把子类对象转换为父类对象
* 父类成员（即使是public、protected）都变成了private

子类继承了父类的实现，而没有继承任何接口（因为public成员都变成private了）。
因此private继承是**软件实现**中的概念，与**软件设计**无关。
private继承和对象组合类似，都可以表示"is-implemented-in-terms-with"的关系。那么它们有什么区别呢？
**在面向对象设计中，对象组合往往比继承提供更大的灵活性，只要可以使用对象组合就不要用private继承**。

<!--more-->

# private继承

我们的`Widget`类需要执行周期性任务，于是希望继承`Timer`的实现。
因为`Widget`不是一个`Timer`，所以我们选择了private继承：

```cpp
class Timer {
public:
   explicit Timer(int tickFrequency);
   virtual void onTick() const;          // automatically called for each tick
};
class Widget: private Timer {
private:
  virtual void onTick() const;           // look at Widget usage data, etc.
};
```

在`Widget`中重写虚函数`onTick`，使得`Widget`可以周期性地执行某个任务。为什么`Widget`要把`onTick`声明为`private`呢？
因为`onTick`只是`Widget`的内部实现而非公共接口，我们不希望客户调用它（[Item 18][item18]指出接口应设计得不易被误用）。

private继承的实现非常简单，而且有时只能使用private继承：

1. 当`Widget`需要访问`Timer`的protected成员时。因为对象组合后只能访问public成员，而private继承后可以访问protected成员。
2. 当`Widget`需要重写`Timer`的虚函数时。比如上面的例子中，由于需要重写`onTick`单纯的对象组合是做不到的。

# 对象组合

我们知道对象组合也可以表达"is-implemented-in-terms-of"的关系，
上面的需求当然也可以使用对象组合的方式实现。但由于需要重写（override）`Timer`的虚函数，所以还是需要一个继承关系的：

```cpp
class Widget {
private:
    class WidgetTimer: public Timer {
    public:
        virtual void onTick() const;
    };
    WidgetTimer timer;
};
```

内部类`WidgetTimer`public继承自`Timer`，然后在`Widget`中保存一个`WidgetTimer`对象。
这是public继承+对象组合的方式，比private继承略为复杂。但对象组合仍然拥有它的好处：

1. 你可能希望禁止`Widget`的子类重定义`onTick`。在Java中可以使用`finel`关键字，在C#中可以使用`sealed`。
在C++中虽然没有这些关键字，但你可以使用public继承+对象组合的方式来做到这一点。上述例子便是。
2. 减小`Widget`和`Timer`的编译依赖。如果是private继承，在定义`Widget`的文件中势必需要引入`#include"timer.h"`。
但如果采用对象组合的方式，你可以把`WidgetTimer`放到另一个文件中，在`Widget`中保存`WidgetTimer`的指针并声明`WidgetTimer`即可，
见[Item 31][item31]。

# EBO特性

我们讲虽然对象组合优于private继承，但有些特殊情况下仍然可以选择private继承。
需要EBO（empty base optimization）的场景便是另一个特例。
由于技术原因，C++中的独立空对象也必须拥有非零的大小，请看：

```cpp
class Empty {}; 
class HoldsAnInt {
private:
  int x;
  Empty e;        
};
```

`Empty e`是一个空对象，但你会发现`sizeof(HoldsAnInt) > sizeof(int)`。
因为C++中独立空对象必须有非零大小，所以编译器会在`Empty`里面插入一个`char`，这样`Empty`大小就是1。
由于字节对齐的原因，在多数编译器中`HoldsAnInt`的大小通常为`2*sizeof(int)`。更多字节对齐和空对象大小的讨论见[Item 7][item7]。
但如果你继承了`Empty`，情况便会不同：

```cpp
class HoldsAnInt: private Empty {
private:
  int x;
};
```

这时`sizeof(HoldsAnInt) == sizeof(int)`，这就是**空基类优化**（empty base optimization，EBO）。
当你需要EBO来减小对象大小时，可以使用private继承的方式。

继承一个空对象有什么用呢？虽然空对象不可以有非静态成员，但它可以包含typedef, enum, 静态成员，非虚函数
（因为虚函数的存在会导致一个徐函数指针，它将不再是空对象）。
STL就定义了很多有用的空对象，比如`unary_function`, `binary_function`等。

# 总结

* private继承的语义是"is-implemented-in-terms-of"，通常不如对象组合。但有时却是有用的：比如方法protected成员、重写虚函数。
* 不同于对象组合，private继承可以应用EBO，库的开发者可以用它来减小对象大小。

[item7]: /2015/07/24/effective-cpp-7.html
[item18]: /2015/08/09/effective-cpp-18.html
[item31]: /2015/08/29/effective-cpp-31.html
[item32]: /2015/08/30/effective-cpp-32.html
