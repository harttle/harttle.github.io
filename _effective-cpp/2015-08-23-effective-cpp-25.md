---
layout: blog
title: Item 25：考虑实现一个不抛异常的swap

tags: C++ STL 异常 模板 特化 作用域 函数重载 
excerpt: 提供一个更加高效的，不抛异常的共有成员函数（比如`Widget::swap`）。在你类（或类模板）的同一命名空间下提供非成员函数`swap`，调用你的成员函数。如果你写的是类而不是类模板，请偏特化`std::swap`，同样应当调用你的成员函数。调用时，请首先用`using`使`std::swap`可见，然后直接调用`swap`。 
---

> Item 25: Consider support for a non-throwing swap.

Swap函数最初由STL引入，已经成为异常安全编程（见[Item 29][item29]）的关键函数，
同时也是解决自赋值问题（参见[Item 11：赋值运算符的自赋值问题][item11]）的通用机制。
`std`中它的基本实现是很直观的：

```cpp
namespace std{
    template<typename T>
    void swap(T& a, T& b){
        T tmp(a);
        a = b;
        b = tmp;
    }
}
```

可以看到，上述Swap是通过赋值和拷贝构造实现的。所以`std::swap`并未提供异常安全，
但由于Swap操作的重要性，我们应当为自定义的类实现异常安全的Swap，这便是本节的重点所在。

<!--more-->

# 类的Swap

先不提异常安全，有时`std::swap`并不高效（对自定义类型而言）。
比如采用 pimpl idiom（见[Item 31][item31]）设计的类中，只需要交换实现对象的指针即可：

```cpp
class WidgetImpl;
class Widget {           // pimpl idiom 的一个类
    WidgetImpl *pImpl;   // 指向Widget的实现（数据）        
public:
    Widget(const Widget& rhs);
}; 

namespace std {
    template<>                      // 模板参数为空，表明这是一个全特化
    void swap<Widget>(Widget& a, Widget& b){   
        swap(a.pImpl, b.pImpl);     // 只需交换它们实体类的指针 
    }
}
```

上述代码是不能编译的，因为`pImpl`是私有成员！所以，`Widget`应当提供一个`swap`成员函数或友元函数。
惯例上会提供一个成员函数：

```cpp
class Widget {
public:       
  void swap(Widget& other){
    using std::swap;          // 为何要这样？请看下文
    swap(pImpl, other.pImpl);
  }
};
```

接着我们继续特化`std::swap`，在这个通用的Swap中调用那个成员函数：

```cpp
namespace std {
  template<>
  void swap<Widget>(Widget& a, Widget& b){
      a.swap(b);              // 调用成员函数
  }
}
```

到此为止，我们得到了完美的`swap`代码。上述实现与STL容器是一致的：**提供共有`swap`成员函数，
并特化`std::swap`来调用那个成员函数**。

# 类模板的Swap

当`Widget`是类模板时，情况会更加复杂。按照上面的Swap实现方式，你可能会这样写：

```cpp
template<typename T>
class WidgetImpl { ... };

template<typename T>
class Widget { ... };

namespace std {
    template<typename T>
    // swap后的尖括号表示这是一个特化，而非重载。
    // swap<>中的类型列表为template<>中的类型列表的一个特例。
    void swap<Widget<T> >(Widget<T>& a, Widget<T>& b){
        a.swap(b); 
    }
}
```

悲剧的是，上述代码不能通过编译。C++允许偏特化类模板，却不允许偏特化函数模板（虽然在有些编译器中可以编译）。
所以我们干脆不偏特化了，我们来重载`std::swap`函数模板：

```cpp
namespace std {
    template<typename T>
    // 注意swap后面没有尖括号，这是一个新的模板函数。
    // 由于当前命名空间已经有同名函数了，所以算函数重载。
    void swap(Widget<T>& a, Widget<T>& b){
        a.swap(b); 
    }
}
```

这里我们重载了`std::swap`，相当于在`std`命名空间添加了一个函数模板。这在C++标准中是不允许的！
C++标准中，客户只能特化`std`中的模板，但不允许在`std`命名空间中添加任何新的模板。
上述代码虽然在有些编译器中可以编译，但会引发未定义的行为，所以不要这么搞！

那怎么搞？办法也很简单，就是别在`std`下添加`swap`函数了，把`swap`定义在`Widget`所在的命名空间中：

```cpp
namespace WidgetStuff {
    template<typename T> 
    class Widget { ... };
  
    template<typename T> 
    void swap(Widget<T>& a, Widget<T>& b){
        a.swap(b);
    }
}
```

任何地方在两个`Widget`上调用`swap`时，C++根据其argument-dependent lookup（又称 Koenig lookup）
会找到`WidgetStuff`命名空间下的具有`Widget`参数的`swap`。

那么似乎**类的Swap**也只需要在同一命名空间下定义`swap`函数，而不必特化`std::swap`。
但是！有人喜欢直接写`std::swap(w1, w2)`，特化`std::swap`可以让你的类更加健壮。

> 因为指定了调用`std::swap`，argument-dependent lookup 便失效了，`WidgetStuff::swap`不会得到调用。

说到这里，你可能会问如果我希望优先调用`WidgetStuff::swap`，如果未定义则取调用`std::swap`，那么应该如何写呢？
看代码：

```cpp
template<typename T>
void doSomething(T& obj1, T& obj2){
  using std::swap;           // 使得`std::swap`在该作用域内可见
  swap(obj1, obj2);          // 现在，编译器会帮你选最好的Swap
}
```

此时，C++编译器还是会优先调用指定了T的`std::swap`，其次是`obj1`的类型`T`所在命名空间下的对应`swap`函数，
最后才会匹配`std::swap`的默认实现。

# 最佳实践

如何实现Swap呢？总结一下：

1. 提供一个更加高效的，不抛异常的共有成员函数（比如`Widget::swap`）。
2. 在你类（或类模板）的同一命名空间下提供非成员函数`swap`，调用你的成员函数。
3. 如果你写的是类而不是类模板，请偏特化`std::swap`，同样应当调用你的成员函数。
4. 调用时，请首先用`using`使`std::swap`可见，然后直接调用`swap`。

[item11]: /2015/07/30/effective-cpp-11.html
[item29]: /2015/08/27/effective-cpp-29.html
[item31]: /2015/08/29/effective-cpp-31.html
