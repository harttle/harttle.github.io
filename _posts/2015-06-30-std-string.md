---
layout: blog 
categories: reading
title: C++手稿：std::string
tags: c++ string
---

字符串在很多编程语言中已经成为基本数据类型，C语言中我们使用`char*`来手动申请和维护字符串，
在C++中，可以使用`std::string`来方便地创建和操作字符串。

`string`是一个模板类，它有`basic_string<T>`定义：

```cpp
typedef basic_string<char> string;
```

> C++的`string`可以通过成员方法`c_str()`转换为C语言的`char*`。

参考文档：[cplusplus.com/string][cpp-str]

# 初始化与赋值

`string`有两个常用的构造函数：

```cpp
// 用一个C字符串构造
string str("hello");
// 等价于
string str = "hello";
```

> 也可以用N个同样的字符来构造字符串：`string str2(8, 'x')`。

在C0x标准中，`std::to_string`可以将很多类型转换为一个`string`，可以代替`itoa`，例如：

```cpp
string str = to_string(123);
```

> `string`构造函数不接受`char`和`int`类型。

字符串可以直接互相赋值，内存会自动拷贝和销毁，我们大可不必管它。对于单个字符赋值可以使用下标运算符：

```cpp
for(int i=0;i<str.length(); i++){
    str[i] = 'a';
}
```

> 与多数class类似，`string`也提供了`swap`：`str1.swap(s2)`将会交换二者的值。

# 运算符支持

有通用运算符支持的数据类型往往更容易理解和操作，其中最讨人喜欢的莫过于`+`运算符：

```cpp
str += str2;
str = str + "hello";
```

> 当然，你也可以直接调用`append`方法：`str.append(str2)`。

除了`+`，`string`还支持一系列的比较运算符：`<`, `==`, `>`, `<=`, `>=`, `!=`。

> 当然，你仍然可以直接调用`compare`方法：`str1.compare(str2)`，`str1`小则会返回`-1`。

<!--more-->

# 长度

* 字符串为空
    * `empty()`：返回是否为空。
    * `clear()`：清空字符串。
* 字符串长度
    * `length()`：等效于`size()`，返回字符串长度。
    * `resize(10, 'x')`：改变长度，如果超过了原有长度，后面补`x`，第二个参数默认值为null。
* 字符串内存
    * `capacity()`：无需再次申请内存可存放的字符数。
    * `reserve(10)`：申请10字符的内存，通常在大量的`insert`前先`reserve`一下，避免多次申请内存。

# 查找

* `str.find("ll")`：字符串`ll`在`str`中第一次出现的下标，未找到为`string::npos`。
* `str.rfind("ll")`：同上，从右向左查找。
* `str.find("ll", 3)`：从下标3开始查找。

# 修改

* `erase(5)`：去掉下标5开始的所有字符。
* `replace(2, 3, "ll")`：下标2开始的3个字符换成`"ll"`。
* `insert(2, "ll")`：下标2处插入`"ll"`。

# 流处理

在C++中，标准输入输出、文件、字符串都可以作为一个流，来接受输入或者输出。
在C++中字符串流也是格式化输出的一种常用手段。

```cpp
string input("test 123");
istringstream sinput(input);

string str;
int i;
sinput >> str >> i;

ostringstream soutput;
soutput << str << i;
cout<< soutput.str();
// test123
```

[cpp-str]: http://www.cplusplus.com/reference/string/string/