---
layout: blog
title: Github Pages (Jekyll) 自动生成文章标签
tags: Bash Github Vim grep awk sed JSON Jekyll
---

在Github Pages上写博客快三年了，为文章添加标签一直是一件困难的事情。
由于Harttle一直在Unix+Vim做开发和写博客，
所以写了一个『Bash脚本』来为文章生成标签列表，
并为Jekyll项目写了一点『Vim插件』，以便在编辑文章时一键生成标签。

# 为什么需要生成标签？

并不是所有人都有这样的困惑。对我来讲Jekyll最不方便之处就是『为文章添加标签』。
原因有二：

1. 标签名不统一。同样的标签经常会因大小写、中英文、连字符等原因被识别为不同标签。
2. 提取标签困难。写完文章后需要仔细挑选标签，并参考以往的文章标签，
这一过程在标签变多时非常困难。

# 用怎样的策略生成标签？

既然这件事情一定要自动化，那么用怎样的逻辑生成标签呢？
想到提取标签，第一印象便是统计词频。
然而词频最高的词语往往是语言表述相关的东西，但它们不是文章的重点。
下面将会看到我们需要一个标签库、一个Bash脚本、再加一个Vim插件。

<!--more-->

## 需要一个标签库

所以需要一个标签库，然后从当前文章匹配那些既有标签。
那么，我需要比较完整的标签库，同时要有我的技术特色。
我在 harttle.land 已经有219篇文章了，把它们标签拿出来不就是现成的标签库嘛！
**所以，可以从Jekyll站点中提取标签形成标签库**。

## 需要Bash脚本+Vim插件

既然策略已定，那么现在开始写代码吧！我要在Vim里一键插入标签，需要写一个Vim插件。
但根据Unix哲学『一个程序只做一件事情已达到较好的复用性』，
我决定写一个Jekyll页面，一个Bash脚本，然后在Vim插件中调用它。

# Jekyll标签页面

既然要使用Jekyll既有的标签库，那么需要一个Jekyll页面来生成那些标签。
恰好[我的博客][harttle.land]有一个`tags.json`：

```liquid
{% raw  %}---
---

[
  {% for tag in site.tags %}
    {
      "name": "{{ tag|first }}",
      "count": {{ tag|last|size }}
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]{% endraw %}
```

它生成的页面就是一个JSON文件（也可以访问 <https://harttle.land/api/tags.json> 查看）：

```json
[
    {
      "name": "Markdown",
      "count": 4
    },
    {
      "name": "Github",
      "count": 3
    }
]
```

这个文件位于`_site/api/tags.json`，这便是标签库。

# 生成标签的Bash脚本

首先这个Bash脚本应当接受一个文件名参数，给出要为哪篇文章生成标签。
然后去`_site/api/tags.json`读取标签列表，最后输出文章匹配的标签。

```bash
#!/bin/bash
# Usage: ./generate_tags.sh xxx.md

# generate tag list 
grep name ./_site/api/tags.json | awk -F : '{print $2}' | tr -d ',\" '  > /tmp/tags.txt

# match tag string
grep $1 -oFf /tmp/tags.txt | sort | uniq | tr '\n' ' ' | sed 's/ $//'; echo ''
```

保存上述脚本为`./scripts/generate_tags.sh`，该脚本分为两部分。首先读取`_site/api/tags.json`生成标签列表文件`/tmp/tags.txt`：

> 其中`awk`用来输出冒号后的标签名，`tr`用来移除逗号引号。

```
Markdown
Github
Ruby
...
```

脚本第二部分用`grep`匹配文章中的标签，其中`$1`表示脚本的第一个参数。
Grep的4个选项解释如下：

```
-o, --only-matching
    Print only the matched (non-empty) parts of  a  matching  line,  with
    each such part on a separate output line.
-F, --fixed-strings
    Interpret PATTERN as a list of fixed strings, separated by  newlines,
    any of which is to be matched.  (-F is specified by POSIX.)
-f FILE, --file=FILE
    Obtain  patterns  from  FILE,  one per line.  The empty file contains
    zero patterns, and therefore matches nothing.  (-f  is  specified  by
    POSIX.)
```

这个脚本可以在Jekyll根目录下直接调用，例如，为我正在编辑的[这篇文章](#)生成标签：

```
$ bash ./scripts/generate_tags.sh _drafts/jekyll-tags.md
ArchLinux Bash CentOS Github HTML Makefile Markdown Ruby Unix Vim inline
```

# 一键插入标签的Vim插件

Vim插件其实就是一些Vim配置：

```vim
" To enable this project vim config, add `set exrc` into your `~/.vimrc`
" Usage: Press `<leader>tags` in normal mode
" Note: make sure your cwd is the project root

nnoremap <leader>tags :read !./scripts/generate_tags.sh % <cr>
```

设置了一个键盘映射，按下`<leader>tags`时执行`./scripts/generate_tags.sh`，
并将输出插入到当前光标所在位置。

> 其中`<leader>`是指你的Vim前导键（我的是`;`），`%`表示当前文件，作为第一个参数传入脚本中。前导键可以通过`let mapleader=';'`在`~/.vimrc`里设置。

把上述Vim配置保存为`.vimrc`放在Jekyll项目的根目录下。
下一个问题是让Vim在Jekyll项目工作时，载入上述配置。
Vim何其强大，当然支持目录相关的配置，只需要在`~/.vimrc`中加入：

```vim
set exrc    " 开启目录相关配置
set secure  " 开启目录相关配置会有风险，只执行安全的配置
```

OK，至此我们在Jekyll站点中用Vim打开一篇文章（xxx.md），输入`;tags`将会在当前行插入自动生成的一行标签了。

# 参考资料

* <http://vim.wikia.com/wiki/Append_output_of_an_external_command>
* <https://andrew.stwrt.ca/posts/project-specific-vimrc/>

[harttle.land]: https://harttle.land
