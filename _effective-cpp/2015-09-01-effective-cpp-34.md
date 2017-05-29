---
layout: blog
title: Item 34：区分接口继承和实现继承

tags: C++ 继承 接口 虚函数 继承 编译 虚函数 成员函数
excerpt: 当你public继承一个类时，接口是一定会被继承的，你可以选择子类是否应当继承实现。不继承实现，只继承方法接口：纯虚函数。继承方法接口，以及默认的实现：虚函数。继承方法接口，以及强制的实现：普通函数。
---

> Item 34: Dirrerentiate between inheritance of interface and inheritance of implementation.

不同于Objective C或者Java，C++中的继承接口和实现继承是同一个语法过程。
当你public继承一个类时，接口是一定会被继承的（见[Item32][item32]），你可以选择子类是否应当继承实现：

* 不继承实现，只继承方法接口：纯虚函数。
* 继承方法接口，以及默认的实现：虚函数。
* 继承方法接口，以及强制的实现：普通函数。

<!--more-->

# 一个例子

为了更加直观地讨论接口继承和实现继承的关系，我们还是来看一个例子：`Rect`和`Ellipse`都继承自`Shape`。

```cpp
class Shape{
public:
    // 纯虚函数
    virtual void draw() const = 0;
    // 不纯的虚函数，impure...
    virtual void error(const string& msg);
    // 普通函数
    int id() const;
};
class Rect: public Shape{...};
class Ellipse: public Shape{...};
```

> 纯虚函数`draw()`使得`Shape`成为一个抽象类，只能被继承而不能创建实例。一旦被public继承，它的成员函数接口总是会传递到子类。

* `draw()`是一个纯虚函数，子类必须重新声明`draw`方法，同时父类不给任何实现。
* `id()`是一个普通函数，子类继承了这个接口，以及强制的实现方式（子类为什么不要重写父类方法？参见[Item 33][item33]）。
* `error()`是一个普通的虚函数，子类可以提供一个`error`方法，也可以使用默认的实现。

> 因为像ID这种属性子类没必要去更改它，直接在父类中要求强制实现！

# 危险的默认实现

默认实现通常是子类中共同逻辑的抽象，显式地规约了子类的共同特性，避免了代码重复，方便了以后的增强，也便于长期的代码维护。
然而有时候提供默认实现是危险的，因为你不可预知会有怎样的子类添加进来。例如一个`Airplane`类以及它的几个`Model`子类：

```cpp
class Airplane{
public:
    virtual void fly(){
        // default fly code
    }
};
class ModelA: public Airplane{...};
class ModelB: public Airplane{...};
```

不难想象，我们写父类`Airplane`时，其中的`fly`是针对`ModelA`和`ModelB`实现了通用的逻辑。如果有一天我们加入了`ModelC`却忘记了重写`fly`方法：

```cpp
class ModelC: public Airplane{...};
Airplane* p = new ModelC;
p->fly();
```

虽然`ModelC`忘记了重写`fly`方法，但代码仍然成功编译了！这可能会引发灾难。。这个设计问题的本质是普通虚函数提供了默认实现，而不管子类是否显式地声明它需要默认实现。

# 安全的默认实现

我们可以用另一个方法来给出默认实现，而把`fly`声明为*纯虚函数*，这样既能要求子类显式地重新声明一个`fly`，当子类要求时又能提供默认的实现。

```cpp
class Airplane{
public:
    virtual void fly() = 0;
protected:
    void defaultFly(){...}
}
class ModelA: public Airplane{
public:
    virtual void fly(){defaultFly();}
}
class ModelB: public Airplane{
public:
    virtual void fly(){defaultFly();}
}
```

这样当我们再写一个`ModelC`时，如果自己忘记了声明`fly()`会编译错，因为父类中的`fly()`是纯虚函数。
如果希望使用默认实现时可以直接调用`defaultFly()`。

> 注意`defaultFly`是一个普通函数！如果你把它定义成了虚函数，那么它要不要给默认实现？子类是否允许重写？这是一个循环的问题。。

# 优雅的默认实现

上面我们给出了一种方法来提供安全的默认实现。代价便是为这种接口都提供一对函数：`fly`, `defaultFly`, `land`, `defaultLand`, ...
有人认为这些名字难以区分的函数污染了命名空间。他们有更好的办法：为纯虚函数提供函数定义。

> 确实是可以为纯虚函数提供实现的，编译会通过。但只能通过`Shape::draw`的方式调用它。

```cpp
class Airplane{
public:
    virtual void fly() = 0;
};
void Airplane::fly(){
    // default fly code
}

class ModelA: public Airplane{
public:
    virtual void fly(){
        Airplane::fly();
    }
};
```

上述的实现和普通成员函数`defaultFly`并无太大区别，只是把`defaultFly`和`fly`合并了。
合并之后其实是有一定的副作用的：原来的默认实现是`protected`，现在变成`public`了。在外部可以访问它：

```cpp
Airplane* p = new ModelA;
p->Airplane::fly();
```

在一定程度上破坏了封装，但[Item 22][item22]我们提到，`protected`并不比`public`更加封装。
所以也无大碍，毕竟不管`defaultFly`还是`fly`都是暴露给类外的对象使用的，本来就不能够封装。

[item22]: /2015/08/19/effective-cpp-22.html
[item32]: /2015/08/30/effective-cpp-32.html
[item33]: /2015/08/31/effective-cpp-33.html

