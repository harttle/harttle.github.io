---
title: 博客迁移：Shell脚本批量文件处理
tags: Bash Github HTML HTTP Linux Makefile UTF-8 awk sed 搜索引擎
---

近期我对所有文章链接（permalink）进行了重新设计，
为了使得旧链接仍可访问，需要把所有旧的URL重定向到新的URL。
因为本博客由Github Pages提供服务，HTTP服务器和域名均不可配置，只能通过旧的HTML重定向到新的HTML。
于是我需要为所有文章创建一个HTML文件用于重定向。

HTML提供了一种301重定向的方式：

```html
<meta http-equiv="refresh" content="0; url=xxx">
<link rel="canonical" href="xxx" />
```

> 第一行是指示浏览器立即重定向，到URL：xxx，`content`指定了重定向之前显示当前页面的秒数。第二行是给主流的搜索引擎看的，
> 详情请见： <https://www.mattcutts.com/blog/canonical-link-tag/>

例如文章`2015-05-02-tex-note.md`，其文件开头指定了分类信息：

```
---
layout: blog
categories: linux
...
```

这篇文章新的URL是`/2015/05/02/tex-note.html`，旧的URL是`/linux/tex-note.html`，
我需要为它生成一个文件：`/linux/tex-note.html`来匹配旧的URL，其内容为：

```html
<html>
<head lang="en">
  <meta http-equiv="refresh" content="0; url=/2015/05/02/tex-note.html">
  <link rel="canonical" href="/2015/05/02/tex-note.html" />
</head>
</html>
```

<!--more-->

这样当用户访问`/linux/tex-note.html`时，便可以重定向到`/2015/05/02/tex-note`了！

Bash提供了丰富的文件和字符串Builtin，同时借助Linux下的`sed`，`awk`等字符串处理工具，
进行批量的文件处理实在不能再方便了。
例如，本站的所有缩略图是用Makefile批量更新的，参见：[Makefile 批量更新缩略图](/2013/10/26/auto-thumb)。

现在来一个脚本继续处理上述的问题吧！

```bash
for file in ./_posts/*    
do
    # 遍历./_posts下的所有博客文章
    # 得到 file == ./_posts/2014-10-09-kiss.md
    
    fname=${file##.*/}
    # 删除最长前缀
    # 得到 fname == 2015-05-02-tex-note.md
    
    basename=${fname%%\.md}
    # 删除最长后缀
    # 得到 basename == 2015-05-02-tex-note
    
    urlname=${basename:11}
    # 从下标11开始的子字符串
    # 得到 urlname == tex-note

    layout=`sed -n '2p' $file | awk -F : '{print $2}'`
    # 读取文章第二行：layout: blog
    # layout == blog
    
    layout="$(echo -e "${layout}" | sed -e 's/\s//g')"
    # 去除layout中的空白字符

    if [ "$layout" != "blog" ]; then
        continue
        # 当layout不为blog时，跳到下一篇文章
    fi
    
    line=$(sed -n '3p' $file)
    # 读取文章第三行
    # line == categories: linux
    
    category=$(echo $line | sed 's/.*:\s*//g' | sed 's/\s//g')
    # sed匹配冒号+空白字符后面的字符串，再移除所有的空白字符（很重要！)
    # category == linux
    
    targetfile=./${category}/${urlname}.html
    # 拼接目标文件名
    # targetfile == ./linux/tex-note.html
    
    targeturl=/$(echo ${basename} | sed 's/-/\//g' | sed 's/\//-/g4').html
    # 拼接目标URL：先把所有-替换为/，再把从第四个开始的/替换为-
    # targeturl == /2015/05/02/tex-note.html

    targeturl=$(echo ${targeturl} | sed 's/\//\\\//g');
    # targeturl
    # targeturl == \/2015\/05\/02\/tex-note
    
    sed "s/xxx/$targeturl/g" migrate_permalink_tpl.html > $targetfile
    # 将模板migrate_permalink_tpl.html中的xxx替换为targeturl，并存为targetfile
done
```

附上`migrate_permalink_tpl.html`：

```html
<!DOCTYPE html>
<html>
<head lang="en">
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=xxx">
  <link rel="canonical" href="xxx" />
</head>
<body></body>
</html>
```

得到的`/linux/tex-note.html`：

```html
<!DOCTYPE html>
<html>
<head lang="en">
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/2015/05/02/tex-note">
  <link rel="canonical" href="/2015/05/02/tex-note" />
</head>
<body></body>
</html>
```
