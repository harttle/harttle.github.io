---
title: 感受Vim的强大：进阶技巧
tags: Vim-Practice Bash Markdown Unix Vim 宏 寄存器 快捷键
---

Vim是从vi发展出来的一个文本编辑器。代码补全、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。和Emacs并列成为类Unix系统用户最喜欢的编辑器。
如果你还没有使用过Vim，建议你先去看这个：[Vim初级：配置和使用][vim-basic]。本文介绍一些Vim的高级特性。包括块编辑、宏录制、语法高亮、键盘映射、函数定义、文件类型识别与对应插件加载等。

<!--more-->

* 英文文档：<http://vimdoc.sourceforge.net/htmldoc/>
* 中文文档：<http://vimcdoc.sourceforge.net/doc/>

# 模式

在开始尝试复杂操作前务必要了解 Vim 的工作模式：

1. 普通模式(Normal): 进入 Vim 后的默认模式，可输入编辑命令。
2. 插入模式(Insert): 在 Normal 模式中按下 `i/I/a/A` 等键后进入插入模式，这时输入的字符会插入到光标处。
2. 可视模式(Visual): 在 Normal 模式下按下 `v` 可进入。用于选中某个区域，后续的编辑命令作用于这个区域。
3. 选择模式(Select): 设置好 `selectmode` 和 `mouse` 后鼠标选区即可进入。类似于可视模式，但键入的字符对选择区进行替换（类似 Microsoft Windows 下的编辑方式）。
5. 命令行模式(Command-line): 在 Normal 模式下按下 ":" 或 "/" 即可进入，用来输入 Ex 命令。
4. Ex 模式(Ex): 在 Normal 模式按下 `Q` 进入。类似命令行模式，只是每个命令结束后不会自动回到普通模式（vimrc 脚本即处于这一模式）。

