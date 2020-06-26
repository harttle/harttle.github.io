---
title: Bash 转义和引号的使用
tags: Bash xargs grep sed 转义
---

字面量、转义和引号是任何编程语言的基础，但却少有人认真地学习 Bash 中的转义和 [引号][quoting]。
好消息是 Bash 引号的语义非常简单，这篇文章就可以完全描述。
**TL;DR**：

1. 反斜线用来转义除换行之外的所有字符，反斜线加换行为连行; 
2. 单引号用来直出字面量，其内容部分不允许转义，包括单引号转义也不允许；
3. 双引号内允许 [命令替换][cmd-sub] 和对特定几个字符转义，双引号内的反斜线对其他字符没有特殊含义，会被当作字面量处理。

<!--more-->

## 一个例子

如果不熟悉 Bash 引号的语义，尤其是配合管道和 xargs 等命令时，事情会变得很复杂很难以理解。
比如下面的命令把 16 进制 ASCII 转为字符串 `harttle`：

```bash
echo '\\x68\\x61\\x72\\x74\\x74\\x6c\\x65' | xargs -0 printf '%b'
```

如果没有加引号或没有加 `-0` 都不会得到正确的结果，二者都会影响参数如何转义。
在介绍完规则后我们重新来看这个例子。

## Bash 转义

Bash（Posix）转义规则很简单：

一、**反斜线用来保持字面量**。Bash 里反斜线用来转义下一个字符，保持下一个字符的字面值。
比如 `\$` 表示字面量 `$`，否则如果没有反斜线 `$` 会被 [Bash 参数展开][para-exp]。
例如：

```bash
# echo 将收到字面量 \x68\x61\x72\x74\x74\x6c\x65，下一个字符 \ 被保持
# 输出 harttle
echo \\x68\\x61\\x72\\x74\\x74\\x6c\\x65

# echo 将收到字面量 x68x61x72x74x74x6cx65，下一个字符 x 被保持
# 输出：x68x61x72x74x74x6cx65
echo \x68\x61\x72\x74\x74\x6c\x65
```

注意 Shell 只负责处理参数和调用命令，不会识别 `\t`, `\n`，`\x68` 等其他编程语言里的 ASCII 特殊字符，这些特殊字符的处理通常在具体的软件中，比如 `echo`, `printf` 等。
例如下面的命令会输出 `a        b`：

```bash
echo 'a\tb'
```

但 `\t` 的语义并不是由 Shell 表达的，Shell 只是把这个长度为 4 的字符串 `"a\tb"` 传递给 `echo` 程序，后者将会收到参数 `argv[1] === "a\\tb"`。

二、**反斜线+换行例外**。反斜线后一个字符是换行（`<NL>`）时上一条规则例外。
这时 `\<NL>` 表示连行，一个命令可以分行写。换句话说 `\<NL>` 等效于会在解析时删除。
比如：

```bash
cat log.txt |\
grep a |\
grep b
# 等价于
cat log.txt | grep a | grep b
```

## 单引号的使用

单引号用来保持引用内容的所有字面量，包括反斜线。也就是说一对单引号中不得出现单引号，它前面有反斜线也不行。
例如下面的命令将会输出 `harttle`：

```bash
# echo 将收到字面量 \x68\x61\x72\x74\x74\x6c\x65
echo '\x68\x61\x72\x74\x74\x6c\x65'
```

如果单引号之间出现单引号，引用内容立即结束（来自其他编程语言的同学注意）。
比如：

```
$ echo 'foo\'bar'   # 回车
quote>              # Shell 继续等待输入，因为第一个引用内容是 foo\
                    # 紧接着是字面量 bar，然后是一个未关闭的 '
quote>'             # 输入 ' 结束第二个引用内容（为空字符串）并回车
foar                # echo 收到的输入为 foo\bar，\b 被 echo 解释为退格
```

这个情况经常在尝试转义单引号里的单引号时发生，比如 `sed 's/\'/"/g'`, `grep 'harttle\'s'` 都是错误的写法。

## 双引号的作用

双引号也是保持引用内容的字面量，但 `$`, `` ` ``, `\` 除外（POSIX 标准）。
其中：

1. `$` 用来做 [Bash 参数展开][para-exp]，比如 `echo "my name is $name."`。
2. `` ` `` 表示 [命令替换][cmd-sub]，基本等价于 `$()`。
3. `\` 是我们讨论的重点，它用来转义。

Shell 转义奇怪的是反斜线后是 `$`, `` ` ``, `"`, `\`, `<NL>` 时反斜线才表示转义，否则反斜线没有特殊含义（表示一个反斜线字面量）。
例如下面两个命令都会输出 `harttle`，因为 `"\\x"` 的第一个反斜线表示转义，解释为 `"\x"`，而 `"\x"` 中的反斜线没有特殊含义，也解释为 `"\x"`。

```bash
echo "\\x68\\x61\\x72\\x74\\x74\\x6c\\x65"
echo "\x68\x61\x72\x74\x74\x6c\x65"
```

其中 `\<NL>` 和单引号一样表示连行，`\"` 表示字面量双引号，注意这在单引号语法中是不允许的。

## 案例分析

现在继续看本文刚开始的例子：

```bash
echo '\\x68\\x61\\x72\\x74\\x74\\x6c\\x65' | xargs -0 printf '%b'
```

1. 由于 echo 的参数使用单引号，echo 收到的参数为字面量 `\\x68\\x61\\x72\\x74\\x74\\x6c\\x65`。
2. 因此 `echo '\\x68\\x61\\x72\\x74\\x74\\x6c\\x65'` 的输出为：`\x68\x61\x72\x74\x74\x6c\x65`。
3. 由于 `xargs -0` 下标准输入会被当做字面量处理（`\` 不再是特殊字符），`xargs` 给到 `printf` 的第二个参数为字面量 `\x68\x61\x72\x74\x74\x6c\x65`，第一个参数为 `%b`。
4. `printf` 处理十六进制 ASCII 字面量语法，输出 `harttle`。

有两点需要注意：

- 如果 echo 的第一个参数只有单个反斜线（`\x68\x61\x72\x74\x74\x6c\x65`），echo 的输出即为 `harttle`，经过 `printf` 后仍然为 `harttle`；
- 如果 `xargs` 没有添加 [`-0` 参数][xargs-options]，`xargs` 会把它的标准输入正常做 Bash 转义，也就是说 `xargs` 给到 `printf` 的第二个参数将会是 `x68x61x72x74x74x6cx65`，因为 Bash 转义中 `\x` 的语义（见“转义”一节）和 `printf` 转义中 `\x` 的语义不同。

[xargs-options]: https://www.gnu.org/software/findutils/manual/html_node/find_html/xargs-options.html
[quoting]: https://www.gnu.org/software/bash/manual/html_node/Quoting.html#Quoting
[cmd-sub]: https://www.gnu.org/software/bash/manual/html_node/Command-Substitution.html#Command-Substitution
[xargs]: https://www.gnu.org/software/findutils/manual/html_node/find_html/xargs-options.html
[para-exp]: https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html#Shell-Parameter-Expansion