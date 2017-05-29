---
layout: blog
title: Item 12：完整地拷贝对象

tags: C++ 继承 拷贝构造函数 构造函数 赋值运算符 运算符重载
excerpt: 在一个成熟的面向对象的C++系统中，只有两种拷贝对象的方式：复制构造函数和赋值运算符。当重载拷贝函数时，首先要完整复制当前对象的数据（local data）；然后调用所有父类中对应的拷贝函数。
---

> Item 12: Copy all parts of an object

在一个成熟的面向对象的C++系统中，只有两种拷贝对象的方式：复制构造函数和赋值运算符，
不妨称他们为**拷贝函数**。
拷贝函数属于编译器默认生成的函数（参考：[Item 5：那些被C++默默地声明和调用的函数][5]），
默认的拷贝函数确实会完整地拷贝对象，但有时我们选择重载拷贝函数，问题就出在这里！

一个正确拷贝函数的实现是这样的：

```cpp
class Customer{
  string name;
public:
  Customer::Customer(const Customer& rhs): name(rhs.name){}
  Customer& Customer::operator=(const Customer& rhs){
    name = rhs.name;                     // copy rhs's data
    return *this;                        // see Item 10
  }  
};
```

很完美对吧？但是有一天你新添加了一个数据成员，但忘记了更新拷贝函数：

```cpp
class Customer{
  string name;
  Date lastTransaction;
public:
  Customer::Customer(const Customer& rhs): name(rhs.name){}
  Customer& Customer::operator=(const Customer& rhs){
    name = rhs.name;                     // copy rhs's data
    return *this;                        // see Item 10
  }  
};
```

这时`lastTransaction`便被被你忽略了，编译器也不会给出任何警告（即使在最高警告级别）。
另外一个常见的情形在你继承父类时：

<!--more-->

```cpp
class PriorityCustomer: public Customer {
int priority;
public:
  PriorityCustomer::PriorityCustomer(const PriorityCustomer& rhs)
  : priority(rhs.priority){}
  
  PriorityCustomer& 
  PriorityCustomer::operator=(const PriorityCustomer& rhs){
    priority = rhs.priority;
  }  
};
```

上述代码看起来没有问题，但你忘记了拷贝父类的部分：

```cpp
class PriorityCustomer: public Customer {
int priority;
public:
  PriorityCustomer::PriorityCustomer(const PriorityCustomer& rhs)
  : Customer(rhs), priority(rhs.priority){}
  
  PriorityCustomer& 
  PriorityCustomer::operator=(const PriorityCustomer& rhs){
    Customer::operator=(rhs);
    priority = rhs.priority;
  }  
};
```

总之当你实现拷贝函数时，

* 首先要完整复制当前对象的数据（local data）；
* 调用所有父类中对应的拷贝函数。

你可能注意到了代码的重复，但千万不要让复制构造函数和赋值运算符相互调用，它们的语义完全不同！
C++甚至都没有提供一种语法可以让赋值运算符调用复制构造函数；反过来让复制构造函数调用赋值运算符倒是可以编译，
但由于复制构造函数的前置条件是一个未初始化的对象，而赋值运算符的前置条件是一个已初始化的对象。
这样的调用并非好的设计，恐怕会引起逻辑混乱。

> 但是代码重复怎么办？Scott Meyers提出可以抽象到一个普通方法中，比如`init`。是不是联想到了Objective-C的`init`函数？

[5]: /2015/07/23/effective-cpp-5.html
