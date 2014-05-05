---
layout: blog
title: Effective C++ 笔记
categories: reading
tags: C++
---

两年前第一次接触 Scott Mayers 的 Effective C++，最近面试C++工程师，又拿来研读，整理了一些读书笔记。

# C++ Way

> Prefer consts, enums, and inlines to \#defines.

尽量使用常量、枚举和内联函数，代替`#define`。即习惯于使用C++风格，可以避免模块化编程的诸多缺点。

1. `#define` 常量全局可用，不利于封装。因为在预编译时进行宏替换，与它们相关的编译错误将不会出现宏名称，不利于调试。
2. 使用`enum`定义类常量较为合适。因为`static const int`允许取地址，此时不仅需要声明，还需要定义。
3. `#define`函数将会产生出乎意料的结果，如`#define MAX(a,b) a>b?a:b`，在调用`MAX(i++,j)`的情况下，`i`自加次数将取决于`j`的大小。

<!--more-->

> Use const whenever possible.

尽量使用常量。这在C++风格中是值得提倡的，尤其在合作项目中。不想改变的变量应该明确地提醒其他程序员，不要侥幸！

1. 对于类似`*`的运算符，应返回`const`类型，来避免`(a*b)=c`这样的语句通过编译。
2. 常量引用传参是值得提倡的，可以提高效率。
3. 编译器一般实现 bitwise-constness 而不是 logical-constness，可通过 `mutable` 来使const函数能够更改logical常量（如缓存）。
4. const 与 non-const 成员函数的避免重复。

	```cpp
	const char& operator[](size_t pos){
		...
	}
	
	char& operator[](size_t pos){
		return const_cast<char&>(
			static_cast<const TextBlock&>(*this)
				[pos]	
		);
	}
	```
	
> Make sure that objects are initialized before they're used.

在使用对象前确保其已经初始化。出于效率原因，C++不保证内置型的初始化。

1. 在构造函数内的`=`是赋值不是初始化！在构造函数前总是列出所有成员变量，以免遗漏。
2. 类的静态变量除了在类声明中进行声明外，还需要在类声明外进行定义。
2. 多个编译单元的 non-local static 对象初始化次序是不确定的。使用 Singleton(local static) 来解决该问题：

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
public:
    static Singleton& getInstance()
    {
        Lock(); // not needed after C++0x
        static SingletonInside instance;
        UnLock(); // not needed after C++0x
        return instance; 
    }
};
```
	
注意：C++0X以后，要求编译器保证内部静态变量的线程安全性，可以不加锁。这里采用内部静态变量方式，还有另外两种实现：

1. 静态指针成员。采取懒汉模式，指针为空则构造（`new`）。
2. 静态成员。采取饿汉模式，外部初始化（`new`），指针需要为`const`。


# Construction

> Know what functions C++ silently writes and calls.

如果没有定义任何构造函数（析构函数，复制构造函数，`=`运算符），编译器会生成默认构造函数（析构函数，复制构造函数，`=`运算符）。调用时机如下：

1. 构造函数：对象定义；使用其他兼容的类型初始化对象时（可使用 `explicit` 来避免这种情况）
2. 复制构造函数：用一个对象来初始化另一对象时；传入对象参数时；返回对象时；
3. 析构函数：作用域结束（包括函数返回）时；`delete`
4. `=`运算符：一个对象赋值给另一对象

> Explicitly disallow the use of compiler-generated functions you do not want.

对于`Uncopyable`，声明其复制构造函数与`=`运算符为`private`：

```cpp
class HomeForSale{
private:
	HomeForSale(const HomeForSale&);
	HomeForSale& operator=(const HomeForSale&);
};
```

> Declare destructors  virtual in polymorphic base classes.

对于多态用途的父类，析构函数应声明为`virtual`，否则当指针或引用类型为父类时，调用析构函数将只析构父类中定义的资源。相应地，`non-virtual`析构函数的类不应被继承。（很不幸，C++不提供类似Java的`final class`或C#的`sealed class`禁止来派生）。

> Prevent exceptions from leaving destructors.

在析构函数中，应处理掉可能的异常，保证对象能够被完整地释放。为了让用户有机会处理这些异常，可以为不安全语句提供一个新的函数；在析构函数中执行默认操作（忽略、记录、或者结束程序）。

```cpp
class DBConn{
public:
	void close(){
		db.close();
		closed = true;
	}
	~DBConn{
		if(!closed){
			try{
				db.close();
			}
			catch(...){
				...
			}
		}
	}
private:
	DBConnection db;
	bool closed;
};
```

> Never call virtual functions during construction or destruction.

在子类对象的父类构造期间，对象类型为父类而非子类。此时，虚函数会被解析至父类，运行时类型信息也为父类（`dynamic_cast`, `typeid`）。

即父类构造期间，对虚函数的调用不会下降至子类。对于构造函数中直接的虚函数调用，某些编译器会发出警告。

> Have assignment operators return a reference to *this.

这是关于赋值运算符的协议，以支持连锁赋值语句。

> Handle assignment to self in operator=.

确保当对象自我赋值时，`=`运算符仍有良好的行为。当然可以事先进行判断（是否为自我赋值），更为简洁的方式为：copy-and-swap.

```cpp
// 注意这里为传值，而不是经典的常量引用
Widget& Widget::operator=(Widget rhs){
	swap(rhs);
	return *this;
}
```

> Copy all parts of an object.

复制构造函数与`=`运算符应拷贝对象的所有成员，这是显然的。然而在两种情况下可能发生疏忽：

1. 忘记了新增成员变量。
2. 忘记了调用父类的复制构造函数（`=`运算符）。

注意：虽然`=`运算符与复制构造函数的行为很相似，但在`=`运算符中调用复制构造函数时不合理的，就像是试图构造一个已经存在的对象。通常将相同的代码抽出来放入`private init`方法中。

# Resource Management

> Use objects to manage resources.

使用`new`构造的对象，如果将删除它的责任给调用者，将很容易发生疏漏，尤其是控制流发生改变时（无意的提前`return`, `break`, etc.）。

利用对象在作用域结束时自动的析构函数，可以实现资源的自动释放，即RAII(Resource Acquisition Is Initialization)。在`std`下已经存在这样一个预定义的类模板：`auto_ptr`，它被销毁时会自动删除所指之物，被赋值或赋值时原指针将会变为null来保证资源的唯一。

```cpp
std::auto_ptr<Investment> pInv(createInvestment());
```

同样，`std::tr1::share_ptr`为RCSP(reference-counting smart pointer)，类似垃圾回收（garbage collection），不同的是RCSP无法解决环状引用（cycles of references）。

另外，`auto_ptr`与`share_ptr`在析构函数内均调用`delete`而不是`delete[]`，故不能用于数组的管理。数组可选用STL的容器。

> Think carefully about copying behavior in resource-managing classes.

RAII对象的复制需要特殊处理，其复制行为由资源的复制行为决定。通常有如下几种：

1. 禁止复制
2. 引用计数
3. 复制底层资源
4. 转移资源所有权

> Provide access to raw resources in resource-managing classes.

资源管理类当然需要提供API来提供原始资源。提供方式可能为隐式转换或显式转换，隐式转换更方便，但有可能会造成误用（混淆了RAII对象与原始资源），不够安全。

> Use the same form in corresponding uses of new and delete.

这条为C++内存使用的规则。使用`new`则对应使用`delete`；使用`new sth[]`则对应使用`delete[]`。

尽量不对数组形式做`typedef`来避免疏忽。

> Store newed objects in smart pointers in standalone statements.

使用单独语句将资源置入智能指针。这样可以避免因异常而导致内存泄漏。如：

```cpp
processWidget(std::tr1::shared_ptr<Widget>(new Widget), priority());
```

C++的执行次序是未知的。如果先创建了对象，此后执行`priority()`产生异常，则该资源会被泄漏。

# Designs and Declarations

> Make interfaces easy to use correctly and hard to use incorrectly.

好的接口不容易被误用。“促进正确使用”包括：

1. 与内置类型行为的一致性。
2. 较强的类型限制。如工厂方法直接返回智能指针而不是依靠客户；不应改变的返回值设为`const`，等等。

**cross-DLL problem**：跨DLL成对使用`new`和`delete`容易引发运行时错误。使用智能指针可以消除这个问题，它会将引用记录一并带入新的环境中，在引用为0时调用`delete`。

> Treat class design as type design.

这里提出了定义新类时需要考虑的一系列问题：

1. 如何创建和销毁
2. 初始化和赋值的区别
3. 传值（pass by value）意味着什么
4. 合法值
5. 新类需要配合某个继承图吗
6. 类型转换
7. 运算符和函数操作
8. 不合适的标准函数（private覆盖）
9. 访问控制
10. 应提供哪些接口
11. 是否应该考虑类模板

> Prefer pass-by-reference-to-const to pass-by-value

通常传递引用会更加高效，而且可以避免对象切割问题（子类传值给父类，将损失子类信息）。

对于并不昂贵的拷贝操作，传值更加高效，这些类型包括：

1. 内置类型
2. STL迭代器
3. 函数对象

> Don't try to return a reference when you must return an object.

1. 不要返回局部对象的指针或引用（栈中的变量将在函数结束后释放）
2. 不要返回堆中对象的指针或引用（在资源获取时除外），会导致内存泄漏
3. 不要返回局部静态对象的指针或引用（除非这样的对象是单例的）。

> Declare data members private.

将数据成员声明为`private`。这样可提供更好的一致性、精确的访问控制、更强的约束条件、充分的弹性（方便实现更改通知、条件赋值等）。

> Prefer non-member non-friend functions to member functions.

更多采用非成员、非友元函数，而不是成员函数。好处如下：

1. 更强的封装。越少的函数可以访问数据，则封装性越强。这便意味着更少的成员函数。如此一来，数据成员的改变只影响少数的成员函数，于是提供了更好的封装。
2. 包的灵活性(packaging flexibility)。std正是这样组织的：数十个头文件来分别提供相关功能，只有用户需要的功能会形成编译依赖。如果以成员函数的方式来组织，将会成为一个庞大的头文件，因为一个类必须整体定义。
3. 功能扩充性。只需在同一命名空间添加函数便可与旧函数整合。如果以成员函数来组织，恐怕要以继承的方式来提供有限的扩展。

> Declare non-member functions when type conversions should apply to all parameters.

当所有参数都可能需要类型转换时，采用非成员函数。这通常用于运算符重载的情形：当重载为成员函数时，第一个操作数必须为`*this`；重载为非成员函数时，第一个操作数可以为任何兼容的数据类型。

```cpp
class Rational{
public:
	...
	const Rational operator* (const Rational& rhs) const;
}
Rational r(1,8);
Rational result1 = r * 2; //ok, 隐式类型转换
Rational result2 = 2 * r; //error!
```

```cpp
const Rational operator*(const Rational& lhs, const Rational& rhs);
Rational result1 = r * 2; //ok, 隐式类型转换
Rational result2 = 2 * r; //ok, 隐式类型转换
```

> Consider support for a non-throwing swap.

`swap`是STL的一部分，是异常安全编程（exception-safe programming）的基础，以及用来处理可能的自我赋值。

1. 当`std::swap`效率不高时，可以提供一个成员 `swap`，并用非成员`swap`调用它。
2. 对于类，应当特化`std::swap`。
2. 对于类模板，因为C++不允许模板函数的偏特化，我们不能特化`std::swap`。采用如下的方法：  

    ```cpp
    namespace WidgetStuff{
        ...
        template<typename T>
        class Widget{...};
        
        template<typename T>
        void swap(Widget<T>& a, Widget<T>& b){
            a.swap(b);
        }
    }

    template<typename T>
    void dosth(T& obj1, T& obj2){
        using std::swap;	//使之可见
        ...
        swap(obj1, obj2);	//自动选择最佳
        ...
    }
    ```  

	编译器会首先去模板参数类型所在命名空间寻找；因为前面的声明，`std::swap`中的匹配特化版将有最高的优先级；如果前两者都不存在，则采用`std`中的默认版本。
4. std内只允许进行特化，添加新的模板、类、函数等等都会引起未定义行为。

# Implementations

> Postone variable definitions as long as possible.

局部变量的定义需要承受其构造与析构成本，即使是未被使用的变量。因此推迟变量定义可增加清晰度和改善效率。

对于循环中使用的变量，其时间成本如下：

1. 在循环外定义：1个构造+1个析构+n个赋值
2. 在循环内定义：n个构造+n个析构

另外，方法1还会降低可理解性和易维护性。因此，除非（1）你知道复制成本<构造+析构（2）这部分效率高度敏感（performance-sensitive），否则应使用方法2.

> Minimize casting.

尽量别转型。C++的设计目标之一即是：杜绝类型错误。

我们回顾一下转型语法：

1. C风格的转型：

	```cpp
	(T) expression
	```

2. 函数风格的转型：

	```cpp
	T(expression)
	```
	
	这两者都属于旧式转型（old-styled casts）
3. C++ 新式转型：（new-style，C++-style casts）

	```cpp
	// 常量性移除（cast away the constness）
	const_cast<T>(expression)
	
	// 安全向下转型（safe downcasting）
	dynamic_cast<T>(expression)
	
	// 低级转型，实际动作可能取决于编译器，不可移植
	reinterpret_cast<T>(expression)
	
	// 强制隐式转换（implicit conversions）
	static_cast<T>(expression)
	```
	
应尽量采用C++风格转型，因为（1）容易辨识（2）功能明确，编译器容易找到错误。当然有时采用旧式转型仍然很方便，比如将转型隐藏在函数调用中：

```cpp
void doSomeWork(const Widget& w);
doSomeWork(Widget());
```

注意：

* 转型创建的只是副本，不应以此试图调用基类函数，可以采用`BaseClass::func()`或`virtual func;`来实现此类功能。
* `dynamic_cast`在很多实现版本中效率很差。一种实现是通过类名的`strcmp`来得到子类。
* 避免做出“对象在C++中如何布局”的假设，更不要在此假设基础上去转型。比如：同一对象的基类指针和子类指针可能不同。

> Avoid returning "handles" to object internals.

避免返回对象内部变量的句柄（包括指针、引用、智能指针）。这样既会破坏封装，也可能造成空悬指针。

1. 破坏封装。返回私有成员和私有函数，无疑都会使其私有性形同虚设。以下是一个返回私有成员函数指针的例子。

    ```cpp
    class A; 
    typedef void (A::* pfunc)();
    
    class A{
    private:
        void func(){ 
            cout<<"I'm private."<<endl;
        }   
    public:
        pfunc get(){
            return &A::func;
        }   
    };
    ...
    A a;
    pfunc p = a.get();
    (a.*p)();
    ```
    上述问题表明：成员的封装性不大于返回其引用的函数的访问级别。另外，如果`const`成员函数传出引用，而后者的数据存储于对象之外，则会造成常量性的破缺（bitwise constness）。

2. 空悬指针。显然对象的内部变量一旦传出，其生存期就可能超过它的来源对象，空悬指针便会成为可能。这是应极力避免的。然而，在某些情况下却不得不这样做：

    ```cpp
    class string{
        ...
        &char operator[](int i){
            ...
        }
    }
    ```

> Strive for exception-safe code.

尽量实现异常安全。**异常安全函数（Exception-safe functions）**当异常抛出时：

1. 不泄漏任何资源。
2. 不允许数据一致性破坏。

异常安全函数应提供以下三个保证之一：

1. 基本承诺。如果异常抛出，程序内的事物仍然有效。但不保证程序所处的状态。
2. 强烈保证。如果异常抛出，程序状态不变。
3. 不抛掷（nothrow）保证。总是能完成其承诺的功能。C++中，对于内置类型的所有操作都提供了nothrow保证。

给一个异常安全性很差的例子：

```cpp
// 当 new Image 抛出异常时
void changeBg(string imsSrc){
    lock(&mutex);
    delete bgImage;  // bgImage 变为空，数据破坏
    ++imageChanges;  // 不应进行的累加，数据破坏
    bgImage = new Image(imgSrc);
    unlock(&mutex);  // 将不会释放互斥锁，资源泄漏
}
```

对于这个例子，我么可以采用自动锁、智能指针，并适当更改代码顺序，即可实现强烈保证。

```cpp
void changeBg(string imgSrc){
    Lock m1(&mutex);    // 退出作用域将自动释放
    bgImage.reset(new Image(imgSrc));   // reset只有其参数成功后才会调用
    ++imageChanges;
}
```

另外，对于实现异常安全存在一般的方法：先生成副本，对副本进行所有操作，结束后进行`swap`。无疑这回增加性能负担。
```cpp
void changeBg(string imgSrc){
    using std::swap;
    Lock m1(&mutex);    // 退出作用域将自动释放
    ... // generate pNew from pOld
    swap(pNew, pOld);
}
```

值得一提的是，函数提供的“异常安全保证”通常最高只等于其所调用的各个函数中最弱的“异常安全保证”。

> Understand int ins and outs of inlining.

Inline函数的定义有两种方式：（1）显示的定义，在函数名前加`inline`，（2）隐式的定义，在类声明中定义函数体，包括`friend`函数和构造函数。

Inline只是对编译器的一个申请而非强制命令。在如下情形中，inline无效：

1. 函数太过复杂，如含有循环和递归的函数。
2. 虚函数。因为虚函数运行时才知道调用哪个，而内联函数要求编译期进行替换。
3. 被指针调用的函数。因为内联函数没有地址，也不可能被指针引用。

Inline函数的缺点：

1. 很显然，代码膨胀。
2. 程序库的更新。inline函数无法直接升级其所在库，其他用到它的单元都需要重新编译。
3. Debug困难。显然， 不与object code对应的内联函数内无法设置断点。


构造函数看起来是inline函数的绝佳候选人，因为通常不含任何代码。但是，编译器会在编译前在此插入大量的代码以保证C++机制的实现。如：定义和`new`时自动初始化，父类和成员对象自动初始化，退出作用域自动销毁，异常抛出时已构造好的部分自动销毁等等。

inline 一般位于头文件，因为编译时为了替换首先要得到其定义式；同样template也一般在头文件，同样为了具现化，首先要得到其定义式。但二者无特定关联。template函数如果没有理由就不应设为inline。

> Minimize compilation dependencies between files.

最小化文件之间的编译依赖。C++没有提供很好的“接口与实现分离机制（public与private的分离）。最小化编译依赖的一般构想是：依赖于声明式，而不是定义式。如下做法都源自这样的策略：

1. 尽量使用指针和引用。（不需得到对象大小，因而只需声明式）
2. 如果能够，尽量使用声明式。
3. 为声明与定义提供不同的头文件。


有如下两种方法可以实现接口与实现的分离。

1. Handle class，这是代理的策略（pimpl idiom）。在Handle类中维护Implementation类的指针，并在所有接口函数的实现中直接调用Implementation对应的函数。
2. Interface class，将Interface类声明为抽象基类（abstract base class）。只提供一组pure virtual函数和一个virtual析构函数，然后再提供一个静态factory方法来返回子类对象。

在Handle class和Interface class中，inline函数用来隐藏其实现细节（即函数本体）。


# Object-Oriented Design

> Make sure public inheritance models "is-a".

public继承一定要用在is-a关系中，要满足李氏替换原则（Liskov Substitution Priciple）。比如鸟都会飞，企鹅继承自鸟，便是一种错误：

```cpp
class Bird{
    public: 
        virtual void fly();
};
class Penguin: public Bird{
};
```

考虑到只有部分鸟会飞，得到更好的实现：

```cpp
class Bird{};
class FlyingBird: public Bird{
public:
    virtual void fly();
};
class Penguin: public Bird{};
```

当然可以不实现一个`Flyingbird`，而使`Penguin::fly();`抛出一个错误。这样做的后果是将错误从编译器延迟到运行期。

> Avoid hiding inherited names.

避免覆盖继承而来的成员。子类中的成员会覆盖父类的同名成员，而无视参数是否相同：

```cpp
class Base{
    void f();
    void f(int);
};
class Derived: public Base{
    void f();
};
Derived d();
d.f(3); // 错误！
```

可以采用`using`声明式来使父类中的其他名称可用：
```cpp
...
class Derived: public Base{
    using Base::f;  //暴露Base中名为f的所有东西
    void f();
};
Derived d();
d.f(3); //现在可以了
```
或者forwarding函数调用父类的实现：
```cpp
...
class Derived: public Base{
    void f(){ Base::f(); }  // inline forwarding function
};
Derived f();
d.f(3); //错误！同样被覆盖
```

> Differentiate between inheritance of interface and inheritance of implementation.

区分接口继承和实现继承。

1. pure virtual函数：只继承接口
2. simple(impure) virtual函数：继承接口和一份缺省实现
3. non-virtual函数：继承接口和一份强制实现

对于第2种情况，考虑到缺省实现只用于真正实现的部分（为了避免代码冗余），而真正的实现不应直接使用缺省实现的情况。可以定义pure virtual函数，并以另一个protected函数来提供缺省实现。一种更优雅（避免相似的函数名称造成命名空间污染）的实现，可以为pure virtual函数提供缺省实现：

```cpp
class Airplane{
public:
    virtual void fly()=0;
}
void Airplane::fly(){   // 编译器不会报错
    ... //缺省实现
}

