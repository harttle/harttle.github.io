---
layout: blog 
categories: reading
title: C++手稿：STL入门
tags: c++ string
---

STL (Standard Template Library) 提供了一些常用的数据结构和算法的模板，1998年加入C++标准。
STL中有三个基本概念：

1. 容器：容纳各种数据类型的数据结构，是一系列的类模板。
2. 迭代器：迭代器用来迭代地访问容器中的元素。
3. 算法：用来操作容器中的元素，是一系列的函数模板。


# STL 容器

STL中的容器定义在`std`命名空间下，需要引入头文件
`<vector>`, `<set>`, `<map>`, `<deque>`, `<list>`, `<stack>`
等。容器可以分为三大类：

1. 顺序容器
    * `vector`：尾端插入元素有较高性能，动态数组实现；
    * `deque`：收尾插入元素都有较高性能，动态数组实现；
    * `list`：可以常数时间在任何地方插入元素，链表实现；
2. 关联容器
    * `set`：不同元素的集合，平衡二叉树实现，检索时间是 $O(log(N))$；
    * `multiset`：同上，但可以包含相同元数据；
    * `map`：同`set`，但存放的是键值对；
    * `multimap`：同上，键可以重复；
3. 容器适配器：`stack`，`queue`，`priority_queue`。

这些容器有一些通用的方法：`empty`，`size`，`swap`，`max_size`。前两类容器支持迭代器，称为第一类容器。

对于顺序容器，有更多的通用方法：`front`, `back`, `pop_back`, `push_back`。

> 容器之间的比较取决于第一个不等的元素；如果长度相同且所有元素相等，两个容器相等；如果一个是另一个的子序列，则较短的容器小于较长的容器。

# STL 迭代器

第一类容器支持迭代器（容器适配器不支持迭代器），分为`const`迭代器和非`const`迭代器。一个简单的迭代器使用是这样的：

```cpp
vector<int> v;
for(vector<int>::reverse_iterator r = v.rbegin(); r < v.rend(); r++){
    cout<<*r;
}
```

取决于不同的存储方式，不同容器支持的迭代器是不同的。这些迭代器按功能的强弱分为5类：

1. Input Iterator：提供只读访问
2. Output Iterator：提供只写访问
3. Forward Iterator：支持逐个向后迭代访问
4. Bidirectional Iterator：能够双向地逐个迭代访问
5. Random Access Iterator：可随机访问每个元素

`vector`和`deque`支持Random Access Iterator，`list`、`set/multiset`、`map/multimap`支持Bidirectional Iterator。

双向迭代器不支持`<`，`>`，`[]`运算符，只能判等：

```cpp
list<int> l;
for(list<int>::const_iterator i = l.begin(); i != l.end(); ++i){
    cout<<*i;
} 
```

<!--more-->

# STL 算法

STL通过函数模板提供了很多作用于容器的通用算法，例如查找、插入、删除、排序等，需要引入头文件`<algorithm>`。

变化序列的：`copy`, `remove`, `fill`, `replace`, `swap`, ...；不变化序列的：`find`, `count`, `for_each`, `equal`, ...

> 这些算法的实现较为通用，也可以作用于C语言的数组。

例如，`find`用值来搜索一个元素的迭代器：

```cpp
vector<int> v;
v.push_back(1);
v.push_back(2);
v.push_back(3);
vector<int>::iterator p = find(v.begin(), v.end(), 3);
if(p != v.end()) cout<<*p;
// 3
```

例如，`copy`用来做容器之间的拷贝：

```cpp
ostream_iterator<int> output(cout, " ");
copy(v.begin(), v.end(), output);
// 1 2 3
```

例如，`erase`用来删除一个区间的元素：

```cpp
v.erase( v.begin(), v.end());
// 等效于
v.clear();
```

# 实现一个Iterator

为了实现上述`ostream_iterator`，需要了解`copy`的实现方式：

```cpp
template<class _II, class _OI>
inline _OI copy(_II _F, _II _L, _OI _X){
    for(;_F != _L; ++_X, ++_F)
        *_X = *_F;
    return (_X);
}
```

因此`ostream_iterator`需要重载`++`, `*`和`=`：

```cpp
template<class T>
class ostream_iterator{
    string sep;
    ostream& o;
public:
    ostream_iterator(ostream& _o, string _s):o(_o), sep(_s){}
    ostream_iterator& operator=(const T& v){
        o<<v<<sep; return *this;
    }
    ostream_iterator& operator*(){ return *this; }
    ostream_iterator& operator++(){ return *this; };
}
```