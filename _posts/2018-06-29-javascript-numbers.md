---
title: JavaScript 中数字的底层表示
tags: JavaScript Number 浮点数 二进制 运算符
---

至今 JavaScript 已经有 [6 种基本类型][types] 了，其中数字类型（Number）是表示数字的唯一方法。
目前其标准维护在 [ECMA262][ecma-262]，在 JavaScript 语言层面不区分整数与浮点、符号与无符号。
所有数字都是 [Number][number] 类型，统一应用浮点数算术。
由于 JavaScript 中无法访问低层的二进制表示，而且 64 位可表示范围非常大，不容易遇到和了解到边界情况。
这篇文章对 JavaScript `Number` 的二进制表示进行简要的介绍，主要明确使用者观察到的边界，
解释 `MAX_VALUE`, `MIN_VALUE`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `EPSILON`
这些常量取值的原因；回答 `POSITIVE_INFINITY`, `NEGATIVE_INFINITY`, `NaN` 这些常量的表示方法。

<!--more-->

## 二进制表示

JavaScript 数字占 64 位，与 C++ 中的 `double` 类型一样，采用
[IEEE 754][IEEE 754] 规范的 [双精度浮点数][double-format]。
字节分配如下图，从高位到低位依次是一个符号位（sign）、11个指数位（exponent）、52个分数位（fraction）。

![double float representation][double-layout]

这样一个数字它的值等于：

$$
(-1)^{sign}(1+\sum_1^{52}{b_{52-i}2^{-i}})\times 2^{e-1023}
$$

为方便讨论，下文使用简写：

$$
(-1)^{sign}\times 1.fraction\times 2^{e-1023}
$$

