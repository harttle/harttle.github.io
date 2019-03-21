---
title: 在 Bash 中进行 encodeURIComponent/decodeURIComponent
tags: Bash encodeURIComponent sed
---

URL Encoding 又叫[百分号编码](/2017/05/23/percentage-encoding.html)，定义在 [URL 标准][rfc3986] 中。
在前端通过 [encodeURI][encodeURI] 和 [encodeURIComponent][encodeURIComponent] 来分别编码 URL 和 URL 参数。
那么在 Bash 中怎么编解码呢？这在写处理网页或链接的脚本时非常有用。
本文给出两个不依赖 Node、Python 等非内置软件的编解码命令，并稍作解释。

<!--more-->

## 编码（encodeURIComponent）

百分号编码中，ASCII 范围内的数字和字母是不编码的，这里为了简单对所有字符都进行编码（仍然是合法的）。
比如把 `"harttle"` 编码成百分号编码：

```bash
echo -n harttle | xxd -p | tr -d '\n' | sed 's/\(..\)/%\1/g'
```

首先 `-n` 禁止 echo 添加行尾回车，经过 xxd 转二进制后移除 xxd 默认的 16 字节换行，最后每两个字符添加一个百分号。详细讨论请参考：<https://stackoverflow.com/questions/296536/how-to-urlencode-data-for-curl-command>

注意：sed 正则表达式中的正则关键字需要转义，例如：`\1` `\(`, `\)`。

## 解码（decodeURIComponent）

解码相对麻烦，因为非编码的部分要保持原状：

```bash
echo -n https%3a%2f%2fharttle.land | sed 's/%/\\x/g' | xargs -0 printf '%b'
```

同样地，首先 `-n` 禁止 echo 添加行尾回车，用 sed 把百分号替换为 `\x`，再用 printf 把它作为二进制输入打出来。详细讨论请参考：<https://unix.stackexchange.com/questions/159253/decoding-url-encoding-percent-encoding>

## 添加为命令

上述命令可以加入到 `~/.bashrc` 以方便使用，唯一要做 注意的就是转义：

```bash
alias encodeURIComponent="xxd -p | tr -d '\n' | sed 's/\(..\)/%\1/g'"
alias decodeURIComponent="sed 's/%/\\\\x/g' | xargs -0 printf '%b'"
```

其中 &#92;&#92;&#92;&#92; 会先通过 Bash 转义（因为是双引号）为 &#92;&#92; 传给 sed，sed 再把它转义为单个 &#92; 字符。在以后进入的 Bash 中就可以这样使用了：

```bash
echo harttle | encodeURIComponent
echo https%3a%2f%2fharttle.land | decodeURIComponent
```

[rfc3986]: https://tools.ietf.org/html/rfc3986
[encodeURI]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
[encodeURIComponent]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
