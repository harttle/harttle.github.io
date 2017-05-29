---
layout: blog
title: Item 4：确保变量的初始化

tags: C++ 栈 编译 全局变量 构造函数 静态变量 拷贝构造函数
excerpt: 出于效率原因，C++不保证**非成员对象的内置型**的初始化。对于成员变量的内置类型，会在构造函数进入之前进行初始化。
---

> Item 4: Make sure that objects are initialized before they're used.

出于效率原因，C++不保证**内置类型数据成员**的初始化。对于成员变量的内置类型，
会在构造函数进入之前进行初始化。例如：

```cpp
class C{
    int a;
    B b;
};
```

其中数据成员`a`是基本数据类型，`b`是成员对象。有些情况下C++会初始化`a`，有些情况下则不会。
对象类型的`b`却是总会被初始化的，它的无参数的构造函数将被调用。

> 有成员对象的类称为封闭类（`C`就是一个），如果`B`没有不带参数的构造函数，则必须在`C`的构造函数中进行`b`的初始化。

C++中变量的初始化规则较为复杂，大致的规则是这样的：

* 对于C风格的C++：如果初始化会产生额外的负担，则不会初始化。
* 对于面向对象风格的C++：类的构造函数中一般都会进行所有成员的初始化（所以你也应该这样做！）。
* 全局/静态变量会自动初始化，自动变量（栈里面的）不会自动初始化。

> 完整的讨论可以参考：[C++手稿：那些变量会自动初始化？][auto-init]。

<!--more-->

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
C::C() : b(), i(1){}
```

> 在构造函数前总是列出所有成员变量，以免遗漏。

# 类静态变量的初始化

类的静态变量除了在类声明中进行声明外，还需要在类声明外进行定义。
（`static const int`是个例外，参见：[Effective C++笔记：避免使用define](/2015/07/21/effective-cpp-2.html)）

> 静态变量的生命周期不同于栈或者堆中的对象，从它被构造开始一直存在，直到程序结束。
包括全局变量、命名空间下的变量、类中和函数中定义的`static`对象。
其中，定义在函数中的称为 local static，其他的称为 non-local static。

多个编译单元的 non-local static 对象初始化次序是不确定的。因此可能会在使用时造成未初始化的问题，
解决办法便是把它变成一个 local static，C++保证了在第一次函数调用遇到该 local static 声明时，
它会被初始化。这也是Singleton(local static) 的典型实现：

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

[auto-init]: /2015/10/05/cpp-variable-init.html
