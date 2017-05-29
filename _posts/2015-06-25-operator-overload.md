---
layout: blog 
title: C++手稿：运算符重载
tags: C++ 引用 运算符 成员函数 构造函数 链式调用 赋值运算符 运算符重载
---

**运算符重载**就是对已有的C++运算符赋予更多的语义，让一个运算符可以作用于其他的数据类型。
典型地，让运算符接受一个类的对象作为参数。

通常有两种方式来重载一个运算符：

1. 声明一个普通函数，作为类的友元。
2. 声明为类的成员方法。

> 事实上，运算符的本质是函数。每个运算符调用会转换为函数调用，运算符的操作数转换为函数参数。
> 运算符的重载本质上是方法的重载。

这些运算符不允许重载：`.`，`.*`，`::`，`?:`，`sizeof`。

# 重载为普通函数

重载为普通函数时，参数的个数为运算符的目数：

```cpp
CPerson operator+(const CPerson& male, const CPerson& female){
    return CPerson(male.name + female.name);
};

CPerson male("Bob"), female("Alice");
CPerson child1 = male + female;
// 等价于
CPerson child2 = operator+(male, female);
```

这些运算符必须重载为成员函数：`()`，`[]`，`->`，`=`。

# 重载为成员函数

重载为成员函数时，参数的个数为运算符的目数-1：

```cpp
class CPerson{
    string name;
public:
    CPerson(string name_):name(name_){}
    CPerson operator+(const CPerson& female){
        return CPerson(name + female.name);
    }
};

CPerson male("Bob"), female("Alice");
CPerson child1 = male + female;
// 等价于
CPerson child2 = male.operator+(female);
```

<!--more-->

# 重载赋值运算符

接下来列举一些常见的运算符重载实践。当一个对象赋值给另一个对象的变量时，赋值运算符被调用。

```cpp
const CPerson& operator=(const CPerson& p){
    name = p.name;
    return *this;
};
```

* 参数为`const`，因为不需要改变原有对象。 能使用`const`时，尽量使用它。见[Effective C++: Item 3][item3]。
* 参数、返回值为引用，因为直接传参会生成一个新的对象，低效。见[Effective C++: Item 20][item20]。
* 返回值为`CPerson`类型，这样可以支持连等：`a = b = c`。
* 返回值为`const`，赋值的结果不应当被改变。

对于赋值运算符，更高效的做法是“copy and swap”：

```cpp
const CPerson& operator=(CPerson p){
    std::swap(name, p.name);
    return *this;
};
```

事实上赋值运算符有两点重要的关注：

1. 自赋值的正确性。一些失败的实现中，会先`delete`掉`this`的资源。

    上述代码中用`std::swap`保证了自我赋值的正确性。当然你也可以自己写一个健壮的`swap`函数。

2. 异常安全。当拷贝失败时，原有对象不可破坏。

    上述代码中，拷贝发生在进入函数之前，提供了强烈的异常安全。同时编译器来完成拷贝比函数中手动拷贝更加高效。见[Effective C++: Item 25][item25]。

# 重载流插入运算符

```cpp
ostream& operator<<(ostream& o, const CPerson& p){
    cout<<p.name<<endl;
    return o;
}
```

> 返回`ostream&`也是为了支持链式调用：`cout<<p1<<p2`。

事实上，`operator<<(int)`是`ostream`的成员函数：

```cpp
class ostream{
    ostream & operator<<(int n){
        // print n
        return *this;
    }
};
```

# 重载下标运算符

```cpp
class Array{
int *ptr;
public:
    int size;
    Array(int n=64):size(n){
        ptr = new int[n];
    }
    Array(Array& old){
        new (this) A(old.size);
        memcpy(ptr, old.ptr, old.size * sizeof(int));
    }
    ~ Array(){
        delete [] ptr;
    }
    int& operator[](int i){
        return ptr[i];
    }
    const Array& operator= (const Array rhs){
        swap(*this, rhs);
        return *this;
    }
};
```

* `new (this) A()`是“placement new”表达式，在已存在的内存上分配对象。
* “copy and swap”方式进行赋值运算符重载。

# 自增运算符

自增、自减运算符分为前置运算符和后置运算符。虽然逻辑上都是一元的，但在定义重载方法时，
C++规定：前置运算符有一个参数，后置运算符有两个参数。

> 当然第二个参数是没用的，只是为了生成不同的函数签名。

例如：

```cpp
CPerson& operator++(CPerson&);
const CPerson operator++(CPerson&, int);
```

可以看到后置自加运算符的返回值为`CPerson`，会在函数返回时生成一个新的对象，
这是因为它的表达式值定义为自加之前的值。
因此，通常我们尽量使用前置的自加、自减运算符：

```cpp
for(vector<int> i = v.begin(); i != v.end(); ++i);
```

# 强制转换运算符

基本数据类型到对象的转换是靠重载构造函数来实现的；
对象到基本数据类型的转换是靠重载强制转换运算符来实现的，**强制转换运算符不允许指定返回值类型**：

```cpp
class CPerson{
    int age;
public:
    CPerson(int age_):age(age_){}
    operator int(){ 
        return n;
    }
};

CPerson p;
(int) p == p.int();
```

下面的例子展示了上述两种转换何时被调用：

```cpp
CPerson p1(1);
cout<<p1 <<endl;      // p1.int()
cout<<p1 + 3<<endl;   // CPerson(3)，p.int();
p1 = 3 + p1;          // p1.int()，CPerson(4)
```

[item3]: /2015/07/21/effective-cpp-3.html
[item20]: /2015/08/13/effective-cpp-20.html
[item25]: /2015/08/23/effective-cpp-25.html
