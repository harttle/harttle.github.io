---
layout: blog
title: Item 51：写new和delete时请遵循惯例

tags: C++ 内存 异常 指针 数组 线程 继承 动态内存 成员函数 析构函数
excerpt: new需要无限循环地获取资源，如果没能获取则调用"new handler"，不存在"new handler"时应该抛出异常； new应该处理size为零的情况； delete应该兼容空指针； new/delete作为成员函数应该处理size > sizeof(Base)的情况（因为继承的存在）。
---

> Item 51: Adhere to convention when writing new and delete.

[Item 50][item50]介绍了如何自定义`new`和`delete`但没有解释你必须遵循的惯例，
这些惯例中有些并不直观，所以你需要记住它们！

* `operator new`需要无限循环地获取资源，如果没能获取则调用"new handler"，不存在"new handler"时应该抛出异常；
* `operator new`应该处理`size == 0`的情况；
* `operator delete`应该兼容空指针；
* `operator new/delete`作为成员函数应该处理`size > sizeof(Base)`的情况（因为继承的存在）。

<!--more-->

# 外部operator new

[Item 49][item49]指出了如何将`operator new`重载为类的成员函数，在此我们先看看如何实现一个外部（非成员函数）的`operator new`：
`operator new`应当有正确的返回值，在内存不足时应当调用"new handler"，请求申请大小为0的内存时也可以正常执行，避免隐藏全局的（"normal form"）`new`。

* 给出返回值很容易。当内存足够时，返回申请到的内存地址；当内存不足时，根据[Item 49][item49]描述的规则返回空或者抛出`bad_alloc`异常。
* 每次失败时调用"new handler"，并重复申请内存却不太容易。只有当"new handler"为空时才应抛出异常。
* 申请大小为零时也应返回合法的指针。允许申请大小为零的空间确实会给编程带来方便。

考虑到上述目标，一个非成员函数的`operator new`大致实现如下：

```cpp
void * operator new(std::size_t size) throw(std::bad_alloc){
    if(size == 0) size = 1;
    while(true){
        // 尝试申请
        void *p = malloc(size);

        // 申请成功
        if(p) return p;

        // 申请失败，获得new handler
        new_handler h = set_new_handler(0);
        set_new_handler(h);

        if(h) (*h)();
        else throw bad_alloc();
    }
}
```

* `size == 0`时申请大小为`1`看起来不太合适，但它非常简单而且能正常工作。况且你不会经常申请大小为0的空间吧？
* 两次`set_new_handler`调用先把全局"new handler"设置为空再设置回来，这是因为无法直接获取"new handler"，多线程环境下这里一定需要锁。
* `while(true)`意味着这可能是一个死循环。所以[Item 49][item49]提到，"new handler"要么释放更多内存、要么安装一个新的"new handler"，如果你实现了一个无用的"new handler"这里就是死循环了。

# 成员operator new

重载`operator new`为成员函数通常是为了对某个特定的类进行动态内存管理的优化，而不是用来给它的子类用的。
因为在实现`Base::operator new()`时，是基于对象大小为`sizeof(Base)`来进行内存管理优化的。

> 当然，有些情况你写的`Base::operator new`是通用于整个class及其子类的，这时这一条规则不适用。

```cpp
class Base{
public:
    static void* operator new(std::size_t size) throw(std::bad_alloc);
};
class Derived: public Base{...};

Derived *p = new Derived;       // 调用了 Base::operator new ！
```

子类继承`Base::operator new()`之后，因为当前对象不再是假设的大小，该方法不再适合管理当前对象的内存了。
可以在`Base::operator new`中判断参数`size`，当大小不为`sizeof(Base)`时调用全局的`new`：

```cpp
void *Base::operator new(std::size_t size) throw(std::bad_alloc){
    if(size != sizeof(Base)) return ::operator new(size);
    ...
}
```

上面的代码没有检查`size == 0`！这是C++神奇的地方，大小为0的独立对象会被插入一个`char`（见[Item 39][item39]）。
所以`sizeof(Base)`永远不会是0，所以`size == 0`的情况交给`::operator new(size)`去处理了。

这里提一下`operator new[]`，它和`operator new`具有同样的参数和返回值，
要注意的是你不要假设其中有几个对象，以及每个对象的大小是多少，所以不要操作这些还不存在的对象。因为：

1. 你不知道对象大小是什么。上面也提到了当继承发生时`size`不一定等于`sizeof(Base)`。
2. `size`实参的值可能大于这些对象的大小之和。因为[Item 16][item16]中提到，数组的大小可能也需要存储。

# 外部operator delete

相比于`new`，实现`delete`的规则要简单很多。唯一需要注意的是C++保证了`delete`一个`NULL`总是安全的，你尊重该惯例即可。

同样地，先实现一个外部（非成员）的`delete`：

```cpp
void operator delete(void *rawMem) throw(){
    if(rawMem == 0) return; 
    // 释放内存
}
```

# 成员operator delete

成员函数的delete也很简单，但要注意如果你的`new`转发了其他`size`的申请，那么`delete`也应该转发其他`size`的申请。

```cpp
class Base{
public:
    static void * operator new(std::size_t size) throw(std::bad_alloc);
    static void operator delete(void *rawMem, std::size_t size) throw();
};
void Base::operator delete(void *rawMem, std::size_t size) throw(){
    if(rawMem == 0) return;     // 检查空指针
    if(size != sizeof(Base)){
        ::operator delete(rawMem);
    }
    // 释放内存
}
```

> 注意上面的检查的是`rawMem`为空，`size`是不会为空的。

其实`size`实参的值是通过调用者的类型来推导的（如果没有虚析构函数的话）：

```cpp
Base *p = new Derived;  // 假设Base::~Base不是虚函数
delete p;               // 传入`delete(void *rawMem, std::size_t size)`的`size == sizeof(Base)`。
```

如果`Base::~Base()`声明为`virtual`，则上述`size`就是正确的`sizeof(Derived)`。
这也是为什么[Item 7][item7]指出析构函数一定要声明`virtual`。

[item7]: /2015/07/24/effective-cpp-7.html
[item16]: /2015/08/07/effective-cpp-16.html
[item39]: /2015/09/06/effective-cpp-39.html
[item49]: /2015/09/17/effective-cpp-49.html
[item50]: /2015/09/19/effective-cpp-50.html
