---
layout: blog 
categories: reading
title: C++手稿：类的静态和常量成员
tags: C++ 静态变量 常量
---

本文总结了静态成员的使用、单例的实现、常量对象与常量方法，以及如何将常量方法重载为普通方法。

# 静态成员

对象成员的声明前加`static`即可定义为静态成员，静态成员必须在声明类的文件中进行声明（通常会初始化），否则链接错。
访问静态成员可以通过类名，也可以通过对象名。

```cpp
class CPerson{
    static int count;
};
int CPerson::count = 0;

CPerson p1, &p2 = p1, *p3 = new CPerson();

cout<<CPerson::count<<endl;
cout<<p1.count<<endl;
cout<<p2.count<<endl;
cout<<p3->count<<endl;
```

* 只有静态常量整型才可以在类的声明中，直接初始化。
* `sizeof`运算符不会计算静态常量。
* 静态方法不可访问非静态成员、`this`指针。

# 单例的实现

在C++中，借由静态成员变量，可以实现单例模式。首先需要将构造函数私有化，并提供获取单例的方法。
此后还需禁止复制构造函数、禁止赋值运算符。

```cpp
class CPerson{
private:
    static CPerson* p;
    CPerson(){};
    CPerson(CPerson&);
    const CPerson& operator= (const CPerson&);
public:
    static Person* instance(){
        return p ? p : (p = new P());
    }
};
CPerson* CPerson::p = NULL;
```

<!--more-->

# 常量对象与常量方法

C++类是用户定义的数据类型，也可以声明为常量。因为方法调用可能会改变对象属性，
所以常量对象只能调用构造函数、析构函数以及常量方法。

**常量方法**是不改变对象属性的方法，在常量方法中所有属性赋值都会产生编译错误。
常量成员函数也可以在类声明外定义，但声明和定义都需要指定`const`关键字。

```cpp
class CPerson{
    public:
        void Print() const{
            cout<<"const";
        }
        void Print(){
            cout<<"normal";
        }
};

CPerson p1;
const CPerson p2;
p1.Print();       // normal
p2.Print();       // const
```

# 常量方法重载

常量方法可以是普通方法的重载，它们拥有不同的函数签名。常量对象只能调用常量方法，
而普通对象会优先调用普通方法，如果不存在，则调用同名的常量方法。

通常我们需要定义相同返回值的常量方法以及普通方法。这时我们不希望重新编写方法的逻辑。
最先想到的方法是常量方法调用普通方法，然而这是C++语法不允许的。
于是我们只能用普通方法调用常量方法，并做相应的类型转换：

```cpp
const char& operator[](size_t pos) const{
    ...
}

char& operator[](size_t pos){
    return const_cast<char&>(
        static_cast<const TextBlock&>(*this)[pos];
    );
}
```

1. `*this`的类型是`TextBlock`，先把它强制隐式转换为`const TextBlock`，这样我们才能调用那个常量方法。
2. 调用`operator[](size_t) const`，得到的返回值类型为`const char&`。
3. 把返回值去掉`const`属性，得到类型为`char&`的返回值。

详情见：[Effective C++ 笔记](/2014/05/04/effective-cpp.html)
