---
layout: blog
title: 搜索引擎搭建
category: web
tags: 爬虫 搜索引擎
---

采用 heritix+pagerank+lucene 方式搭建搜索引擎原型，并评估其性能。


# Heritrix

heritrix 是用作web归档的爬虫框架，java语言实现，具有 Apache License 自由软件许可。我们采用heritrix抓取网页数据。

可参照官方 Guide：https://webarchive.jira.com/wiki/display/Heritrix/Heritrix+3.0+and+3.1+User+Guide


## 依赖项

可选择 open-jdk 或者 oracle jre。

```bash
# open jdk
sudo apt-get install open-jdk-7 # ubuntu
sudo pacman -S open-jdk-7       # arch linux
sudo rpm -ivh open-jdk-7        # centos
```

oracle jre 安装可参考 http://www.liberiangeek.net/2012/04/install-oracle-java-runtime-jre-7-in-ubuntu-12-04-precise-pangolin/

## 安装

1. 下载并解压

    在 https://webarchive.jira.com/wiki/display/Heritrix/Heritrix 可以得到最新的版本。下载后解压。

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

    参照：https://webarchive.jira.com/wiki/display/Heritrix/A+Quick+Guide+to+Running+Your+First+Crawl+Job

    ```bash
    cd $HERITRIX_HOME
    # -a 设置用户名和密码，-j 设置抓取到的网页的路径，例如：
    bin/heritrix -a harttle:123456 -j /home/harttle/search-engine/pages/
    ```
    然后在浏览器打开 https://localhost:8843，登录后根据提示新建一个job。

## 配置

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


# Page-Rank