为了表示负的指数，指数部分存在一个偏移量 `-1023`。
对于非零值第一位有效位始终为 1，因此二进制表示中省略了这个 1，分数位分别表示 1/2, 1/4，1/8，...。
上式表示的浮点数称为 [normal number][normal]，
特殊值（`0`, `NaN`, `Infinity`）和 subnormal number 不同于上述公式，
见[下文](/2018/06/29/javascript-numbers.html#header-4)。

## normal number

**语法**：指数部分 $1 \leq e \leq 2046$ 的值会被解析为 [normal number][normal]。
0 和 2047 分别被用于 subnormal number 和特殊值，见[下文](http://localhost:4000/2018/06/29/javascript-numbers.html#header-4)。

**概念**：[normal number][normal] 只表示非零值，
并规定省略第一个非零的 `1`，significant（有效位数）部分可以多一位精度。
指数部分的最大值为 2046，因此 **normal number 的最大值**
（也是 **Number 的最大值**，[Number.MAX_VALUE][MAX_VALUE] 的值）为：

$$
1.1111111...\times 2^{2046-1023} = (2-2^{-52}) \times 2^{1023} \approx 1.7976931348623157 \times 10^{308}
$$

这个最大值略小于 $2^{1024}$，相差 $2^{971}$。
[Math.EPSILON][epsilon] 表示大于 1 的最小浮点数与 1 的差，
它的值等于：

$$
1....0001 \times 2^{1023-1023} - 1....0000 \times 2^{1023-1023}
= 2^{-52} \times 2^0 = 2^{-52} \approx 2.220446049250313 \times 10^{-16}
$$

**normal number 的最小值**（也是 **Number 的最小值**，[Number.MIN_VALUE][MIN_VALUE] 的值）
为上述最大值的负值，只变化符号位：

$$
-1.1111111...\times 2^{2046-1023} = -(2-2^{-52}) \times 2^{1023} \approx -1.7976931348623157 \times 10^{308}
$$

normal number 的指数部分最小值为 1，
fraction 部分最小为 0，significant（有效位数）部分最小为 1，
因此 normal number 能够表达的最小正数为：

$$
1 \times 2^{1−1023} = 2^{-1022} \approx 2.2250738585072014 \times 10^{−308}
$$

注意后四位小数是 2014 哈哈，normal number 能够表达的最大负数也是上面的大小，符号位变负。

## subnormal number

**语法**：指数部分 $e = 0$，且分数部分 $fraction \neq 0$ 的值会被解析为 [subnormal number][subnormal]。

**概念**：normal number 省略前导的 1 虽然能够多一位有效位数，
但首位有效数字必须为 1 也限制了最小正数的大小。
[subnormal number][subnormal] 就是来弥补 0 与 1 之间的取值的。
它规定指数部分全零且没有前导 1，但计算时采用 -1022 作为指数（等效 e=1），
一个 subnormal number 的值由以下公式给出：

$$
(-1)^{sign}\times 0.fraction\times 2^{-1022}
$$

因此**最大的 subnormal number** 为：

$$
0.1111111... \times 2^{−1022} = (1-2^{-52}) \times 2^{-1022} \approx 2.2250738585072009\times10^{−308}
$$

它与最小的正 normal number（$2^{-1022}$）相差 $2^{-1074}$。
**最小的 subnormal number** 与它大小相同，符号为负。

**最小的正 subnormal number**（也是 Number 能够表示的最接近 0 的数值），它的值为：

$$
2^{-52} \times 2^{-1022} = 2^{-1074} \approx 4.9 \times 10^{−324}
$$

## spetial values

### 0

**语法**：指数部分 $e = 0$，且分数部分 $fraction = 0$ 的值会被解析为零。

**概念**：根据 $sign$ 的取值，有 $+0$, $-0$ 两种 0 的表示。

### Infinity

**语法**：指数部分 $e = 11111111111_2$，且分数部分 $fraction = 0$ 的值会被解析为 $\infty$。

**概念**：根据 $sign$ 的取值，有 [Number.NEGATIVE_INFINITY][Number.NEGATIVE_INFINITY],
[Number.POSITIVE_INFINITY][Number.POSITIVE_INFINITY] 两个值。

### NaN

**语法**：指数部分 $e = 11111111111_2$，且分数部分 $fraction \neq 0$ 的值会被解析为 [NaN][NaN]。

**概念**：由于不限定分数部分取值，`NaN` 值有很多种表示。

符号位可以取任意值（$2$ 种），分数只是不可取零（$2^{52} - 1$），
因此共有 $(2^{52}-1)\times 2 = 2^{53} - 2$ 种。

## 整数的表示

所有的非零整数都属于 normal number（0 属于特殊值，见下文），
它们的指数部分刚好能够把所有分数移出到小数点左侧，数学地表示为：

$$
2^{e-1023} \times 2^{-l} \geq 1 \Rightarrow e \geq 1023 + l
$$

其中 $l$ 为最后一个非零的分数下标，起始 $l = 1$。例如，
1 的 $l = 0, e = 1023, fraction = 0$，
3 的 $l = 1, e = 1024, fraction = 1000..._2$，
5 的 $l = 2, e = 1025, fraction = 0100..._2$。
这些整数中可以连续、准确地表示的那些整数称为 **安全的整数**，
例如 $2^{100}$ 是不安全的，因为它和 $2^{100} + 1$ 具有完全相同的表示：$e = 1123, fraction = 0$，
这导致在 JavaScript 中，

```javascript
Math.pow(2, 100) === (Math.pow(2, 100) + 1)
```

**最大的安全整数**（即 [Number.MAX_SAFE_INTEGER][MAX_SAFE_INTEGER] 的值）
是 52 位分数都刚好用到的情况，此时 $l = 52 \Rightarrow e = 1023 + l = 1075$，
加省略的前导 1 共有 53 个 1，它的值为：

$$
111...(共 53 个)...111_2 = 2^{53} - 1 = 9007199254740991
$$

同样地，符号位取 1 即可得到 **最小的安全整数**，也就是 [Number.MIN_SAFE_INTEGER][MIN_SAFE_INTEGER] 的值：

$$
-2^{53} + 1 = -9007199254740991
$$

对于不安全的整数或其他未能精确表示的浮点数，会选择最接近的一个可以精确表示的值，
如果存在两个同样接近的值，[IEEE 754 binary64][IEEE 754] 提供了 ties to even 和 ties to odd 两种 Rounding 方式。
JavaScript Number 实现的浮点数 Rounding 方式是 [Round to nearest, ties to even][ties-to-even]。
我们来观察一下最大安全整数附近的 Rounding 方式：

```javascript
console.log(Number.MAX_SAFE_INTEGER);
// sign=0, fraction=9007199254740991（52个1）, e=1023+52
// 输出 9007199254740991，这个值就是 MAX_SAFE_INTEGER = 2^53 - 1

console.log(Number.MAX_SAFE_INTEGER+1);
// sign=0, fraction=0（全0）, e=1023+53
// 输出 9007199254740992，这个值是精确的 2^53

console.log(Number.MAX_SAFE_INTEGER+2);
// sign=0, fraction=0（全0），e=1023+53
// 输出 9007199254740992，这个值仍然等于 2^53，不等于 2^53 + 1
```

我们来考虑 `Number.MAX_SAFE_INTEGER + 2` 的表示方式。它是一个奇数，它的二进制值共 54 位：$1000...(共52个0)...0001$，
分数加省略的前导 1 共 53 位，因此最后一个 1 无法表示出来。
这时可以选 $1000...000...0010$（最后一个零不存）和 $1000...000...0000$（最后一个零不存）两个同样接近的值，
根据 ties to even 策略，选择后者让 fraction 部分变成偶数。
就得到了与 `Number.MAX_SAFE_INTEGER + 1` 同样的值：$2^{53}$。

所以为什么不用四舍五入呢？因为四舍五入中每次遇到中间值时总是“入”的，在累加时会放大误差；
选择绑定到最近的奇数/偶数则会两两抵消，避免误差放大。

## 一些讨论

### Number 一共多少种值？

[Number][number-type] 使用64位双精度浮点数实现，根据指数部分的值来区分不同的表示法。

* 指数为 0
    * 分数为 0 表示 0，正负共 $2$ 个
    * 分数不为 0 表示 subnormal numbers，共 $(2^{52}-1)\times 2 = 2^{53} - 2$ 个
* 指数为 2047（全1）
    * 分数为 0 表示 $\infty$，正负共 $2$ 个。
    * 分数不为 0 表示 `NaN`，共 $(2^{52}-1)\times 2 = 2^{53} - 2$ 个
* 指数为其他值，表示 normal numbers，共 $2 \times 2^{52} \times (2^{11}-2) = 2^{64} - 2^{54}$ 个

加起来共有 $2^{64}$ 种值（当然 64 位嘛），减去重复的 `NaN`
（$\pm 0$ 是不重复的，它们作除数时会分别得到 $\pm \infty$），
**Number 能够表示的不重复的值** 有：

$$
2^{64} - (2^{53} - 2 - 1) = 2^{64} - 2^{53} + 3
$$

### Number 精度到底如何？

所以 **浮点数的精度如何** 呢？精度取决于连续两个双精度浮点数之间的差，这个差取决于指数的大小。

* 对于 normal number（绝对值大于等于 $2^{-1022}$）来讲，指数越大（通常数字越大）精度越小，1 附近的精度由 `Number.EPSILON` 给出（见[上文](/2018/06/29/javascript-numbers.html#header-2)）；
* 对于 subnormal number（绝对值小于 $2^{-1022}$）来讲，指数是固定的，精度是确定的 $2^{-1074}$；

### Number 转换为 32 位整数

虽然 Number 都适用浮点数运算（Floating point arithmetic），但有些运算符和方法只支持 32 位整数。
这时会进行 [JavaScript 类型转换][js-type-conv]，
这于 `<<`, `>>`, `>>>`, `|`, `&`, `parseInt()`, `Atomics.wait()` 等操作，
会先调用 [ToInt32][ToInt32] 转换类型：把 64 位 Number 先转换为整数（abs 后再 floor），
再取其低 32 位作有符号 32 位整数解释（即第一位被当做符号位，以 two's complement 解释）。
例如：

```javascript
console.log(Math.pow(2, 100) << 2)
```

输出为 0，因为 $2^{100}$ 的低 32 位全零，解释后的结果为 0，左移一位仍然为 0。

```javascript
console.log((Math.pow(2,50) - 1) << 1)
```

输出为 -2，因为 $2^{50} - 1$ 的低 32 位全1，解释后的结果为 -1，左移一位右侧补 0 得到 -2。

[ToInt32]: https://tc39.github.io/ecma262/#sec-toint32
[number-type]: https://tc39.github.io/ecma262/#sec-ecmascript-language-types-number-type
[ecma-262]: https://tc39.github.io/ecma262/
[double-layout]: https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/IEEE_754_Double_Floating_Point_Format.svg/618px-IEEE_754_Double_Floating_Point_Format.svg.png
[IEEE 754]: https://en.wikipedia.org/wiki/IEEE_754
[double-format]: https://en.wikipedia.org/wiki/Double-precision_floating-point_format
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[subnormal]: https://en.wikipedia.org/wiki/Denormal_number
[normal]: https://en.wikipedia.org/wiki/Normal_number_(computing)
[epsilon]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
[MAX_VALUE]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE
[MIN_VALUE]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_VALUE
[NaN]: https://en.wikipedia.org/wiki/NaN#Encoding
[MAX_SAFE_INTEGER]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
[MIN_SAFE_INTEGER]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER
[ties-to-even]: https://en.wikipedia.org/wiki/Rounding#Round_half_to_even
[Number.NEGATIVE_INFINITY]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY
[Number.POSITIVE_INFINITY]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY
[js-type-conv]: /2015/08/21/js-type-conv.html
[types]: /2015/09/18/js-type-checking.html
