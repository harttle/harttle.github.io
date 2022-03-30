---
title: 对 tail -f 使用管道
tags: TTY Unix 管道 awk grep sed
---

最近发现 `tail -f` 时管道后面的程序都会被卡住，才发现 grep，sed，awk 不直接输出到 TTY 时都是带缓冲的。平时跟在 `cat` 后使用没问题是因为输入管道关闭触发了 flush。本文详细解释其中的坑，以及怎么让 sed, awk, grep 立即 flush。
**TL;DR**：grep 添加 `--line-buffered`，sed 添加 `-u`，awk 调 `fflush()`。

<!--more-->

## 管道和缓冲

[管道][pipe] 是 Linux/Unix 中进程间通信的一种方式，可以在命令间、进程间传递数据。比如下面的命令用来来打印所有文件不存在的异常。

```bash
cat log.txt | grep Error | grep ENOENT
```

由于 `cat` 命令会在读完文件后立即退出并关闭 STDOUT，grep 的缓冲会立即 flush，我们会在执行完上述命令后立即看到输出。但如果改成实时打印日志的 `tail -f` 则会看不到任何输出：

```bash
tail -f log.txt | grep Error | grep ENOENT
```

因为当 grep 的输出不是 [TTY（终端）][tty] 时，会启用缓冲。输入关闭或缓冲区满时才输出。这个例子中第一个 grep 的输入 `tail -f` 一直没有关闭，因此缓冲一直不会输出，第二个 grep 也永远不会收到输入。
因此控制台不会有任何输出。

但如果反过来，grep 的输出是 TTY 时就不会缓冲。也就是说 `tail -f log.txt | grep Error`（注意少了一个 grep）会正常地持续地输出。

## 检查输出文件

那么 grep 会检查它输出到哪里？虽然理论上有悖于管道的设计，也不那么函数式。
难以想象我们有个函数，它的返回值竟然会取决于这个返回值下一步被用于做什么操作。
不仅是 grep，sed 也有类似的行为，这里不去更多地讨论设计，而是给几个有用的场景：

1. 当输出到 TTY 时输出带颜色的字符，输出到文件时输出纯文本。
2. 当输出到 TTY 时执行过程可以提示用户输入，输出到文件时则需要使用默认值或者报错。
3. 以及 grep 的例子：输出到 TTY 时实时打印，输出到文件或其他程序时缓冲起来（因为尤其是写入磁盘文件时，没必要有输出就写）。

那么怎么判断标准输出的文件描述符呢？

- Shell 里可以通过 `[ -t 1 ]` 来判断 stdout（文件描述符 1） 是否是 TTY。
- JavaScript 里可以通过 `process.stdout.isTTY` 来判断是否是 TTY。
- 更多请参考：<https://rosettacode.org/wiki/Check_output_device_is_a_terminal>

注意 `[` 是一个命令，`-t` 是它的参数，可以 `man [` 查看详情。

## 缓冲区满

既然 `tail -f` 日志看不到输出是因为缓冲区没有 flush，那么缓冲区什么时候会被 flush 呢？有两种情况：

1. 写入已经结束（类似 JavaScript 中的 `Stream.prototype.end()` 调用）。但是 `tail -f` 的输出流永远不会结束，因为 `-f` 会永远 follow 文件 append。作为对比，cat 命令的输出流会在读到文件尾时结束。比如执行 `cat log.txt | grep Error` 会立即 flush 并退出。
2. 缓冲区满。既然叫做 Buffer 一定是有大小的，tail 写入足够多的内容后，grep 的缓冲区就会满，这时也会发生 flush。

那么 grep 的缓冲区是多大呢？既然 tail 的输出不足以填满缓冲区，我们用输出足够多的 yes 命令：

```bash
yes Error ENOENT | grep Error | grep ENOENT
```

yes 命令用来不断地循环（死循环，直到被 `Ctrl-C`）输出它的参数，因此缓冲很快会满。果然上面的命令我们可以看到大量的输出。

## 避免缓冲

grep 提供了 `--line-buffered` 来按照行缓冲，也就是每写满一行 flush 一次：

```
--line-buffered
     Force output to be line buffered.  By default, output is line buffered when standard output is
     a terminal and block buffered otherwise.
```

sed 可以用 `--unbuffered` 来禁用缓冲：

```
-u, --unbuffered
     load minimal amounts of data from the input files and flush the output buffers more often
```

awk 作为一门完整的编程语言，需要调用 `fflush()` 方法来清空缓冲：

```
The built-in function fflush(expr) flushes any buffered output for the file or pipe expr.
```

因此前面的例子中给 grep 添加 `--line-buffered` 即可让它持续地输出：

```bash
tail -f log.txt | grep --line-buffered Error | grep ENOENT
```

注意第二个 grep 不需要添加 `--line-buffered`，因为它的标准输出是 TTY，默认不会启用缓冲区。
下面是一个更完整的例子，从 log.txt 文件实时读日志，过滤包含 Error 的行，把 harttle 标记去掉，打印出第一列，再过滤得到 `ENOENT` 的行：

```bash
tail -f log.txt | grep --line-buffered Error | sed -u 's/harttle//' | awk '${print $1; fflush()}' | grep ENOENT
```

[pipe]: https://man7.org/linux/man-pages/man2/pipe2.2.html
[tty]: /2016/06/08/shell-config-files.html