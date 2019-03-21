---
layout: blog
redirect_from: /2013/11/05/se-project.html
title: 搜索引擎搭建：Heritrix + Lucene
tags: 搜索引擎 倒排索引 PageRank Web
---

采用 Heritix + Lucene 搭建搜索引擎原型，支持网站排名（PageRank）和倒排索引（Inverted Index），并评估其性能。

## 爬虫（Heritrix）

Heritrix 是用作 Web 归档的爬虫框架，java语言实现，具有 Apache License 自由软件许可。我们采用heritrix抓取网页数据。
可参照官方 Guide：<https://webarchive.jira.com/wiki/display/Heritrix/Heritrix+3.0+and+3.1+User+Guide>

<!--more-->

### 依赖项

可选择 open-jdk 或者 oracle jre。

```bash
# open jdk
sudo apt-get install open-jdk-7 # ubuntu
sudo pacman -S open-jdk-7       # arch linux
sudo rpm -ivh open-jdk-7        # centos
```

oracle jre 安装可参考 <http://www.liberiangeek.net/2012/04/install-oracle-java-runtime-jre-7-in-ubuntu-12-04-precise-pangolin/>

### 安装

1. 下载并解压

    在 <https://webarchive.jira.com/wiki/display/Heritrix/Heritrix> 可以得到最新的版本。下载后解压。

    ```bash
    tar -xzvf heritrix-xxx.tar.gz
    ```

3. 设置环境变量

    ```bash
    # 在 ~/.bashrc 中加入以下环境变量
    export JAVA_HOME=/path/to/your/jre
    export HERITRIX_HOME=/path/to/your/heritrix
    export JAVA_OPTS=-Xmx1024M  # 可选，指定使用的内存上限
    ```

4. 启动 UI

    参照：<https://webarchive.jira.com/wiki/display/Heritrix/A+Quick+Guide+to+Running+Your+First+Crawl+Job>

    ```bash
    cd $HERITRIX_HOME
    # -a 设置用户名和密码，-j 设置抓取到的网页的路径，例如：
    bin/heritrix -a harttle:123456 -j /home/harttle/search-engine/pages/
    ```
    
    然后在浏览器打开 <https://localhost:8843> ，登录后根据提示新建一个job。

### 配置

建立job后，可编辑 crawler-beans.cxml 文件进行设置。heritrix 支持在网页中直接编辑该文件。

> 该文件位于 -j 参数指定的路径/job-name/ 下，或者默认位置：$HERITRIX_HOME/jobs/job-name/。

* 联系信息

    设置 `metadata.operatorContactUrl` 为包含你的联系信息的页面，方便网络管理员联系你。

    > 该属性将被用于填充 HTTP 请求的 `User-Agent` 字段

* 目标服务器

    设置 `longerOverrides` 中的 `prop` 字段为要处理为web服务器域名

* 避免heritrix下载媒体文件

    `scope` 字段指定了heritrix的访问范围，为了避免访问媒体文件的 URI，可以编辑 `MatchesListRegexDecideRule` 字段，采用如下设置：

    ```bash
    <bean class="org.archive.modules.deciderules.MatchesListRegexDecideRule">
      <property name="decision" value="REJECT"/>
      <property name="listLogicalOr" value="true" />
      <property name="regexList">
       <list>
         <value>.*(?i)(\.(avi|wmv|mpe?g|mp3))$</value>
         <value>.*(?i)(\.(rar|zip|tar|gz))$</value>
         <value>.*(?i)(\.(pdf|doc|xls|odt))$</value>
         <value>.*(?i)(\.(xml))$</value>
         <value>.*(?i)(\.(txt|conf|pdf))$</value>
         <value>.*(?i)(\.(swf))$</value>
         <value>.*(?i)(\.(js|css))$</value>
         <value>.*(?i)(\.(bmp|gif|jpe?g|png|svg|tiff?))$</value>
         <value>.*(?i)(\.(docx?|xlsx?|pptx?))$</value>
       </list>
      </property>
    </bean>

    ```
* 只归档 `Content-Type` 为 `text/html` 的文件

    `warcWriter` 字段指定了写入归档的规则，为了只匹配特定 `Content-Type` 的文件，可以为该字段添加如下规则：
    
    ```bash
    <bean id="warcWriter" class="org.archive.modules.writer.WARCWriterProcessor">
       <property name="shouldProcessRule">
         <bean class="org.archive.modules.deciderules.DecideRuleSequence">
           <property name="rules">
             <list>
               <!-- Begin by REJECTing all... -->
               <bean class="org.archive.modules.deciderules.RejectDecideRule" />
               <bean class="org.archive.modules.deciderules.ContentTypeMatchesRegexDecideRule">
                 <property name="decision" value="ACCEPT" />
                 <property name="regex" value="^text/html.*" />
               </bean>
             </list>
           </property>
         </bean>
       </property>
       <!-- other properties -->
    </bean>
    ```

