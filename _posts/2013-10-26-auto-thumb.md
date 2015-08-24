---
layout: blog
categories: web
title: Makefile 批量更新缩略图
subtitle: 站点后台工具
tags: Makefile Bash
excerpt: 采用 ImageMagick + Makefile 的方式，批量地更新用于web的缩略图。
redirect_from:
  - /web/auto-thumb.html
  - /2013/10/26/auto-thumb/
---

# 背景

网站中通常会产生大量的多媒体文件，尤其是图片。维护和更新这些文件却是很繁琐的事情。本文介绍如何批量地更新用于web的缩略图：采用 ImageMagick + Makefile 的方式，既能及时地更新缩略图，又避免了不必要的文件操作。

* ImageMagick：是一款命令行图片处理工具，其功能复杂强大，毫不逊色于Ps。在Linux服务器中，通常采用 ImageMagick 来进行web后台的图片操作。
* Makefile：在 Unix 系统中，通常用 make 来自动化建构软件。make 根据依赖文件的修改时间进行判断是否执行更新，避免了不必要的更新操作。

<!--more-->

# 实例

假设我们的目录有两级结构，所有图片文件都在第二级目录下，例如：

```
imgs
├── 2012
│   ├── a.jpg
│   └── b.png
└── 2013
    └── c.JPG
``` 

我们希望该目录下的图片文件发生改动或者添加时，自动地重新生成其缩略图，并且忽略不需要更新的文件。下面利用 ImageMagick 进行缩略图的生成，同时借助于 Makefile 的依赖关系检查，完成缩略图的更新。

## 更新当前目录图片的缩略图

1. 在文件夹 `2012` 下建立 makefile 文件：

    ```makefile
    # get img files
    items := $(shell ls *.* | grep -E '*.[j][pP][gG]|*.[J][pP][gG]')
    thumbs := $(addprefix thumb/,$(items))
    
    all: $(thumbs) list
    
    # generate thumbs
    $(thumbs): thumb/%: %
            [ ! -d 'thumb' ] && mkdir thumb;\
            convert -resize 240x160 $< $@
    
    .PHONY: list clean
    
    # generate thumb list
    list: 
            echo 'imgs:' > list.yml;\
            for item in $(items);do\
                    echo -e '\t- '$$item >> list.yml;\
            done;\

    # clean redundant thumbs
    clean:
            ls thumb | grep -E '*.*' | grep -x -v "`ls *.*`" | xargs -l -i rm thumb/{};
            
    # clean all thumbs
    clean-all:
            -rm -rf file thumb list.yml
    ```

2. 执行 `make` 即可在当前目录创建 `thumb` 子目录，并保存生成的缩略图。为了便于批量导入，同时产生了图片列表 `list.yml`（YAML格式）。
    执行 `make clean` 即可清空多余的缩略图，执行 `make clean-all` 即可清空所有缩略图以及图片列表。

3. 生成的效果如下：

    ```
    2012
    ├── makefile
    ├── a.jpg
    ├── b.png
    └── thumb
        ├── a.jpg
        └── b.png
    ``` 

## 递归更新目录

1. 我们将上述 makefile 在每个子目录软链接（`ln -s`）一份。然后在 `imgs` 下建立**总控 Makefile**，来执行其所有子目录的make：

    ```makefile
    # dirs to exclude
    exclude_dirs := include bin
    
    # find subfolders
    dirs := $(shell find . -maxdepth 1 -type d)
    dirs := $(basename $(patsubst ./%,%,$(dirs)))
    dirs := $(filter-out $(exclude_dirs),$(dirs))
    
    .PHONY: all clean
    
    all: $(dirs)
            for dir in $(dirs);do\
                    if [ -f $$dir/Makefile ];then $(MAKE) -C $$dir;fi;\
            done
    
    clean: 
            for dir in $(dirs);do\
                    if [ -f $$dir/Makefile ];then $(MAKE) clean -C $$dir;fi;\
            done
            
    clean-all: 
	for dir in $(dirs);do\
		$(MAKE) clean-all -C $$dir;\
	done
    ```

2. 在 `imgs` 执行 `make`，即可以更新所有子目录的缩略图；执行 `make clean`，即可清空所有缩略图，以及图片列表。

3. 生成的效果如下：

    ```
    imgs
    ├── makefile
    ├── 2012
    │   ├── makefile
    │   ├── a.jpg
    │   ├── b.png
    │   └── thumb
    │       ├── a.jpg
    │       └── b.png
    └── 2013
        ├── makefile
        ├── c.JPG
        └── thumb
            └── c.JPG
    ``` 
