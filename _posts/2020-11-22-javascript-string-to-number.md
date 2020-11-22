---
title: JavaScript 字符串转数字
tags: JavaScript 字符串 Number
---

JavaScript 有很多字符串转数字的方式，但它们的转换规则很不一样适用范围也不同。
这里给出一些总结，以及一个对比表格。

**TL;DL**

value           | "3.14"/3.14 | null  | false | true  |"Infinity"/Infinity | "1e3" | "123z" |"z123" | 10n
---             | ---  | ---   | ---    | ---  | ---      | ---   | ---    | ---   | ---
parseInt(value) | 3    | NaN   | NaN    | NaN  | NaN      | 1     | 123    | NaN   | 10 
Number(value)   | 3.14 | 0     | 0      | 1    | Infinity | 1000  | NaN    | NaN   | 10
+value          | 3.14 | 0     | 0      | 1    | Infinity | 1000  | NaN    | NaN   | TypeError 

此外，

- "0x" 开头都被解释为 16 进制。
- "0x" 开头都被解释为 10 进制，除了 parseInt 在某些浏览器下解释为 8 进制。
- undefined 都会转为 NaN。

<!--more-->

## parseInt

[parseInt][parseInt] 是从 ES1 开始就有的内置函数。第一个参数是数字字符串，第二个参数是进制，且只支持 2-36。需要注意的是：

* 10 不是默认值。例如 `parseInt('0x10')` 为 16，此时 parseInt 采取了 16 进制。
* 不是所有数字字符串都能 parseInt。parseInt 只认识 +/- 两种符号，因此 `parseInt((1e80).toString())` 会从 `e` 截断结果为 1。如果要产生 parseInt 能识别的字符串，需要 `BigInt(1e80).toString()`。
* 不是所有非数字都会返回 NaN。第一个字符不是数字时才返回 NaN，例如 `parseInt('e3')` 为 NaN，但 `parseInt('3e')` 为 3。
* 使用 parseInt 时应该指定进制。例如 `parseInt('010')` 在有的浏览器中是 8 有的是 10，后来 ES5 规定了此时用 10。
* “使用 parseInt 时应该指定进制”的一个推论：不能直接用于 `Array.prototype.map`，例如：

```javascript
['10', '10', '10'].map(parseInt)
// 返回 [10, NaN, 2]，因为进制参数分别为：0，1，2
```

## Number

[Number](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number) 是 "number" 基本类型的对象封装，不加 new 关键字时只做转换可以仍然返回基本类型。例如：

```javascript
new Number('1') === 1   // false
Number('1') === 1       // true
```

用作类型转换时，`Number` 可以支持数字的所有字面表示比如 `Number('1e3')`, `Number('Infinity')`，`Number('1.3')`，但是不能自定义进制。此外不同于 `parseInt` 的是，`Number` 对任何不合法的数字表示都会返回 `NaN`。

## + 运算符

像多数语言一样 JavaScript 定义了 [单目运算符 +](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unary_plus)，它的操作数可以是数字，也可以是其他类型。是其他类型时会被转换为数字。用于 BigInt 时会抛出 `TypeError`。

`+val` 是 JavaScript 中最常见的、最快的转换其他值到数字的方式，它不仅支持浮点数表示，还支持 8 进制和 16 进制，也能转换 `null`, `false`, `true`。转换失败时值为 `NaN`。和 `Number` 一样不会尝试转换字符串前缀为数字，只要整个字符串是非法的值就是 `NaN`。

需要注意的是 `num + str` 中的 `+` 是双目运算符 +，它不会把 `str` 转换为数字。如果这里要使用单目运算符 +，需要写成 `num + +str`。注意两个 `+` 要有空格，否则会解释为自增运算符进而抛出 S`yntaxError`。
但它的操作数可以是表达式，因此 `num + + + + + str` 也是合法的，也会把 `str` 转为数字。例如：

```javascript
let num = 3, str = '3'
console.log(num + str)              // '33'
console.log(num + + str)            // 6
console.log(num + + + + + + str)    // 6
```

[parseInt]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt