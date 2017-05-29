---
layout: blog
title: Item 35：考虑虚函数的其他替代设计

tags: C++ 策略模式 模板方法 虚函数 函数指针 JavaScript traits
excerpt: 非虚接口范式（NVI idiom）可以实现模板方法设计模式。用函数指针代替虚函数，可以实现策略模式。用function代替函数指针，可以支持所有兼容目标函数签名的可调用对象。用另一个类层级中的虚函数来提供策略，是策略模式的惯例实现。
---

> Item 35: Consider alternatives to virtual functions.

比如你在开发一个游戏，每个角色都有一个`healthValue()`方法。很显然你应该把它声明为虚函数，可以提供默认的实现，让子类去自定义它。
这个设计方式太显然了你都不会考虑其他的设计方法。但有时确实存在更好的，本节便来举几个替代的所涉及方法。

* 非虚接口范式（NVI idiom）可以实现模板方法设计模式（Template Method），用非虚函数来调用更加封装的虚函数。
* 用函数指针代替虚函数，可以实现策略模式。
* 用`tr1::function`代替函数指针，可以支持所有兼容目标函数签名的可调用对象。
* 用另一个类层级中的虚函数来提供策略，是策略模式的惯例实现。

<!--more-->

# NVI实现模板方法模式

> **模板方法设计模式**：我们知道实现某个业务的步骤，但具体算法需要子类分别实现。

使用**非虚接口**（Non-Virtual Interface Idiom）可以实现模板方法模式。比如上面的`healthValue`声明为普通函数，它调用一个私有虚函数`doHealthValue`来实现。
实现起来是这样的：

```cpp
class GameCharacter{
public:
    // 子类不应重新定义该方法，见Item 36
    int healthValue() const{
        // do sth. before
        int ret = doHealthValue();
        // do sth. after
        return ret;
    }
private:
    // 子类可以重新定义该方法
    virtual int doHealthValue() const{
        // 默认实现
    }
}
```

NVI Idiom的好处在于，在调用`doHealthValue`前可以做一些设置上下文的工作，调用后可以清除上下文。
比如在调用前给互斥量（mutex）加锁、验证前置条件、类的不变式；调用后给互斥量解锁、验证后置条件、类的不变式等。

上述C++代码也有奇怪的地方，你可能已经发现了。`doHealthValue`在子类中是不可调用的，然而子类却重写了它。
但C++允许这样做是有充分理由的：父类拥有何时（when）调用该接口的权利；子类拥有如何（how）实现该接口的权利。

> 有时为了继承实现方式，子类虚函数会调用父类虚函数，这时`doHealthValue`就需要是protected了。
> 有时（比如析构函数）虚函数还必须是public，那么就不能使用NVI了。

# 函数指针实现策略模式

上述的NVI随是实现了模板方法，但事实上还是在用虚函数。我们甚至可以让`healthValue()`完全独立于角色的类，只在构造函数时把该函数作为参数传入。

```cpp
class GameCharacter;

int defaultHealthCalc(const GameCharacter& gc);

class GameCharacter{
public:
    typedef int (*HealthCalcFunc)(const GameCharacter&);
    explicit GameCharacter(HealthCalcFunc hcf = defaultHealthCalc): healthFunc(hcf){}
    int healthValue() const{
        return healthFunc(*this);
    }
private:
    HealthCalcFunc healthFunc;
}
```

这便实现了**策略模式**。可以在运行时指定每个对象的生命值计算策略，比虚函数的实现方式有更大的灵活性：

* 同一角色类的不同对象可以有不同的`healthCalcFunc`。只需要在构造时传入不同策略即可。
* 角色的`healthCalcFunc`可以动态改变。只需要提供一个`setHealthCalculator`成员方法即可。

我们使用外部函数实现了策略模式，但因为`defaultHealthCalc`是外部函数，所以无法访问类的私有成员。
如果它通过public成员便可以实现的话就没有任何问题了，如果需要内部细节：

