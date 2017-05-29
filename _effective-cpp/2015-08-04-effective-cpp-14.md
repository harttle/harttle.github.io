---
layout: blog
title: Item 14：资源管理类要特别注意拷贝行为

tags: C++ RAII 内存 引用 作用域 智能指针 构造函数 运算符重载
excerpt: 资源管理对象的拷贝行为取决于资源本身的拷贝行为，同时资源管理对象也可以根据业务需要来决定自己的拷贝行为
---

> Item 14: Think carefully about copying behavior in resource-managing classes.

在[Item 13：使用对象来管理资源][item13]中提出了基于RAII的资源管理对象，`auto_ptr`和`shared_ptr`。
智能指针可以有不同的拷贝策略。当你实现这样一个资源管理对象时，需要特别注意。比如一个典型的RAII风格的互斥锁实现：

```cpp
class Lock {
public:
    explicit Lock(Mutex *pm):mutexPtr(pm){
        lock(mutexPtr);
    }
    ~Lock(){ unlock(mutexPtr); }
private:
    Mutex *mutexPtr;
};
```

> 用`explicit`限定构造函数，可以防止隐式转换的发生：`Lock l = pm`。

该互斥锁的使用方式很简单，只需要为每个临界区创建一个C++代码块，在其中定义`Lock`的局部变量：

```cpp
Mutex m;            // 定义互斥锁
{                   // 创建代码块，来定义一个临界区
    Lock m1(&m);    // 互斥锁加锁
    ...             // 临界区操作
}                   // m1退出作用域时被析构，互斥锁自动解锁
```

当`m1`被复制时情况会怎样？把当前作用域的代码加入到同一个临界区中？拷贝互斥锁并定义一个新的临界区？还是简单地给互斥锁换一个资源管理者？
**资源管理对象的拷贝行为取决于资源本身的拷贝行为，同时资源管理对象也可以根据业务需要来决定自己的拷贝行为**。可选的拷贝行为不外乎下面这四种：

1. 禁止拷贝。简单地私有继承一个`Uncopyable`类便可以让它禁止拷贝。参见：[Item 6：禁用那些不需要的缺省方法][item6]。
2. 引用计数，采用`shared_ptr`的逻辑。恰好`shared_ptr`构造函数提供了第二个参数`deleter`，当引用计数到0时被调用。
所以`Lock`可以通过聚合一个`shared_ptr`成员来实现引用计数：

    ```cpp
    class Lock{
    public: 
        explicit Lock(Mutex *pm): mutexPtr(pm, unlock){
            lock(mutexPtr.get());
        }
        private: 
            std::shared_ptr<Mutex> mutexPtr;
        }
        // `Lock`的析构会引起`mutexPtr`的析构，而`mutexPtr`计数到0时`unlock(mutexPtr.get())`会被调用。
    };
    ```

3. 拷贝底层资源。当你可以任意拥有底层资源时，可以直接拷贝它。比如`string`的行为：内存存有指向对空间的指针，当它被复制时会复制那片空间。
4. 转移底层资源的所有权。`auto_ptr`就是这样做的，把资源移交给另一个资源管理对象，自己的资源置空。

[item13]: /2015/08/02/effective-cpp-13.html
[item6]: /2015/07/23/effective-cpp-6.html
