---
layout: blog
title: Item 43：访问模板基类中的名称

tags: C++ 模板 继承 特化 继承 作用域 虚函数
excerpt: 从面相对象C++转移到模板C++时，你会发现类继承在某些场合不在好使了。比如父类模板中的名称对子类模板不是直接可见的，需要通过this->前缀、using或显式地特化模板父类来访问父类中的名称。
---

> Item 43: Know how to access names in templatized base classes.

从面相对象C++转移到模板C++时，你会发现类继承在某些场合不在好使了。
比如父类模板中的名称对子类模板不是直接可见的，需要通过`this->`前缀、`using`或显式地特化模板父类来访问父类中的名称。

> 因为父类模板在实例化之前其中的名称是否存在确实是不确定的，而C++偏向于早期发现问题（early diagnose），所以它会假设自己对父类完全无知。

<!--more-->

# 编译错的一个例子

一个`MsgSender`需要给多个`Company`发送消息，我们希望在编译期进行类型约束，于是选择了模板类来实现`MsgSender`。

```cpp
template<typename Company>
class MsgSender{
public:
    void sendClear(const MsgInfo& info){...}    // 发送明文消息
    void sendSecret(const MsgInfo& info){...}   // 发送密文消息
};
```

由于某种需求我们需要继承`MsgSender`，比如需要在发送前纪录日志：

```cpp
template<typename Company>
class LoggingMsgSender: public MsgSender<Company>{
public:
    void sendClearMsg(const MsgInfo& info){
        // 存储一些日志
        sendClear(info);    // 编译错！
    }
};
```

> 首先要说明这里我们创建了新的方法`sendClearMsg`而不是直接重写`sendClear`是一个好的设计，
> 避免了隐藏父类中的名称，见[Item 33][item33]；也避免了重写父类的非虚函数，见[Item 36][item36]。

编译错误发生的原因是编译器不知道父类`MsgSender<Company>`中是否有一个`sendClear`，因为只有当`Company`确定后父类才可以实例化。
而在解析子类`LoggingMsgSender`时父类`MsgSender`还没有实例化，于是这时根本不知道`sendClear`是否存在。

为了让这个逻辑更加明显，假设我们需要一个公司`CompanyZ`，由于该公司的业务只能发送密文消息。所以我们特化了`MsgSender`模板类：

```cpp
template<>
class MsgSender<CompanyZ>{
public:
    void sendSecret(const MsgInfo& info){...}   // 没有定义sendClear()
};
```

> `template<>`意味着这不是一个模板类的定义，是一个模板类的**全特化**（total template specialization）。
> 我们叫它全特化是因为`MsgSender`没有其它模板参数，只要`CompanyZ`确定了`MsgSender`就可以被实例化了。

现在前面的编译错误就更加明显了：如果`MsgSender`的模板参数`Company == CompanyZ`，
那么`sendClear()`方法是不存在的。这里我们看到**在模板C++中继承是不起作用的**。

# 访问模板父类中的名称

既然模板父类中的名称在子类中不是直接可见的，我们来看如何访问这些名称。这里介绍三种办法：

## this指针

父类方法的调用语句前加`this->`：

```cpp
template<typename Company>
class LoggingMsgSender: public MsgSender<Company>{
public:
    void sendClearMsg(const MsgInfo& info){
        ...
        this->sendClear(info);
    }
};
```

这样编译器会假设`sendClear`是继承来的。

## using 声明

把父类中的名称使用`using`声明在子类中。该手法我们在[Item 33][item33]中用过，那里是为了在子类中访问被隐藏的父类名称，
而这里是因为编译器不会主动去搜索父类的作用域。

```cpp
template<typename Company>
class LoggingMsgSender: public MsgSender<Company>{
public:
    using MsgSender<Company>::sendClear;  
    void sendClearMsg(const MsgInfo& info){
        ...
        sendClear(info);
    }
};
```

`using`语句告诉编译器这个名称来自于父类`MsgSender<Company>`。

## 调用时声明

最后一个办法是在调用时显式指定该函数所在的作用域（父类）：

```cpp
template<typename Company>
class LoggingMsgSender: public MsgSender<Company>{
public:
    void sendClearMsg(const MsgInfo& info){
        ...
        MsgSender<Company>::sendClear(info);
    }
};
```

这个做法不是很好，因为显式地指定函数所在的作用域会禁用虚函数特性。万一`sendClear`是个虚函数呢？

子类模板无法访问父类模板中的名称是因为编译器不会搜索父类作用域，上述三个办法都是显式地让编译器去搜索父类作用域。
但如果父类中真的没有`sendClear`函数（比如模板参数是`CompanyZ`），在后续的编译中还是会抛出编译错误。

[item33]: /2015/08/31/effective-cpp-33.html
[item36]: /2015/09/03/effective-cpp-36.html