> 参考：[Learning the vi Editor/Vim/Modes](https://en.wikibooks.org/wiki/Learning_the_vi_Editor/Vim/Modes)

# 选中编辑

`v` 可进入 **可视模式**（visual），[使用标准快捷键移动光标][vim-cursor] 可进行文本选区，之后的编辑命令对整个选中区域生效。
例如把选中区域的所有 `author` 替换为 `harttle`：

1. 进入 Visual 模式并选三行文本：`vjjj`。
2. 对选中部分进行替换：`:s/author/harttle/g`。

# 块编辑

按下 `<Ctrl>v` 进入列编辑模式 **列编辑** 模式（block Visual mode），移动光标可跨行选择矩形的文本块，之后的编辑命令对整个块生效。
例如注释 N 行代码（添加 `//`）：
Normal 模式下 `<Ctrl>v` 进入列编辑模式，`jjj` 选中下面三行，`I` 进入插入模式，输入 `//` 注释字符，按 `<Esc>` 完成。

如何让矩形块选中参差不齐的行尾呢，这时需要一些特殊的移动命令，
比如 `^` 移动到行首（或 `|` 移动到当前行的第一个字符）、`$` 光标移到行尾、`A` 在行尾追加、`I` 在行首插入。

例如在每行行尾都加入句号：Normal 模式下 `gg` 到文件头，`<Ctrl-v>`进入块编辑模式，
`G` 选择所有内容；`A` 进入行尾插入模式，输入 `。`，按下 `<Esc>`完成。

> 参考：[Vim Tips Wiki: Inserting text in multiple lines](http://vim.wikia.com/wiki/Inserting_text_in_multiple_lines)

# filetype on

Vim可针对特定的文件，加载指定插件。以此来实现文件类型的特殊配置以及语法高亮。

首先要在 vimrc 中通过 `filetype on` 开启文件类型识别，Vim 会在载入时做如下工作：

1. 执行`$RUNTIMEPATH/filetype.vim`，尝试得到 `filetype`。
2. 如果没有得到 `filetype`，继续执行 `$RUNTIMEPATH/scripts.vim`

比如我们可以在 `~/.vim/filetype.vim` 中进行 `filetype`：

```vim
" 在读取和创建 *.cpp 时设置 filetype 为 cpp
au BufRead,BufNewFile *.cpp setfiletype cpp
```

调试时我们可以手动设置 `:set filetype=cpp`。
`RUNTIMEPATH` 变量可通过 `:set rtp` 打印出来，详情请参考：<http://vimcdoc.sourceforge.net/doc/options.html#'runtimepath'>

# filetype plugin on

`filetype plugin on` 允许 Vim 通过 `filetype` 的当前值加载对应的 `$RUNTIMEPATH/ftplugin/<filetype>.vim`。
如果你按照上一小节配置了 `filetype` 变量，在你打开 cpp 文件时 Vim 会尝试载入 `~/.vim/ftplugin/cpp.vim` 文件（如果有的话）。

事实上 Vim 会尝试载入 `$RUNTIMEPATH` 下的所有 `ftplugin/cpp.vim`。
比如 `~/.vim/ftplugin/cpp.vim` 之后还会执行 `~/.vim/after/ftplugin/cpp.vim`，
因此它里面的配置生效会更稳。

# 手动载入插件

`filetype` 只是提供一种方便的机制来定义不同文件类型的配置。
我们也可以不用这种机制，手动载入对应文件的配置，例如：

```vim
" 创建或读取 *.plt 文件时执行 plt.vim
au BufNewFile,BufRead *.plt  source ~/.vim/after/ftplugin/plt.vim`
```

参考：<http://vimcdoc.sourceforge.net/doc/filetype.html#filetype-plugins>

# 缩进设置

缩进的设置也可以通过不同的文件类型来载入，需要在 `~/.vimrc` 中设置 `filetype indent on`。
与 `ftplugin` 机制类似在 Vim 加载一个有 `filetype` 的文件时会自动载入对应的缩进配置文件。

比如打开 `*.cpp`（`filetype` 已按上述设置为 `cpp`）时，Vim 会尝试载入 `~/.vim/indent/cpp.vim`。
其中的内容可以是：

```vim
set shiftwidth=4
set tabsize=4
set expandtab
```

# 语法高亮

`syntax on` 允许 Vim 加载文件类型的语法高亮配置，Vim会在载入时寻找并加载 `RUNTIMEPATH/syntax/<filetype>.vim`。例如：`~/.vim/syntax/markdown.vim` 将会对文件类型`markdown` 进行语法高亮。

当然语法高亮最好引入插件，请参考这些文章：

* [打造前端开发的 Vim 环境](/2015/11/22/vim-frontend.html)
* [如何用Vim搭建IDE？](/2015/11/04/vim-ide.html)
* [在VIM下写C++能有多爽？](/2015/07/18/vim-cpp.html)

# 键盘映射

Vim支持定义键盘映射来完成快捷键的功能，也就是将特定的按键映射为一系列按键与函数的序列。

例如将 `F7` 映射为编译当前 java 文件：

```vim
map <F7> <Esc>:!javac %<<CR>
```

`:` 为进入Ex模式，`!` 指定下面的命令在vim外执行，`%` 为当前文件名，`%<` 为不带扩展名的当前文件名，`<CR>` 为回车。

此外设置 `map` 时可以指定它在何种情况（Vim 模式）下生效，这些模式包括：

map 模式 | 描述
:---:  | ----
n	|	普通
v	|	可视和选择
s	|	选择
x	|	可视
o	|	操作符等待
!	|	插入和命令行
i	|	插入
l	|	插入、命令行和 Lang-Arg 模式的 ":lmap" 映射
c	|	命令行


定义 `map` 时添加上述模式名作为前缀，即可指定 `map` 命令在哪些模式生效：

命令    |       左边  |       右边   |          模式
----    | -------     |     ----     |           ----
:map     |    {lhs}  |   {rhs}  |       mapmode-nvo
:nm[ap]  |  {lhs}    |  {rhs}    |    mapmode-n
:vm[ap]  |  {lhs}    |  {rhs}    |    mapmode-v
:xm[ap]  |  {lhs}    |  {rhs}    |    mapmode-x
:smap    |   {lhs}   |   {rhs}   |    mapmode-s
:om[ap]  |  {lhs}    |  {rhs}    |    mapmode-o
:map!    |   {lhs}   |   {rhs}   |    mapmode-ic
:im[ap]  |   {lhs}   |   {rhs}   |    mapmode-i
:lm[ap]  |   {lhs}   |   {rhs}   |    mapmode-l
:cm[ap]  |  {lhs}    |  {rhs}    |    mapmode-c

此外还可添加`nore` 指定非递归方式（取消传递性）。
例如 `inoremap` 为插入模式下工作的 `map`，并且它的值不会被递归映射。

> 参考：[Mapping keys in Vim - Tutorial](http://vim.wikia.com/wiki/Mapping_keys_in_Vim_-_Tutorial_%28Part_1%29)

# 函数

现在我们可以自定义快捷键了，如果希望在键盘映射中执行更复杂的功能，我们需要定义Vim函数。

* 函数名必须以大写字母开始
* 函数可以有返回值：`return something`
* 函数可以有范围前缀。定义：`function s:Save()`，调用：`call s:Save()`

下面是函数调用的例子，按键F8时，进入拷贝模式（取消行号，鼠标进入visual模式）。

```vim
" key mapping
map <F8> <Esc>:call ToggleCopy()<CR>

" global variable
let g:copymode=0

" function
function ToggleCopy()
    if g:copymode
        set number
        set mouse=a
    else
        set nonumber
        set mouse=v
    endif
    let g:copymode=!g:copymode
endfunction
```

> 参考：[Learn Vimscript the Hard Way](http://learnvimscriptthehardway.stevelosh.com/chapters/23.html)

# 录制宏

用户录制的宏保存在寄存器中，我们先来看看什么是寄存器。vim的寄存器分为数字寄存器和字母寄存器。

* 数字寄存器为`0-9`，`0`保存着上次复制的内容，`1-9`按照最近的顺序保存着最近删除的内容。
* 字母寄存器为`a-z`，拷贝3行到寄存器`c`：`c3yy`.

现在开始录制宏。假如有如下的文件，我们希望将第二列的类型用`` ` ``分隔起来。

```
1 | BOOL  | Boolean
2 | SINT  | Short integer
3 | INT   | Integer 
4 | DINT  | Double integer 
5 | LINT  | Long integer 
6 | USINT | Unsigned short integer 
7 | UINT  | Unsigned integer 
```

1. 首先按几次`<Esc>`进入normal模式，光标移到第一行，开始录制并存入m寄存器`qm`。
2. 光标到行首`^`，到第二列词首`ww`，进入插入模式`i`，插入分隔符`` ` ``，退出到normal模式`<Esc>`，到词尾`e`，进入插入模式`i`，插入分隔符`` ` ``，退出到normal模式`<Esc>`，光标到下一行`j`。
3. 结束录制`q`。
4. 光标到第二行，在normal模式执行100次寄存器m中的宏`100@m`。

宏会在 `j` 执行错误后自动结束，得到如下文件：

```
1 | `BOOL`  | Boolean
2 | `SINT`  | Short integer
3 | `INT`   | Integer 
4 | `DINT`  | Double integer 
5 | `LINT`  | Long integer 
6 | `USINT` | Unsigned short integer 
7 | `UINT`  | Unsigned integer 
```

> 参考 [Vim Tips Wiki: Recording keys for repeated jobs](http://vim.wikia.com/wiki/VimTip144)

[vim-basic]: /2013/11/08/vim-config.html
[vim-cursor]: /2015/11/07/vim-cursor.html
