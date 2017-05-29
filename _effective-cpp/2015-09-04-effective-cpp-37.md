---
layout: blog
title: Item 37：不要重写父类函数的默认参数

tags: C++ 动态绑定 虚函数 默认参数 继承
excerpt: 因为虽然虚函数的是动态绑定的，但默认参数是静态绑定的。只有动态绑定的东西才应该被重写。
---

> Item 37: Never redefine a function's inherited default parameter value.

不要重写父类函数的默认参数。[Item 36][item36]已经说明子类中不应该重写继承而来的父类的非虚函数。
那么本文讨论的内容其实是：不要重定义虚函数的默认参数。为什么呢？
因为**虽然虚函数的是动态绑定的，但默认参数是静态绑定的。只有动态绑定的东西才应该被重写**。

<!--more-->

# 静态绑定与动态绑定

静态绑定是在编译期决定的，又称早绑定（early binding）；动态绑定是在运行时决定的，又称晚绑定（late binding）。
举例来讲，`Rect`和`Circle`都继承自`Shape`，`Shape`中有虚方法`draw`。那么：

```cpp
Shape* s1 = new Shape;
Shape* s2 = new Rect;
Shape* s3 = new Circle;
s1->draw();     // s1的静态类型是Shape*，动态类型是Shape*
s2->draw();     // s2的静态类型是Shape*，动态类型是Rect*
s3->draw();     // s3的静态类型是Shape*，动态类型是Circle*
```

在编译期是不知道应该调用哪个`draw`的，因为编译期看到的类型都是一样的：`Shape*`。
在运行时可以通过虚函数表的机制来决定调用哪个`draw`方法，这便是动态绑定。

# 静态绑定的默认参数

虚函数是动态绑定的，但为什么参数是静态绑定的呢？这是出于运行时效率的考虑，如果要动态绑定默认参数，则需要一种类似虚函数表的动态机制。
所以你需要记住默认参数的静态绑定的，否则会引起困惑。来看例子吧：

```cpp
lass Shape{
public:
    virtual void draw(int top = 1){
        cout<<top<<endl;
    }
};
class Rect: public Shape{
public:
    virtual void draw(int top = 2){
        cout<<top<<endl;
    }
};

Rect* rp = new Rect;
Shape* sp = rp;

sp->draw();
rp->draw();
```

在`Rect`中重定义了默认参数为`2`，上述代码的执行结果是这样的：

```
1
2
```

默认参数的值只和静态类型有关，是静态绑定的。

# 最佳实践

**为了避免默认参数的困惑，请不要重定义默认参数**。但当你遵循这条规则时却发现及其蛋疼：

```cpp
class Shape{
public:
    virtual void draw(Color c = Red) const = 0;
};
class Rect: public Shape{
public:
    virtual void draw(Color c = Red) const;
};
```

代码重复！如果父类中的默认参数改了，我们需要修改所有的子类。所以最终的办法是：**避免在虚函数中使用默认参数**。可以通过[Item 35][item35]的NVI范式来做这件事情：

```cpp
class Shape{
public:
    void draw(Color c = Red) const{
        doDraw(color);
    }
private:
    virtual void doDraw(Color c) const = 0;
};
class Rect: public Shape{
    ...
private:
    virtual void doDraw(Color c) const;     // 虚函数没有默认参数啦！
};
```

我们用普通函数定义了默认参数，避免了在动态绑定的虚函数上定义静态绑定的默认参数。

[item35]: /2015/09/02/effective-cpp-35.html
[item36]: /2015/09/03/effective-cpp-36.html
