---
layout: article
title: Effective C++ 笔记
categories: 读书
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
		static FileSystem fs;
		return fs;
	}
	```
	
# Constructors, Destructors and Assignment Operators

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
