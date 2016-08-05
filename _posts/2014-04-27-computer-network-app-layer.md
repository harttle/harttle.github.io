---
title:  《计算机网络》笔记 - 应用层
tags: ADSL DNS HTML HTTP IP Java LAN PHP POP3 RAID SMTP TCP UDP XML 磁盘 网络 表单 路由 操作系统 电路交换 过程调用 IMAP
---

## DNS-域名系统

* DNS（Domain name system）：RFC 1034、1035，调用解析器（resolver）将名字映射成IP地址

### DNS名字空间

* DNS名字空间：internet被分为200多个顶级域，每个域被分为若干子域，子域又被进一步划分，以此类推。
* 顶级域有两种：通用域和国家域
+ 通用域包括com（商业的）、edu（教育性机构）、int（国际性组织）、mil（美国军队）、net（网络供应商）、org（非营利性组织）、biz（商贸）、info（信息）、name（人们的名字）、pro（职业）、aero（航空业）、coop（合作社）、museum（博物馆）
+ 国家域定义在ISO 3166中。

### 资源记录

* 每个域都有一组与它相关联的资源记录；当解析器把域名传递给DNS时，DNS所返回的是与该域名相关联的资源记录。
* 每条资源记录是一个5元组：Domain_name（域名）、Time_to_live（生存期）、class（类别）、type（类型）、value（值）

### 名字服务器

* 权威记录：来自于管理该记录的权威机构，因此总是正确的
* 递归查询：当解析器接收到一个域名查询时，它将该查询传递给本地的一个名字服务器，如果被查询域名落在该名字服务器的管辖范围内，那么返回权威的资源记录；如果本地没有关于它的信息，那么本地名字服务器向顶级名字服务器发送一条查询此域的消息。
* LDAP（lightweight directory access protocol，轻量级目录访问协议）：RFC 2251，定位到一般的对象，如人员、资源、服务等。

<!--more-->

## 电子邮件

### 结构与服务

* 用户代理：阅读和发送电子邮件
* 消息传输代理：将消息从源端传送到目标端
* 电子邮件基本功能 
+ 撰写
+ 传输
+ 报告
+ 显示
+ 处理

### 消息格式

* RFC 822：基本ASCII电子邮件
* 头域：To、Cc、Bcc、From、Sender、Received、Return-Path、Data、Reply-To、Message-Id、In-Reply-To、References、Keywords、Subject
* MIME-多用途Internet邮件扩展
+ 头域：MIME-Version、Content-Description、Content-Id、Content-Transfer-Encoding、Content-Type
+ 二进制消息编码（base64编码，又称ASCII盔甲）：0-63分别为A-Z、a-z、0-9、+、/；==与=分别代表一个组只含8位或者16位；对少量非ASCII字符的消息编码效率较低
+ 可打印的引用编码（quoted-printable encoding）：7位的ASCII编码，所有超过127的字符被编码为等号+2个用16进制数字表示的字符值。

### 消息传输

* SMTP（simple mail transfer protocol，简单邮件传输协议） 
+ 在25号端口建立TCP连接
+ 命令：HELLO、MAIL FROM、RCPT TO、DATA等
+ ISP服务器上运行消息传输代理，接收邮件
* POP3（post office protocol version 3，邮局协议第三版）
+ 在110端口建立TCP连接
+ RFC 1939，用户从ISP的消息传输代理获得电子邮件
+ 假设用户每次交互后清除邮箱后脱机工作
* IMAP（internet message access protocol，Internet 消息访问协议）
+ 在143端口建立TCP连接
+ 假设用户的邮件会永久地保存在服务器上
* 投递特性：过滤器、假期守护程序（自动回复）
* webmail

## 万维网

### 结构概述

* URL（unform resource locator，统一资源定位符）：命名web页面
+ 组成：协议（也称方案，scheme）+页面所在机器的DNS名字，唯一指定特定页面的本地名字
+ 协议类型：http（hypertext transfer protocol，超文本传输协议）、ftp、file、news（NNTP，network news transfer protocol，网络新闻传输协议）、gopher、mailto、telnet
+ URN（universal resource name，通用资源名）：RFC 2141，不指定页面所在位置就能够引用页面，可减轻服务器负载
* 客户端
+ 浏览器运行步骤
* 确定URL
* 查询DNS以确定IP
* 与IP的80端口建立TCP连接
* 发送请求以获取URL指向的文件
* 服务器发送文件，释放TCP连接
* 浏览器显示文件中的文本，取回并显示图片
* 浏览器扩展
+ 插件：代码模块，浏览器从磁盘取出，安装称自己的一个扩展模块，运行在浏览器内部，完成工作后从浏览器内存中移除掉
+ 辅助应用程序：完整的应用程序，作为独立的进程来运行，接受临时文件的名字来打开文件
* 服务器端
+ 服务器运行步骤 
* 接收来自客户（浏览器）的TCP连接
* 获取所需文件名
* 从磁盘获取文件
* 将文件返回给客户
* 释放TCP连接
+ 服务器场（server farm）
* 组织：前端连接到一个LAN中，LAN中有一个路由器和若干处理节点（独立的计算机）
* TCP移交（TCP handoff）：避免所有请求与回复都通过前端
* 无状态特性与cookie
+ RFC 2109：当用户请求web页面时，可以提供附加信息cookie（最大4k）
+ cookie域：域名、路径、内容、过期时间、安全
+ 非持久的cookie：没有包含过期时间域，浏览器退出时丢弃
+ 持久的cookie：包含过期时间域

### 静态web文档

