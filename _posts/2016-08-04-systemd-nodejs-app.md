---
title: 使用systemd管理Node.js应用
tags: Linux MongoDB Node.js Redis systemd
---

[systemd][systemd-wiki] 是 Linux 下的一款系统和服务管理器，
该软件的初衷是提供精确的服务间依赖，以此支持并行启动来提高性能。
越来越多的Linux发行版都由sysvinit迁移到了systemd（包括Debian！）。
在这些Linux系统中，用原生的systemd来托管[Node.js][node]进程足够满足一般开发者的要求。
借由systemd可以很方便地处理依赖关系和监测日志。

# systemctl

`systemctl`是查询和控制systemd的主要命令，下面以`mongod`为例介绍常用参数：

> [MongoDB][mongodb]是[Node.js][node]下非常常见的NoSQL数据库，在ArchLinux下通过pacman安装：`pacman install mongodb`，安装成功后`mongod`即为可用的systemd服务。

```bash
# 查看服务状态
systemctl status mongod
# 启动服务
systemctl start mongod
# 停止服务
systemctl stop mongod
# 重启服务
systemctl restart mongod
# 设为自启动
systemctl enable mongod
# 取消自启动
systemctl disable mongod
```

<!--more-->

> 更多信息可查阅man page：`man systemctl`

# 单元文件

每个systemd服务均由一个[单元文件][unitfile-arch]来定义。
这些单元文件位于`/usr/lib/systemd/system/`和`/etc/systemd/system/`，
分别存放安装软件包（比如[MongoDB][mongodb]）和系统管理员的单元文件。
systemd启动时会扫描上述路径并载入相应的单元。

Systemd Unit Files Locations ([provided by redhat][redhat-doc]):

Directory |	Description
--- | ---
`/usr/lib/systemd/system/` | Systemd unit files distributed with installed RPM packages.
`/run/systemd/system/` | Systemd unit files created at run time. This directory takes precedence over the directory with installed service unit files.
`/etc/systemd/system/` | Systemd unit files created by systemctl enable as well as unit files added for extending a service. This directory takes precedence over the directory with runtime unit files.


所以在修改或添加单元文件后，需要让systemd重新加载扫描并加载这些文件：

```bash
sudo systemctl daemon-reload
```

单元文件的语法非常简单，类似于Windows的`.ini`文件。例如：

```systemd
[Unit]
Description=myapp

[Service]
WorkingDirectory=/home/harttle/myapp
ExecStart=/usr/bin/node bin/www
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp
```

将上述文件保存为`/etc/systemd/system/myapp.service`，
运行`systemctl start myapp`即可启动它。
通过`systemctl status myapp`来查看状态，通过`journalctl`来查看日志，见下文。

> 更多信息可查询man page: `man systemd.unit`

# 监测日志

systemd采用cgroups来监测进程，这意味着fork得到的子进程也不会脱离日志。
systemd单元默认的日志输出为syslog，可通过`journalctl`来查看：

```bash
# 指定systemd单元（unit）
journalctl -u myapp
```

查看实时日志：

```bash
journalctl -f
```

# 依赖关系

[Node.js][node]应用通常会依赖于其他的服务，比如[MongoDB][mongodb]、[Redis][redis]等。
这意味着myapp在开机启动时可能会因这些进程未启动而失败。
可以在单元文件中指定依赖关系，systemd便会先启动那些依赖：

```systemd
[Unit]
Description=myapp
Requires=mongodb.service redis.service
After=mongodb.service redis.service
```

# 环境与用户组

systemd支持为每个单元文件设置用户组，以及环境变量。
这在[Node.js][node]的Web应用部署和安全提供了方便。

```systemd
[Service]
Environment=DEBUG='myapp:*'
User=www
Group=http
```

设置多个环境变量可以编写多条`Environment=`语句，例如：

```bash
Environment=PORT=3000
Environment=HOST=localhost
```

用户和组在生产环境下较为有用，用特定的用户来运行
[Node.js][node]应用可以在很大程度上限制网络攻击造成的破坏。

[systemd-wiki]: https://zh.wikipedia.org/wiki/Systemd
[unitfile-arch]: http://www.freedesktop.org/software/systemd/man/systemd.unit.html
[mongodb]: https://www.mongodb.com
[redis]: https://github.com/antirez/redis
[node]: http://nodejs.org
[redhat-doc]: https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/chap-Managing_Services_with_systemd.html#tabl-Managing_Services_with_systemd-Introduction-Units-Locations
