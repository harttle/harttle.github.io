---
layout: blog 
categories: reading
title: C++手稿：指针与引用
tags: c++ pointer reference
---

# 引用

引用是C++的C语言的扩充，用来定义一个变量的别名。其使用方式同被引用的变量，且可以通过参数传递引用。

> 未初始化、初始化为常量或表达式都会引发编译错误。

# 引用参数

为了在函数中修改传入的参数，可以把函数参数声明为引用。一个经典的使用场景是`swap`，避免了繁琐的指针操作：

```cpp
void swap(int& lhs, int& rhs){
    int tmp = lhs;
    lhs = rhs;
    rhs = tmp;
}
```

# 引用返回值

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

# 常量指针与指针常量

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
```

> 通常来讲，编译器允许变量到常量的隐式转换，不允许常量到变量的转换。可以参考`const_cast`。