* 启动 heritrix

    在 Web-based UI 中，依次执行 build、launch、unpause 即可启动 heritix。


## 网站排名（Page-Rank）

### 提取链接关系

我们现在要进行 Page-Rank，需要获得网页之间的链接关系。可以通过heritrix生成的日志文件（`crawl.log`）来提取。

参见：<https://webarchive.jira.com/wiki/display/Heritrix/Logs>

```bash
cat crawl.log | awk '$7=="text/html"{print $6 " => " $4}' > links
```

现在我们得到了包含链接关系的文件 `links`。

### 进行 Page Rank

Page Rank 是 Google 搜索引擎进行网站排名的重要算法之一。[wiki](http://en.wikipedia.org/wiki/Pagerank) 给出了 Matlab 实现：

```matlab
% Parameter M adjacency matrix where M_i,j represents the link from 'j' to 'i', such that for all 'j' sum(i, M_i,j) = 1
% Parameter d damping factor
% Parameter v_quadratic_error quadratic error for v
% Return v, a vector of ranks such that v_i is the i-th rank from [0, 1]
 
function [v] = rank(M, d, v_quadratic_error)
 
N = size(M, 2); % N is equal to half the size of M
v = rand(N, 1);
v = v ./ norm(v, 2);
last_v = ones(N, 1) * inf;
M_hat = (d .* M) + (((1 - d) / N) .* ones(N, N));
 
while(norm(v - last_v, 2) > v_quadratic_error)
        last_v = v;
        v = M_hat * v;
        v = v ./ norm(v, 2);
end
 
endfunction
 
function [v] = rank2(M, d, v_quadratic_error)
 
N = size(M, 2); % N is equal to half the size of M
v = rand(N, 1);
v = v ./ norm(v, 1);   % This is now L1, not L2
last_v = ones(N, 1) * inf;
M_hat = (d .* M) + (((1 - d) / N) .* ones(N, N));
 
while(norm(v - last_v, 2) > v_quadratic_error)
        last_v = v;
        v = M_hat * v;  
        % removed the L2 norm of the iterated PR
end
 
endfunction
```

以下是调用过程代码：

```matlab
M = [0 0 0 0 1 ; 0.5 0 0 0 0 ; 0.5 0 0 0 0 ; 0 1 0.5 0 0 ; 0 0 0.5 1 0];
rank(M, 0.80, 0.001)
```

> Page Rank 的其他语言实现可以从 GitHub 获得：<https://github.com/louridas/pagerank>

## 倒排索引（Lucene）

倒排索引（Inverted index）被广泛应用在搜索引擎中，它存储着在全文搜索下某个单词在一个文档或者一组文档中的存储位置的映射。以下通过 Lucene 框架实现索引以及查询。

官方 Guide：<http://lucene.apache.org/core/4_5_1/demo/overview-summary.html>

### 获取页面文件

在使用 Lucene 进行全文索引之前，我们需要得到包含页面文件的目录。下面的 shell 脚本将完成 `.warc.gz` 到页面文件目录的转换。运行该脚本将产生 `files` 目录，其中包含所有的页面文件。

> 页面文件将以编号命名，第一行为 URL，其后为 HTML 内容。

```bash
#!/bin/bash

less *.warc.gz | sed 's/\r//g' > pages.txt

[ ! -d files ] && mkdir files

while read -r line
do
    let i++
    lines[$i]=$line
done < pages.txt

nline=$i

url=''
state='none'
ndoc=0

for (( i=1;i<=nline;i++ ))
do
    line=${lines[$i]}

    case "$line" in
        "WARC/1.0")
            state='warc'
            ;;
        "WARC-Type: response")
            state='warc-valid'
            url=${lines[$i+1]}
            url=${url#*: }
            let ndoC++
            echo $url >> files/$ndoc
            echo >> files/$ndoc
            ;;
        "HTTP/1.1 200 OK")
            [ $state = 'warc-valid' ] && state='http'
            ;;
        "")
            [ $state = 'http' ] && state='doc'
            ;;
        *)
            [ $state = 'doc' ] && echo $line >> files/$ndoc
            ;;
    esac
done

```

### 建立索引

2. 安装与配置

    ```bash
    # 下载后解压
    tar -xzvf lucene-xxx.tar.gz
    cd lucene

    # 设置环境变量，直接加入所有的 jar 包
    dir=`pwd`
    export CLASSPATH=`find -name '*.jar' | sed "s@^.@$dir@g" | sed ':a;N;s/\n/:/;ta'` 
    ```
3. 建立索引与搜索

    ```bash
    # 建立索引，files 为页面文件所在目录，会在当前目录产生 index 目录来保存索引信息
    java org.apache.lucene.demo.IndexFiles -docs files

    # 搜索，将进入交互式搜索程序
    java org.apache.lucene.demo.SearchFiles
    ```
