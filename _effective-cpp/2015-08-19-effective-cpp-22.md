---
layout: blog
title: Item 22：数据成员应声明为私有

tags: C++ 内存 封装 接口 继承 
excerpt: 数据成员声明为私有可以提供一致的接口语法，提供细粒度的访问控制，易于维护类的不变式，同时可以让作者的实现更加灵活。而且我们会看到，`protected`并不比`public`更加利于封装。
---

> Item 22: Declare data members private

数据成员声明为私有可以提供一致的接口语法，提供细粒度的访问控制，易于维护类的不变式，同时可以让作者的实现更加灵活。而且我们会看到，`protected`并不比`public`更加利于封装。

<!--more-->

# 语法一致性

你肯定也遇到过这种困惑，是否应该加括号呢？

```cpp
obj.length  // 还是 obj.length()?
obj.size    // 还是 obj.size()?
```

总是难以记住如何获取该属性，是调用一个`getter`？还是直接取值？如果我们把所有数据都声明为私有，那么在调用语法上，统一用括号就好了。

# 访问控制

为数据成员提供getter和setter可以实现对数据更加精细的访问控制，比如实现一个只读的属性：

```cpp
class readOnly{
  int data;
public:
  int get() const { return data; }
}
```

事实上，在C#中提供了*访问器*（又称属性）的概念，
每个数据成员都可以定义一套访问器（包括setter和getter），使用访问器不需要使用括号：

```csharp
public class readWrite{
  private string _Name;
  public string Name{
    set { this._Name = value; }
    get { return this._Name; }
  }
}
ReadWrite rw;
// 将会调用set方法
rw.Name = "alice";
```

# 可维护性

封装所有的数据可以方便以后类的维护，比如你可以随意更改内部实现，而不会影响到既有的客户。例如一个`SpeedDataCollection`需要给出一个平均值：

```cpp
class SpeedDataCollection{
public:
  void add(int speed);
  double average() const;
};
```

`average()`可以有两种实现方式：维护一个当前平均值的属性，每当`add`时调整该属性；每次调用`average()`时重新计算。两种实现方式之间的选择事实上是CPU和内存的权衡，如果在一个内存很有限的系统中可能你需要选择后者，但如果你需要频繁地调用`average()`而且一点内存不是问题，那么就可以选择前者。

你的实现方式的变化不会影响到你的客户。但如果`avarage()`不是方法而是一个共有数据成员。
那么对于你的每次实现方式变化，客户就必须重新实现、重新编译、重新调试和测试它们的代码了。

# 来看看 protected

既然共有数据成员会破坏封装，它的改动会影响客户代码。那么`protected`呢？

面向对象的精髓在于封装，可以粗略地认为一个数据成员的封装性反比于它的改动会破坏的代码数量。比如上述的`average`如果是一个`public`成员，它的改动会影响到所有曾使用它的客户代码，它们的数量是大到不可知的(unknowably large amount)。如果是`protected`成员，客户虽然不能直接使用它，但可以定义大量的类来继承自它，所以它的改动最终影响的代码数量也是 unknowably large。

`protected`和`public`的封装性是一样的！如果你曾写了共有或保护的数据成员，你都不能随意地改动它们而不影响客户代码！

