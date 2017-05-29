---
layout: blog
title: Item 44：将参数无关代码重构到模板外去

tags: C++ 内存 多态 模板 
excerpt: 把模板中参数无关的代码重构到模板外便可以有效地控制模板产生的代码膨胀。另外代码膨胀也可以由类型模板参数产生：对于非类型模板参数产生的代码膨胀，用函数参数或数据成员来代替模板参数即可消除冗余；对于类型模板参数产生的代码膨胀，可以让不同实例化的模板类共用同样的二进制表示。
---

> Item 44: Factor parameter-independent code out of templates.

模板是个好东西，你可以在实现类型安全的同时少写很多代码。但**模板提供的是编译期的多态**，
即使你的代码看起来非常简洁短小，生成的二进制文件也可能包含大量的冗余代码。
因为模板每次实例化都会生成一个完整的副本，所以其中与模板参数无关的部分会造成**代码膨胀**（code bloat）。

把模板中参数无关的代码重构到模板外便可以有效地控制模板产生的代码膨胀。
另外代码膨胀也可以由类型模板参数产生：

* 对于非类型模板参数产生的代码膨胀，用函数参数或数据成员来代替模板参数即可消除冗余；
* 对于类型模板参数产生的代码膨胀，可以让不同实例化的模板类共用同样的二进制表示。

<!--more-->

# 抽取公共代码

在避免代码冗余的问题上，**抽取公共代码**（commonality and variability analysis）是我们每天都在用的方法。
当你写几个函数时，会把其中的公共部分抽取到另一个函数；当你声明类时，也会把它们的公共部分抽取到父类中。

于是你希望在模板编程中也用该办法来避免代码重复，但模板和非模板代码在这一点上是不同的：

* 非模板的代码中，冗余的显式的（explicit）。只要有重复代码你都会看到它；
* 模板代码中，冗余是隐式的（implicit）。模板代码只有一份，模板被实例化时产生的冗余需要你的直觉才能感受到。

# 模板产生的代码膨胀

现在来看一个模板是怎样引发代码膨胀的。比如要实现一个固定大小的矩阵，它支持转置运算。

```cpp
template<typename T, int n>
class Square{
public:
    void invert();
};
```

> 其中的`int n`是一个非类型参数，它也是一种合法的模板参数~

然后可能会这样使用该模板：

```cpp
Square<double, 5> s1;
Square<double, 10> s2;
s1.invert();    s2.invert();
```

`Square`模板会实例化两个类：`Square<double, 5>`和`Square<double, 10>`，它们拥有相同的`invert`方法。
这是模板产生代码膨胀的典型场景。

# 抽取父类模板

结局模板产生的代码膨胀，仍然是用抽取公共代码的办法。如果你真的看到了二进制代码中两个相同的`invert`函数，
你的直觉肯定是把它抽取到另一个类中：

```cpp
template<typename T>
class SquareBase{
protected:
    void invert(int size);
};

template<typename T, int n>
class Square:private SquareBase<T>{
private:
    using SquareBase<T>::invert;
public:
    void invert(){ this->invert(n); }
}
```

因为`invert`函数定义在基类中，所以它只会在二进制代码中出现一次，即`SquareBase<double>::invert`。该函数由两个子类共享。
上述代码中有些细节还值得一提：

* `SquareBase::invert`是供子类用的，所以声明为`private`而不是`public`；
* 调用父类`invert`的代价为零，因为`Square::invert`是隐式的inline函数，见[Item 30][item30]；
* 使用`this->`前缀是因为，`SquareBase`里的名称在子类模板`Square`里是隐藏的，见[Item 43][item43]；
* 使用`private`继承是因为，`Square` is implemented in terms of `Square`，见[Item 39][item39]。

# 数据存储问题

既然我们决定由父类来做`invert`操作，那么父类怎么访问数据呢？因为数据本来是在子类中的。
当然我们可以在调用`SquareBase::invert`时把内存地址也一起告知父类，
但如果矩阵类中有很多函数都需要这些信息呢？我们可能需要调用每个函数时都把这些信息传递给父类函数。
既然这样，何不把数据地址直接放在父类中？既然父类存放了数据，那么就把矩阵大小也一并存放了吧！

```cpp
template<typename T>
class SquareBase{
protected:
    SquareBase(int _n, T *_data): n(_n), data(_data){}
    void setData(T *_data){
        data = _data;
    }
private:
    int n;
    T* data;
};
```

父类中存储了矩阵数据的位置（`data`）以及大小（`n`），子类仍然可以决定如何分配地址空间。
可以存放在子类中作为成员属性，也可以动态申请内存。

# 权衡

不管数据是怎样分配和访问的，我们消除代码重复的方案是确定的：将公共部分抽取到父模板类中。
这样做的好处便是避免了代码膨胀，减小了二进制文件和"working set"的大小，有利于提高指令缓存的命中率，
从而达到更高的代码执行效率。但提取公共部分到新的模板类也造成了一些问题：

* 如果`int n`硬编码在模板参数中的话，编译器能做更多的优化，比如常量传播等。但`int n`作为函数参数，这些优化就没有了。
* 添加类的层级会导致对象大小的增加。至少多存储了一个`T* data`指针。

实践中到底是否应该抽取公共代码出来取决于你的应用场景，在上述的优劣中进行权衡。

本问讨论的是非类型模板参数，对于类型模板参数，代码膨胀的问题也是存在的，比如

* `int`和`long`在多数平台都是一样的底层实现，然而模板却会实例化为两份，因为它们类型不同。
* `List<int *>`, `List<const int *>`, `List<double *>`的底层实现也是一样的。但因为指针类型不同，也会实例化为多份模板类。

[item30]: /2015/08/28/effective-cpp-30.html
[item39]: /2015/09/06/effective-cpp-39.html
[item43]: /2015/09/10/effective-cpp-43.html
