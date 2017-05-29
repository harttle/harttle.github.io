---
layout: blog
title: Item 47：使用Traits类提供类型信息

tags: C++ 容器 迭代器 STL traits 指针 模板 特化 编译 
excerpt: C++中的 Traits 类可以在编译期提供类型信息，它是用Traits模板及其特化来实现的。通过方法的重载，可以在编译期对类型进行"if...else"判断。我们通过STL中的一个例子来介绍Traits的实现和使用。
---

> Item 47: Use traits classes for information about types.

C++中的 Traits 类可以在编译期提供类型信息，它是用Traits模板及其特化来实现的。
通过方法的重载，可以在编译期对类型进行"if...else"判断。我们通过STL中的一个例子来介绍Traits的实现和使用。

> 本文以`iterator_traits`为例介绍了如何实现traits类，以及如何使用traits类（在[Item 42][item42]中提到过`iterator_traits`）。
> 其实C++标准库中还提供了很多其他的traits，比如`char_traits`, `numeric_limits`等。

STL提供了很多的容器、迭代器和算法，其中的`advance`便是一个通用的算法，可以让一个迭代器移动n步：

```cpp
template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d);     // 如果d小于0，就逆向移动
```

<!--more-->

# STL迭代器回顾

* 最简单的迭代器是**输入迭代器**（input iterator）和**输出迭代器**（output iterator），
它们只能向前移动，可以读取/写入它的当前位置，但只能读写一次。比如`ostream_iterator`就是一个输出迭代器。

* 比它们稍强的是**前向迭代器**（forward iterator），可以多次读写它的当前位置。
单向链表（`slist`，STL并未提供）和TR1哈希容器的迭代器就属于*前向迭代器*。

* **双向迭代器**（bidirectional iterator）支持前后移动，支持它的容器包括`set`, `multiset`, `map`, `multimap`。

* **随机访问迭代器**（random access iterator）是最强的一类迭代器，可以支持`+=`, `-=`等移动操作，支持它的容器包括`vector`, `deque`, `string`等。

# Tag 结构体

对于上述五种迭代器，C++提供了五种Tag来标识迭代器的类型，它们之间是"is-a"的关系：

```cpp
struct input_iterator_tag {};
struct output_iterator_tag {};
struct forward_iterator_tag: public input_iterator_tag {};
struct bidirectional_iterator_tag: public forward_iterator_tag {};
struct random_access_iterator_tag: public bidirectional_iterator_tag {};
```

现在回到`advance`的问题，它的实现方式显然取决于`Iter`的类型：

```cpp
template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d){
  if (iter is a random access iterator) {
    iter += d;                                      // use iterator arithmetic
  }                                                  // for random access iters
  else {
    if (d >= 0) { while (d--) ++iter; }              // use iterative calls to
    else { while (d++) --iter; }                     // ++ or -- for other
  }                                                  // iterator categories
}
```

怎么得到`Iter`的类型呢？这正是traits的作用。

# Traits

traits允许我们在编译期得到类型的信息。traits并非一个关键字，而是一个编程惯例。

traits的另一个需求在于`advance`对与基本数据类型也能正常工作，比如`char*`。所以traits不能借助类来实现，
于是我们把traits放到模板中。比如：

```cpp
template<typename IterT>          // template for information about
struct iterator_traits;           // iterator types
```

`iterator_traits<IterT>`将会标识`IterT`的迭代器类别。`iterator_traits`的实现包括两部分：

* 用户定义类型的迭代器
* 基本数据类型的指针

# 用户类型的迭代器

在用户定义的类型中，typedef该类型支持迭代器的Tag，例如`deque`支持随机迭代器：

```cpp
template < ... >                    // template params elided
class deque {
public:
  class iterator {
  public:
    typedef random_access_iterator_tag iterator_category;
  }:
};
```

然后在全局的`iterator_traits`模板中`typedef`那个用户类型中的Tag，以提供全局和统一的类型识别。

```cpp
template<typename IterT>
struct iterator_traits {
  typedef typename IterT::iterator_category iterator_category;
};
```

# 基本数据类型的指针

上述办法对基本数据类型的指针是不起作用的，我们总不能在指针里面`typedef`一个Tag吧？
其实这时只需要偏特化`iterator_traits`，因为内置类型指针都是可以随机访问的：

```cpp
template<typename IterT>               // partial template specialization
struct iterator_traits<IterT*>{
  typedef random_access_iterator_tag iterator_category;
};
```

你已经看到了实现一个traits类的整个过程：

1. 确定你希望提供的类型信息。比如你希望提供`deque`的`iterator`类型；
2. 为那个信息起一个名字。比如`iterator_catetory`；
3. 提供一个模板以及必要的特化，来包含你希望提供的类型信息。比如`iterator_traits`。

# advance的实现

我们已经用`iterator_traits`提供了迭代器的类型信息，是时候给出`advance`的实现了。

```cpp
template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d) {
  if (typeid(typename std::iterator_traits<IterT>::iterator_category) ==
    typeid(std::random_access_iterator_tag))
  ...
}
```

上述实现其实并不完美，至少`if`语句中的条件在编译时就已经决定，它的判断却推迟到了运行时（显然是低效的）。
在编译时作此判断，需要为不同的`iterator`提供不同的方法，然后在`advance`里调用它们。

```cpp
template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d) {
  doAdvance(                                              // call the version
    iter, d,                                              // of doAdvance
    typename std::iterator_traits<IterT>::iterator_category()
  );                                                     
}                                                       

// 随机访问迭代器
template<typename IterT, typename DistT>
void doAdvance(IterT& iter, DistT d, std::random_access_iterator_tag) {
  iter += d;
}

// 双向迭代器
template<typename IterT, typename DistT>
void doAdvance(IterT& iter, DistT d, std::bidirectional_iterator_tag) {
  if (d >= 0) { while (d--) ++iter; }
  else { while (d++) --iter; }
}

// 输入迭代器
template<typename IterT, typename DistT>
void doAdvance(IterT& iter, DistT d, std::input_iterator_tag) {
  if (d < 0 ) {
     throw std::out_of_range("Negative distance");    // see below
  }
  while (d--) ++iter;
}
```

总结一下上面代码是如何使用traits类的：

1. 创建一系列的"worker"函数，拥有不同的traits参数。根据traits参数来提供相应的实现；
2. 创建一个"master"函数来调用这些"worker"，并将traits类提供的信息传递给"worker"。

[item42]: /2015/09/09/effective-cpp-42.html