class ModelA: public Airplane{
public:
    virtual void fly(){
        Airplane::fly();    // 纯虚函数实现的调用方式：pModelA->Airplane::fly()
        ... //自定义实现
    }
}
```

这样既强制用户实现自己的方法，同时提供了缺省实现。


> Consider alternatives to virtual functions.

当你寻找设计方法时，不妨考虑一下virtual函数的一些替代方案。如template method模式，Strategy模式。

采用NVI（Non-Virtual Interface）实现的Template method模式。由non-virtual函数（即为接口）作为模板方法，划分其执行步骤。virtual函数来提供其各步骤的实现方式：

```cpp
class GameCharacter{
public:
    int healthValue() const{
        ... // 前面的处理
        int v = doHealthValue();    // 真正的工作
        ... // 后面的处理
        return v;
    }
private:
    virtual int doHealthValue() const{} //由子类提供不同的实现
};
```

采用函数指针实现的Strategy模式。由函数指针来提供计算生命值的策略，这类方法中难免出现灵活性与降低封装的权衡。

```cpp
int *defaultHealthCalc(const GameCharacter&);

class GameCharacter{
public:
    typedef int (*healthCalcFunc)(const GameCharacter&);
    explicit GameCharacter(HealthCalcFunc hcf=defaultHealthCalc): healthCalcFunc(hcf);
    int healthFunc(*this) const{return healthFunc(*this);}
private:
    HealthCalcFunc healthFunc;
};
int loseHealthQuickly(const GameCharacter&);
int loseHealthSlowly(const GameCharacter&);

