---
layout: blog
title:  《计算机网络》笔记 - 概述
tags: ALOHA IP LAN TCP WAN 栈 接口 网络 蓝牙 路由 多路复用 操作系统 电话网络
---

顾名思义，计算机网络是指计算机连接而成的网络。但我们首先还是需要区分一下*计算机网络*和*分布式系统*：

* 分布式系统 
对于用户是一个统一的整体，只有一个模型或泛型，由操作系统之上的中间件负责实现。 
eg. 万维网(world wide web)
* 计算机网络 
大量独立的计算机互相连接起来共同完成计算任务。

<!--more-->

## 计算机网络的应用

### 商业应用
* 资源共享 
地理位置束缚、客户-服务器模型
* 通信媒介 
电子邮件、电子商务

### 家庭应用
* 即时消息、聊天室 
* 对等通信(p2p)

### 移动用户
* PDA（personal digital assistants）
* 固定无线、移动无线
* WAP 1.0（wireless application protocol）：针对小屏幕简化的Web页面。


## 网络硬件
* 广播网络：广播、多播
* 点到点：单播
* 个人区域网络-&gt;局域网-&gt;城域网-&gt;广域网-&gt;Internet

### 局域网 LAN（local area network）
* 总线型网络：以太网 IEEE 802.3
* 环形网络：IBM令牌环 IEEE 802.5

### 城域网 MAN（metropolitan area network）
* 有线电视 
* 集中控制：头端

### 广域网 WAN（wide area network）
* 主机、交换单元、通信子网、传输线、路由器 
* 存储转发（分组交换）、路由算法

### 无线网络
* 系统互联：计算机外部设备 eg. 蓝牙
* 无线 LAN：IEEE 802.11
* 无线 WAN：蜂窝电话、IEEE 802.16

### 互联网
通过网关互相连接起来的网络

<!--more-->

## 网络软件

### 协议层次

* 协议：通信双方关于如何进行通信的约定
* 对等体：不同机器上包含对应层的实体
* 接口：定义了下层向上层提供哪些原语操作和服务
* 网络体系结构：层和协议的集合
* 协议栈：一个特定的系统所使用的一组协议

### 各层的设计问题

* 编址机制
* 错误控制
* 流控制：传送速率
* 多路复用、多路解复用：为多个上层会话使用同一个连接

### 其他

* 面向连接与无连接的服务
* 服务：某一层向它的上一层提供的一组原语
* 协议：一组规则，规定同一层对等实体间交换的信息的格式和含义

## 参考模型

![MODEL][1]

## 网络实例

### Internet

* ARPANET：advanced research project agency，比电话网络更好的命令和控制系统。
* NSFNET：national science foundation，使用ARPANET的硬件；首次使用TCP/IP协议。
* Internet：客户-&lt;POP（point of presence，汇接点）-&lt;区域ISP（internet service provider，服务提供商）-&lt;骨干网-&lt;NAP（network access point）-&lt;服务器

### 面向连接的网络：X.25、帧中继、ATM

* X.25：第一个公共的数据网络
* 帧中继：无错误控制、无流控制
* ATM（asynchronous transfer mode，异步传输模式）虚电路：155Mbps、622Mbps
* ATM 参考模型

![atm][2]

### 以太网

* ALOHANET：短距离无线电波（夏威夷，分上行和下行，通过冲突检测）
* Ethernet：DIX标准（多支路电缆，通过监听电缆确定发送）、令牌（获得令牌的计算机可以发送）、IBM令牌环

### 无线 LAN：802.11
* 有基站模式：访问点（access point）
* 无基站模式：ad hoc 网络
* 困难：冲突检测、多径衰减、移动性

## 网络标准化

* 事实（de facto）、法定（de jure）
* 电信领域：公共承运商、邮电部（PTT）、国际电信联盟（ITU或CCITT）
* 国际标准领域：ISO，成员包括ANSI（美国）、BSI（英国）、AFNOR（法国）、DIN（德国）；电气和电子工程师协会（IEEE）
* Internet 标准领域：IAB（internet activities board）包括IRTF（internet research task force）和IETF（internet engineering task force），通过RFC（request for comments 标准提案-&lt;标准草案）完成标准。

[1]: /assets/img/blog/computer-network/osivstcpip.png
[2]: /assets/img/blog/computer-network/atm-model.jpg

