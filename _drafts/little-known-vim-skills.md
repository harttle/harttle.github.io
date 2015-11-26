---
layout: blog
categories: linux
title: 那些鲜为人知的Vim小技巧
tags: Vim Bash 
---

# 用拷贝的内容替换

当发生拼写错误或者想要重命名标识符时，就需要用拷贝的内容来替换当前的名字。比如调用函数时写错了：

```cpp
void letus_fuckit_with_vim(){
    cout<<"great!";
}
let_fuckat_with_vom();
```

只需要先复制上面的函数名，再把光标切换到拼错的词首。然后按下`viwp`，就替换过来了：

```cpp
void letus_fuckit_with_vim(){
    cout<<"great!";
}
letus_fuckit_with_vim();
```

> `v`进入可视模式，输入`i`表示选好之后要插入，然后`w`来选择一个单词（你可以选择任何区域），最后按下`p`来粘贴。

# 字符查找

[Vim光标跳转][vim-cursor]虽然有数十种快捷键，但你有没有发现当我们碰到长单词时会很无力，比如我想把下面的`description`替换为`keywords`：

```
tmystr_meta_description
```

是不是要不断地敲`l`（或者敲几次`{num}l`），其实可以用单词查找功能。只需要输入`fd`便可以查找当前行的下一个字母`d`。大写的`F`可以反向查找。

# 段落跳转

这个对中文用户几乎无用，但我们在编辑代码文件时会很有用。`()`可以调到句首句尾，`{}`可以调到段首段尾。

# 选区头尾跳转

Emmet插件可以进行HTML的标签匹配，你按下`<c-y>d`当前标签首尾之间被选中。你想调到选中区域的尾部怎么办？
按下`o`即可切换收尾，再次按下`v`就能回到Normal模式。

# 原生自动补全

如果你没有使用任何Vim插件，Vim的自动补全是默认关闭的。在不引入插件的情况下Vim也可以启用强大的自动补全，只需要设置：

```vim
filetype plugin on
set omnifunc=syntaxcomplete#Complete
```

在任何时候，按下`<c-x><c-o>`将会触发自动补全。

参考： http://vim.wikia.com/wiki/Omni_completion

# 搜索选区

当你需要选择一大段文字时，不妨先进入visual模式，再进行正则搜索。例如在markdown中，选择某个`##`的内容可以这样操作：
移动光标到要选中的`##`上，按下`v`进入visual模式，输入`/^## `匹配下一个二级标题，按下`j`回到上一行。

# 拷贝当前文件名

使用`:let @"=expand("%")`可以拷贝当前文件名，我们可以给这个命令设一个快捷键：

```vim
nnoremap yf :let @"=expand("%:t")<CR>
nnoremap yp :let @"=expand("%:p")<CR>
```

其中`yf`拷贝当前文件名，`yp`拷贝完整文件路径。然后按下`p`即可粘贴。
当然你可以拷贝到任何一个寄存器，比如拷贝到寄存器`k`：`:let @k=expand("%")`。
然后粘贴`k`中的内容：`"kp`。

[vim-cursor]: {% post_url 2015-11-07-vim-cursor %}