GameCharacter c1(loseHealthQuickly);
GameCharacter c2(loseHealthSlowly);
```

可以看到Strategy模式提供了很大的灵活性：（1）同一类型的对象可以有不同的计算策略，（2）计算策略可以在运行时变更。另外，如果采用`tr1::functoin`代替函数指针将提供更大的灵活性：计算策略可以包括兼容的函数、函数对象、成员函数等等。

```cpp
...
class GameCharacter{
public:
    typedef std::tr1::function<int (const GameCharacter&)> HealthCalcFunc;
    ...
};

short calcFunc(const GameCharacter);    //兼容的函数

struct Calculator{
    int operator(const GameCharacter&) const{...};  // 函数对象
};

class GameLevel{
public:
    float health(const GameCharacter&) const;   //成员函数
};

GameCharacter c1(calcFunc);
GameCharacter c2(Calculator());

GameLevel currentLevel;
GameCharacter c3(
    std::tr1::bind(&GameLevel::health,
        currentLevel,
        _1);    // 以currentLevel调用health函数
```

> Never redefine an inherited non-virtual function.

不要覆盖父类的non-virtual函数。不同于vitual函数的动态绑定（dynamically bound），non-virtual函数是静态绑定（statically bound）的。通过B类型的指针调用的non-virtual函数永远是B内定义的版本。这会造成如下的不一致：

```cpp
D x;
D* pD = &x;
B* pB = &x;

pD->mf();
pB->mf();   //结果不同于上面的调用，违反is-a设计。
```

> Never redefine a function's inherited default parameter value.

不要重新定义继承来的方法的默认参数。对于继承来的non-virtual函数，根本不应该覆盖（如上一条）；对于继承来的virtual函数，vitual函数是动态绑定的，而其参数则是静态绑定。即：使用父类指针调用子类中定义的虚函数，其默认参数却永远来源于父类。这是C++基于编译器实现的简易度和程序运行效率的取舍。

> Model "has-a" or "is-implemented-in-terms-of" through composition.

在应用域（application domain），复合意味着 has-a；在实现域（implementation domain），复合意味着 is-implemented-in-terms-of。

> Use private inheritance judiciously.

明智地使用私有继承。私有继承意味着implemented-in-terms-with，并且只继承实现。

通常，私有继承比组合的级别低，他们的区别在于private inheritance允许子类继续更改virtual函数，访问其protected成员。另外，在极端情况下，由于EBO（empty base optimization，空基类消耗空间为0，而作为独立对象大小为1，不考虑alignment）私有继承会稍节省空间。


> Use multiple inheritance judiciously.

明智地使用多重继承。多重继承比单一继承复杂，而且可能导致歧义性。例如：

```cpp
class A{
public:
    void f();
};
class B{
public:
    void f() const;
};
class D:public A, public B{};

D d;
d.f();  // 歧义，编译错
```

如上示例中，C++总是找出最佳匹配的名称后才检测其可用性（包括访问级别、参数、constness）。匹配程度相同便会造成歧义。另外，对于“钻石型”多重继承，子类会有多份祖父的数据。为了避免重复，必须将带有此数据的class成为virtual base class：令所有继承自它的class采用virtual继承（如`class D: virtual public A{};`）。

多重继承还可以用来实现接口与实现的分离，即public继承接口类，private继承实现类。

# Generic Programming

> Understand implicit interfaces and compile-time polymorphism.

Templates 和 Classes 同样都支持接口和多态。

1. 对于 class，接口是显式的（explicit），基于函数签名。多态发生在运行期，以虚函数实现。
2. 对于 template，接口是隐式的（implicit），基于有效表达式（valid expression）。多态发生在编译期，通过模板具现化和函数重载解析（function overloading resolution）实现。

> Understand the two meanings of typename.

1. 作为模板参数前缀，`typename`和`class`完全等价。
2. `typename`还用来标识嵌套从属类型名称；但不出现在基类列表和成员初始化列表。

如果模板内某名称依赖于模板参数，则称之为**从属名称（dependent name）**，如果从属名称存在class或类型嵌套，则称为**嵌套从属名称（nested dependent name）**。因为**嵌套从属类型名称（nested dependent type name）**存在歧义（即不一定是类型，或许只是静态成员，如 `C::iterator`），C++在碰到从属名称时假设它不是类型，此时需要使用`typename`声明该类型名称。

> Know how to access names in templatized base classes.

了解如何访问模板父类中的名称。考虑到模板父类可能被特化（全特化或者偏特化），其中的名称也是不确定的，因而在继承模板类时C++不去父类中查找名称（与object-oriented C完全不同）。有如下3种方法声明这些名称（对于不存在的名称，即使声明过也会在具现化时编译错）：

1. `this->`指针，让编译器假设未特化的父类被继承。
2. `using Base<T>::functoin;`声明式，让编译器假设父类存在这样的名称。
3. `Base<T>::function();`调用，假设`function`已被继承。这样的明确资格修饰（explicit qualification）会关闭virtual绑定行为。

> Factor parameter-independent code out of templates.

将模板参数无关代码抽离Templates。当发生代码重复时，通常将共同的代码提取出来作为单独的函数。而模板具现化造成的代码重复却更加隐蔽。

1. 对于非类型参数造成的代码膨胀，以函数参数或成员变量来替换模板参数。
2. 对于类型参数，让具有相同二进制表述（binary representation）的具现类型（instantiation type）共享实现。例如不同类型的指针，很多平台上的`long`和`int`。

> Use member function templates to accept "all compatible types".

使用成员函数模板来接受所有兼容的类型。对于内置指针，时支持隐式转换的，尤其是子类指针转换为基类指针；而对于智能指针模板，不同的模板参数具现化得到的class之间不会反应其参数类型之间的继承关系。

1. 使用成员函数模板可以生成“可接受所有兼容类型”的函数。例如泛化的拷贝构造函数可以实现隐式转换：

    ```cpp
    template<typename T>
    class SmartPtr{
    public:
        template<typename U>
        SmartPtr(const SmartPtr<U>& other)  // 接受所有类型的copy构造函数
            :heldPtr(other.get()){...}      // 利用成员初始化，对于原是指针不兼容的转换将产生编译错误
                                            // 进而沿用了原始指针一样的兼容策略

        T* get const{   return heldPtr; }
    private:
        T* heldPtr;
    };
    ```
2. 模板并不改变语言规则。如果没有声明copy构造函数，编译器会自动生成一个。因此在声明了泛化copy构造函数后，还是需要声明正常的copy构造函数（赋值运算符也是同样的）。

> Define non-member functions inside templates when type conventions are desired.

当需要类型转换时，将非成员函数定义在模板中。如下代码将通不过编译：

```cpp
template<typename T>
class Rational{...};
template<typename T>
const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs){...}

