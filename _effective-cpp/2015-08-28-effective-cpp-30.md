---
layout: blog
title: Item 30：理解inline函数的里里外外

tags: C++ inline 宏 模板 虚函数 成员函数 构造函数 析构函数
excerpt: inline(内联函数)避免了宏的缺点，也不需要付出函数调用的代价。也方便了编译器基于上下文的优化。但inline函数可能会造成目标代码膨胀和指令缓存的Miss。
---

> Item 30: Understanding the ins and outs of lining.

inline（内联）函数的好处太多了：它没有宏的那些缺点，见[Item 2：避免使用define][item2]；而且不需要付出函数调用的代价。
同时也方便了编译器基于上下文的优化。但inline函数也并非免费的午餐：

它会使得目标代码膨胀，运行时会占用更多的内存，甚至引起缓存页的失效和指令缓存的Miss，这些都会造成运行时性能的下降。
但是另一方面，如果inline函数足够小以至于生成的目标代码比函数调用还小，那么inline函数会产生更小的目标代码以及更高的指令缓存命中率。

本文便来讨论一些典型的适合inline的场景，以及容易误用inline的地方。

<!--more-->

# 声明方式

可能很多开发者不知道，inline只是对编译器的一个请求而非命令。该请求可以隐式地进行也可以显式地声明。

> 当你的函数较复杂（比如有循环、递归），或者是虚函数时，编译器很可能会拒绝把它inline。因为虚函数调用只有运行时才能决定调用哪个，而inline是在编译器便要嵌入函数体。
> 有些编译器在dianotics级别编译时，会对拒绝inline给出warning。

隐式的办法便是把函数定义放在类的定义中：

```cpp
class Person{
    ...
    int age() const{ return _age;}  // 这会生成一个inline函数！
};
```

> 例子中是成员函数，如果是友元函数也是一样的。除非友元函数定义在类的外面。

显式的声明则是使用`inline`限定符：

```cpp
template<typename T>
inline const T& max(const T& a, const T& b){ return a<b ? b: a;}
```

# 模板与inline

可能你也注意到了inline函数和模板一般都定义在头文件中。这是因为inline操作是在编译时进行的，而模板的实例化也是编译时进行的。
所以编译器时便需要知道它们的定义。

> 在绝大多数C++环境中，inline都发生在编译期。有些环境下也可以在链接时进行inline，尤其在.NET中可以运行时进行inline。

但**模板实例化和inline是两个过程**，如果你的函数需要做成inline的就把它声明为inline（也可以隐式地），否则仍然把它声明为正常的函数。

# 取函数地址

有些适合inline的函数编译器仍然不能把它inline，比如你要取一个函数的地址时：

```cpp
inline void f(){}
void (*pf)() = f;

f();        // 这个调用将会被inline，它是个普通的函数调用
pf();       // 这个是通过指针调用的，不会被inline
```

# 构造/析构函数

构造析构函数看起来很适合inline，但事实并非如此。我们知道C++会在对象创建和销毁时保证做很多事情，比如调用`new`时会导致构造函数被调用，
退出作用域时析构函数被调用，构造函数调用前成员对象的构造函数被调用，构造失败后成员对象被析构等等。

这些事情不是平白无故发生的，编译器会生成一些代码并在编译时插入你的程序。比如编译后一个类的构造过程可能是这样的：

```cpp
Derived::Derived(){
    Base::Base();
    try{ data1.std::string::string(); }
    catch(...){
        Base::Base();
        throw;
    }
    try{ data2.std::string::string(); }
    catch(...){
        data1.std::string::~string();
        Base::~Base();
        throw;
    }
    ...
}
```

`Derived`的析构函数、`Base`的构造和析构函数也是一样的，事实上构造和析构函数会被大量地调用。
如果全部inline的话，这些调用都会被扩展为函数体，势必会造成目标代码膨胀。

如果你是库的设计者，那么你的接口函数的`inline`特性的变化将会导致客户代码的重新编译。
因为如果你的接口是inline的，那么客户需要将函数体展开编译到客户的目标代码中。

# 总结

那么我们应当如何决定是否inline呢？最初我们不应inline任何东西，除非它是必须被inline的或者真的是很显然（比如前述的`age()`方法）。
况且只有20%的代码会决定80%的性能，当我们遇到那20%性能关键的部分时再去inline它不迟！

> inline函数也是不易调试的。。因为它被inline了。

* 最小化inline的使用。
* 不要因为函数模板在头文件中就要把它inline。

[item2]: /2015/07/20/effective-cpp-2.html
