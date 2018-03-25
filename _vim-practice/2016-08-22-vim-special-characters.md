---
title: Vim 查找/替换/输入非可见字符
tags: Unix Vim Windows 字符编码
---

在跨平台工作中由于不同编辑器处理换行和空白字符风格不一致，
常常在Vim下会看到一些特殊字符。
本文帮你解决不可见字符的查找、替换、输入等问题。

<!--more-->

# 非可见字符表

Vim中可见特殊字符会直接显示，不可见特殊字符会显示为该字符在命令行的输入方式，
例如 `\r` 显示为 `^M`。通过 `:help digraph-table` 可看到所有Vim中可输入的特殊字符：

```
char  digraph  hex   dec   official name
^@      NU     0x00   0    NULL   (NUL)
^A      SH     0x01   1    START OF HEADING (SOH)
^B      SX     0x02   2    START OF TEXT (STX)
^C      EX     0x03   3    END OF TEXT (ETX)
^D      ET     0x04   4    END OF TRANSMISSION (EOT)
^E      EQ     0x05   5    ENQUIRY (ENQ)
^F      AK     0x06   6    ACKNOWLEDGE (ACK)
^G      BL     0x07   7    BELL (BEL)
^H      BS     0x08   8    BACKSPACE (BS)
^I      HT     0x09   9    CHARACTER TABULATION (HT)
^@      LF     0x0a   10   LINE FEED (LF)
^K      VT     0x0b   11   LINE TABULATION (VT)
^L      FF     0x0c   12   FORM FEED (FF)
^M      CR     0x0d   13   CARRIAGE RETURN (CR)
```

第一列为特殊字符，第二列为digraph（见下文），第三列为十六进制表示，
第四列为十进制表示，第五列为该字符的官方名称。所以如何查看文件中的这些字符呢？

```
" 显示隐藏字符
:set list
" 不显示隐藏字符
:set nolist
" 设置显示哪些隐藏字符
:set listchars=eol:$,tab:>-,trail:~,extends:>,precedes:<
```

> 也可以通过外部命令查看二进制表示。转为二进制：`:%!xxd`，恢复：`:%!xdd -r`。

# 输入非可见字符：digraph

Vim 中显然没有什么特殊字符选择工具，但提供了两种输入特殊字符的方式：

* 通过两个字符来输入一个特殊字符（digraph）。
* 直接通过编码值（ASCII或Unicode）输入。

其中digraph是一种类似双拼的方法，连续输入两个字符来表示一个特殊字符。
需要先按下前导键`<Ctrl-K>`，例如在编辑模式下输入：

```
<Ctrl-K>Rg
```

将会出现`®`字符，其中`"Rg"`是该字符的digraph（双拼）。
所有的digraph可以通过`:help digraph-table`查询。

# 输入非可见字符：字符编码

除了 digraph 外还可直接通过字符编码来输入它，这样我们即使没有输入法也可以输入中文。
这种方式也是在插入模式下进行的，需要先按下前导键`<Ctrl-V>`（Windows下`<Ctrl-Q>`）。
有下列5种方式：

* 十进制值ASCII：`^Vnnn (000 <= nnn <= 255)`
* 八进制值：`^VOnnn 或 ^Vonnn (000 <= nnn <= 377)`
* 十六进制值：`^VXnn or ^Vxnn (00 <= nn <= FF)`
* 十六进制BMP Unicode：`^Vunnnn (0000 <= nnnn <= FFFF)`
* 十六进制任何Unicode：`^VUnnnnnnnn (00000000 <= nnnnnnnn <= 7FFFFFFF)`

是时候打开 Vim 了，进入插入模式后依次按下以下字符：

```
<Ctrl-v>u6768<Ctrl-v>u73fa<Esc>
```

将会得到 `杨珺` 两个字符，没错这是 Harttle 的名。

# 换行的搜索/替换

> 如果你还不了解Vim的搜索和替换，请移步[在 Vim 中优雅地查找和替换][search]。

换行在Vim中的行为很特殊也不够一致，需要单独讨论一下。首先区分一下`\r`和`\n`：

* 前者是回车（Carriage Return），在Vim中可通过`<c-k>CR`输入，显示为`^M`。
* 后者是换行（New Line），在Vim中通过`<CR>`（回车）键输入，显示为回车并换行；

所以对于Windows风格换行（`\r\n`）在Vim中会在每行结尾显示`^M`。

## 搜索

在搜索模式（`/`）搜索换行时仍然应当使用`\n`字符，因为Vim的换行（Unix风格）确实是`\n`而不是`\r\n`。例如：

```
/foo\nbar
```

可以匹配到所有的：

```
foo
bar
```

## 替换

注意 `:s` 命令替换为换行（`NL`, `\n`）时，应当写 `\r` 而不是`\n`。
例如将所有逗号替换为换行：

```
:%s/,/\r/g
```

> 如果使用`\n`则目标会被替换为空字符`NULL`（显示为`^@`）。

将DOS风格换行（`\r\n`）的文件转为Unix风格换行（`\n`）其实很简单，不需要手动查找替换：

```
:set fileformat=unix 
:w
```

Excel 等软件经常用 CR（`^M`, `\r`）来换行，怎么把 `\r`换成 `\n` 呢？

```
:%s/<Ctrl-k>cr/\r/g
```

# 参考阅读

* Vim Tips Wiki：<http://vim.wikia.com/wiki/Entering_special_characters>

[search]: /2016/08/08/vim-search-in-file.html