Rational<int> oneHalf(1,2);
Rational<int> result = oneHalf * 2;
```
在执行`operator*`时，`oneHalf`很容易得到其类型为`Rational<int>`，而`2`却使编译器不知如何推导`T`到底是什么。因为C++编译器在template实参推导过程中，从不考虑隐式类型转换函数（内置隐式转换是兼容的）。可以声明为`friend`，则会在具现化`Rational<int>`时具现化`operator*`的函数声明。此时可以顺利通过编译：

```cpp
class Ratinoal{
    ...
    friend const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs);
};
```

然而链接发生错误，因为只有声明被具现化了。解决方法是将函数本体合并入声明式内：

```cpp
class Rational{
    ...
    // 这里friend的作用并非访问控制，而是使该函数及时被具现化。
    friend const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>& rhs){
        return ...;
    }
};
```

当然这会使`operator*`成为内联函数。如果不希望这样，可以把它作为wrapper，调用外部的某个函数。

> Use traits classes for information about types.

使用 traits class 表现类型信息。类型信息在有些函数中会用到，例如`advance`（用来将迭代器移动n步）。考虑到效率，对于不同类型的迭代器执行的操作应该是不同的。以下介绍如何在该函数中获得类型信息，以进行不同的操作。

STL有五种迭代器：

1. Input。只能向前移动，每次一步，只可读（一次）。如`istream_iterator`。
2. Output。只能向前移动，每次一步，只可写（一次）。如`ostream_iterator`。
3. forward。可以做上述所有事情，而且可以读/写所指内容任意次。如单向链表（stl不提供）。
4. bidirectional。可以做上述所有事情，而且可以向后移动。如`set`, `map`。
5. random access。可以做上述所有事情，而且可以执行迭代器算术，即常量时间向前/后跳跃任意距离。

C++ 提供了为迭代器一组卷标结构（tag struct）：

```cpp
struct input_iterator_tag{};
struct output_iterator_tag{};
struct forward_iterator_tag: public input_iterator_tag{};
struct bidirectional_iterator_tag: public forward_iterator_tag{};
struct random_access_iterator_tag: public bidirectional_iterator_tag{};
```

然后在不同的迭代器中将其对应的`tag class`通过`typedef`统一定义为`iterator::iterator_category`。例如：

```cpp
template<...>
class deque{
public:
    class iterator{
    public:
        typedef random_access_iterator_tag iterator_category;
    };
    ...
};
```

然后提供traits模板，提供各种迭代器类型的`iterator_category`（这样的做法只是为了方便，还有对内置类型的支持）：

```cpp
template<typename IterT>
struct iterator_traits{
    typedef typename IterT::iterator_category iterator_category;
};
```

通过特化模板来支持内置类型：

```cpp
template<typename IterT>
struct iterator_traits<IterT*>{
    typedef random_access_iterator_tag iterator_category;
};
```

至此，我们已经可以在`advance`中通过以下代码来测试类型了：

```cpp
template<typenmae IterT, typename DistT>
void advance(IterT& iter, DistT d){
    if(typeid(typename std::iterator_trates<IterT>::iterator_category) 
        == typeid(typename std::random_access_iterator_tag))
        iter += d;  // 如果具现化的Iter不是随机访问迭代器，则会在此产生编译错
}
```

但是注意到`typeid`在编译期就可以得到结果，而`if`将工作移到运行期，不仅浪费时间，也造成可执行文件膨胀。可以使用函数重载来让编译器在编译期就选择自动合适的函数，定义一系列的重载函数（或函数模板），如：

```cpp
template<...>
void doAdvance(IterT& iter, DistT d,
    std::random_access_terator_tag){
    // do sth
}
```

然后建立控制函数，来调用上述“劳工函数”并传递traits class提供的类型信息：

```cpp
template<...>
void advance(IterT& iter, DistT d){
    doAdvance(iter,d,
        typename std::iterator_traits<IterT>::iterator_category()
        );
}
```

> Be aware of template metaprogramming

模板元编程（TMP，template metaprogramming）是编写基于模板的C++程序并执行与编译期的过程。例如计算阶乘：

```cpp
template<unsigned n>
struct Factorial{
    enum {value = n* Factorial<n-1>::value};
};
template<>
struct Factorial<0>{
    enum {value = 1};
};
...
cout<<Factorial<20>::value<<endl;
```

TMP可将工作从运行期移到编译期，实现早期的错误侦测和更高的执行效率。可以用来生成“基于策略选择组合”的客户定制代码，也可用来避免生成对某些特殊类型并不合适的代码。

# Customizing new and delete

> Understand the behavior of the new-handler.

`std::set_new_handler`可以设置`new`失败时的回调函数，而且它将会被反复调用直到找到足够内存。设计良好的new handler必须做以下事情：

1. 让更多内存可用
2. 安装另一个new-handler，当前的new-handler无法释放足够内存时
3. 移除new-handler，这会使`new`抛出异常
4. 抛出`bad_alloc`或不返回（`abort`或`exit`）

`new (std::nothrow) Widget`将会在申请空间失败时不抛出异常，而使返回`null`，然而在之后的构造函数中仍然产生异常。即Nothrow new不能彻底抑制异常的抛出。

> Understand when it makes sense to replace new and delete.

有很多理由需要自定义`new`和`delete`，包括改善效率、收集heap使用信息、检测错误使用等。

> Adhere to convention when writing new and delete.

自定义`new`和`delete`的惯例：

* `operator new`应内含一个无穷循环，尝试分配内存，如果无法满足则调用new-handler。应该可以处理0byte申请，处理太大的错误申请。

* `operator delete`应在收到`null`时不做任何事情，处理太大的错误申请。

> Write placement delete if you write placement new.

定义placement new的同时也请定义placement delete。

`new`一般接受一个参数`size_t`，对于有更多参数的`new`成为placement new。当申请内存成功，构造函数抛出异常时，C++会尝试调用与`new`同样签名的`delete`，如果没有则什么都不做（将导致内存泄漏）。

定义placement new的同时，为了使客户可以继续使用正常版本，可以采用`using`声明式。

# Miscellany

> Pay attention to compiler warnings.

> Familiarize yourself with the standard library, including TR1.

> Faniliarize yourself with Boost.

