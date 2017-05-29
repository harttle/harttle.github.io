---
layout: blog
title: Item 27：最小化类型转换

tags: C++ 类型转换 运算符重载 常量 指针 类型检查 拷贝构造函数
excerpt: C++的类型检查只在编译时执行，运行时没有类型错误的概念。理论上讲只要你的代码可以编译那么就运行时就不会有不安全的操作发生。但C++允许类型转换，也正是类型转换破坏了理论上的类型系统。
---

> Item 27: Minimize casting.

**C++的类型检查只在编译时执行，运行时没有类型错误的概念。
理论上讲只要你的代码可以编译那么就运行时就不会有不安全的操作发生。
但C++允许类型转换，也正是类型转换破坏了理论上的类型系统。**

在C#，Java等语言中类型转换会更加必要和频繁，但它们总是安全的。C++则不然，
这要求我们在类型转换时格外小心。C++中的类型转换有三种方式：

1. C风格的类型转换：

    ```cpp
    (T) expression
    ```

2. 函数风格的类型转换：

    ```cpp
    T(expression)
    ```

3. C++风格的类型转换。包括`const_cast`, `dynamic_cast`, `reinterpret_cast`, `static_cast`。

<!--more-->

* `const_cast`用于去除常量性质。
* `dynamic_cast`用于安全向下转型，有运行时代价。
* `reinterpret_cast`低级类型转换，它实现相关的因而不可移植。
* `static_cast`强制进行隐式类型转换，例如`int`到`double`，非常量到常量（反过来不可！只有`const_cast`可以做这个）等。

# 为什么用C++风格？

C风格转型和函数风格转型没有区别，只是括号的位置不一样。C++风格的类型转换语义更加明确（编译器会做更详细的检查）不容易误用，
另外也更容易在代码中找到那些破坏了类型系统的地方。所以尽量用C++风格的转型，比如下面代码中，后者是更好的习惯：

```cpp
func(Widget(15));
func(static_cast<Widget>(15));
```

# 类型转换做了什么？

很多人认为类型转换只是告诉编译器把它当做某种类型。事实上并非如此，比如最常见的数字类型转换：

```cpp
int x,y;
double d = static_cast<double>(x)/y;
```

上述的类型转换一定是产生了更多的二进制代码，因为多数平台中`int`和`double`的底层表示并不一样。再来一个例子：

```cpp
Derived d;        // 子类对象
Base *pb = &d;    // 父类指针
```

同一对象的子类指针和父类指针有时并不是同一地址（取决于编译器和平台），而运行时代码需要计算这一偏移量。
一个对象会有不同的地址是C++中独有的现象，所以不要对C++对象的内存分布做任何假设，更不要基于该假设做类型转换。
这样可以避免一些未定义行为。Scott Meyers如是说：

> The world is filled with woeful programmers who've learned this lesson the hard way.

# 需要转型吗？

C++类型转换有趣的一点在于，很多时候看起来正确事实上却是错误的。比如`SpecialWindow`继承自`Window`，
它的`onResize`需要调用父类的`onResize`。一个实现方式是这样的：

```cpp
class SpecialWindow: public Window{
public:
    virtual void onResize(){
        // Window onResize ...
        static_cast<Window>(*this).onResize();
        
        // SpecialWindow onResize ...
    }
};
```

这样写的结果是当前对象父类部分被拷贝（调用了`Window`的拷贝构造函数），并在这个副本上调用`onResize`。
当前对象的`Window::onResize`并未被调用而`SpetialWindow::onResize`的后续代码被执行了，
如果后续代码修改了属性值，那么当前对象将处于无效的状态。正确的方法也很显然：

```cpp
class SpecialWindow: public Window{
public:
    virtual void onResize(){
        // Window onResize ...
        Window::onResize();
        // SpecialWindow onResize ...
    }
};
```

这个例子说明，当你想要转型时可能已经误入歧途了。此时需要仔细考虑一下是否真的需要转型？

# dynamic_cast的性能问题

在一般的实现中`dynamic_cast`会逐级地比较类名。比如4级的继承结构，`dynamic_cast<Base>`将会调用4次`strcmp`才能确定最终的那个子类型。
所以在性能关键的部分尽量避免`dynamic_cast`。通常有两种途径：

1. 使用子类的容器，而不是父类容器。比如

    ```cpp
    vector<Window> v;
    dynamic_cast<SpecialWindow>(v[0]).blink();
    ```

    换成子类容器就好了嘛；
    
    ```cpp
    vector<SpecialWindow> v;
    v[0].blink();
    ```
    
    但这样你就不能在容器里放其他子类的对象了，你可以定义多个类型安全的容器来分别存放这些子类的对象。

2. 通过虚函数提供统一的父类接口。比如：

    ```cpp
    class Window{
    public:
        virtual void blink();
        ...
    };
    class SpecialWindow: public Window{
    public:
        virtual void blink();
        ...
    };
    vector<Window> v;
    v[0].blink();
    ```

这两个方法并不能解决所有问题，但如果可以解决你的问题，你就应该采用它们来避免类型转换。
这取决于你的使用场景，但可以确定的是，连续的`dynamic_cast`一定要避免，比如这样：

```cpp
if(SpecialWindow1 *p = dynamic_cast<SpecialWindow1*>(it->get()){...}
else if(SpecialWindow2 *p = dynamic_cast<SpecialWindow2*>(it->get()){...}
else if(SpecialWindow3 *p = dynamic_cast<SpecialWindow3*>(it->get()){...}
...
```

这样的代码性能极差，而且又代码维护问题：当你又来一个`SpecialWindow4`的时候你需要再次找到这段代码来进行扩展。
使用虚函数完全可以替代上述的实现。

# 总结

好的C++很少使用转型。但转型是不可避免的，比如`int`到`double`的转换就很好用，省的定义一个新的`double`并用`int来初始化它。
像其他的可读性差的代码一样，你应该把转型封装到函数里面去。总之：

1. 如果可以就避免转型，尤其是性能较差的`dynamic_cast`。可以通过更好的设计来避免转型。
2. 如果一定要转型，把它藏到函数里面去。别把转型的代码转移给客户。
3. 尽量用C++风格转型，而不是旧式的风格。这样更容易识别，语义也更加明确。
