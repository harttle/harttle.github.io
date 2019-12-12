---
title: Vim 下大小写敏感的搜索/替换
tags: Vim 大小写敏感 搜索 替换
---

Vim 中的搜索默认是大小写敏感的，即搜索 `vim` 不会匹配到 `Vim`。
这一点跟多数编辑器/IDE 都不同，因此 Vim 的默认设置其实很不顺手。
本文来分享一些个性化的配置方法，让 Vim 下的大小写敏感/不敏感用起来更加顺手。
比如当搜索词包含大写时应用大小写敏感搜索；其他情况应用大小写不敏感搜索。

## TL;DR

以搜索词为 harttle 为例（省略了最后的回车）：

* 强制大小写不敏感搜索：`/harttle\c`
* 强制大小写敏感搜索：`/harttle\C`
* 强制大小写不敏感替换：`s/harttle\c/Harttle`
* 强制大小写敏感替换：`s/harttle\C/Harttle`
* 设置为大小写敏感：`:set ignorecase`
* 设置为大小写不敏感：`:set noignorecase`
* 设置为智能模式（有大写时敏感否则不敏感）：`:set smartcase`
* 设置为非智能模式：`:set nosmartcase`

<!--more-->

## 大小写敏感控制字符

正如在正则表达式有类似 `i` 这样的开关，Vim 也有特殊字符来控制大小写敏感。
在模式末尾加 `\c` 表示大小写不敏感，加 `\C` 表示大小写敏感。
例如：

```vim
" 大小写不敏感搜索，可以匹配：vim, Vim, VIM
/vim\c<CR>
" 大小写敏感搜索，只可以匹配：Vim
/Vim\C<CR>
" 把出现的所有 vim, Vim, VIM 等都替换为 Vim，在写文章时会经常会用到
:%s/vim\c/Vim/g
```

这一语法的优先级高于下文的 `ignorecase`, `smartcase` 等选项，
所以比较万能，在远程机器上、别人的电脑上，一般用这个操作。

## ignorecase/smartcase

Vim 中的 `ignorecase` 用于设置大小写敏感，它将在所有搜索、替换命令中生效。
在 normal 模式中 `:set ignorecase` 设置为不敏感；`:set noignorecase` 设置为敏感。
`ignorecase` 属于选项变量，因此也可以通过 `&` 来设置，例如：`:let &ignorecase=1`。
把冒号去掉后可以直接放到 .vimrc 文件里持久生效。

> 更多 Vim 变量赋值和引用的细节，可参考这篇文章：[Vim 中的变量赋值、引用与作用域](https://harttle.land/2017/01/30/variables-in-vim.html)。

开启 `ignorecase` 之后还可以把 `smartcase` 也打开（后者要求前者出于开启状态），
Vim 会启用智能模式：

* 在你输入的模式中包含大写时，启用大小写敏感模式；
* 在你输入的模式中只有小写时，启用大小写不敏感模式。

例如：

```vim
:set ignorecase
:set smartcase

" 大小写不敏感，可以匹配：vim, Vim, VIM
/vim<CR>
" 大小写敏感，只可以匹配 Vim
/Vim<CR>"
```

## 当前词搜索

`smartcase` 只对输入的模式（pattern）生效，其他不需要输入 pattern 的搜索命令不生效。
比如 [在 Vim 中优雅地查找和替换](https://harttle.land/2016/08/08/vim-search-in-file.html) 中介绍过可以用 `*`（向后），`#`（向前），`g*`（不切词）等命令来搜索光标所在的词搜索光标所在的词。
为了让它们好使，可以先按下 `*` 来搜索一次，然后按下 `/`（向后）再按上箭头找到上次历史（这是一个具体的 pattern）再按回车搜索。同样地，按 `?`（向前）也可以。

“展开光标所在词”是存在 Vim 命令的，因此我们可以把 `*`, `#` 映射掉来自动化上面的过程：

```vim
" respect to smartcase, expand the pattern
:nnoremap * /\<<C-R>=expand('<cword>')<CR>\><CR>
:nnoremap # ?\<<C-R>=expand('<cword>')<CR>\><CR>
```

这样下次按下 `*` 或 `#` 时，Vim 就会展开光标处的词，分别应用 `/` 或 `?` 进行搜索。
这样当光标处的词有大写时就用大小写敏感搜索，全小写时就用大小写不敏感搜索。
`<C-R>=` 用来插入计算表达式并插入到命令里，类似我们在
[使用 Vim 寄存器](https://harttle.land/2016/07/25/vim-registers.html)
中介绍的 `<C-R>"` 可以把匿名寄存器（上次拷贝、剪切、删除）的内容插入到命令里。
