---
layout: blog 
categories: reading
title: C++手稿：对象的生命周期，构造与析构
tags: C++ 构造函数 析构函数
redirect_from:
  - /reading/cpp-object-lifecycle.html
  - /2015/06/22/cpp-object-lifecycle/
---

# 类的声明

C++引入类的概念来实现面向对象程序设计，先来看一个简单的类的声明：

```cpp
class CPerson{
    public: 
    // 构造函数
    CPerson(){
        cout<<"constructor"<<endl;
    }
    // 构造函数（重载）
    CPerson(int age){
        cout<<"constructor "<<age<<endl;
    }
    
    // 声明可以与实现分离
    void Hello(); 
};

CPerson::Hello(){
    cout<<"hello"<<endl;
};
```

* 构造函数定义为私有，可以防止该类被直接实例化。一般用于Singleton实现。
* 不允许签名为`CPerson(CPerson p){}`的构造函数（编译错）。

> 构造函数可以有参数，不允许有返回值。

# 对象实例化

可以直接定义对象变量，在栈中分配并初始化对象；也可以定义对象指针，从堆中分配空间并初始化对象。

```cpp
CPerson p1;
CPerson p2(2);
CPerson* p3 = new CPerson(3);
```

输出：

```
constructor
constructor 2
constructor 3
```

<!--more-->

# 对象数组

在C++中类是一种数据类型，与基本数据类型相似，可以使用数组的初始化语法：

```cpp
CPerson arr[3] = {1, CPerson(2)};
```

输出：

```
constructor 1
constructor 2
constructor
```

定义了参数为整型的构造函数后，该类与整型就成为了兼容的类型，即整型可以强制转换为该类的对象。

# 对象指针数组

```cpp
CPerson *p[3] = {new CPerson(1), new CPerson(2)};
```

输出：

```
constructor 1
constructor 2
```

对象指针`CPerson *`与`int`并非兼容的类型，因而需显式地指定指针类型的表达式（`new CPerson(1)`）。
同时，未指定项的指针值为空。

# 复制构造函数

类的声明中，签名为`CPerson(CPerson&)`的方法称为复制构造函数，用来从一个已存在的对象复制生成一个新的对象。
在如下三种情况下会被调用：

1. 用一个对象初始化另一个对象时。例如：

    ```cpp
    CPerson p2(p1);
    CPerson p2 = p1;
    ```
    
2. 对象作为参数传递时。例如：

    ```cpp
    void func(A a){}
    ```

3. 对象作为返回值时。例如：

    ```cpp
    A func(){ A a; return a;}
    ```

只有一个参数的复制构造函数可以被称为转换构造函数。当需要类型转换时，会被调用：

```cpp
CPerson = 2;    // CPerson(int) called
```

> 注意区分赋值和初始化：对象变量间赋值不会调用复制构造函数。赋值只会按位拷贝对象所在的内存。

# 析构函数

类的声明中，签名为`~CPerson()`的方法称为析构函数。析构函数没有参数和返回值。当对象生命周期结束时被调用，通常用来释放资源。

一个类只能由一个析构函数。析构函数与构造函数类似，用户不指定时编译器会生成一个缺省的析构（构造）函数，
缺省的析构（构造）函数是空函数。

# 对象生命周期

如下程序解释了对象的声明周期何时开始，以及何时结束。涉及到了：全局对象、静态对象、栈中的对象、堆中的对象。

```cpp
CPerson p1;             // main执行前，构造函数被调用
void func(){
    static CPerson p2;  // func第一次执行前，构造函数被调用
    CPerson p3;         // p3的构造函数被调用
                        // func结束时，p3的析构函数被调用
}  
int main(){
    CPerson p4, *p5;    // 调用p4的构造函数
    func();
    p5 = new CPerson;   // 调用p5的构造函数
    delete p5;          // 调用p5的析构函数
                        // main结束时，p4的析构函数被调用
}
                        // 程序结束前，p1, p2的析构函数被调用
```
