---
title: Vim 中使用 eslint 检查代码风格
tags: JavaScript Vim 代码风格 快捷键 ESLint
---

[eslint][eslint] 是一款可配置的插件式架构的代码风格检查工具。可配置不足为奇，但插件式的架构却能带来很多方便。
例如在单元测试代码中，引入 mocha 插件便可自动引入一系列额外的语法规则。

[打造前端开发的 Vim 环境](/2015/11/22/vim-frontend.html) 一文中提到了使用 Syntastic 对代码进行代码风格检查。
但同时我们需要按照**同样一份规则**（就是下文的 eslintrc）来进行代码格式化。
本文详细介绍如何在 Vim 中引入 eslint，以及用 eslint 规则来格式化代码。
 
<!--more-->

# syntastic 与 vim-autoformat

工欲善其事必先利其器，首先介绍两个 Vim 插件。
如果你不了解如何安装这些托管在 Github 上的 Vim 插件，
请移步 <https://github.com/VundleVim/Vundle.vim>。
继续完成下文的配置之前，需要你安装这两个插件：

```vim
Plugin 'scrooloose/syntastic'
Plugin 'Chiel92/vim-autoformat'
```

其中 [syntastic][syntastic] 可以调用外部命令行工具来进行代码风格检查，
[vim-autoformat][vaf] 则可以调用外部命令行工具来格式化代码。
下文要介绍的就是让两者都调用 [eslint][eslint-cli]，并使用同一份 `eslintrc`。

# eslint 安装与配置

eslint 可直接通过 npm 安装：

```bash
sudo npm install -g eslint
```

eslint 使用配置文件来指定代码风格检查规则。可以创建一个简单的配置文件`.eslintrc.json`
（你也可以使用 `eslint --init` 来生成一份自定义的配置文件）：

```json
{
    "extends": "standard",
    "plugins": [
        "standard",
        "promise"
    ]
}
```

上述配置声明了使用 ES6 标准模式来进行检查，并引入了 promise 插件和 standard 插件。
该配置文件的作用范围包括配置文件所在目录，以及所有的子目录。
安装配置文件中指定的那些依赖项：

```bash
sudo npm install -g eslint-plugin-standard
sudo npm install -g eslint-plugin-promise
sudo npm install -g eslint-config-standard
```

生成配置文件后可创建一个简单的 JavaScript 文件来测试 eslint 是否可以运行：

```
> cat a.js
function a  (){}
> eslint a.js
/Users/harttle/tmp/a.js
  1:10  error  'a' is defined but never used       no-unused-vars
  1:13  error  Multiple spaces found before '('    no-multi-spaces
  1:15  error  Missing space before opening brace  space-before-blocks
✖ 3 problems (3 errors, 0 warnings)
```

# 配置 syntastic

本小节的目的是让 Syntastic 用 eslint 来检查 JavaScript 语法风格。
需要在`~/.vimrc`中将 JavaScript checker 设置为`eslint`：

```vim
let g:syntastic_javascript_checkers = ['eslint']
```

此后在 Vim 中保存（`:w`） JavaScript 时就会触发风格检查，
你也可以使用 `:SyntasticCheck` 来手动触发。
如果需要 location list （`:help lnext`） 来导航错误列表，需要设置 Syntastic 填充 location list：

```vim
let g:syntastic_always_populate_loc_list = 1
```

更多 syntastic 配置可参考：<https://github.com/vim-syntastic/syntastic>

# 配置 vim-autoformat

既然可以检查语法风格，那么我需要用同样的规则进行代码格式化。
恰好 `eslint --fix` 参数提供了格式化代码的特性，
我们只需要让 [vim-autoformat][vaf] 也调用 `eslint` 的命令行接口。

在 `~/.vimrc` 中定义一个 formatter，并设置到 JavaScript 文件类型：

```vim
let g:formatdef_eslint = '"SRC=eslint-temp-${RANDOM}.js; cat - >$SRC; eslint --fix $SRC >/dev/null 2>&1; cat $SRC | perl -pe \"chomp if eof\"; rm -f $SRC"'
let g:formatters_javascript = ['eslint']
```

上面定义的 formatter 做了这些事情：

1. 将标准输入写到临时文件`eslint-temp-xxx.js`
2. 调用 `eslint --fix` 来修复它
3. 将 `eslint-temp-xxx.js` 输出到标准输出。
4. 截掉文件尾的换行（`\n`）
4. 删掉临时文件

几个 Trick 需要解释（你有更好的写法欢迎评论）：

* 临时文件放在当前目录而非`/tmp`。否则 `eslint` 会根据 `/tmp/eslint-temp-xxx.js` 路径来读取配置文件。
* 临时文件不命名为隐藏文件。否则 `eslint` 会忽略它。
* 干掉文件尾的换行。这是因为 Vim 读入文件尾的换行后，会再来一个换行产生两个`\n`。

到此为止，在 `a.js` 中运行 `:Autoformat` 即可格式化整个文件；
再次写入（`:w`）即可重新触发代码风格检查。这一流程可以在 `~/.vimrc` 中设置一个快捷键：

```vim
noremap <F3> :Autoformat<CR>:w<CR>
```

[eslint]: http://eslint.cn/docs/user-guide/configuring
[syntastic]: https://github.com/vim-syntastic/syntastic
[vaf]: https://github.com/Chiel92/vim-autoformat
[eslint-cli]: http://eslint.cn/docs/user-guide/command-line-interface
