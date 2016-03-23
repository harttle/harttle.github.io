---
layout: blog
title: Item 38：通过组合表示"拥有"或"以...实现"的关系
subtitle: Effective C++笔记
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

[strategy-pattern]: /assets/img/blog/effective-cpp/strategy-pattern@2x.png
[pointers]: {% post_url 2015-07-05-cpp-pointers-and-references %}
[args]: {% post_url 2015-07-07-cpp-functions-and-arguments %}
[item2]: {% post_url 2015-07-20-effective-cpp-2 %}
[item3]: {% post_url 2015-07-21-effective-cpp-3 %}
[item4]: {% post_url 2015-07-22-effective-cpp-4 %}
[item6]: {% post_url 2015-07-23-effective-cpp-6 %}
[item7]: {% post_url 2015-07-24-effective-cpp-7 %}
[item11]: {% post_url 2015-07-30-effective-cpp-11 %}
[item12]: {% post_url 2015-08-01-effective-cpp-12 %}
[item13]: {% post_url 2015-08-02-effective-cpp-13 %}
[item15]: {% post_url 2015-08-05-effective-cpp-15 %}
[item18]: {% post_url 2015-08-09-effective-cpp-18 %}
[item20]: {% post_url 2015-08-13-effective-cpp-20 %}
[item22]: {% post_url 2015-08-19-effective-cpp-22 %}
[item25]: /2015/08/23/effective-cpp-25.html
[item30]: /2015/08/28/effective-cpp-30.html
[item32]: /2015/08/30/effective-cpp-32.html
[item33]: /2015/08/31/effective-cpp-33.html
[item35]: /2015/09/02/effective-cpp-35.html
[item36]: /2015/09/03/effective-cpp-36.html
