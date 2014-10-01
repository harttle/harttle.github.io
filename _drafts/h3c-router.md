---
layout: blog
categories: development
title: secureCRT 连接 H3C 路由器
tags: network
---

H3C ER5100 路由器只有Console口可以用来管理，机身无按键。Console口需要专用转接线：一端为以太网口，一端为COM口（需要支持COM口的电脑）。需要该转接线的路由器都会自带。


## 连接到路由器

1. 接线。将console口连接到服务器com口；
1. 远程连接到该服务器（当然也可以在机房服务器上操作）；
1. 下载并安装 secureCRT，我这里是7.0.0；
1. 设置 secureCRT：
    1. 新建快速连接：
        * 协议：serial；
        * 端口：com1（这个以实际为准，我是试的）；
        * 波特率：9600；
        * 数据位：8
        * 奇偶校验：无
        * 停止位：1
        * 流控：无
    2. 设置连接的终端仿真。设为自动，或选择xterm终端。

## 配置
