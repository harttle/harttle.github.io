---
layout: blog
categories: development
title: 阿里云CentOS架设XMPP服务器
tags: im linux xmpp
---

最近在为一个IOS应用，在阿里云的ECS上架设XMPP服务，使用CentOS6.5，ejabberd，ssh。

## 连接服务器

首先，当然是买一个ECS主机，我们知道云服务器是可扩展的，开始时买怎样的硬件并不重要，对于云服务器，所做的硬件扩展对服务器应用来讲是不可见的，也就避免了维护成本。购买后会得到服务器IP、root密码。

打开Unix控制台，使用ssh连接到centOS：

```bash
ssh root@[IP Addr]
```

输入密码，以root身份进入服务器。为了避免每次都输入IP，可以对本机的ssh进行配置（全局：`/etc/ssh_config`，用户：`~/.ssh/config`），加入一个远程主机：

```bash
Host bix
    Hostname [IP Addr]
    ServerAliveInterval 120
    User harttle
```

此后，通过`ssh bix`即可登录。

## ejabberd 配置

### 安装ejabberd

[ejabberd](http://www.process-one.net/en/ejabberd) 是一款使用Erlang编写的开源IM服务器，支持XMPP协议。在CentOS下可从yum源下载安装：

```bash
yum install ejabberd
```

### 添加管理员

ejabberd 支持网页管理，不过我们首先要添加管理员用户。

添加一个域名：`bix.org`：

```
%% file: /etc/ejabbered/ejabberd.cfg
{hosts, ["localhost", "bix.org"]}
```

在该域名下添加一个用户`harttle`：

```bash
ejabberdctl start   # 启动ejabberd
ejabberdctl register harttle bix.org [passwd]
```

将该用户设为管理员：

```
%% file: /etc/ejabbered/ejabberd.cfg
{acl, admin, {user, "harttle", "bix.org"}}.
```

从浏览器打开：`http://[IP]:5280/admin/`，输入刚才的用户名密码即可进入ejabberd管理页面。


### 允许所有IP注册

ejabberd的默认配置中，只允许本机进行用户注册：

```
{mod_register,...

    {ip_access, [{allow, "127.0.0.0/8"},
                 {deny, "0.0.0.0/0"}]},
        ...
```

`allow` 的默认值为 `all`（[参照文档](http://www.process-one.net/docs/ejabberd/guide_en.html#modregister)），故注释掉这两行即可允许所有IP进行用户注册。
