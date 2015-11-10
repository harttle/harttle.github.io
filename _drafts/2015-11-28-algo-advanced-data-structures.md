---
layout: blog
categories: reading
title:  算法导论笔记 - 高级数据结构
tags: 算法 B树
---

## B树

* B树类似于红黑树。他们在降低磁盘I/O操作数方面更好一些。因为B树的分支因子可以非常大，所以其高度要比红黑树小得多。
* B树是以一种自然的方式推广了的二叉搜索树。

### B树的定义

我们假定，任何与 **关键字**相联系的 **卫星数据**将与关键字一样存放在同一结点中，并随着关键字一起移动。一棵B树T是具有以下性质的有根树（根为T.root）：
> B+树是B树的变种。

1. 每个结点x有如下属性：
	a. x.n，表示结点x中的关键字个数
	b. x.n个关键字以非降序排列
	c. x.leaf，表示x是否为叶结点
2. 每个内部结点包含 x.n+1 个指针指向孩子们 c[i]
3. x 中的关键字 x.key[i] 对子树中的关键字 k[i] 进行分割，n个关键字，n+1个子树
4. 每个叶结点有相同的深度，即树的高度h
5. 每个结点的关键字数由 **最小度数**（minimum degree）t>=2控制：
	a. 除根节点外，每个结点至少含 t-1 个关键字
	b. 每个结点至多含 2t-1 个关键字

如果 n>=1，那么对任意一棵包含n个关键字、高度为h、最小度数t>=2 的B树T，有
$h\leq \log_t \frac{n+1}{2}$

<!--more-->

### B树上的基本操作

####搜索

```cpp
B-TREE-SEARCH(x,k)
	i=1
	while i<=x.n and k>x.key[i]
		i++
	if i<=x.n and k==x.key[i]
		return (x,i)
	elseif x.leaf
		return NIL
	else DISK-READ(x,c[i])
		return B-TREE-SEARCH(x.c[i],k)
```
循环所用时间为 O(t)，访问磁盘页数为 $O(\log_t n)$，总的CPU时间为 $O(t\log_t n)$。

####创建

```cpp
B-TREE-CREATE(T)
	x = ALLOCATE-NODE()
	x.leaf = TRUE
	x.n = 00
	DISK-WRITE(x)
	T.root = x
```
CPU时间为 O(1)。


#### 插入

**分裂 B 树中的结点**

B-TREE-SPLIT-CHILD(x,i)

输入：非满的内部结点 x，它的一个满的孩子x.c[i]的下标 i。
输出：将该子结点分裂为2个，并在 x 中添加关键字分开这两个孩子

**沿树下行插入关键字**

B-TREE-INSERT-NONFULL(x,k)

输入：非满的树x，要插入的关键字k

1. 如果x是叶结点，直接插入k
2. 如果x是内部结点，找到该关键字对应的子树
3. 如果该子树是满的，就分裂它
4. 在这个非满的子树上调用 B-TREE-INSERT-NONFULL

**构造非满根结点并插入关键字k**

B-TREE-INSERT(T,k)

1. 如果根节点不满，调用 B-TREE-INSERT-NONFULL(T.root,k)
2. 如果根结点是满的，将根结点置于新的根结点下，调用 B-TREE-SPLIT-CHILD 将原根结点分为两个孩子。调用调用 B-TREE-INSERT-NONFULL(T.root,k)。

### 从B树中删除关键字

当删除内部结点的关键字时，需要重新安排这个结点的孩子。当要删除的关键字的路径上的结点有最少的关键字树时还可能需要向上回溯。删除操作有以下几种情况：

1. 关键字k在叶结点x中：直接删除它
2. 关键字k在内部结点x中：
	a. 如果k左边的子树关键字足够(>=t)，拿出最大的一个代替k
	b. 如果k右边的子树关键字足够(>=t)，拿出最小的一个代替k
	c. 既然左右子树关键字都不多于 t-1，将右子树与k合并入左子树，得到 2t-1 个关键字的新结点
3. 关键字k不在当前的内部结点x中：降至一个至少含t个关键字的结点，通过对x的某个合适的子结点进行递归。


