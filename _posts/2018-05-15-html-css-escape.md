---
title: 在 HTML 和 CSS 中转义特殊字符
tags: HTML CSS 转义
---

在编程语言中，字符串 **直接量**（Literal Value，也叫字面量）需要用一对分隔符来定义，
比如 `"author:harttle"` 中前后的引号。
那么当字符串中要表示分隔符时就需要 [转义][escape]，比如 `"author:\"harttle\""`。

JavaScript 是一种 [通用编程语言][gppl]，这类语言的转义相对比较一致通常使用反斜线，比如 `\n`, `\r` 等。
但是在 HTML、CSS 这样的 [领域特定语言][dsl] 中为了在大多数场景中提供更简单的语法，
转义就会比较麻烦。下文中给出 HTML 和 CSS 中的字符串转义机制，以及如何进行转义的代码片段。

本文介绍的是 HTML 和 CSS 中的转义，不是 JavaScript 中的 [escape][js-escape] 方法（它可以产生一个类似 URL 编码的结果）。
此外关于百分号编码请参考 [百分号编码与 encodeURIComponent](/2017/05/23/percentage-encoding.html)，关于表单编码请参考 [HTTP 表单编码 enctype](/2016/04/11/http-form-encoding.html)

<!--more-->

# HTML 中的转义字符

[html][html] 是一种标记语言，就像其他编程语言一样，它可以表示包括它的语法在内的所有字符。但 HTML 中反斜线不是转义字符，而是以 `&` 起始的字符串。
[这里有一个 HTML 特殊字符码表](https://www.freeformatter.com/html-entities.html#iso88591-characters)，
[HarttleLand](https://harttle.land) 站的主题中就使用了很多的这些字符。

## HTML 转义语法

* `&` + ASCII 字母（ASCII Alphanumeric）。表示命名的字符引用，例如 `&amp;` 表示 `&`，`&lt;` 表示 `<`。HTML5 发布了非常多 [新的命名字符](https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references)。
* `&#` + 数字。可以表示的字符包括 ASCII 字符、数学符号、希腊字母等。例如 `&#38;` 表示 `&`，`&#60;` 表示 `<`。
    * `&#x` + 16 进制数字。例如 `&#x41;` 表示大写字母 `A`；
    * `&#` + 10 进制数字。例如 `&#65;` 也表示大写字母 `A`。

## 哪些字符需要转义？

与通用编程语言中的转义一样，有许多字符都有转义的表示方式，但并不是所有字符都需要转义。
比如 C 语言中 `\a` 是 `a` 的转义表示，但多数情况都不需要写成转义的形式。
HTML 也一样，

* 标签所在的上下文（标签的内容）中需要转义（**标签转义**）的字符只有 `&`, `<`, `>`，
* 属性上下文（属性值的内容）中还需要转义（**属性转义**）`"` 和 `'`。

> 参考 <https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-on-html>

# JavaScript 中转义 HTML (消毒)

明确 HTML 转义机制后事情就好办了，下面的实现来自 [StackOverflow](https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript)，
其中单引号转义使用 `&#039;` 而非 `&apos;` 是由于 [HTML4 的兼容性原因](https://stackoverflow.com/questions/2083754/why-shouldnt-apos-be-used-to-escape-single-quotes)。

```javascript
// 转义结果可用于拼接标签内容，也可用于拼接属性值
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

在浏览器中，我们还可以利用浏览器的 [HTML Fragment 序列化算法](https://html.spec.whatwg.org/#serialising-html-fragments) 来帮我们实现：

```javascript
// 转义结果只可用于拼接标签内容
function escapeHtml(str) {
    var div = document.createElement('div')
    div.innerText = str;
    return div.innerHTML;
}
```

上述实现运行在标签的上线文中，因此不会转义 `"` 和 `'`。转义后的属性不可直接拼接到属性上下文中。

# CSS 中的转义字符

有时我们需要 CSS 字符串，而字符串中可能包含 CSS 特殊字符。
比如 [伪元素](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements) 的 `content` 属性值，
比如传给 [getElementsByClassName()](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName) 的类名
（当然一般也不会把 class 命名为 CSS 特殊字符）。CSS 使用反斜线（`\`）转义，规则是：

* ASCII 字符可以使用 `\` + 一个 ASCII 字符来转义，例如 `\;` 表示分号。
* Unicode 字符（包括与上述 ASCII 码表重合的部分）使用 `\` + 6 位数字表示，例如 `\000030` 表示字符 `"1"`。
* 对于第二种情况，不足 6 位时为避免歧义后面可加空格分隔，这个空格总会被当做分隔符，不会被当做内容。

例如 `\30 a` 表示 `"0a"`，相当于 `\000030a`；`\30a` 则表示单个 Unicode 字符 `U+030A`。

# JavaScript 中转义 CSS

[CSS Object Model](https://drafts.csswg.org/cssom/#the-css.escape%28%29-method) 中提供了 [CSS.escape()](https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape) 方法来转义 CSS 字符串。例如：

```javascript
var escaped = CSS.escape(';:"\'[]{}')
console.log(escaped)
// 输出 \;\:\"\'\[\]\{\}
```

另一个常用的场景是 iconfont 中设置 `::before` 伪元素的 `content`：

```css
.icon::before {
    font-family: 'icon-by-harttle';
    content: '\e622';
}
```

[html]: https://html.spec.whatwg.org/multipage
[escape]: https://en.wikipedia.org/wiki/Escape_character
[gppl]: https://en.wikipedia.org/wiki/General-purpose_programming_language
[dsl]: https://en.wikipedia.org/wiki/Domain-specific_language
[js-escape]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/escape
