---
layout: blog
title: Item 31：最小化文件之间的编译依赖

tags: C++ 常量 引用 指针 接口 编译 接口类 虚函数 工厂方法
excerpt: 最小化编译依赖的一般做法是依赖于声明而非定义，这个想法可以通过句柄类或接口类来实现。库的声明应当包括“完整的”和“只有声明的”两种形式。
---

> Item 31: Minimize compilation dependencies between files.

曾听老师讲过，每天上班的第一件事就是下载最新代码开始编译，然后可以有半个小时去喝杯咖啡。。。
这是C++特殊的一点，即使你在保持接口不变的情况下只改了类的内部实现，其他的项目文件仍然可能需要重新编译。

C++的Class不仅规约了外部接口，也给出了内部实现：

```cpp
class Person{
public:
    // 外部接口
    Person(const string& name);
    string name() const;
private:
    // 内部实现
    string _name;
    Date _birthday;
};
```

基于`Person`的内部实现，它的类定义文件中应该包含这样的代码：

```cpp
include<string>
include"date.h"
```

> `<string>`中定义了`string`类，`date.h`中定义了`Date`类。

这些`include`在编译前都是要拷贝进来的！这使得`Person`与这些头文件产生了编译依赖。
只要这些头文件（以及它们依赖的文件）中的类定义发生改动，`Person`类便需要重新编译。

你可能会想到，在`Person`文件中，只引入`string`和`Date`的声明而不引入定义不就解决问题了么：
这样当我们更改`Date`的内部实现时`Person`便不会知道，也就不需要重新编译了。这个思路写出来的代码是这样的：

```cpp
class string;
class Date;
class Person{
    ...
};
Person p;
```

编译通过不了！首先`string`是一个`typedef`：`basic_string<char>`，你需要声明更多的东西才能合法地声明这样一个`string`。
另外当编译器运行到`Person p;`时要为`Person`分配空间，需要知道`Person`的大小，而`Person`的大小依赖于`Date`的大小。
所以编译器需要知道`Date`的内部实现！只声明`Date`是不够的。

<!--more-->

# 使用指针代替对象

一个去除编译依赖的办法是：**依赖项使用指针而不是对象，同时依赖于类的声明而非定义**。比如我们把`_birthday`改成指针，并声明`class Date;`：

```cpp
class Date;
class Person{
    ...
private:
    Date* _birthday;
}
```

编译器为`Person`分配空间时，为其中的`_birthday`分配指针大小的空间即可，不必知道`Date`的内部实现，此时只需要提供`Date`的声明即可。
`Person`依赖于`Date`的声明而不是定义，于是`date.h`不再是`Person`的编译依赖了。
另外，如果你只是在返回值或者参数用到了`Date`，也不需要引入`Date`的定义，声明它即可：

```cpp
class Date;
Date d;
void func(Date d);
```

虽说对象作为函数参数还是传递引用比较好（见[Item 20：传递常量引用比传值更好][item20]），但即使你传递的是对象，也不需要给出它的内部实现。

# 单独地提供声明

既然我们希望依赖于声明而非定义，那么我们需要**为每个类单独地提供声明文件，和定义文件**。
比如`date.h`便需要分为两个文件，一个是声明`class Date;`，一个是定义`class Date{}`。

```cpp
// file: datefwd.h
class Date;

// file: date.h
class Date{
    ...
};
```

我们在`Person`中`include"datefwd.h"`即可，这样解除`Person`和`Date`内部实现（定义在`date.h`中）之间的编译依赖。

# 使用句柄类

C++中接口声明和内部实现必须同时引入，
但在Java等语言中便不存在这个问题。因为所有对象都是引用，比如`Person`中的`Date`只是一个引用，`Person`的大小与`Date`的实现无关，
只需要为`Date`分配一个引用大小的空间即可。在C++中，我们也可以使用`"pImpl idiom"`来实现这个策略：

```cpp
class Person{
public:
    Person(string& name);
    string name() const;
private:
    shared_ptr<PersonImpl> pImpl;
};
Person::Person(string& name): pImpl(new PersonImpl(name)){}
string Person::name(){
    return pImpl->name();
}
```

相当于把实现放到了另外一个类中`PersonImpl`，这样的`Person`类称为**句柄类**（Handle class）。
这样，当`PersonImpl`的内部实现发生改变时，依赖于`Person`的代码不再需要重新编译了。

# 使用接口类

还记得虚函数吗？除了句柄类，还有另外一个方式来移除编译依赖：接口类。在Java或C#中有接口的概念，
一个类可以实现若干个接口。但在C++中只有类的概念，但我们可以用只包含虚函数的类来定义一个接口：

```cpp
class Person{
public:
    virtual ~Person();
    virtual string name() const = 0;
    virtual string birthday() const = 0;
};
```

> 接口类中的成员函数定义为纯虚函数即可，因为接口类中我们当然不打算放一个方法的实现进去。

这个`Person`接口类包含纯虚函数，是一个抽象类。客户不能实例化它，只能使用它的引用和指针。
然而客户一定需要某种方法来获得一个实例，比如工厂方法（见[Item 13][item13]或者虚构造函数。
它们动态地创建对象，并返回对象指针（最好是智能指针，见[Item 18][item18]）。

比如`Person`有一个实体类叫做`RealPerson`，那么`Person`中可以提供一个工厂方法`create()`：

```cpp
class Person{
public:
    static shared_ptr<Person> create(string& name);
};
shared_ptr<Person> Person::create(string& name){
    return shared_ptr<Person>(new RealPerson(name));
}
...
shared_ptr<Person> p(Person::create("alice"));
```

# 总结

最小化编译依赖的一般做法是依赖于声明而非定义，这个想法可以通过句柄类或接口类来实现。库的声明应当包括“完整的”和“只有声明的”两种形式。

接口类和句柄类的设计隐藏了类的实现细节，减小了实现细节的改动对客户的影响。
但无论是接口类还是句柄类，都会造成一些代价：多一个`pImpl`指针的空间、虚函数表指针的空间、寻找虚函数的时间、间接调用的时间。

确实有人会因为这些代价而拒绝使用这些先进的技术，你会发现很难说服他们。这一点即便是Scott Meyers也没有办法：

> If so, you're reading the wrong book.

[item13]: /2015/08/02/effective-cpp-13.html
[item18]: /2015/08/09/effective-cpp-18.html
[item20]: /2015/08/13/effective-cpp-20.html
