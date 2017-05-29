---
layout: blog 
title: C++手稿：封装与继承
tags: C++ 封装 继承 作用域 多继承 名称隐藏 对象组合 构造函数 析构函数
---

本文总结了C++中类的继承相关的概念，包括可见性级别、继承的不同方式、构造与析构过程、封闭类、友元等。

# 可见性级别

C++类提供了数据结构和算法的封装，以及相应的3种可见级别。它们定义了不同的可见性：

* Public：当前类以及子类的方法中可见，外部可见。
* Protected：当前类以及子类的方法中可见，外部不可见。
* Private：当前类的方法中可见，外部不可见。

> 在一个对象的成员函数中，可以调用其他同类对象的私有方法。

多数现代的面向对象语言中，仅提供Private和Public两种可见性，C++的可见级别略显复杂。
然而三种继承方式以及多继承机制，让问题更加复杂。简单起见，此处只讨论Private和Public方式的单继承。

* Public继承：子类中可访问基类`public`、`protected`成员，子类外部可见父类`public`成员。
* Private继承：子类中可访问基类`public`、`protected`成员，子类外部不可见父类成员。

# 类的继承

* Public继承表示"is a"的关系（见[Effective C++: Item 32][item32]），子类的对象同时也是一个基类的对象。
子类的行为应符合基类的行为，因此Public继承中通常不会覆盖基类成员。

* Private继承表示“以...实现“的关系，子类是以基类来实现的
对于一个子类的对象，其外部不可见基类的行为。Private继承更像是对象组合。

> 对于Public继承，子类的指针、引用、变量可以直接赋值给基类的指针、引用、变量。

```cpp
class CBase{};
class CDerived: public CBase{
public:
    CDerived(): CBase(){}
};
```

<!--more-->

# 名称隐藏

子类中声明的成员会覆盖掉基类中的同名成员，但可以通过基类名来调用：

```cpp
class CBase{
public:
    int i;
};
class CDerived: public CBase{
public:
    int i;
    void func(){
        CBase::i = 1;
    }
};
```

与访问成员变量的方式类似，访问基类的成员函数的也需要指定基类名称。类继承引起的名称隐藏和作用域嵌套引起的名称隐藏是一样的，隐藏的是名称与类型无关。
更多讨论可以参见[Effective C++: Item 33][item33]。

# 封闭类

有成员对象的类称为**封闭类**，这是对象组合的一种实现方式。可以在构造函数的初始化列表中进行初始化。

```cpp
class CPerson{
    CHead head;
    CBody body;
public:
    CPerson(head_, body_):head(head_), body(_body){}
};
```

> 很显然，如果对象成员的构造函数参数非空，则会要求当前类指定构造函数。

也可以不指定初始化列表，在构造函数中再进行成员对象的赋值，这会导致成员对象被构造多次。
更重要的是，因为**常量类型、引用类型的成员不接受赋值，它们只能在初始化列表中进行初始化**。

# 构造与析构过程

对象的构造过程中，首先完成父类的构造函数，再完成成员对象的构造，最后调用当前类的构造函数：

1. 构造父类的对象。在此过程中对象的动态类型是仍然是父类。
2. 构造对象属性。它们实例化的顺序只取决于在类中声明的顺序，与初始化列表中的顺序无关。
3. 调用构造函数。在这里完成当前类指定的构造过程。

对象的析构过程恰好相反，首先调用当前类的析构函数，然后析构对象属性，最后析构父类对象。

# 友元

C++中存在着破坏封装的语法特性：友元，友元函数和友元类可以访问当前类的私有成员。但通过友元可以更好地实现类的扩展和运算符重载。
[Effective C++: Item 23][item23]给出了更多关于友元和封装的讨论。

> 友元的关系不可传递和继承。

友元函数在类声明中添加`friend`关键字，可以通过参数传入类的实例进行操作。友元函数也可以是另一个类的成员函数。

```cpp
class CPerson{
    int age;
public:
    friend void SetAge(CPerson&, int);
    friend void CGod::createMan();
};
void SetAge(CPerson& p, int n){
    p.age = n;
}
```

友元类的逻辑相对简单，在声明中给出友元类，便给了它私有的权限：

```cpp
class CPerson{
public:
     friend class God;
};
```

[item23]: /2015/08/20/effective-cpp-23.html
[item32]: /2015/08/30/effective-cpp-32.html
[item33]: /2015/08/31/effective-cpp-33.html
