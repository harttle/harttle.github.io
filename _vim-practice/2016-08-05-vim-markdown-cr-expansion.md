---
title: Vim 中为 Markdown 配置回车展开
tags: Markdown Vim Jekyll
---

靠Vim写Jekyll博客已经很久了，编写代码块（Code Fence）时键入前后的```` ``` ````，
以及手动编写文章头信息（Front Matter）一直是个麻烦的事情。
Harttle今天就通过Vim键盘映射来对这两种语法提供回车展开支持。最终效果如下：

<!--more-->

键入Code Fence```` ``` ````以及高亮语言（`|`表示光标所在位置）：

    ```javascript|```

此时键入回车：

    ```javascript
    |
    ```

# 定界符匹配

Markdown中有两种代码语法：行内代码`` `foo` ``，以及用```` ``` ````分隔的代码块（Code Fence）。
我们在输入`` ` ``时希望Vim自动补全后一个`` ` ``且光标仍位于两者之间。
要实现这一点需要先安装 [delimitMate][dm] 插件：

```vim
Plugin 'Raimondi/delimitMate'
```

> 如何安装Vim插件？请参考[打造前端开发的 Vim 环境][vim-frontend]一文。

然后在`~/.vim/after/ftplugin/markdown.vim`（不存在则创建该路径及文件）中为Markdown文件配置特殊的`` ` ``定界符：

```vim
let b:delimitMate_quotes = "\" ' `"
let b:delimitMate_nesting_quotes = ['`']
```

> 设置`` ` ``允许嵌套是为了在输入三个`` ` ``时Vim仍然可以正确匹配。


现在打开一个`*.md`文件并键入```` ``` ````后，即可自动补全后面的```` ``` ````：

    ```|```

此时敲回车：

    ```
    |```

而我们希望的是：

    ```
    |
    ```

这便是我们下一节讨论的回车符展开。

# 回车符展开

本节中更改的还是`~/.vim/after/ftplugin/markdown.vim`文件，
该文件为Markdown类型文件独有的配置，不会影响其他类型的文件。
首先创建一个键盘映射：将回车映射为`Expander()`函数调用。

> Vim通过文件后缀来识别文件类型，只需要在`~/.vimrc`中打开该功能：`:filetype on`。
> 如果你希望自定义文件类型，可以在`~/.vim/after/filetype.vim`中添加文件类型识别规则。
> 参见：<http://vim.wikia.com/wiki/Filetype.vim>

```vim
inoremap <expr> <CR> Expander()
```

其中`inoremap`是指insert模式（`i`）下进行映射；且为非递归（`nore`）映射，即映射后的结果不被再次映射；`<CR>`为回车符（Carriage Return）。
现在到了程序员的强项：编写`Expander`函数。

```vim
function! Expander()
  let line   = getline(".")
  let col    = col(".") - 1

  if line[0:2] ==# "```" && line[col : col+2] ==# "```"
    return "\<CR>\<Esc>O"
  endif

  return "\<CR>"
endfunction
```

该函数获取了当前光标所在行内容，以及光标所在位置（敲击回车后光标后移了一格）。
光标后有三个`` ` ``并且行首也有三个`` ` ``时返回『回车、退出插入模式、向上插入新行』；
否则返回正常的『回车』。

> 注意`<expr>`键盘映射的函数返回值中，按键需要转义。例如`\<CR>`。

# 头信息展开

在编写Jekyll文章时，首先要编写头信息（Front Matter）：

    ---
    title: xxx
    tags: xxx
    ---

我希望输入`---`后回车便自动补全以上内容，可以继续修改上述`Expander`函数：

```vim
function! Expander()
  let line   = getline(".")
  let col    = col(".") - 1

  if line[0:2] ==# "```" && line[col : col+2] ==# "```"
    return "\<CR>\<Esc>O"
  endif

  if line[0:2] ==# "---"
    return "\<CR>layout: blog\<CR>---\<Esc>Otitle: "
  endif

  return "\<CR>"
endfunction
```

保存该文件并重新打开一个`*.md`文件，输入以下内容（`|`为光标位置）：

    ---|

按下回车，便可补全Front Matter：

    ---
    layout: blog
    title: |
    ---


[dm]: https://github.com/Raimondi/delimitMate
[vim-frontend]: /2015/11/22/vim-frontend.html
