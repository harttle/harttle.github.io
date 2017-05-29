---
layout: blog
title: Item 38：通过组合表示"拥有"或"以...实现"的关系

tags: C++ 对象组合 继承
excerpt: 一个类型包含另一个类型的对象时，我们这两个类型之间是组合关系。组合是比继承更加灵活的软件复用方法。
---

> Item 38: Model "has-a" or "is-implemented-in-terms-of" through composition.

一个类型包含另一个类型的对象时，我们这两个类型之间是**组合**关系。组合是比继承更加灵活的软件复用方法。
[Item 32][item32]提到public继承的语义是"is-a"的关系。对象组合也同样拥有它的语义：

* 就对象关系来讲，*组合*意味着一个对象拥有另一个对象，是"has-a"的关系；
* 就实现方式来讲，*组合*意味着一个对象是通过另一个对象来实现的，是"is-implemented-in-terms-of"的关系。

<!--more-->

# 拥有

拥有的关系非常直观，比如一个`Person`拥有一个`name`：

```cpp
class Person{
public:
    string name;
};
```

# 以...实现

假设你实现了一个`List`链表，接着希望实现一个`Set`集合。因为你知道代码复用总是好的，于是你希望`Set`能够继承`List`的实现。
这时用public继承是不合适的，`List`是可以有重复的，这一性质不适用于`Set`，所以它们不是"is-a"的关系。
这时用组合更加合适，`Set`以`List`来实现的。

```cpp
template<class T>                   // the right way to use list for Set
class Set {
public:
  bool member(const T& item) const;
  void insert(const T& item);
  void remove(const T& item);
  std::size_t size() const;
private:
  std::list<T> rep;                 // representation for Set data
};
```

`Set`的实现可以很大程度上重用`List`的实现，比如`member`方法：

```cpp
template<typename T>
bool Set<T>::member(const T& item) const {
  return std::find(rep.begin(), rep.end(), item) != rep.end();
}
```

> 复用`List`的实现使得`Set`的方法都足够简单，它们很适合声明成inline函数（见[Item 30][item30]）。

[item30]: /2015/08/28/effective-cpp-30.html
[item32]: /2015/08/30/effective-cpp-32.html
