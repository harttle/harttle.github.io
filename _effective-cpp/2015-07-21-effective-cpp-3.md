---
layout: blog
title: Item 3：尽量使用常量
tags: C++ STL 宏 常量 指针 编译 函数重载
excerpt: 尽量使用常量，以逻辑常量的方式编写常量方法，使用普通方法调用常量方法可避免代码重复。
---

> Item 3: Use const whenever possible

尽量使用常量。不需多说，这是防卫型（defensive）程序设计的原则，
尽量使用常量限定符，从而防止客户错误地使用你的代码。

# 常量的声明

总结一下各种指针的声明方式吧：

```cpp
char greeting[] = "Hello";

char *p = greeting;                    // non-const pointer, non-const data
const char *p = greeting;              // non-const pointer, const data
char * const p = greeting;             // const pointer, non-const data
const char * const p = greeting;       // const pointer, const data 
```

`const` 出现在 `*` 左边则被指向的对象是常量，出现在 `*` 右边则指针本身是常量。
然而对于常量对象，有人把 `const` 放在类型左边，有人把 `const` 放在 `*` 左边，都是可以的：

```cpp
void f1(const Widget *pw);   // f1 takes a pointer to a constant Widget object
void f2(Widget const *pw);   // 等效
```

STL的iterator也是类似的，如果你希望指针本身是常量，可以声明 `const iterator`；
如果你希望指针指向的对象是常量，请使用 `const_iterator`：

```cpp
std::vector<int> vec;

// iter acts like a T* const
const std::vector<int>::iterator iter = vec.begin();
*iter = 10;                              // OK, changes what iter points to
++iter;                                  // error! iter is const

//cIter acts like a const T*
std::vector<int>::const_iterator cIter = vec.begin();
*cIter = 10;                             // error! *cIter is const
++cIter;                                 // fine, changes cIter
```

返回值声明为常量可以防止你的代码被错误地使用，例如实数相加的方法：

```cpp
const Rational operator*(const Rational& lhs, const Rational& rhs);
```

当用户错误地使用 `=` 时：

```cpp
Rational a, b, c;
if (a * b = c){
    ...
}
```

编译器便会给出错误：不可赋值给常量。

<!--more-->

# 常量成员方法

声明常量成员函数是为了确定哪些方法可以通过常量对象来访问，另外一方面让接口更加易懂：
很容易知道哪些方法会改变对象，哪些不会。

成员方法添加常量限定符属于函数重载。常量对象只能调用常量方法，
非常量对象优先调用非常量方法，如不存在会调用同名常量方法。
常量成员函数也可以在类声明外定义，但声明和定义都需要指定 `const` 关键字。
例如：

```cpp
class TextBlock {
public:
  const char& operator[](std::size_t position) const   // operator[] for
  { return text[position]; }                           // const objects

  char& operator[](std::size_t position)               // operator[] for
  { return text[position]; }                           // non-const objects

private:
   std::string text;
};

TextBlock tb("Hello");
const TextBlock ctb("World");
tb[0] = 'x';             // fine — writing a non-const TextBlock
ctb[0] = 'x';            // error! — writing a const TextBlock
```

# 比特常量和逻辑常量

**比特常量**（bitwise constness）：如果一个方法不改变对象的任何非静态变量，那么该方法是常量方法。
比特常量是C++定义常量的方式，然而一个满足比特常量的方法，却不见得表现得像个常量，
尤其是数据成员是指针时：

```cpp
class TextBlock{
    char* text;
public:
    char& operator[](int pos) const{
        return text[pos];
    }
};

const TextBlock tb;
char *p = &tb[1];
*p = 'a';
```

因为 `char* text` 并未发生改变，所以编译器认为我们的操作都是合法的。
然而我们定义了一个常量对象 `tb`，只调用它的常量方法，却能够修改`tb`的数据。
对数据的操作甚至可以放在 `operator[]()` 方法里面。

这一点不合理之处引发了**逻辑常量**（logical constness）的讨论：常量方法可以修改数据成员，
只要客户检测不到变化就可以。可是常量方法修改数据成员C++编译器不会同意的！这时我们需要 `mutable` 限定符：

```cpp
class CTextBlock {
public:
  std::size_t length() const;
  
private:
  char *pText;

  mutable std::size_t textLength;         // these data members may
  mutable bool lengthIsValid;             // always be modified
};                                     

std::size_t CTextBlock::length() const{
  if (!lengthIsValid) {
    textLength = std::strlen(pText);
    lengthIsValid = true;          
  }
  return textLength;
}
```

# 避免常量/非常量方法的重复

通常我们需要定义成对的常量和普通方法，只是返回值的修改权限不同。
当然我们不希望重新编写方法的逻辑。最先想到的方法是常量方法调用普通方法，然而这是C++语法不允许的。
于是我们只能用普通方法调用常量方法，并做相应的类型转换：

```cpp
const char& operator[](size_t pos) const{
    ...
}

char& operator[](size_t pos){
    return const_cast<char&>(
        static_cast<const TextBlock&>(*this)
            [pos]   
    );
}
```

1. `*this` 的类型是 `TextBlock`，先把它强制隐式转换为 `const TextBlock`，这样我们才能调用那个常量方法。
2. 调用 `operator[](size_t) const`，得到的返回值类型为 `const char&`。
3. 把返回值去掉 `const` 属性，得到类型为 `char&` 的返回值。
