---
title: C++手稿：指针与引用
tags: C++ STL 内存 引用 指针 数组 函数指针 智能指针 析构函数 栈空间
---

C++的引用和指针始终是最容易出错的地方，大量的C++错误都是由空引用和空指针造成的。
与此同时，常量指针、函数指针、数组指针也是容易产生困惑的地方。
本文便来总结一下C++中引用和指针的用法，以及智能指针的概念。

<!--more-->

## 引用

引用是C++的C语言的扩充，用来定义一个变量的别名。其使用方式同被引用的变量，且可以通过参数传递引用。
引用在定义时必须初始化为一个变量，初始化为常量或表达式都会引发编译错误。

引用是一种隐式的指针，对它的操作都会被解释为对它引用的对象的操作。
引用不占用栈空间，因为编译器知道它的地址。但作为参数传递引用时，会把指针放在参数栈中。例如：

```cpp
void function(int& x) {
     x = 10;
 }
 int main() {
     int i = 5;
     int& j = i;
     function(j);
 }
 ```
 
 其中`j`并不占用当前的栈空间，而`function`被调用前会将`j`的地址放入它的参数栈中。
 
 关于引用的内存占用： <http://stackoverflow.com/questions/1179937/how-does-a-c-reference-look-memory-wise>
 
## 引用参数

为了在函数中修改传入的参数，可以把函数参数声明为引用。一个经典的使用场景是`swap`，避免了繁琐的指针操作：

```cpp
void swap(int& lhs, int& rhs){
    int tmp = lhs;
    lhs = rhs;
    rhs = tmp;
}
swap(a, b);
```

传引用还是传值，对于调用者来讲是没有区别的。这一点与传指针是不同的，如果要传递指针调用者需要先对参数变量取地址。

## 引用返回值

引用作为函数的返回值，一般是为了在函数外部修改内部变量。例如，对下标操作符的重载：

```cpp
class Array{
    int[N] array;
public:
    int& operator[](i){
        return array[i];
    }
};
Array arr;
arr[2] = 2;
```

> 如果返回值为`int`而非`int&`，则运行时会将`array[i]`拷贝一份作为返回值，此时赋值无效。

## 常量指针与指针常量

常量指针指向地方的内容不可改变，指针常量指向的地方不可改变。

```cpp
// 定义整数
int n = 1, m=2;

// 常量指针
const int * p = &n;
*p = 5;   // 编译错

// 指针常量
int * const p = &n;
p = &m;   // 编译错

// 指针和指向的对象都是常量
const int * const p = &n;
```

> 通常来讲，编译器允许变量到常量的隐式转换，不允许常量到变量的转换。可以参考`const_cast`。

## 指针数组

指针数组是有一系列指针构成的数组，例如：

```cpp
int* arr[8];
```

数组的长度为8，数组的每一项都是类型为`int*`的指针。

## 数组指针

数组指针是指向数组的指针，在C++中可以声明一个指向长度为8的数组的指针：

```cpp
int (*arr)[8];
```

## 函数指针

函数指针通常用来进行传参，借此实现动态的策略。传参时可以用函数名，也可以用函数指针。而函数指针需要用函数名来初始化。

```cpp
int sum(int a, int b)j{
    return a+b;
}
void wrapper(int a, int b, int (*p)(int, int)){
    cout<<p(a, b)<<endl;
}

int main(){
    wrapper(2, 3, sum);
    int (*p)(int, int) = sum;
    wrapper(2, 3, p);
}
```

类似地，函数指针也可以组成一个数组：

```cpp
int (*p[])(int, int) = {sum, sum};
wrapper(2, 3, p[0]);
wrapper(2, 3, p[1]);
```

除了函数指针，函数对象也常用来传递动态的策略。
它们有一致的调用方式，在类模板中具有相同的隐式接口，
因此多数STL算法模板都可以不加区分地使用函数对象或者函数指针，
详情见[Effective C++: Item 41][item41]）。

## 智能指针

在[Effective C++: Item 13][item13]中详细介绍了智能指针的概念与使用方法。

C++没有内置的垃圾回收机制，所以获取和回收资源需要程序员来设计。
使用new构造的对象，如果将删除它的责任给调用者，将很容易发生疏漏，尤其是控制流发生改变时。
我们可以想到让对象来管理资源，利用会被自动调用的析构函数来完成资源的回收。
STL中已经提供了这样一个类模板：`std::auto_ptr`。

```cpp
auto_ptr<Investment> invest(){
    auto_ptr<Investment> pInv(createInvestment());
}
```

> 注意：`auto_ptr`析构函数中使用的是`delete`而非`delete[]`，所以不适合管理数组资源。

同时，`auto_ptr`重载了赋值运算符，保证了资源不会被多次析构。
这样，`auto_ptr`的赋值操作会转移资源，原指针将会变为`NULL`. 
如果需要同时存在多个引用，可以使用`shared_ptr`，它会对引用进行计数。

> `shared_ptr`的引用计数很像垃圾回收，然而它并不能解决环状引用的问题。

[item13]: /2015/08/02/effective-cpp-13.html
[item41]: /2015/09/08/effective-cpp-41.html

