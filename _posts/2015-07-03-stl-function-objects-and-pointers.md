---
layout: blog 
categories: reading
title: C++手稿：STL中的函数对象与函数指针
tags: c++ stl function-object function-pointer
---

先来感受一下C++中的函数对象和函数指针：

```cpp
template<typename T>
void printer(int a, int b, T func){
    cout<<func(a, b)<<endl;
}
```

在STL中定义了很多像上面这样的模板，这里的T是一个可调用（实现了括号运算符）的东西。
这使得我们在使用模板时可以指定一个计算策略，它可以是函数对象，也可以是函数指针。

> `Less<int>`便是一个常见的函数对象，常用来配置容器或算法。`<functional>`中定义了很多这样的函数对象。

# 函数指针

函数指针通常用来将函数传参或存储。例如：

```cpp
int sum(int a, int b){
    return a+b;
}
int main(){
    printer(2, 3, sum);
    return 0;
}
```

上述的`printer`调用方式，编译器会生成对应的函数实例：

```cpp
void printer(int a, int b, int (*func)(int, int)){
    cout<<func(a, b)<<endl;
}
```

这里`T`的类型是`int (*)(int, int)`。

> 如果你是python或者javascript程序员的话，上述过程没有什么特别的。
> 唯一要注意的是`func`的声明方式，星号要和标识符括起来：`(*func)`。

# 函数对象

函数对象是重载了括号运算符的类的实例，它也可以这样调用：`func(a, b)`。例如：

```cpp
class Sum{
public:
    int operator()(int a, int b){
        return a+b;
    }
};

int main(){
    printer(2, 3, Sum());
    return 0;
}
```

编译器会生成这样的函数实例：

```cpp
void printer(int a, int b, Sum s){
    cout<<s(a, b)<<endl;
}
```

> 函数对象可以实现更加复杂的有状态的运算，因为对象可以有更多的属性和方法。

<!--more-->

# std::accumulate

```cpp
#include <iostream>     // std::cout
#include <functional>   // std::minus
#include <numeric>      // std::accumulate

int myfunction (int x, int y) {return x+2*y;}
struct myclass {
	  int operator()(int x, int y) {return x+3*y;}
} myobject;

int main () {
    int init = 100;
    int numbers[] = {10,20,30};
  
    std::cout << std::accumulate(numbers,numbers+3,init) << std::endl;
    std::cout << std::accumulate (numbers, numbers+3, init, std::minus<int>()) << std::endl;
    std::cout << std::accumulate (numbers, numbers+3, init, myfunction) << std::endl;
    std::cout << std::accumulate (numbers, numbers+3, init, myobject) << std::endl;
  
    return 0;
}
```

在这里`accumulate`的第四个参数默认值为`std::plus<int>()`，是一个函数对象，
`std::minus<int>()`也是一个函数对象，它们都是在`functional`中定义的。
`myfunction`是函数指针，而`myobject`是自定义的函数对象。输出如下：

```
160
40
220
280
```

摘自cplusplus.com： http://www.cplusplus.com/reference/numeric/accumulate

# 比较器：std::sort

需要比较元素大小的STL算法、容器的模板、容器的成员函数，都可以给定一个比较策略。它们的默认值通常是`Less<T>()`。

例如，指定`greater`函数对象作为比较器，就可以实现反向排序：

```cpp
sort(v.begin(), v.end(), greater<int>());
```

> `std::sort`要求随机存取迭代器，`list`不可用`std::sort`，可以使用`list::sort(Pred pr)`。

`std::sort`实际上是快排，复杂度为$O(n lgn)$，它是不稳定的。`stale_sort`则是稳定的归并排序。

# 比较器：模板参数

关联容器通常使用搜索树来实现，所以插入元素时需要进行比较操作。
我们在使用容器模板时可以指定比较器：

```cpp
class A{
    int n;
public:
    A(int _n):n(_n){}
    bool operator<(const A& lhs, const A& rhs){
        return lhs.n < rhs.n;
    }
};
multiset<A, less<A>> s;
s.insert(A());
```

默认情况下关联容器使用`less`模板来进行元素比较，而`less`中调用了`<`，
所以默认情况下插入关联容器的元素需要实现`<`运算符：


> 如果未实现相应的比较运算符，`insert`操作会编译错。因为运算符调用本质上是函数调用。

[deque]: http://www.cplusplus.com/reference/deque/deque/
[list]: http://www.cplusplus.com/reference/list/list/
[queue]: http://www.cplusplus.com/reference/queue/queue
[priority_queue]: http://www.cplusplus.com/reference/queue/priority_queue/
[vector]: http://www.cplusplus.com/reference/vector/vector
[set]: http://www.cplusplus.com/reference/set/set
[multiset]: http://www.cplusplus.com/reference/set/multiset
[map]: http://www.cplusplus.com/reference/map/map
[multimap]: http://www.cplusplus.com/reference/map/multimap/
[stack]: http://www.cplusplus.com/reference/stack/stack