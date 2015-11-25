---
layout: blog
categories: reading
title: Item 42：typename的两种用法
subtitle: Effective C++笔记
tags: C++ 模板 名称隐藏
excerpt: 模板参数前的typename和class没有任何区别；但 typename还可以用来帮编译器识别嵌套从属类型名称，基类列表和成员初始化列表除外。
---

> Item 42: Understand the two meanings of typename.

时至今日还有人在论坛里问模板参数前的`typename`和`class`有何区别：

```cpp
template<typename T> class Widget;
template<class T> class Widget;
```

答案是没有区别！有人觉得`class`写起来方便就用`class`，有人觉得`typename`语义更正确就用`typename`。
然而`typename`和`class`对编译器而言却是不同的东西，这是本节的重点所在。

`typename`可以用来帮编译器识别嵌套从属类型名称，基类列表和成员初始化列表除外。

<!--more-->

# 声明一个类型

`typename`的第一个作用在于声明一个类型。为什么类型还需要声明呢？因为编译器并不是总会知道哪个名称是个类型。
下面的代码会编译错：
 
```cpp
template<typename C>
void print2nd(const C& container){
    if(container.size() >= 2){
        C::const_iterator it(container.begin());
        ++it;
        int value = *it;  
        cout<<value;
    }
}
```

发生编译错误是因为编译器不知道`C::const_iterator`是个类型。万一它是个变量呢？ `C::const_iterator`的解析有着逻辑上的矛盾：
直到确定了`C`是什么东西，编译器才会知道`C::const_iterator`是不是一个类型；
然而当模板被解析时，`C`还是不确定的。这时我们声明它为一个类型才能通过编译：

```cpp
typename C::const_iterator it(container.begin());
```

# 嵌套从属名称

事实上类型`C::const_iterator`依赖于模板参数`C`，
模板中依赖于模板参数的名称称为**从属名称**（dependent name），
当一个从属名称嵌套在一个类里面时，称为**嵌套从属名称**（nested dependent name）。
其实`C::const_iterator`还是一个**嵌套从属类型名称**（nested dependent type name）。

嵌套从属名称是需要用`typename`声明的，其他的名称是不可以用`typename`声明的。比如下面是一个合法的声明：

```cpp
template<typename C>
void f(const C& container, typename C::iterator iter);
```

如果你把`const C&`也声明了`typename`也是要编译错的哦：

```cpp
template<typename C>
void f(typename const C& container, typename C::iterator iter);
```

错误输出：

```
error: expected a qualified name after 'typename'
```

# 一个例外

模板中的嵌套从属名称是需要`typename`声明的，然而有一个例外情况： 
*在派生子类的基类列表中，以及构造函数的基类初始化列表中，不允许`typename`声明*。
例如`Derived<T>`继承自`Base<T>::Nested`：

```cpp
template<typename T>
class Derived: public Base<T>::Nested{  // 继承基类列表中不允许声明`typename`
public:
    explicit Derived(int x): Base<T>::Nested(x){    // 基类初始化列表不允许声明`typename`
        typename Base<T>::Nested tmp;   // 这里是要声明的
    }
};
```

# traits

C++提供了一系列的traits模板，用来提供类型信息。比如：

```cpp
template<typename IterT>
void workWithIterator(IterT it){
    typename std::iterator_traits<IterT>::value_type tmp(*it);
}
```

其实上述模板方法也可以不同traits来实现，比如：

```cpp
template<typename container>
void workWithIterator(typename container::iterator it){
    typename container::value_type tmp(*it);
}
```

但traits提供了更加一致的使用方式以及容器实现的灵活性，模板代码也简洁了不少。
尽管如此，程序员还是懒惰的。我们倾向于用`typedef`来给这些嵌套从属名称起一些别名：

```
template<typename IterT>
void workWithIterator(IterT it){
    typedef typename std::iterator_traits<Iter>::value_type value_type;
    value_type tmp(*it);
}
```

虽然`typedef typename`看起来也很怪异，但你想敲很多遍`typename std::iterator_traits<Iter>::value_type`么？

[dmd]: /assets/img/blog/effective-cpp/dmd.png
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
[item31]: /2015/08/29/effective-cpp-31.html
[item32]: /2015/08/30/effective-cpp-32.html
[item33]: /2015/08/31/effective-cpp-33.html
[item35]: /2015/09/02/effective-cpp-35.html
[item36]: /2015/09/03/effective-cpp-36.html
[item38]: /2015/09/05/effective-cpp-38.html
[item39]: /2015/09/06/effective-cpp-39.html
