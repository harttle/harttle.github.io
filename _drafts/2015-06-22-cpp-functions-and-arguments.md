---
layout: blog 
categories: reading
title: C++手稿：函数与参数
tags: c++ function argument
---

# 默认参数

在函数声明中可以设置若干个默认参数，这些参数在函数调用时可以省略。例如：

```cpp
void print(int a = 3, int b=4){
    cout<<a<<" "<<b<<endl;
}
print();  // 3 4
print(4); // 4 4
print(,3); // compile error
```

默认参数提供了更灵活的函数声明。简化函数逻辑的同时，也提供了一种扩展既有函数的方式。

# 重载的二义性

我们知道可以通过参数个数的不同来进行函数重载。存在默认参数时，通过参数个数进行重载的函数调用便会存在歧义。例如：

```cpp
void print(int a = 1){}
void print(int a = 1, int b = 2){}
print();
```

同时定义上述两个`print`函数没有问题，因为它们的函数签名是不同的。但`print()`的调用存在歧义，此处会发生编译错误。
因此，**使用默认参数时，要避免函数重载的二义性**。

> 除了虚函数外，函数调用的函数地址是在编译期决定的。