我们只能弱化`GameCharacter`的封装。或者提供更多public成员，或者将`defaultHealthCalc`设为`friend`。
弱化的封装和更灵活的策略是一个需要权衡的设计问题，取决于实际问题中动态策略的需求有多大。

# tr1::function实现策略模式

如果你已经习惯了模板编程，可能会发现函数指针实现的策略模式太过死板。
为什么不能接受一个像函数一样的东西呢（比如函数对象）？为什么不能是一个成员函数呢？为什么一定要返回`int`而不能是其他兼容类型呢？

`tr1`中给出了解决方案，使用`tr1::function`代替函数指针！`tr1::function`是一个对象，
他可以保存任何一种类型兼容的可调用的实体（callable entity）例如函数对象、成员函数指针等。
看代码：

> 现在`tr1`在C++11标准中已经被合并入`std`命名空间啦（叫做多态函数对象包装器），不需要`std::tr1::function`了，可以直接写`std::function`。

```cpp
class GameCharacter;
int defaultHealthCalc(const GameCharacter& gc);

class GameCharacter{
public:
    typedef std::function<int (const GameCharacter&)> HealthCalcFunc;
    explicit GameCaracter(HealthCalcFunc hcf = defaultHealthCalc): healthCalcFunc(hcf){}
    int healthValue() const{
        return healthFunc(*this);
    }
private:
    HealthCalcFunc healthFunc;
};
```

注意`std::function`的模板参数是`int (const GameCharacter&)`，参数是`GameCharacter`的引用返回值是`int`，
但`healthCalcFunc`可以接受任何与该签名兼容的可调用实体。即只要参数可以隐式转换为`GameCharacter`返回值可以隐式转换为`int`就可以。
用`function`代替函数指针后客户代码可以更加灵活：

```cpp
// 类型兼容的函数
short calcHealth(const GameCharacter&);
// 函数对象
struct HealthCalculator{
    int operator()(const GameCharacter&) const{...}
};
// 成员函数
class GameLevel{
public:
    float health(const GameCharacter&) const;
};
```

无论是类型兼容的函数、函数对象还是成员函数，现在都可以用来初始化一个`GameCharacter`对象：

```cpp
GameCharacter evil, good, bad;
// 函数
evil(calcHealth);                       
// 函数对象
good(HealthCalculator());
// 成员函数
GameLevel currentLevel;
bad(std::bind(&GameLevel::health, currentLevel, _1));
```

最后一个需要解释一下，`GameLevel::health`接受一个参数`const GameCharacter&`，
但事实上在运行时它是需要两个参数的，`const GameCharacter&`以及`this`。只是编译器把后者隐藏掉了。
那么`std::bind`的语义就清楚了：首先它指定了要调用的方法是`GameLevel::health`，第一个参数是`currentLevel`，
`this`是`_1`，即`&currentLevel`（细节略过啦！，这里的重点在于成员函数也可以传入！）。

> 如果你写过JavaScript你会发现这就是`Function.prototype.bind`嘛！

# 经典的策略模式

可能你更关心**策略模式**本身而不是上述的这些实现，现在我们来讨论策略模式的一般实现。
在UML表示中，生命值计算函数`HealthCalcFunc`应当定义为一个类，拥有自己的类层级。
它的成员方法`calc`应当为虚函数，并在子类可以有不同的实现。

![][strategy-pattern]

实现代码可能是这样的：

```cpp
class HealthCalcFunc{
public:
    virtual int calc(const CameCharacter& gc) const;
};
HealthCalcFunc defaultHealthCalc;
class GameCharacter{
public:
    explicit GameCharacter(HealthCalcFunc *phcf = &defaultHealthCalc): pHealthCalc(phcf){}
    int healthValue() const{
        return pHealthCalc->calc(*this);
    }
private:
    HealthCalcFunc *pHealthCalc;
};
```

熟悉策略模式的人一眼就能看出来上述代码是策略模式的经典实现。可以通过继承`HealthCalcFunc`很方便地生成新的策略。

[strategy-pattern]: /assets/img/blog/effective-cpp/strategy-pattern@2x.png
