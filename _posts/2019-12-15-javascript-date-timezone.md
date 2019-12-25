---
title: 编写跨时区的 JavaScript 代码
tags: JavaScript Date 时区
---

JavaScript 在 1.1 就支持 `Date` 对象，所有主流浏览器都支持。
和其他语言类似，Date、Time 的表现会受到时区的影响，在编写跨时区网站的页面脚本时，或者单元测试在其他时区的持续集成服务上运行时，都需要熟悉 `Date` 对象里的时区概念。
本文介绍 Date 对象的初始化字符串会被当做怎样的时区解释，Date 上的方法哪些是时区相关的，以及如何编写在所有时区都能运行的代码。

<!--more-->

## UTC 时间

UTC、GMT、当地时间（LT）这些概念就不重复了，大概 UTC 和 GMT 都等于零时区的当地时间。具体可以参考 [Linux/Windows 时间不一致问题](https://harttle.land/2015/05/02/linux-windows-time.html)。
在多数语言和数据库里，DateTime 的存储都采用 UTC 时间，不存具体的时区信息。
因为 UTC 时间就是零时区的当地时间，下文把这个时间称为绝对时间。

JavaScript 的 Date 对象也一样，它的内存表示就是绝对时间，当调用 `.getHours()`，`.toString()` 时再根据操作系统时区设置来解释。
Web 中的时间采用[格里历][Gregorianum]（公历），Date 可以用数字来初始化，其零点 `new Date(0)` 为 1970-01-01T00:00:00.0Z，可以用负数来表示 1970-01-01 之前的日期。
这个数字表示从 1970-01-01 到此经过的毫秒数（注意 [Unix TimeStamp][unix-timestamp] 或 Seconds since the Epoch 都是精确到秒），即 `new Date(1000)` 为 1970-01-01T00:00:01.0Z。

## Date 初始化

Date 有最多 7 个构造参数，我们不去展开具体语法（参考[MDN Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)）。
数字和无参数初始化的含义都很明确，但使用日期字符串初始化时会比较隐晦，[MDN][mdn] 提到日期字符串初始化还存在浏览器见不一致的问题。
JavaScript 的主流实现中，日期字符串采用 [RFC2822][rfc2822] 规范，也存在采用 ISO8601 规范的实现。
虽然不建议使用字符串初始化 Date，但我们还是要举例说明在 V8 下哪些情况被解释为 UTC 时间（绝对时间），哪些情况被解释为当地时间。

以下会被解释为 UTC 时间：

* "2019-12-15T00:00:00Z"
* "2019-12-15T00:00:00.0Z"
* "2019-12-15T00:00:00.00Z"

以下会被解释为当地时间：

* "2019-12-15T00:00:00"
* "2019-12-15 00:00:00"
* "2019-12-15"
* "2019-12-15 00:00:00 +0800"
* "Sun Dec 15 2019 00:00:00 GMT+0800 (China Standard Time)"
* "Sun Dec 15 2019 00:00:00 +0800"

写明 CST、+0800 的都比较没有歧义，主要关注其他的字符串里，只要没有写 `T` 和 `Z` 的都会被解释为当地时间，这一点和 ISO8601 也不一致。

## 时区相关的方法

**多数方法都是依赖时区的**，因为这样用起来才方便。Ruby、PHP 里的 strftime 中多数格式化字符（比如 `%H`, `%m` 等）也都是依赖时区的。
比如我这里（中国北京） `new Date(0).getHours()` 是 `8`，因为 1970-01-01T00:00:00.0Z 时 GMT 时间是零点，对应北京当地时间是 8 点。
在 JavaScript Date 里，对应的不依赖时区的（绝对时间）对应方法都叫做 getUTCxxx()。比如：

* `getHours()` 是当地时间，`getUTCHours()` 是 UTC 时间。
* `getMonth()` 是当地时间，`getUTCMonth()` 是 UTC 时间。
* `getDay()` 是当地时间，`getUTCDay()` 是 UTC 时间。

## 编写时区无关的代码

由于多数方法都是时区相关的，我们可以很容易编写出在不同时区下有不同展示的 Web 页面。
现在的挑战是如何编写在任何时区都有一致表现的代码，比如你的单元测试在全球的任何服务器上都能跑通。

1. 只关心运算的场景，统一使用绝对时间初始化。如果 Date 在你的系统里只是用来比较大小、计算差值，就应该多使用绝对时间的初始化方式。比如：`new Date(3422200000)`。
2. 只关心呈现的场景，统一使用当地时间初始化。如果你会大量地创建对象并查看它的字符串表示（`toString()`, strftime 格式化等），就应多使用当地时间来初始化。虽然内部表示会随着时区变化，但初始化和呈现时总是一致的。比如 `new Date('2016-07-01')` 在任何时区里 toString 后仍然是 `07/01/2016`。

[mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[rfc2822]: https://tools.ietf.org/html/rfc2822
[unix-timestamp]: http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16
[Gregorianum]: https://zh.wikipedia.org/wiki/%E6%A0%BC%E9%87%8C%E6%9B%86