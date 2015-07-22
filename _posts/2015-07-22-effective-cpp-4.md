---
layout: blog
categories: reading
title: Effective C++笔记：避免使用define
tags: c++ macro
---

> Item 4: Make sure that objects are initialized before they're used.
> 在使用对象前确保其已经初始化。

出于效率原因，C++不保证**非成员对象的内置型**的初始化。对于成员变量的内置类型，
会在构造函数进入之前进行初始化。例如：

```cpp
class C(){
    int a;
    B b;
};
```

这里的`a`和`b`都是成员变量，其中`a`是基本数据类型，`b`是成员对象。它们会初始化为默认值：0、不带参数的构造函数。

> 有成员对象的类称为封闭类（`C`就是一个），如果`B`没有不带参数的构造函数，则必须在`C`的构造函数中进行`b`的初始化。

# 构造函数中初始化所有成员

在C++程序设计中的绝大多数场景下，由构造函数上进行变量的初始化。于是规则很简单：在构造函数中初始化所有成员。
值得注意的是，在构造函数进入之前成员已经进行了初始化。下面的代码会使得成员对象构造两次：

```cpp
class C{
   B b;
public:
   C(){ b = B(); }  // 这个是赋值啦
};
```

正确的做法是在构造函数前给出初始化列表：

```cpp
class C{
    B b;
    int i;
public:
    C():b(), i(){}
};
// 或者
C::C()
    : b(), 
      i(1)
    {}
```

> 在构造函数前总是列出所有成员变量，以免遗漏。

# 类静态变量需要声明

类的静态变量除了在类声明中进行声明外，还需要在类声明外进行定义。
（`static const int`是个例外，参见：[Effective C++笔记：避免使用define](/2015/07/21/effective-cpp-2)）

静态变量的生命周期不同于栈或者堆中的对象，从它被构造开始一直存在，直到程序结束。
包括全局变量、命名空间下的变量、类中和函数中定义的`static`对象。
其中，定义在函数中的称为 local static，其他的称为 non-local static。

多个编译单元的 non-local static 对象初始化次序是不确定的。因此可能会在使用时造成未初始化的问题，
解决办法便是把它变成一个 local static，可以使用 Singleton(local static) 来写：

```cpp
class FileSystem{...};
FileSystem& tfs(){
		//将在首次进入函数时构造
		static FileSystem fs;	
		return fs;
}
```
	
以下提供较完整的Signleton C++实现：

```cpp
class Singleton{
private:
    Singleton(){}
    Singleton(const Singleton&);
    Singleton& operator=(const Singleton& rhs);
public:
    static Singleton& getInstance(){
        static Singleton instance;
        return instance; 
    }
};
```
	
> 一旦声明了任何形式的构造函数（包括拷贝构造函数），编译器将不会生成默认的无参构造函数。所以上述的无参数的构造函数可以省略。
