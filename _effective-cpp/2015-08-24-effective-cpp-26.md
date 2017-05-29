---
layout: blog
title: Item 26：尽量推迟变量定义

tags: C++ 作用域 构造函数 析构函数 赋值运算符 拷贝构造函数
excerpt: 这一规则在任何编程语言中都适用，一方面可以避免无用的构造使得程序更高效，另一方面作用域的缩小会使程序更加清晰。
---

> Item 26: Postpone variable definitions as long as possible.

**这一规则在任何编程语言中都适用，一方面可以避免无用的构造使得程序更高效，另一方面作用域的缩小会使程序更加清晰。**
存在控制流转移的代码中，你可能会不经意间定义无用的变量。例如：

```cpp
string encryptPassword(const string& password){
    string encrypted;
    if (password.length() < MinimumPasswordLength) {
        throw logic_error("Password is too short");
    }
    encrypted = password;
    encrypt(encrypted);
    return encrypted;
}
```

<!--more-->

# 推迟构造函数的执行

当`encryptPassword`抛出异常时，`encrypted`是无用的根本不需要构造它。所以更好的写法是推迟`encrypted`的构造：

```cpp
string encryptPassword(const string& password){
    if (password.length() < MinimumPasswordLength) {
        throw logic_error("Password is too short");
    }
    string encrypted;       // 默认构造函数
    encrypted = password;   // 赋值运算符
    encrypt(encrypted);
    return encrypted;
}
```

这样我们可以提升有异常抛出时的执行效率。

# 推迟到有构造参数时

另外[Item 4：确保变量的初始化][item4]中提到“构造一个对象再给它赋值不如直接用一个值初始化它”，
所以上述代码还有改进的余地：直接用`password`来初始化`encrypted`：

```cpp
string encryptPassword(const string& password){
    if (password.length() < MinimumPasswordLength) {
       throw logic_error("Password is too short");
    }
    string encrypted(password);     // 拷贝构造函数
    encrypt(encrypted);
    return encrypted;
}
```

标题中的“尽量推迟”在此有了更深刻的含义：变量定义可以一直推迟到你有初始化参数时再进行。

# 循环中的变量

循环中的变量定义也是一个常见的争论点。这里援引Scott Meyers的例子，比如我们有两种写法：

写法A，在循环外定义：

```cpp
Widget w;
for (int i = 0; i < n; ++i){ 
  w = some value dependent on i;
  ...                           
}                  

```

写法B，在循环内定义：

```cpp
for (int i = 0; i < n; ++i) {
    Widget w(some value dependent on i);
    ...
}
```

* 写法A的代价是：1个构造函数，1个析构函数，n个赋值运算符
* 写法B的代价是：n个构造函数，n个析构函数

但A使得循环内才使用的变量进入外部的作用域，不利于程序的理解和维护。**软件工程中倾向于认为人的效率比机器的效率更加难得，
所以推荐采用B来实现**。除非：

1. 这段代码是性能的关键，并且：
2. 赋值比一对构造/析构更加廉价。

[item4]: /2015/07/22/effective-cpp-4.html
