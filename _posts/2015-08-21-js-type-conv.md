---
title: JavaScript显式类型转换与隐式类型转换
tags: JavaScript 接口 弱类型 构造函数 类型转换
---

在 JavaScript 中声明变量不需指定类型，对变量赋值也没有类型检查，同时还允许隐式类型转换。
这些特征说明 JavaScript 属于弱类型的语言。

在强类型的 C++ 中，多数情况下构造函数需要声明为 `explicit` 来禁止隐式类型转换，
避免误用（见[Item 15：资源管理类需要提供对原始资源的访问][item15]）。
弱类型的 JavaScript 中没有这一机制，比如下面的代码：

```javascript
// 弹出对话框中输入1
var a = prompt('input a number');

var b = a + 1;

console.log(b);   // 控制台输出 11   
```

目前 JavaScript 还无法阻止 `a` 被隐式转换为字符串。
本文便来总结一下 JavaScript 的类型转换行为，以及隐式类型转换的规则。

<!--more-->

# 转换为字符串

转换为字符串是应用程序中的常见操作，几乎所有语言都提供了将任何类型转换为字符串的通用接口。
比如Java和C#的`toString`方法、C++的函数`std::to_string`，当然还有JavaScript的`toString`方法。

多数的JavaScript宿主环境（比如Node.js和Chrome）都提供了全局函数`toString`；
与此同时`Object.prototype`也定义了`toString`方法，使得所有对象都拥有转换为字符串的能力。

比如一个`Number`转换为`String`：

```javascript
var n = 1;
n.toString();   // '1'
```

`toString`接受一个参数指定进制，默认为10. 可以利用这个参数生成包括字母和数字的随机字符串：

```javascript
Math.random().toString(36).substr(2);
```

`random`生成一个0到1的随机数，36进制的字符集为`[0-9a-z]`（36个），`substr`用来截掉起始的`"0."`。
另外`Object.prototype.toString`可以用来检测JavaScript对象的类型：

```javascript
var toString = Object.prototype.toString;

toString.call(new Date); // [object Date]
toString.call(new String); // [object String]
toString.call(Math); // [object Math]

// Since JavaScript 1.8.5
toString.call(undefined); // [object Undefined]
toString.call(null); // [object Null]

// 自定义类型
toString.call(new MyClass);   // [object Object]
```

# 转换为数字

字符串转换为数字也是常见需求，通常用来从用户输入或文件来获得一个`Number`。
在C++中可以用`atoi`、`cin`、`scanf`等函数，在JavaScript中可以直接用`parseInt`和`parseFloat`。
例如：

```javascript
var iNum1 = parseInt("12345red");	//返回 12345
var iNum1 = parseInt("0xA");	//返回 10
var iNum1 = parseInt("56.9");	//返回 56
var iNum1 = parseInt("red");	//返回 NaN
var fNum4 = parseFloat("11.22.33");	//返回 11.22
```

注意`NaN`是JavaScript中唯一一个不等于自己的值。`(NaN == NaN) === false`！
如果遇到非法字符，`parseInt`和`parseFloat`会忽略之后的所有内容。

`parseFloat`只接受十进制数字的字符串，而`parseInt`还提供了第二个参数（可选）用来指定字符串表示数字的进制：

```javascript
var iNum1 = parseInt("10", 2);	//返回 2
var iNum2 = parseInt("10", 8);	//返回 8
var iNum3 = parseInt("10", 10);	//返回 10
```

> 上述例子来自 w3school.com.cn: http://www.w3school.com.cn/js/pro_js_typeconversion.asp

# 强制类型转换

强制类型转换在C++中有两种方式：用括号将类型声明在变量之前；或者调用构造函数。
在JavaScript中没有类型关键字（只有一个`var`来声明变量），因而只能调用构造函数：

```javascript
Boolean(0)		          // => false - 零
Boolean(new object()) 	// => true - 对象
Number(undefined)       // =>	NaN
Number(null)	          // => 0
String(null)	          // => "null"
```

# 隐式类型转换

隐式类型转换是最为隐蔽的地方，不加注意的话很容易在这一点上出错，对这一点的掌握也体现了JavaScript程序员经验。
JavaScript会自动转换表达式中对象的类型以完成表达式求值。

## 四则运算

加法运算符`+`是双目运算符，只要其中一个是`String`类型，表达式的值就是一个`String`，
会隐式调用每个元的 `.toString()` 方法。

对于其他的四则运算，只有其中一个是`Number`类型，表达式的值便是一个`Number`。

对于非法字符的情况通常会返回`NaN`：

```javascript
'1' * 'a'     // => NaN，这是因为parseInt(a)值为NaN，1 * NaN 还是 NaN
```

不同类型的相加的行为比较复杂，也不一致，可以参考这里：
<https://www.andronio.me/2017/10/22/js-operators-incensistency/>

## 判断语句

判断语句中的判断条件需要是`Boolean`类型，所以条件表达式会被隐式转换为`Boolean`。
其转换规则同`Boolean`的构造函数。比如：

```javascript
var obj = {};
if(obj){
    while(obj);
}
```

## toString

有些接口只支持字符串参数，会对传入值进行 `toString`。
比如 JavaScript 宿主环境提供的接口：

```javascript
alert({a: 1});    // => [object Object]
```

这里传入任何对象都会被 `toString` 转为字符串。

[item15]: /2015/08/05/effective-cpp-15.html
