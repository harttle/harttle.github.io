---
layout: blog
title: Item 33：避免隐藏继承来的名称

tags: C++ inline 继承 编译 作用域 名称隐藏 转发函数
excerpt: 子类中的名称会隐藏父类中所有同名的属性。public继承表示这"is-a"的关系，应该避免这样做。使用using声明或者转发函数可以使父类名称再次可见。
---

> Item 33: Avoid hiding inherited names.

其实本文的话题和继承完全没有关系，**隐藏名称是作用域的问题**。 
在C++中每一对`{` `}`都会开启一个新的作用域，并嵌套在当前作用域中。

# 一个示例

```cpp
int x;
void func(){
    double x;
    cin>>x;     // read a new value for local x
}
```

> 可以看到`double x`隐藏了`int x`，因为C++的名称隐藏规则（name-hiding rules）隐藏的是名称，和类型无关！

<!--more-->

# 继承作用域

子类可以访问父类中的名称，是因为子类的作用域是嵌套（nested in）在父类的作用域中的。
这一点也很符合直觉：

```cpp
class Base{
public:
    void func_base();
};
class Derived{
public:
    void func_derived(){
        func_base();
    }
};
```

在`func_derived()`中调用`func_base()`时，编译器首先检查当前作用域内是否有名称`func_base`（当然C++是不允许在函数里定义函数的），
没有找到；然后去父作用域`Derived`中寻找名称`func_base`，仍然未找到；然后去再上一级作用域`Base`中寻找`func_base`，找到了！然后调用`Base::func_base()`。

> 如果还没找到，编译器还会去`Derived`所在命名空间下、全局作用域下寻找。

# 隐藏父类的名称

子类中重写（override）与父类方法同名的方法，将会隐藏父类中所有同名的重载方法。例如：

```cpp
class Base{
public:
    virtual void func()=0;
    void func(int);
};
class Derived: public Base{
public:
    virtual void func();
};
...
Derived d;
d.func(1);      // Error!
```

`Derived`中声明的`func`方法，隐藏了父类中所有的`func`名称，包括所有的重载函数。

# 继承所有重载方法

当你从父类继承来了一系列的重载（overload）方法，而只想重写（override）其中的一个时，可以用`using`，否则其他重载方法会被隐藏。

```cpp
class Derived: public Base{
public:
    using Base::func;
    virtual void func();
};
...
d.func(1);      // OK
```

# 继承一个重载方法

在public继承中，子类和父类是"is-a"的关系（见[Item 32][item32]），所以通常我们希望从父类继承所有的方法。
但如果是private继承（见[Item 39][item39]），
可能你只想要其中的一个，这时可以定义一个转发函数（forwarding function）：

```cpp
class Base{
public:
    virtual void mf1() = 0;
    virtual void mf1(int);
};
class Derived: private Base{
public:
    virtual void f1(){
        Base::mf1();        // 这是一个inline函数，见 Item30
    }
};
```

# 总结

* 子类中的名称会隐藏父类中所有同名的属性。public继承表示这"is-a"的关系，应该避免这样做。
* 使用`using`声明或者转发函数可以使父类名称再次可见。

[item32]: /2015/08/30/effective-cpp-32.html
[item39]: /2015/09/06/effective-cpp-39.html

