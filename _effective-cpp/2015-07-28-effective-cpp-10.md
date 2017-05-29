---
layout: blog
title: Item 10：赋值运算符要返回自己的引用

tags: C++ 引用 运算符 链式调用 赋值运算符 运算符重载
excerpt: 这是关于赋值运算符的编程惯例，用来支持链式的赋值语句。
---

> Item 10：Have assignment operators return a reference to *this.

这是关于赋值运算符的编程惯例，用来支持链式的赋值语句：

```cpp
int x, y, z;
...
x = y = z = 1;
```

在C++中，它相当于：

```cpp
x = ( y = ( z = 1 ) );
```

这是因为`=`运算符是右结合的，链式赋值时会从右向左运算。链式写法的赋值已经成为了惯例，
所以我们自定义的对象最好也能支持链式的赋值，这需要重载`=`运算符时返回当前对象的引用：

```cpp
class Widget {
public:
    Widget& operator=(const Widget& rhs){   // return type is a reference to
      return *this;                         // return the left-hand object
    }
    Widget& operator+=(const Widget& rhs){  // the convention applies to
       return *this;                        // +=, -=, *=, etc.
    }
};
```

说到运算符的结合性，不妨来研究一下最费解的运算符`,`的行为。首先，它的返回值是后面表达式的值：

```cpp
int a;
a = (1, 2, 3);
cout<<a<<endl;
```

上述代码的输出结果是`3`。如果你写成了`a = 1, 2, 3`，输出结果将会是`1`。
因为`=`运算符的优先级高于`,`，此时第一个表达式变成了`a = 1`，第二个是`b`，第三个是`c`。
那么结合性呢？`,`运算符是左结合的：

```cpp
cout<<1, cout<<2, cout<<3;
```

输出是：

```
123
```
