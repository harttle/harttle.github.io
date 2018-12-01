---
title:  部署自己的博客：Github+Jekyll
tags: Github LaTeX Markdown Jekyll
---

最近终于完成了个人博客的开发和部署，就把整个过程记录在这里。利用 GitHub 提供的文件服务部署，采用 github + jekyll 方式构建静态博客站点。目前支持功能如下：

* 代码片段高亮。由 [rouge](https://github.com/jneen/rouge) 提供，配置在 [_conf](https://github.com/harttle/harttle.github.io/blob/master/_config.yml) 文件中。从 [这篇文章](https://harttle.land/2018/09/29/es6-iterators.html) 可以看到显示效果。
* LaTex 公式渲染。由 [MathJax](http://www.mathjax.org/) 把 LaTex 渲染为 SVG，HTML 或 MathML。从 [这篇文章](https://harttle.land/2018/06/29/javascript-numbers.html) 可以看到显示效果。
* 静态服务。这是一个静态博客，由 [Github Pages](https://pages.github.com/) 提供服务。
* Google 统计。配置在 [_conf](https://github.com/harttle/harttle.github.io/blob/master/_config.yml) 文件中。

下文介绍具体的搭建步骤：

<!--more-->

## 准备工作

1. 注册 GitHub 账号：<https://github.com/join>
2. 下载 Github Desktop 或者 Git 命令行工具。
3. 安装 Ruby。 Ubuntu 中可以 `sudo apt-get install ruby`，ArchLinux 中可以 `yaourt -S ruby`。
3. 安装 Jekyll。这是一个 Ruby 库，使用 gem 安装：`gem install jekyll`。

## 创建 GitHub 仓库

1. 运行 `ssh-keygen -t rsa` 得到 SSH 公钥文件：id_rsa.pub
1. 登录 GitHub，添加你的 SSH key（account settings -> SSH Keys -> Add SSH Key）
3. 在 GitHub，创建名为 username.github.io 的仓库（其中 username 为你的用户名），并拷贝其 Git URL（下文会用到）。

## 生成网站目录

使用 `jekyll` 命令可以生成站点的目录结构：

```bash
jekyll new harttle.github.io
cd harttle.github.io    # 进入生成的目录
```

Jekyll 生成的目录结构如下：

```
.
├── _config.yml		//站点的配置文件
├── _drafts		//博客草稿
|   ├── begin-with-the-crazy-ideas.textile
|   └── on-simplicity-in-technology.markdown
├── _includes		//供引入的html模块
|   ├── footer.html
|   └── header.html
├── _layouts		//视图模板
|   ├── default.html
|   └── post.html
├── _posts		//博客文章
|   ├── 2007-10-29-why-every-programmer-should-play-nethack.textile
|   └── 2009-04-26-barcamp-boston-4-roundup.textile
├── _site		//jekyll 编译生成的站点
└── index.html
```

## 本地预览

1. 启动 Jekyll 本地服务，Jekyll 会自动进行编译：

	```bash
	jekyll serve
	```
3. 打开浏览器，访问 <http://localhost:4000>，你机会看到 Jekyll 默认生成的网站。


## 发布到 GitHub

1. 在你的项目目录中添加一个远程仓库，地址是上述拷贝的 Git URL（类似：git@github.com:harttle/harttle.github.io.git）：
    
    ```bash
    git remote add origin <Git URL>
    ```
2. 提交并 Push 到 GitHub

	```bash
	# 把 _site 目录添加到 .gitignore，这些内容会自动生成不需提交
	echo '_site' >> .gitignore
	# 提交改动至HEAD版本
	git commit -a
	# 同步HEAD至服务器
	git push -u origin master
	```
3. GitHub 将会在10分钟内编译你的文件生成静态站点，访问 用户名.github.io（例如 <http://harttle.github.io>）即可查看博客。

现在你可以去改那些模板代码，或者写新的文章了。本文下面的部分会介绍一些功能的实现方式。

## 使用 Jekyll 变量

* 在 `_config.yml` 中定义的变量，在模板中可以通过 `site.xxx` 来访问。
* 页面的 [Front Matter](https://jekyllrb.com/docs/front-matter/) 中定义的变量，或者文章页的变量，可通过 `page.xxx` 访问。
* 在 `_layout` 模板中，`content` 变量为子模板的内容。

更多变量的使用方式，请参考：<https://jekyllrb.com/docs/variables/>

## 使用 Jekyll 插件

GitHub 出于安全性的考虑，Jekyll 引擎默认采用 `--safe` 参数，这会禁用[白名单](https://pages.github.com/versions/)之外的 Jekyll 的插件。
如果希望使用自定义的 Jekyll 插件，只能关闭 GitHub 的 Jekyll 引擎，在本地编译好之后再 Push 到 Github。
可以在单独的分支维护源码，把编译好的 `_site` 目录推送到 Github。

## 支持 LaTex

文档同样完美：<http://docs.mathjax.org/en/latest/>
如下的使用将会直接将当前页面的`\(`与`\)`中内容转换为行内公式（inline），将`\[`与`\]`中内容转换为独立的公式行（block）。当然，这都是可以配置的。

```html
<!-- 直接引入MathJax，使用Tex-MML-AM_HTLMorMML配置文件 -->
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML"></script>
```

## 相关链接

* Jekyll 框架：<http://jekyllrb.com/docs/home/>
* Liquid 模板语言：<http://docs.shopify.com/themes/liquid-basics>
* Markdown 语法：<http://daringfireball.net/projects/markdown/>
* `_config.yml` 语法：<http://www.yaml.org/spec/1.2/spec.html>

