---
layout: blog
title: Item 8：析构函数不要抛出异常

tags: C++ 内存 异常 数组 析构函数
excerpt: 由于析构函数常常被自动调用，在析构函数中抛出的异常往往会难以捕获，引发程序非正常退出或未定义行为。
---

> Item 8: Prevent exceptions from leaving destructors.
>
> 析构函数不要抛出异常

由于析构函数常常被自动调用，在析构函数中抛出的异常往往会难以捕获，引发程序非正常退出或未定义行为。
例如，对象数组被析构时，会抛出多于一个的异常，然而**同时存在的异常在C++标准中是禁止的**，
因此程序会非正常退出：

```cpp
class Widget {
public:
  ~Widget() { ... }            // assume this might emit an exception
};
void doSomething(){
  std::vector<Widget> v;
}                              // v is automatically destroyed here
```

其实，容器中的对象在析构时抛出异常还会引起后续的对象无法被析构，导致资源泄漏。
这里的资源可以是内存，也可以是数据库连接，或者其他类型的计算机资源。

析构函数是由C++来调用的，源代码中不包含对它的调用，因此它抛出的异常不可被捕获。
对于栈中的对象而言，在它离开作用域时会被析构；对于堆中的对象而言，在它被`delte`时析构。

<!--more-->

请看：

```cpp
class C{
public:
    ~C(){ throw 1;}
};
void main(){
    try{
        C c;
    }
    catch(...){}
}
```

析构的异常并不会被捕获，因为`try{}`代码块中只有一行代码`C c`，它并未抛出异常。
经Homebrew gcc 5.1.0编译后，运行时会产生这样的错误输出：

```
libC++abi.dylib: terminating with uncaught exception of type int
```

也许你觉得在`try`中用`delete`手动释放堆对象就可以捕获异常。我们来试试：

```cpp
C *p = new C;
try{
    delete p;
}
catch(...){}
```

上述代码会给出同样的错误输出：

```
libC++abi.dylib: terminating with uncaught exception of type int
```

这只能说明`delete`并不是对析构函数的直接调用，它只是一个关键字。。析构函数还是由C++调用的。
事实上，如果上面不`delete`的话，程序不会产生错误，此时`p`属于内存泄露，
这些内存是在程序退出后由操作系统来回收的。

那么**在析构函数中，应处理掉可能的异常，保证对象能够被完整地释放**。
因为析构函数中总会出现非安全的代码，我们**只能吞掉异常，或者退出程序**。这样：

```cpp
class DBConn{
public:
	~DBConn{
		if(!closed){
			try{
				db.close();
			}
			catch(...){
			  cerr<<"数据库关闭失败"<<endl;
			  // 或者直接退出程序
				// std::abort();
			}
		}
	}
private:
	DBConnection db;
};
```

> 另外值得一提的是，上述`catch(...)`中的`...`并不是省略号，它是合法标识符，表示不确定的形参。

但是对于一个完善的设计，我们需要让客户知道这里发生了异常。
在此只需为不安全语句提供一个新的函数；在析构函数中我们还是执行默认操作（忽略、记录、或者结束程序）。

```cpp
class DBConn{
public:
	void close(){
		db.close();
	}
	...
```

这个常规方法给了客户自行关闭数据库并处理异常的机会，当然如果他放弃这个机会，
便不能怪罪于我们让程序退出或者吞掉异常了。
