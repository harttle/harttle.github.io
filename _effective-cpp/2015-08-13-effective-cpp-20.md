---
layout: blog
title: Item 20：传递常量引用比传值更好

tags: C++ 引用 常量
excerpt: 通常来讲，传递常量引用比传值更好，同时避免了截断问题。但是内置类型和STL容器、迭代器，还是传值更加合适。
---

> Item 20: Prefer pass-by-reference-to-const to pass-by-value 

C++函数的参数和返回值默认采用传值的方式，这一特性是继承自C语言的。如果不特殊指定，
函数参数将会初始化为实参的拷贝，调用者得到的也是返回值的一个副本。
这些拷贝是通过调用对象的拷贝构造函数完成的，正是这一方法的调用使得拷贝的代价可能会很高。

通常来讲，传递常量引用比传值更好，同时避免了截断问题。但是内置类型和STL容器、迭代器，还是传值更加合适。

# 来个例子

一个典型的类的层级可能是这样的：

```cpp
class Person {
    string name, address;
};
class Student: public Person {
    string schoolName, schoolAddress;
};
```

假如有这样一处函数调用：

```cpp
bool validateStudent(Student s);           // function taking a Student by value

Student plato;                             // Plato studied under Socrates
bool platoIsOK = validateStudent(plato);   // call the function
```

在调用`validateStudent()`时进行了6个函数调用：

1. `Person`的拷贝构造函数，为什么`Student`的拷贝构造一定要调用`Person`的拷贝构造请参见：[Item 12：完整地拷贝对象][12]
2. `Student`的拷贝构造函数
3. `name`, `address`, `schoolName`, `schoolAddress`的拷贝构造函数

解决办法便是传递常量引用：

```cpp
bool validateStudent(const Student& s);
```

首先以引用的方式传递，不会构造新的对象，避免了上述例子中6个构造函数的调用。
同时`const`也是必须的：传值的方式保证了该函数调用不会改变原来的`Student`，
而传递引用后为了达到同样的效果，需要使用`const`声明来声明这一点，让编译器去进行检查！

<!--more-->

# 截断问题

将传值改为传引用还可以有效地避免**截断问题**：由于类型限制，子类对象被传递时只有父类部分被传入函数。

比如一个`Window`父类派生了子类`WindowWithScrollBars`：

```cpp
class Window {
public:
  ...
  std::string name() const;           // return name of window
  virtual void display() const;       // draw window and contents
};

class WindowWithScrollBars: public Window {
public:
  ...
  virtual void display() const;
};
```

有一个访问`Window`接口的函数，通过传值的方式来获取`Window`的实例：

```cpp
// incorrect! parameter may be sliced!
void printNameAndDisplay(Window w){     
  std::cout << w.name();
  w.display();
}

WindowWithScrollBars wwsb;
printNameAndDisplay(wwsb);
```

当调用`printNameAndDisplay`时参数类型从`WindowWithScrollBars`被隐式转换为`Window`。
该转换过程通过调用`Window`的拷贝构造函数来进行。
导致的结果便是函数中的`w`事实上是一个`Window`对象，
并不会调用多态子类`WindowWithScrollBars`的`display()`。

```cpp
// fine, parameter won't be sliced
void printNameAndDisplay(const Window& w){ 
  std::cout << w.name();
  w.display();
}
```

这就很好嘛，如果你曾深入过编译器你会发现引用是通过指针来实现的。

# 特殊情况

一般情况下相比于传递值，传递常量引用是更好的选择。但也有例外情况，比如*内置类型*和*STL迭代器和函数对象*。

内置类型传值更好是因为它们小，而一个引用通常需要32位或者64位的空间。可能你会认为小的对象也应当首选传值，
但**对象小并不意味着拷贝构造的代价不高**！比如STL容器通常很小，只包含一些动态内存的指针。然而它的拷贝构造函数中，
必然会分配并拷贝那些动态内存的部分。

即使拷贝构造函数代价很小，传值的方式仍然有性能问题。有些编译器会区别对待内置类型和用户定义类型，
即使它们有相同的底层表示。比如有些编译器虽然会把`double`放入寄存器，但是拒绝将只含一个`double`的对象放入寄存器。

> 一个只含`double`的对象大小为8，它和一个`double`具有相同的大小和底层表示。关于对象大小的计算，请参考：[Item 7：将多态基类的析构函数声明为虚函数][7]

从面向对象设计方面来讲，即使对象现在很小，但它作为用户定义类型是有可能变大的（如果你更改了内部实现）。
从长远来讲的性能考虑，也应当采取传引用的方式来设计使用它的函数。

STL迭代器和函数对象也应当被传值，这是因为它们在STL中确实是被这样设计的，同时它们的拷贝构造函数代价并不高。

[12]: /2015/08/01/effective-cpp-12.html
[7]: /2015/07/24/effective-cpp-7.html
