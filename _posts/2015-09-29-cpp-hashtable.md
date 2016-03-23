---
layout: blog
title: 用C++实现一个简单的哈希表
tags: C++ 封装 数组 算法 链表 二叉树 哈希表 智能指针
---

> Wikipedia: [散列表][hashtable]（Hash table，也叫哈希表），是根据关键字（Key value）而直接访问在内存存储位置的数据结构。
> 也就是说，它通过计算一个关于键值的函数，将所需查询的数据映射到表中一个位置来访问记录，这加快了查找速度。
> 这个映射函数称做散列函数，存放记录的数组称做散列表

哈希表、二叉树、链表是最常见的数据结构，涵盖了程序员面试和笔试中几乎所有的数据结构相关问题。
本文中用C++来实现一个简单的哈希表，帮助理解哈希表是怎样运作的。为了简化代码并突出逻辑，采用简单的除余数作为*散列函数*，用线性探测来*处理碰撞*。

<!--more-->

# 哈希列表项

先声明一个哈希列表项的类，来封装`key`和`value`。之所以需要在表项中存储`key`是因为碰撞的存在，往往不能够通过散列函数直接得到地址，还需要进一步的判断，因此列表项中需要存储`key`值。
不过列表项的实现是很直观的：

```cpp
class HashItem{
    int key, val;
public:
    HashItem(int k, int k): key(k), val(v){}
    const int& getKey(){
        return key;
    }
    const int& getVal(){
        return val;
    }
};
```

> 当然`key`可以是任何支持判等运算的类型，这里设为`int`是为了简化逻辑。

# 简单的哈希表

有了`HashItem`便很容易写出`HashTable`，需要注意的是在析构函数中要记得释放动态内存。

```cpp
class HashTable{
    static const int SIZE = 256;
    HashItem ** table;      // 注意这是二级指针，指向对个HashItem*
public:
    HashTable(){
        table  = new HashItem*[SIZE]();     // 这里的括号是为了初始化为0
    }
    void set(key, val){
        int idx = key%SIZE;
        if(table[idx]) delete table[idx];
        table[idx] = new HashItem(key, val);
    }
    const int get(key){
        int idx = key%SIZE;
        return table[idx] ? table[idx]->getVal() : -1;      // 注意这里需要判断key不存在的情况
    }
    ~HashTable(){
        for(int i=0; i<SIZE; i++)
            if(table[i]) delete table[i];
        delete[] table;                     // 别忘了table本身也是要销毁的
    }
};
```

上述算法中使用C风格的资源管理不是异常安全的。比如`HashTable::set`中的`HashItem`构造函数一旦抛出异常，`table[idx]`将处于无效的状态。
[Effective C++: Item 29][item29]中提到了**使用[智能指针][item13]和copy and swap范式可以为资源替换提供异常安全**，在`HashTable`的例子中，可以用`shared_ptr`来存储`HashTable*`：

```cpp
class HashTable{
    vector<shared_ptr<HashItem>> table(SIZE);
    ...
public:
    void set(key, val){
        int idx = key%SIZE;
        shared_ptr<HashItem> tmp(new HashItem(key, val));
        swap(tmp, table[idx]);
    }
    ...
};
```

# 处理碰撞

哈希表的思路很简单：将`key`映射到一个下标，然后把`value`存进去。但有时多个`key`会映射到同一个下标，比如`key1 ==  SIZE + k`和`k2 = SIZE*2 + K`的下标均为`k`。
这时便需要处理碰撞了，我们使用最简单的线性探测（linear probing）来重新实现`HashTable::set`。

```cpp
void HashTable::set(key, val){
    int idx = key%SIZE;
    while(table[idx] && table[idx]->getKey() != key)
        idx = (idx+1)%SIZE;           // 当SIZE不够大时，这里会陷入死循环。可以检测一下。
    if(table[idx]) delete table[idx];
    table[idx] = new HashItem(key, val);
}
```

加入处理碰撞后，`HashTable::get`也需要做相应的改动：

```cpp
const int HashTable::get(key){
    int idx = key%SIZE;
    while(table[idx] && table[idx]->getKey() != key)
        idx = (idx+1)%SIZE;           // SIZE不够大时，这里也面临死循环的问题
    return table[idx] ? table[idx]->getVal() : -1;      // 注意这里需要判断key不存在的情况
}
```

[hashtable]: https://zh.wikipedia.org/wiki/%E5%93%88%E5%B8%8C%E8%A1%A8
[item13]: {% post_url 2015-08-02-effective-cpp-13 %}
[item29]: {% post_url 2015-08-27-effective-cpp-29 %}