* HTML（hypertext markup language，超文本标记语言）
* 表单
* XML（extensible markup language，可扩展标记语言）
* XSL（extensible style language，可扩展样式语言）
* SOAP（simple object access protocol，简单对象访问协议）：应用之间执行RPC（远过程调用）的方法，以XML构造请求，以HTTP发送
* XHTML（extended hypertext markup language，扩展的超文本标记语言）：用于小型移动设备，语法更挑剔

### 动态web文档

* 服务器端动态web页面生成（动态html）：CGI（common gateway interface，公共网关接口）、PHP（hypertext preprocessor，超文本预处理器）、JSP（javaserver pages，java服务器页面）、ASP（active server page，活动的服务器页面，ms版的php和jsp）

* 客户端动态网页生成：JavaScript、applet（jvm上运行的java小程序）、activeX控件（ms）

### HTTP-超文本传输协议

* 连接：HTTP1.0服务器回应后关闭TCP连接；HTTP1.1支持持续连接
* 方法：GET、PUT、HEAD、POST、DELETE、TRACE、CONNECT、OPTIONS
* 消息头：请求头、回应头

### 性能增强

* 缓存、代理（维护缓存）
* 服务器复制：镜像、瞬间拥挤
* 内容分发网络：CDN（content delivery network），图像、音频等大文件存储在CDN上

### 无线web

* WAP（wireless application protocol，无线应用协议）使用新的HTML标准，9600bps，协议层
+ 无线应用环境（WAE)
+ 无线会话协议（WSP）
+ 无线传输协议（WTP）：代替TCP，效率原因
+ 无线传输层安全（WTLS）
+ 无线数据包协议（WDP）：类似UDP
+ 承载层（GSM、CDMA、D-AMPS、GPRS等）
* I-Mode（information-mode，信息模式）
+ 对语音信号使用电路交换网络，对数据信号使用分组交换网络
+ 数字网络基于CDMA，手持机使用LTP（lightweight transport protocol，轻量级传输协议）并通过空中链路与协议转换网管通话
+ 软件结构
* 用户交互模块
* 插件+cHTML（compact HTML，紧凑的HTML）解释器+Java
* 简单的窗口管理器
* 网络通信
* 实时操作系统
* 第二代无线web
+ 新特新
* 推模型和拉模型
* 运行将电话集成到应用中
* 多媒体信息
* 264个象形文字
* 存储设备接口
* 浏览器插件
+ wap2.0支持两种协议栈
* XHTML
* WSP HTTP
* WTP TLS
* WTLS TCP
* WDP IP
* 承载层 承载层

## 多媒体

### 音频压缩

* MP3（mpeg audio layer 3，MPEG音频层3）
* 波形编码：使用较少的傅里叶分量重现波形
* 感知编码：利用心理声学的频率屏蔽和暂时屏蔽去掉某些分量

### 流式音频
* 元文件：将整个音频分为很多元文件，减少缓冲时间
* RTSP（real time streaming protocol，实时流协议）：管理用户界面、处理传输错误、解压缩音乐、消除抖动
* 拉式服务器、推式服务器、低水印标记和高水印标记

### IP 语音

* H.323：ITU在1996年发布，终端、网守、区域。、H.245（新的压缩算法）、H.225（与网守通信）
* SIP（session initiation protocol，会话发起协议）

### 视频简介

* 一帧：一次扫描
* 隔行扫描与逐行扫描
* 彩色电视系统：SECAM（SEquentiel couleur avec memire，顺序与存储彩色电视系统）、PAL（phase alternating line，逐行倒相制式）、NTSC（national television standards committee，国家电视标准委员会）；亮度、色度
* HDTV（high definition television，高清晰度电视）
* 数字系统

### 视频压缩

* JPEG（joint photographic experts group，联合图像专家族）标准
+ 块准备：四像素取平均值（亮度比色度更敏感）
+ 对每一块作DCT（discrete cosine transformation，离散余弦变换）
+ 量化：将上一步的每个格点乘以对应的权值
+ 减小每一块的(0,0)元素值（DC分量），其他元素称为AC分量
+ 行程编码：同样的值用计数值表示
* MPEG（motion picture experts group，运动图像专家组）标准，MPEG-1与JPEG的区别在于运动补偿，包括四种帧
+ I（帧内编码，intracoded）：JPEG编码的静止图片
+ P（预测，predictive）：与前一帧之间的逐块差值
+ B（双向，bidirectional）：与前一帧和后一帧之间的差值
+ D（DC编码，DC-coded）：用于快进的快平均值

### 视频点播

* 准视频点播：在多个频道以某种时差播放同样的视频
* 线路：视频服务器->光纤->ATM或SONET骨干网络->光纤->交换机->区域分布式网络->消费者房子->机顶盒
* 视频服务器
+ Zipf定律：最受欢迎的那部电影，它的受欢迎程度是第七受欢迎电影的7倍
+ 分层存储：RAM->磁盘->DVD->磁带
+ 磁盘存储
* 磁盘场（disk farm）：每个驱动器存储一定数量的电影，有重复
* 磁盘阵列（disk array）或RAID（redundant array of inexpensive disks，廉价磁盘冗余阵列）：每部电影分布在多个驱动器上（条状化，striping）
* 分发网络：数据源与目标之间交换机和线路的集合
+ ADSL
+ FTTC（fiber to the curb，光纤到路边）
+ FTTH（fiber to the home，光纤到户）
+ HFC（hybrid fiber coax，混合光纤同轴电缆）

### Mbone（multicast backbone，多播骨干网）

* Mbone是internet之上的一个虚拟层叠网络
* 由隧道连接的多个多播岛组成，每个岛有至少一个mrouter（multicast router，多播路由器）
* 使用基于Bellman-Ford距离矢量算法的路由算法DVMRP（distance vector multicast routing protocol，距离矢量多播路由协议）
* PIM（protocol independent multicast，协议无关多播）：AS间的路由，IETF工作组开发


