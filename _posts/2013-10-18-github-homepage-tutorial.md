---
layout: blog
categories: web
title:  "像 Geek 一样写博客"
subtitle: "GitHub 博客部署教程"
tags: markdown github ruby
redirect_from:
  - /web/github-homepage-tutorial.html
  - /2013/10/18/github-homepage-tutorial/
---

最近终于完成了个人博客的开发和部署，就把整个过程记录在这里。利用 GitHub 提供的文件服务部署，采用 github+GFM+jekyll 方式构建静态博客站点。

之后还可以采用highlight.js进行代码高亮，MathJax提供LaTex公式支持。完成部署后，可以在在线撰写博客，也可以本地离线撰写，然后同步到GitHub。

## 一些背景

* **Git** 是一个分布式版本控制/软件配置管理软件，最初用户linux内核开发，至今已广泛用于项目源码管理。
* **[GitHub](http://github.com/)** 是一个用于使用Git版本控制系统项目的共享虚拟主机服务，提供了无限的存储空间以及网络流量。
* **markdown** 是一种轻量级标记语言，可用少量的编辑工作生成美观的 HTML 文件。已经成为 GitHub 托管的项目中默认的文档格式，当然 GitHub 也扩展了该语言（GFM）并提供渲染支持。
* **[Jekyll](http://jekyllrb.com/)** 是基于 Ruby 的 package，用于编译生成静态站点。GitHub 提供了静态站点支持，并采用 Jekyll 作为其编译引擎。于是，在 GitHub 提交文件后，在10分钟内 GitHub 将编译生成静态站点并开始提供服务。
* **[highlight.js](http://highlightjs.org)** 是用于web页面的代码高亮，在程序员的博客中想必是不可或缺的。这个开源项目在托管在github的，开发很活跃，因此我放弃了使用Google的prettify，并且加入到highlight.js的开发项目中，为我的vimrc加入了高亮规则。
* **[MathJax](http://www.mathjax.org/)** 用于将latex公式转换为html、矢量图的js框架。不必说，理工背景的一定会用得到。能转换为html实在是太NB了！与图片不同，可以实现与上下文的完美拼接。

<!--more-->

## 环境配置


### 准备工作

1. GitHub 账号
2. Linux 操作系统（在windows也可完成，但为了方便强烈推荐采用Linux系统）：Ubuntu、OpenSuse、CentOS、Arch...均可。

### 应用程序安装

1. Ruby
	* 如果已经安装过ruby，请确认版本为 1.9.3 或 2.0.0（通过运行 `ruby --version` 得到ruby版本）
	* 否则，安装Ruby

		```bash
		#ubuntu
		sudo apt-get install ruby
		#centos
		yum install ruby
		#arch
		yaourt -S ruby  
		```
2. Jekyll
	安装 Jekyll
		
	```bash
	gem install jekyll
	```


## 建立站点

### 创建 GitHub 仓库

1. 运行 `ssh-keygen -t rsa` 得到 SSH 公钥文件：id_rsa.pub
1. 登录 GitHub，添加你的 SSH key（account settings -> SSH Keys -> Add SSH Key）
3. 在 GitHub，创建名为 username.github.io 的仓库（其中username为你的用户名），并拷贝其URL（类似：git@github.com:harttle/harttle.github.io.git）
4. 在linux下运行 `git clone URL_YOU_COPIED`，得到文件夹 username.github.io
5. 运行 `git remote set-url origin URL_YOU_COPIED`，让git使用密钥验证，省去了每次push时输入密码。

### 生成站点文件

1. 生成站点文件

	```bash
	# 建立站点
	jekyll new my-site
	# 拷贝至 GitHub 仓库
	cp -r my-site/. username.github.io
	rm -r my-site
	# 添加编译生成的文件至 gitignore
	echo '_site' >> .gitignore
	```
2. 编译站点，并运行本地服务

	```bash
	# 编译生成静态站点，-w 选项可以监测文件变化并自动重新生成
	jekyll build -w
	# 运行服务
	jekyll serve
	```
3. 打开浏览器，访问 localhost:4000，将看到 jekyll 生成的默认站点。

### 自定义开发

* 文档
	* 了解 jekyll 静态站点框架：http://jekyllrb.com/docs/home/
	* 视图模板使用 Liquid 模板语言：http://docs.shopify.com/themes/liquid-basics
	* 博文采用 Markdown 语言：http://daringfireball.net/projects/markdown/

* jekyll 站点文件结构
	
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
* 站点配置文件：_config.yml
    该文件采用 **[YAML](http://www.yaml.org/spec/1.2/spec.html)** 标记语言组织内容，在该文件修改站点保留变量，或者添加自定义变量。这里定义的变量在模板中可通过 `site.VARIABLE_NAME` 访问（记住重启jekyll服务）。
    
    ```yaml
    # GitHUb Pages 默认的 Markdown 引擎（即 GFM）    
    markdown: redcarpet
    # Latex 支持
    markdown: maruku
    ```

### 同步至 GitHub

1. 运行 git 提交至GitHub

	```bash
	# 提交改动至HEAD版本
	git commit -a
	# 同步HEAD至服务器
	git push
	```
2. GitHub将会在10分钟内编译你的文件生成静态站点，访问 username.github.io 即可查看博客。


## Tips

### Jekyll的使用

* 变量定义与访问
    * 在 `_config.yml` 中定义的变量，可通过 `site.VAL` 访问；
    * 在子模板（通过 `layout` 继承的页面）中定义的变量，可通过 `page.VAL` 访问；
    * `content` 为子模板的内容
    * `page.content` 为经过markdown转换的末级子模板的内容

* Jekyll 插件在 GitHub Pages 中不能使用，因为 GitHub Pages 的编译使用 `--safe` 参数；但可以在本地编译后同步至 GitHub 来取代 GitHub 的自动编译。
* `{% raw  %} {% include %} {% endraw %}` 标签参数只能为常量，被包含文件中的 liquid 语句以文件为单元解析。

### Jekyll plugin

GitHub 出于安全性的考虑，jekyll 引擎默认采用 `--safe` 参数，这会禁用 Jekyll 的插件。如果希望开启 Jekyll 插件来获得更多的支持，只能关闭 GitHub 的 Jekyll 引擎。

我们选择在 username.github.io repo 中新建一个叫 `dev` 的 branch 来做开发，把生成的静态站点 `_site` push 到 master 分支。当然，我们需要把master上的jekyll文件复制过来。

1. 新建 branch

    ```bash
    # 建立dev目录
    mkdir dev   
    cd dev

    # 建立git仓库，并连接到github
    git init    
    git remote add origin git@github.com:harttle/harttle.github.io.git 

    # 新建分支
    git checkout -b dev 
    git push --set-upstream origin dev

    # 现在可以开始工作了
    git push
    git pull
    ```

2. 迁移 Jekyll 站点

    ```bash
    # 拷贝文件
    cp -r harttle.github.io/. dev/

    # 编译站点
    cd dev/
    jekyll build -d ../harttle.github.io/

    # 运行站点
    jekyll serve -d ../harttle.github.io/
    ```
    
### 代码高亮

这里有完美的文档：http://highlightjs.org/
如果希望在后台实现转换，可以这样使用：

```html
<!-- 首先，引入它的样式 -->
<link rel="stylesheet" href="/assets/css/highlight/tomorrow-night-eighties.css">

<!-- 然后，对于每一个要高亮的代码块，调用如下函数 -->
<script>
function(code, lang){
      if(lang)
        return '<code class="hljs">'+hljs.highlight(lang,code).value+'</code>';
      else
        return '<code class="hljs">'+hljs.highlightAuto(code).value+'</code>';
</script>
```

### Tex支持

文档同样完美：http://docs.mathjax.org/en/latest/
如下的使用将会直接将当前页面的`\(`与`\)`中内容转换为行内公式（inline），将`\[`与`\]`中内容转换为独立的公式行（block）。当然，这都是可以配置的。

```html
<!-- 直接引入MathJax，使用Tex-MML-AM_HTLMorMML配置文件 -->
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML"></script>
```

## 开发时间线

### 2013-10-12

* 站点框架
* github 部署

### 2013-10-16

* 社会化评论

### 2013-10-17

* 相册模块
    * 延迟载入
    * gallery浏览

### 2013-10-25

* 自动导航(affix)
* 相册载入速度优化

    加入缩略图机制（make+imageMagick）

### 2013-10-28

* 404页面

### 2013-10-29

* latex显示

    采用mathJax
* CDN

### 2013-10-30

* 解决 affix-bottom 失效

    > 问题出自 sticky footer 中的 `body{height:100%}`，解决：
    > Replace `document.body.offsetHeight` with `document.body.scrollHeight` in bootstrap.min.js

### 2013-10-31

* 载入优化

    script 后置

### 2013-11-1

* 社会化链接

    添加 linkedIn facebook google+ follow
* SEO优化

    添加 meta、添加sitemap.xml和robots.txt、导入搜索引擎、创建RSS 

### 2013-11-06

* google analysis

