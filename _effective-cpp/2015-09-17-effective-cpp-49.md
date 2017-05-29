---
layout: blog
title: Item 49：new handler的行为

tags: C++ RAII 内存 异常 模板 动态内存
excerpt: new申请内存失败时会抛出"bad alloc"异常，此前会调用一个由set_new_handler()指定的错误处理函数（"new-handler"）。
---

> Item 49: Understand the behavior of the new-handler.

`new`申请内存失败时会抛出`"bad alloc"`异常，此前会调用一个由`std::set_new_handler()`指定的错误处理函数（"new-handler"）。

<!--more-->

# set_new_handler()

"new-handler"函数通过`std::set_new_handler()`来设置，`std::set_new_handler()`定义在`<new>`中：

```cpp
namespace std{
    typedef void (*new_handler)();
    new_handler set_new_handler(new_handler p) throw();
}
```

> `throw()`是一个异常声明，表示不抛任何异常。例如`void func() throw(Exception1, Exception2)`表示`func`可能会抛出`Exception1`，`Exception2`两种异常。

`set_new_handler()`的使用也很简单：

```cpp
void outOfMem(){
    std::cout<<"Unable to alloc memory";
    std::abort();
}
int main(){
    std::set_new_handler(outOfMem);
    int *p = new int[100000000L];
}
```

当`new`申请不到足够的内存时，它会不断地调用`outOfMem`。因此一个良好设计的系统中`outOfMem`函数应该做如下几件事情之一：

* 使更多内存可用；
* 安装一个新的"new-handler"；
* 卸载当前"new-handler"，传递`null`给`set_new_handler`即可；
* 抛出`bad_alloc`（或它的子类）异常；
* 不返回，可以`abort`或者`exit`。

# 类型相关错误处理

`std::set_new_handler`设置的是全局的`bad_alloc`的错误处理函数，C++并未提供类型相关的`bad_alloc`异常处理机制。
但我们可以重载类的`operator new`，当创建对象时暂时设置全局的错误处理函数，结束后再恢复全局的错误处理函数。

比如`Widget`类，首先需要声明自己的`set_new_handler`和`operator new`：

```cpp
class Widget{
public:
    static std::new_handler set_new_handler(std::new_handler p) throw();
    static void * operator new(std::size_t size) throw(std::bad_alloc);
private:
    static std::new_handler current;
};

// 静态成员需要定义在类的外面
std::new_handler Widget::current = 0;
std::new_handler Widget::set_new_handler(std::new_handler p) throw(){
    std::new_handler old = current;
    current = p;
    return old;
}
```

> 关于`abort`, `exit`, `terminate`的区别：`abort`会设置程序非正常退出，`exit`会设置程序正常退出，当存在未处理异常时C++会调用`terminate`，
> 它会回调由`std::set_terminate`设置的处理函数，默认会调用`abort`。

最后来实现`operator new`，该函数的工作分为三个步骤：

1. 调用`std::set_new_handler`，把`Widget::current`设置为全局的错误处理函数；
2. 调用全局的`operator new`来分配真正的内存；
3. 如果分配内存失败，`Widget::current`将会抛出异常；
4. 不管成功与否，都卸载`Widget::current`，并安装调用`Widget::operator new`之前的全局错误处理函数。

# 重载operator new

我们通过RAII类来保证原有的全局错误处理函数能够恢复，让异常继续传播。关于RAII可以参见[Item 13][item13]。
先来编写一个保持错误处理函数的RAII类：

```cpp
class NewHandlerHolder{
public:
    explicit NewHandlerHolder(std::new_handler nh): handler(nh){}
    ~NewHandlerHolder(){ std::set_new_handler(handler); }
private:
    std::new_handler handler;
    NewHandlerHolder(const HandlerHolder&);     // 禁用拷贝构造函数
    const NewHandlerHolder& operator=(const NewHandlerHolder&); // 禁用赋值运算符
};
```

然后`Widget::operator new`的实现其实非常简单：

```cpp
void * Widget::operator new(std::size_t size) throw(std::bad_alloc){
    NewHandlerHolder h(std::set_new_handler(current));
    return ::operator new(size);    // 调用全局的new，抛出异常或者成功
}   // 函数调用结束，原有错误处理函数恢复
```

# 使用Widget::operator new

客户使用`Widget`的方式也符合基本数据类型的惯例：

```cpp
void outOfMem();
Widget::set_new_handler(outOfMem);

Widget *p1 = new Widget;    // 如果失败，将会调用outOfMem
string *ps = new string;    // 如果失败，将会调用全局的 new-handling function，当然如果没有的话就没有了
Widget::set_new_handler(0); // 把Widget的异常处理函数设为空
Widget *p2 = new Widget;    // 如果失败，立即抛出异常
```

# 通用基类

仔细观察上面的代码，很容易发现自定义"new-handler"的逻辑其实和`Widget`是无关的。我们可以把这些逻辑抽取出来作为一个模板基类：

```cpp
template<typename T>
class NewHandlerSupport{
public:
    static std::new_handler set_new_handler(std::new_handler p) throw();
    static void * operator new(std::size_t size) throw(std::bad_alloc);
private:
    static std::new_handler current;
};

template<typename T>
std::new_handler NewHandlerSupport<T>::current = 0;

template<typename T>
std::new_handler NewHandlerSupport<T>::set_new_handler(std::new_handler p) throw(){
    std::new_handler old = current;
    current = p;
    return old;
}

template<typename T>
void * NewHandlerSupport<T>::operator new(std::size_t size) throw(std::bad_alloc){
    NewHandlerHolder h(std::set_new_handler(current));
    return ::operator new(size);
}
```

有了这个模板基类后，给`Widget`添加"new-handler"支持只需要public继承即可：

```cpp
class Widget: public NewHandlerSupport<Widget>{ ... };
```

其实`NewHandlerSupport`的实现和模板参数`T`完全无关，添加模板参数是因为`handler`是静态成员，这样编译器才能为每个类型生成一个`handler`实例。

# nothrow new

1993年之前C++的`operator new`在失败时会返回`null`而不是抛出异常。如今的C++仍然支持这种nothrow的`operator new`：

```cpp
Widget *p1 = new Widget;    // 失败时抛出 bad_alloc 异常
assert(p1 != 0);            // 这总是成立的

Widget *p2 = new (std::nothrow) Widget;
if(p2 == 0) ...             // 失败时 p2 == 0
```

"nothrow new" 只适用于内存分配错误。而构造函数也可以抛出的异常，这时它也不能保证是`new`语句是"nothrow"的。

[item13]: /2015/08/02/effective-cpp-13.html
