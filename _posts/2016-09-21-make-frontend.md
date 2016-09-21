---
title: Makefile构建前端项目
tags: Bash Linux Makefile Unix awk grep sed
---

[Make][make]是GNU下的构建自动化工具，用于从源文件构建可执行程序和程序库。
由Makefile定义构建依赖关系，运行Make时这些依赖会递归地展开。
可以说Make和Bash是Linux下生存的必备技能，当然还需要一款你热爱的编辑器。

> Make还会检查文件修改时间来判断是否需要执行某条依赖。
> 因此除了程序库外，Make也常常用于自动更新存在文件间依赖的项目。
> 比如：[批量更新网站缩略图][make-thumb]

Harttle曾使用过上百个Grunt/Gulp插件，尝试着去体会它们所承诺的那些优雅。
而今Harttle决定重新回到Make的怀抱，在[前端为什么需要构建工具？][frontend-build]
一文中详述了这一选择的全部理由。

<!--more-->

# Make能否满足前端的构建需求？

**make是通用构建工具，能满足一切构建需求。**

而且比其他任何构建工具都更高效和简洁，下文中Harttle将从实际需求出发来证实这一点。

# 合并文件

是不是有一个叫做[grunt-contrib-concat][grunt-concat]的Grunt插件？
是不是有一个叫做[gulp-concat][gulp-concat]的Gulp插件？
它们有着相当的代码和文档，每月数百万的下载量。
下面的代码足以让你怀疑这一切的必要性：

```makefile
out.js: src/*.js
    cat $^ > $@
```

> 如果你不了解上述代码的确切含义，Harttle推荐这篇文章：[Makefile 入门][makefile]

[make][make]与Unix STDIN/STDOUT有着天然的亲和，
上述代码甚至比[grunt-contrib-concat][grunt-concat]的配置还简洁。

# 拷贝文件

拷贝文件仍然不许任何插件，但支持通配：

```makefile
build/foo.js: src/foo.js
```
除了合并文件外，make还会检查文件的修改日期以避免不必要的重复构建。

# 压缩静态文件

```makefile
dist/out.min.js: out.js lib/jquery.js
    @mkdir -p $(@D)
    uglifyjs $? >> $@
```

> 这个`$(@D)`自动化变量确实费解不过挺有用，它指目标文件所在目录。
[这里][automatic-vars]有全部22个自动化变量的文档。

首先创建目标目录所在目录（即`/dist`），然后只将比目标新的依赖（`$?`）压缩，
追加到目标文件（`dist/out.min.js`）中。

最后一条命令如果是`uglifyjs $^ > $@`同样可行，只是会多处理一些文件。
从这里可以看到Make在表达更多逻辑的同时并未增加代码量。

# 批量处理

在JavaScript世界中我们通过Glob来批量选择文件，在Make中则需要借助于Bash通配符和命令。

```makefile
SOURCES = src/*.js
# 或者干脆find
# SOURCES = $(shell find ./src \
#          ! -name "*.md" \
#          ! -name "*.log")

# 生成目标列表
TARGETS = $(SOURCES:src/%=build/%)

$(TARGETS): build/%: src/%
    cp $< $@
```

`%`的用法称为[静态模式][makefile]，用来定义批量的依赖规则。
上述代码的意图是将`src/`下的源文件拷贝到`build/`下。

# 强制执行

Make默认会检查文件的新旧，这会导致有时我们运行`make`相关的命令并未执行，
例如：

```makefile
build: foo
    cp foo build/bar
```

连续两次执行`make out.js`，第二次执行时make发现当前的`build/`文件夹比`foo`要新，
于是不执行任何操作。但我们的`build`指的并非文件夹而是构建的语义，
我们可以将`build`设置为伪目标来禁止Make的文件检查，`clean`是一个更常见的伪目标：

```makefile
.PHONY build clean
build: foo
    cp foo build/bar
clean:
    rm -rf build
```

# 替换静态资源

因为在Web站点发布后需要使用与源码中不同的静态资源地址，
通常是经过合并压缩，并且CDN化的。
这意味着要找出所有HMTL中对JavaScript的引用，并将其替换为生产环境脚本
（比如叫`site.min.js`）。

如果你配置过类似[usemin][usemin]这样的工具，可能会发现这里面巨大的坑。
我们用一段Shell脚本来简单实现一下：

```makefile
VIEWS = $(shell find src/views -name "*.html")
VIEW_OBJS = $(VIEWS:src/%=build/%)

JS = $(shell cat $(VIEWS) | grep '<script ' | awk -F '"' '{print substr($$2,2)}')
JS_TAG = <script src="\/static\/site.min.js"><\/script>

static/site.min.js: $(JS)
    cat $^ > $@

$(VIEW_OBJS): build/%: src/%
    grep -vE '<script ' $< |     \
        sed 's/<\/body>/$(JS_TAG)<\/body>/' > $@
```

> 由于Make中`$`有特殊的含义，`$$2`是转义后的`$2`。

* `VIEWS`保存HTML源码列表，而`VIEW_OBJS`保存构建后的HTML源码列表。
* `JS`变量中保存着所有被引用到的脚本列表，我们需要这个列表来生成`site.min.js`。
* 生成`$(VIEW_OBJS)`的逻辑是：先移除所有的`<script>`标签，再在`<body>`尾添加`site.min.js`。

# 生成MD5

对于MD5我们需要的只是`cksum`工具，而它在1995年就进入了BSD Unix。
几乎所有的Linux和Mac都可用。下面这段脚本用来生成CSS/JS的MD5并写入`.manifest`：

```makefile
DIST := ./assets/

$(DIST)/.manifest: $(shell find $(DIST) -type f -name '*.css' -or -name '*.js')
    find $(DIST) -type f -exec cksum {} \; | sed -e "s#$(DIST)/##" | cut -f1,3 -d" " > $@
```

这段脚本来自于：<https://www.sitepoint.com/using-gnu-make-front-end-development-build-tool/>

[make-thumb]: /2013/10/26/auto-thumb.html
[make]: http://www.gnu.org/software/make/manual/make.html
[frontend-build]: /2016/09/19/frontend-build.html
[grunt-concat]: https://github.com/gruntjs/grunt-contrib-concat
[gulp-concat]: https://www.npmjs.com/package/gulp-concat
[makefile]: /2014/01/01/makefile.html
[automatic-vars]: https://www.gnu.org/software/make/manual/html_node/Automatic-Variables.html 
[usemin]: https://github.com/zont/gulp-usemin
