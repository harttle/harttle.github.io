---
title: 安装 AUR 软件包
tags: ArchLinux AUR 编译
---

AUR（ArchLinux User Repository）是 ArchLinux 的社区驱动的软件仓库，
属于不受支持的软件仓库（unsupported）。
但它却是 Arch 社区最有活力的仓库，很多官方仓库（Official Repositories）中的包都来自于 AUR。
AUR 之于 ArchLinux 官方仓库，类似于 Boost 社区之于 STL，类似于 PPA 之于 Ubuntu 官方仓库。
比如 [在 MacBookPro 上安装 ArchLinux](/2019/04/26/macbook-archlinux-install.html) 时就用到了非常多的 AUR 包。

由于 AUR 中的包不受支持，ArchLinux 的官方包管理工具 pacman 不支持从 AUR 安装。
这就需要额外的工具，几年前 yaourt 独大，在很多 ArchLinux 安装教程中都会介绍如何安装 yaourt。
时至今日 yaourt 已经停止开发（discontinued），官方更愿意推荐 AUR **工具**而非**安装器**。
因为这些包属于 unsupported，你要为安装和维护它们负责，ArchLinux 认为你应当知道一个包是怎样编译和安装进入你的系统的。

本文先介绍 ArchLinux 提供的软件包构建/安装方式，以及如何手动从 PKGBUILD 构建/安装一个软件包。
最后再介绍一些 AUR 工具。

<!--more-->

## PKGBUILD

ArchLinux 中 [PKGBUILD][pkgbuild] 文件完整地描述了一个包。
它是一个 Shell 脚本，描述了包的名字、版本、作者、如何编译、如何安装，以及冲突和依赖关系。
只要你拿到了一个 PKGBUILD 文件，你就可以编译和安装一个包。

比如官方仓库的每个软件包都是以 PKGBUILD 的形式存在于官方仓库中。
可以用以下命令来下载 core、extra、testing 的官方仓库：

```bash
svn checkout --depth=empty svn://svn.archlinux.org/packages
```

本文以我的调整 MacBook 背光的包 [macbook-lighter][macbook-lighter] 为例，
可以从 AUR 仓库下载：

```bash
git clone https://aur.archlinux.org/macbook-lighter.git
```

得到的仓库中只包含一个 PKGBUID 文件，这个文件用于后面的编译安装过程。

## makepkg

[makepkg][makepkg] 命令是一个软件包自动编译脚本，直接由 pacman 包提供。
pacman4 属于 core 软件仓库，在 ArchLinux 提供的启动盘中已经内置了。
安装系统时用的 [base 软件组][base] 中也包含了 pacman。
也就是说，当你已经有一个 ArchLinux 时，makepkg 在你的系统中已经安装好了。

makepkg 会调用 PKGBUID 中封装的编译和安装脚本，这些脚本通常由
configure, make, make install 的流程构成。
为了能够让这些脚本里用到的编译工具都可用，建议安装 base-devel 软件组：

```bash
pacman -S base-devel
```

这一步对于编译 AUR 中的包是必须的，因为 AUR 中的包会默认 base-devel 组已经安装。
它们不会声明有 base-devel 中的软件依赖。
现在我们用 makepkg 来编译上文中得到的 PKGBUILD：

```bash
makepkg -s
```

`-s` 参数表示不仅做编译，而且去自动下载依赖。
执行结束后我们会得到一个 macbook-lighter-v0.0.2.1.g4441c81-1-any.pkg.tar.xz 文件。
可以用 pacman 直接安装它：

```bash
pacman -U *.xz
```

这里只介绍到 PKGBUILD, makepkg, pacman 的简单使用方式，
希望继续深入可以参考 [ArchLinux Build System](https://wiki.archlinux.org/index.php/Arch_Build_System)。

## pacaur

ArchLinux 提供来 [AUR 工具列表](https://wiki.archlinux.org/index.php/AUR_helpers)，有的用来搜索，有的用来构建，有的封装来 pacman。
最后一种是最危险的因为它抽象了上文中描述的整个操作。
但这里介绍的 pacaur 就属于这一种，方便嘛！从 AUR 下载并安装它：

```bash
git clone https://aur.archlinux.org/pacaur.git && cd pacaur
makepkg -s
pacman -U *.xz
```

然后就可以用 pacaur 来安装 AUR 包了，比如上面提到的 macbook-lighter：

```bash
aurman -S macbook-lighter
```

## 相关链接

* AUR 工具列表：<https://wiki.archlinux.org/index.php/AUR_helpers>
* makepkg 文档：<https://wiki.archlinux.org/index.php/Makepkg>
* MacBook 安装 ArchLinux：<https://harttle.land/2019/04/26/macbook-archlinux-install.html>
* MacBook Lighter 仓库：<https://github.com/harttle/macbook-lighter>

[base]: https://www.archlinux.org/groups/x86_64/base/
[makepkg]: https://wiki.archlinux.org/index.php/Makepkg_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
[pkgbuild]: https://wiki.archlinux.org/index.php/PKGBUILD_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
[macbook-lighter]: https://aur.archlinux.org/packages/macbook-lighter
