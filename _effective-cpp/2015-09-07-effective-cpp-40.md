---
layout: blog
title: Item 40：明智地使用多继承

tags: C++ 继承 多继承 接口类 名称隐藏 对象组合 工厂方法
excerpt: 多继承比单继承复杂，引入了歧义的问题，以及虚继承的必要性；虚继承在大小、速度、初始化/赋值的复杂性上有不小的代价，当虚基类中没有数据时还是比较合适的；多继承有时也是有用的。典型的场景便是：public继承自一些接口类，private继承自那些实现相关的类。
---

> Item 40: Use multiple inheritance judiciously.

多继承（Multiple Inheritance，MI）是C++特有的概念，在是否应使用多继承的问题上始终争论不断。一派认为单继承（Single Inheritance，SI）是好的，所以多继承更好；
另一派认为多继承带来的麻烦更多，应该避免多继承。本文的目的便是了解这两派的视角。具体从如下三个方面来介绍：

* 多继承比单继承复杂，引入了歧义的问题，以及虚继承的必要性；
* 虚继承在大小、速度、初始化/赋值的复杂性上有不小的代价，当虚基类中没有数据时还是比较合适的；
* 多继承有时也是有用的。典型的场景便是：public继承自一些接口类，private继承自那些实现相关的类。

<!--more-->

# 歧义的名称

多继承遇到的首要问题便是父类名称冲突时调用的歧义。如：

```cpp
class A{
public:
    void func();
};
class B{
private:
    bool func() const;
};
class C: public A, public B{ ... };

C c;
c.func();           // 歧义！
```

虽然`B::func`是私有的，但仍然会编译错。这是由C++的重载函数调用的解析规则决定的，
首先找到参数最匹配的函数，然后再检查可见性。上述例子中并未找到最匹配的函数，所以抛出了编译错误。
为了解决歧义，你必须这样调用：

```cpp
c.A::func();
```

# 多继承菱形

当多继承的父类拥有更高的继承层级时，可能产生更复杂的问题比如**多继承菱形**（deadly MI diamond）。如图：

![][dmd]

```cpp
class File{};
class InputFile: public File{};
class OutputFile: public File{};
class IOFile: public InputFile, public OutputFile{};
```

> 这样的层级在C++标准库中也存在，例如`basic_ios`, `basic_istream`, `basic_ostream`, `basic_iostream`。

`IOFile`的两个父类都继承自`File`，那么`File`的属性（比如`filename`）应该在`IOFile`中保存一份还是两份呢？
这是取决于应用场景的，就`File::filename`来讲显然我们希望它只保存一份，但在其他情形下可能需要保存两份数据。
C++还是一贯的采取了自己的风格：都支持！默认是保存两份数据的方式。如果你希望只存储一份，可以用`virtual`继承：

```cpp
class File{};
class InputFile: virtual public File{};
class OutputFile: virtual public File{};
class IOFile: public InputFile, public OutputFile{};
```

可能多数情况下我们都是希望`virtual`的方式来继承。但总是用`virtual`也是不合适的，它有代价：

* 虚继承类的对象会更大一些；
* 虚继承类的成员访问会更慢一些；
* 虚继承类的初始化更反直觉一些。继承层级的最底层（most derived class）负责虚基类的初始化，而且负责整个继承链上所有虚基类的初始化。

基于这些复杂性，Scott Meyers对于多继承的建议是：

1. 如果能不使用多继承，就不用他；
2. 如果一定要多继承，尽量不在里面放数据，也就避免了虚基类初始化的问题。

# 接口类

这样的一个不包含数据的虚基类和Java或者C#提供的Interface有很多共同之处，这样的类在C++中称为接口类，
我们在[Item 31][item31]中介绍过。一个`Person`的接口类是这样的：

```cpp
class IPerson {
public:
    virtual ~IPerson();
    virtual std::string name() const = 0;
    virtual std::string birthDate() const = 0;
};
```

由于客户无法创建抽象类的对象，所以必须以指针或引用的方式使用`IPerson`。
需要创建实例时客户会调用一些工厂方法，比如：

```cpp
shared_ptr<IPerson> makePerson(DatabaseID personIdentifier);
```

# 同时继承接口类与实现类

在Java中一个典型的类会拥有这样的继承关系：

```java
public class A extends B implements IC, ID{}
```

继承B通常意味着实现继承，继承IC和ID通常意味着接口继承。在C++中没有接口的概念，但我们有接口类！
于是这时就可以多继承：

```cpp
class CPerson: public IPerson, private PersonInfo{};
```

`PersonInfo`是私有继承，因为`Person`是借助`PersonInfo`实现的。
[Item 39][item39]提到对象组合是比private继承更好的*实现继承方式*。
但如果我们希望在`CPerson`中重写`PersonInfo`的虚函数，那么就只能使用上述的private继承了（这时就是一个合理的多继承场景）。

现在来设想一个需要重写虚函数的场景：
比如`PersonInfo`里面有一个`print`函数来输出`name`, `address`, `phone`。但它们之间的分隔符被设计为可被子类定制的：

```cpp
class PersonInfo{
public:
    void print(){
        char d = delimiter();
        cout<<name<<d<<address<<d<<phone;
    }
    virtual char delimiter() const{ return ','; }
};
```

`CPerson`通过private继承复用`PersonInfo`的实现后便可以重写`delimiter`函数了：

```cpp
class CPerson: public IPerson, private PersonInfo{
public:
    virtual char delimiter() const{ return ':'; }
    ...
};
```

至此完成了一个合理的有用的多继承（MI）的例子。

# 总结

我们应当将多继承视为面向对象设计工具箱中一个有用的工具。相比于单继承它会更加难以理解，
如果有一个等价的单继承设计我们还是应该采用单继承。但有时多继承确实提供了清晰的、可维护的、合理的方式来解决问题。
此时我们便应该理智地使用它。

* 多继承比单继承复杂，引入了歧义的问题，以及虚继承的必要性；
* 虚继承在大小、速度、初始化/赋值的复杂性上有不小的代价，当虚基类中没有数据时还是比较合适的；
* 多继承有时也是有用的。典型的场景便是：public继承自一些接口类，private继承自那些实现相关的类。

[dmd]: /assets/img/blog/effective-cpp/dmd.png
[item31]: /2015/08/29/effective-cpp-31.html
[item39]: /2015/09/06/effective-cpp-39.html
