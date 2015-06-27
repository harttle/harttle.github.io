---
layout: blog 
categories: reading
title: C++手稿：虚函数与多态
tags: cpp polymorphism inheritance
---

C++类继承带来了诸多好处：基类代码复用、通用的方法和属性、更好的可维护性，
然而最大的好处莫过于提供统一的接口。接口是一种对类型的抽象，它统一了一系列类的行为，
不同类的对象之间交互更加容易。Java、objective C等面向对象语言都提供了接口的概念，
在C++中，可以通过抽象类来实现一个接口。

C++通过虚函数实现了多态：通过基类指针或引用调用虚函数时，会调用当前对象的实际类型中声明的函数。
为了这个特性，包含虚函数的C++对象中会存储一个虚函数表指针，来完成动态联编。

> 编译程序在编译阶段并不能确切知道将要调用的函数，只有在程序运行时才能确定将要调用的函数，
> 为此要确切知道该调用的函数，要求联编工作要在程序运行时进行，
> 这种在程序运行时进行联编工作被称为**动态联编**。

# 虚函数

虚函数通过`virtual`关键字来声明。

```cpp
class CPerson{
public:
    virtual void hello(){
        cout<<"I'm a person"<<endl;
    }
};
class CMan: public CPerson{
public:
    // 子类中不必声明virtual
    void hello(){
        cout<<"I'm a man"<<endl;
    }
};
CPerson *p = new CMan();
p->hello();
// I'm a man
```

上述代码中，通过基类指针调用虚函数时，子类的同名函数得到了执行。多态在C++中有三种形态：

1. 通过基类指针调用基类和子类的同名虚函数时，会调用对象的实际类型中的虚函数。
2. 通过基类引用调用基类和子类的同名虚函数时，会调用对象的实际类型中的虚函数。
3. 基类或子类的成员函数中调用基类和子类的同名虚函数，会调用对象的实际类型中的虚函数。

# 纯虚函数

虚函数的声明以`=0`结束，便可将它声明为纯虚函数。包含纯虚函数的类不允许实例化，称为**抽象类**。
事实上纯虚函数提供了面向对象中接口的功能。当然，这样的接口是以继承的方式实现的。

```cpp
class CPerson{
public:
    virtual void hello() = 0;
};
CPerson p;  // compile error
```

注意空方法、纯虚函数、方法声明的区别。类声明中的空方法给出了方法声明+方法定义。
只声明但没有定义的方法将会产生链接错，无论是否被调用过。

```cpp
class CPerson{
public:
    void empty(){};
    void declare();
};
CPerson::declare(){
    // ...
};
```

# 访问级别

虚函数的调用会在运行时动态匹配当前类型，然而成员函数的访问性检查是语法检查的一部分，在编译期完成。
如果虚函数在父类中是Private，即使在子类中是Public，也不可以通过父类指针调用它：

```cpp
class CPerson{
    virtual void hello(); 
};
class CMan: public CPerson{
public:
    virtual void hello(); 
};

CPerson* p = new CMan;
p->hello(); // 编译错
```

# 虚析构函数

虚函数的机制使得我们可以通过更加通用的基类指针来操作对象。然而使用基类指针来`delete`对象则面临着问题：

```cpp
CPerson *p = new CMan();
delete p;
```

上述代码只会回收`CMan`中`CPerson`部分所占用的内存，执行了`CPerson`的析构函数，却没有执行`CMan`的虚构函数。
解决办法很容易理解：将析构函数设为`virtual`。

> 构造函数不允许是虚函数。

```cpp
class CPerson{
public: 
    virtual ~CPerson(){};
};
class CMan: public CPerson{
public:
    ~CMan(){}; 
};
CPerson *p = new CMan();
delete p;
```

这样，`delete`时会先调用`~CMan()`在调用`~CPerson()`。

# 构造函数调用虚函数

当执行构造函数时，当前对象的类型为构造函数所属在的类。
所以在构造函数中调用虚函数和调用普通函数是一样的，不会动态联编，
被调用的函数来自自己或者基类。

```cpp
class CPerson{
public:
    virtual void hello(){
        cout<<"I'm a person"<<endl;
    }
    virtual void bye(){
        cout<<"Bye, person"<<endl;
    }
};
class CMan: public CPerson{
public:
    CMan(){
        hello();
        bye();
    }
    void hello(){
        cout<<"I'm a man"<<endl;
    }
};
class CReek: public CMan{
public:
    void hello(){
        cout<<"I'm a reek"<<endl;
    }
    void bye(){
        cout<<"Bye, reek"<<endl;
    }
};

int main(){
    CReek r;
    return 0;
}
```

上述的调用结果是：

```
I'm a man
Bye, person
```

`hello`和`bye`都是虚函数，其中`hello`三个层级都有定义，但被执行的是当前类`CMan`中的定义；
`bye`在上下两个层级有定义，被执行的是上一级类`CPerson`中的定义。
可见，构造函数执行时当前对象的类型是定义构造函数的类。
