---
layout: blog
title: Item 52：写了placement new就要写placement delete

tags: C++ 内存 异常 指针 动态内存 名称隐藏 构造函数
excerpt: new和delete是要成对的，因为当构造函数抛出异常时用户无法得到对象指针，因而delete的责任在于C++运行时。 运行时需要找到匹配的delete并进行调用。因此当我们编写了"placement new"时，也应当编写对应的"placement delete"， 否则会引起内存泄露。在编写自定义new和delete时，还要避免不小心隐藏它们的正常版本。
---

> Item 52: Write placement delete if you write placement new

"placement new"通常是专指指定了位置的`new(std::size_t size, void *mem)`，用于`vector`申请`capacity`剩余的可用内存。
但*广义的"placement new"指的是拥有额外参数的`operator new`*。

`new`和`delete`是要成对的，因为当构造函数抛出异常时用户无法得到对象指针，因而`delete`的责任在于C++运行时。
运行时需要找到匹配的`delete`并进行调用。因此**当我们编写了"placement new"时，也应当编写对应的"placement delete"，
否则会引起内存泄露。在编写自定义`new`和`delete`时，还要避免不小心隐藏它们的正常版本。**

<!--more-->

# 成对的delete

当构造函数抛出异常时，C++会调用与`new`同样签名的`delete`来撤销`new`。但如果我们没有声明对应的`delete`：

```cpp
class Widget{
public:
    static void* operator new(std::size_t size, std::ostream& log) throw(std::bad_alloc);
    Widget(){ throw 1; }
};

Widget *p = new(std::cerr) Widget;
```

构造函数抛出了异常，C++运行时尝试调用`delete(void *mem, std::ostream& log)`，
但`Widget`没有提供这样的`delete`，于是C++不会调用任何`delete`，这将导致内存泄露。
所以在`Widget`中需要声明同样签名的`delete`：

```cpp
static void operator delete(void *mem, std::ostream& log);
```

但客户还可能**直接调用`delete p`，这时C++运行时不会把它解释为"placement delete"**，这样的调用会使得`Widget`抛出异常。
所以在`Widget`中不仅要声明"placement delete"，还要声明一个正常的`delete`。

```cpp
class Widget{
public:
    static void* operator new(std::size_t size, std::ostream& log) throw(std::bad_alloc);
    static void operator delete(void *mem, std::ostream& log);
    static void operator delete(void *mem) throw();
    Widget(){ throw 1; }
};
```

这样，无论是构造函数抛出异常，还是用户直接调用`delete p`，内存都能正确地回收了。

# 名称隐藏

在[Item 33][item33]中提到，类中的名称会隐藏外部的名称，子类的名称会隐藏父类的名称。
所以当你声明一个"placement new"时：

```cpp
class Base{
public:
    static void* operator new(std::size_t size, std::ostream& log) throw(std::bad_alloc);
};
Base *p = new Base;     // Error!
Base *p = new (std::cerr) Base;     // OK
```

普通的`new`将会抛出异常，因为"placement new"隐藏了外部的"normal new"。同样地，当你继承时：

```cpp
class Derived: public Base{
public:
    static void* operator new(std::size_t size) throw(std::bad_alloc);
};
Derived *p = new (std::clog) Derived;       // Error!
Derived *p = new Derived;       // OK
```

这是因为子类中的"normal new"隐藏了父类中的"placement new"，虽然它们的函数签名不同。
但[Item 33][item33]中提到，按照C++的名称隐藏规则会隐藏所有同名（name）的东西，和签名无关。

# 最佳实践

为了避免全局的"new"被隐藏，先来了解一下C++提供的三种全局"new"：

```cpp
void* operator new(std::size_t) throw(std::bad_alloc);      // normal new
void* operator new(std::size_t, void*) throw();             // placement new
void* operator new(std::size_t, const std::nothrow_t&) throw();     // 见 Item 49
```

为了避免隐藏这些全局"new"，你在创建自定义的"new"时，也分别声明这些签名的"new"并调用全局的版本。
为了方便，我们可以为这些全局版本的调用声明一个父类`StandardNewDeleteForms`：

```cpp
class StandardNewDeleteForms {
public:
  // normal new/delete
  static void* operator new(std::size_t size) throw(std::bad_alloc) { return ::operator new(size); }
  static void operator delete(void *pMemory) throw() { ::operator delete(pMemory); }

  // placement new/delete
  static void* operator new(std::size_t size, void *ptr) throw() { return ::operator new(size, ptr); }
  static void operator delete(void *pMemory, void *ptr) throw() { return ::operator delete(pMemory, ptr); }

  // nothrow new/delete
  static void* operator new(std::size_t size, const std::nothrow_t& nt) throw() { return ::operator new(size, nt); }
  static void operator delete(void *pMemory, const std::nothrow_t&) throw() { ::operator delete(pMemory); }
};
```

然后在用户类型`Widget`中`using StandardNewDeleteForms::new/delete`即可使得这些函数都可见：

```cpp
class Widget: public StandardNewDeleteForms {           // inherit std forms
public:
   using StandardNewDeleteForms::operator new;         
   using StandardNewDeleteForms::operator delete;     

   static void* operator new(std::size_t size, std::ostream& log) throw(std::bad_alloc);   // 自定义 placement new
   static void operator delete(void *pMemory, std::ostream& logStream) throw();            // 对应的 placement delete
};
```

[item33]: /2015/08/31/effective-cpp-33.html
