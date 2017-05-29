---
layout: blog
title: Item 55：熟悉一下Boost

tags: Boost C++ Lambda STL traits 正则表达式
excerpt: Boost是一个C++开发者的社区，作为C++标准的试验场，收容了很多高质量、开源的、跨平台、独立于编译器的C++库，包括许多TR1组件的实现。
---

> Item 55: Familiarize yourself with Boost.

[Boost][boost]是一个C++开发者的社区，作为C++标准的试验场，
收容了很多高质量、开源的、跨平台、独立于编译器的C++库，
包括许多TR1组件的实现。

<!--more-->

Boost是其他C++组织和社区所不能比拟的：

* 与C++标准委员会的亲近关系。Boost社区成员和C++标准委员会成员有很大的交集。
多数C++下一代标准都来自于Boost社区。
* 特殊的项目接收流程。首先在邮件列表中提出它，然后开启整个流程：
讨论、优化、重新提交，直到满意。

Boost社区中的库千差万别，较小的库（比如**Convention**）除了错误处理和跨平台外只有几行代码；
较大的库（比如**Boost Graph Library**、**Boost MPL Library**）
却需要整本的书来写它们。这些库可以分为以下几个大的类别：

* 字符串和文本处理。类型安全的`printf`、正则表达式、
分词（tokenizing）、转换（parsing）。
* 容器。STL风格的固定大小数组、可变大小的Bitset、多维数组。
* 函数对象和高阶编程。比如有趣的**Lambda**库：

    ```cpp
    using namespace boost::lambda;
    std::vector<int> v;
    std::for_each(v.begin(), v.end(), std::cout<< _1 * 2 + 10 << "\n");
    ```

    > _1 是 Lambda 库的占位符，表示当前元素

* 泛型编程。包括一套可扩展的traits类，见[Item 47][item47]。
* 模板元编程（TMP，见[Item 48][item48]）。
* 数值计算。包括有理数、八元数、最大公约数、最小公倍数等。
* 正确性和测试。隐式模板接口的形式化和测试驱动编程。
* 数据结构。包括类型安全的联合体、元组。
* 跨语言支持。比如C++和Python提供无缝互操作性的库。
* 内存。如固定大小内存池的分配器。
* 杂项。CRC检查、时间日期操作、文件系统遍历等。

也有一些程序设计领域的东西并不在Boost里面，
比如GUI开发、数据库连接等。

[boost]: http://boost.org
[item47]: /2015/09/15/effective-cpp-47.html
[item48]: /2015/09/16/effective-cpp-48.html
