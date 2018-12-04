---
title:  算法导论笔记 - 高级设计和分析技术
tags: 分治 算法 贪心 动态规划
---

## 动态规划

动态规划方法通常用来求解 **最优化问题**（optimization problem），通常有四个步骤：

1. 刻画一个最优解的特征
2. 递归地定义最优解的值
3. 计算最优解的值
4. 利用计算出的信息构造一个最优解

> **动态规划**（dynamic programming）与分治方法相似，都是通过组合子问题的解来求解原问题。区别在于分治法的子问题互不相交，而动态规划应用于子问题重叠的情况。

<!--more-->

### 钢条切割问题

问题定义：给定一段长度为n的钢条和价格表$$p_i (i=1,2,\cdots,n)$$，求切割钢条方案，使得销售收益$$r_n$$最大。

钢条切割问题满足 **最优子结构**（optimal substructure）性质：问题的最优解由相关子问题的最优解组合而成，这些子问题可以独立求解。

#### 直接的自顶向下的递归方法

```cpp
CUT-ROD(p, n)
	if n==0
		return 0
	q = -MAX
	for i=1 to n
		q = max(q,p[i]+CUT-ROD(p,n-i))
	return q
```
该算法的运行时间为 $T(n)=2^n$。

#### 带备忘的自顶向下法

```cpp
MEMOIZED-CUT-ROD(p,n)
	let r[0..n] be a new array
	for i=0 to n
		r[i] = -MAX
	return MEROIZED-CUT-AUX(p,n,r)

MEMOIZED-CUT-ROD-AUX(p,n,r)
	if r[n] >= 0
		return r[n]
	if n == 0
		q = 0
	else q = -MAX
		for i=1 to n
			q = max(q,p[i]+MEMOIZED-CUT-ROD-AUX(p,n-i,r))
	r[n] = q
	return q
```
该算法的渐近运行时间为 $\Theta(n^2)$。

#### 自底向上法

```cpp
BOTTOM-UP-CUT-ROD(p,n)
	let r[0..n] be a new array
	r[0] = 0
	for j = 1 to n
		q = -MAX
		for i=1 to j
			q = max(q,p[i]+r[j-i])
		r[j] = q
	return r[n]
```
该算法与自顶向下法有相同的渐近运行时间。

#### 重构解

扩展 BOTTOM-UP-CUT-ROD 算法，计算最大收益$$r_j$$同时，记录最优解对应的第一段钢条的切割长度 $$s_j$$。

```cpp
EXTENDED-BOTTOM-UP-CUT-ROD(p,n)
	let r[0..n] be a new array
	r[0] = 0
	for j = 1 to n
		q = -MAX
		for i=1 to j
			if q< p[i]+r[j-i]
				q = p[i]+r[j-i]
				s[j] = i
		r[j] = q
	return r and s
```

输出长度为n的钢条的完整的最优切割方案

```cpp
PRINT-CUT-ROD-SOLUTION(p,n)
	(r,s) = EXTENDED-BOTTOM-UP-CUT-ROD(p,n)
	while n>0
		print s[n]
		n=n-s[n]
```

### 矩阵连乘法

**矩阵连乘法**（matrix-chain multiplication problem）可描述如下：
给定n个矩阵的链 $$<A1,A2,...An>$$，矩阵 $$Ai$$ 的规模为 $$p_{i-1}\times p_i$$，
求完全括号化方案，使得计算乘积 $$A1A2...An$$ 所需的标量乘法次数最少。

我们称有如下性质的矩阵乘积链为 **完全括号化**（fully parenthesized）：它是单一矩阵，或者两个完全括号化的矩阵乘积链的积，且已外加括号。括号化方案的数量与n呈指数关系，通过暴力搜索穷尽所有可能的括号化方案来寻找最优方案，是一个糟糕的策略。

> 一个例子，计算三个矩阵连乘 {A1，A2，A3} ；维数分别为
> $$10\times 100, 100\times 5 , 5\times 50$$。
> 
> 按顺序计算 $$((A1\times A2)\times A3)$$需要的次数为
> $$10\times 100 \times 5+10\times 5\times50=7500$$次；
> 
> 如果按$$(A1\times (A2\times A3))$$顺序，计算次数为：
> $$10\times 5\times 50+10\times 100\times 50=75000$$次。
> 
> 所以问题是：如何确定运算顺序，可以使计算量达到最小化。

子问题：令 m[i][j] 表示第i个矩阵至第j个矩阵这段的最优解。
如果 i=j，则 m[i][j] 这段中就一个矩阵，需要计算的次数为0；
如果 i>j，则 m[i][j] = min{ m[i][k] + m[k+1][j] + p[i-1]\*p[k]\*p[j] }，其中 i<=k<j ;

注意计算顺序，保证在计算 m[i][j] 的时候，m[i][k] 和 m[k+1][j] 已经计算出来了。

求解表 m

```cpp
MATRIX-CHAIN-ORDER(p)
	n = p.length -1 
	let m[1..n,1..n] and s[1..n-1,2..n] be new tables
	for i = 1 to n
		m[i,i] = 0
	for l =  2 to n
		for i = 1 to n-l+1
			j = i+l-1
			m[i,j] = MAX
			for k = i to j-1
				q = m[i,k]+m[k+1,j] + p(i-1)p(k)p(j)
				if q< m[i,j]
					m[i,j] = q
					s[i,j] = k
	return m and s
```

构造最优解

```cpp
PRINT-OPTIMAL-PARENS(s, i, j)
	if i==j
		print "Ai"
	else print "("
		PRINT-OPTIMAL-PARENS(s, i, s[i,j])
		PRINT-OPTIMAL-PARENS(s, s[i,j]+1, j)
		print ")"
```

### 动态规划原理

适合应用动态规划方法求解的最优化问题应该具备两个要素：最优子结构和子问题重叠。

给定一个有向图 $$G=(V,E)$$ 和两个顶点 $$u,~v\in V$$。
**无权最短路径**：找到一条从 u 到 v 的边数最少的路径。这条路径必然是简单路径。
**无权最长路径**：找到一条从 u 到 v 的边数最多的路径，这条路径要求是简单路径。

无权最短路径具有最优子结构性质，而无权最长路径没有该性质。原因在于，虽然最长路径问题和最短路径问题的解都用到了两个子问题，但两个最长简单路径子问题是相关的，而两个最短路径子问题是 **无关的**（independent）。

如果递归算法反复求解相同的子问题，我们就称最优化问题具有 **重叠子问题**（overlapping subproblems）性质。与之相反，适合用分治方法求解的问题通常在递归的每一步都生成全新的问题。直接的递归算法无疑会重复计算每个子问题，而带备忘的递归算法可以达到与带备忘自顶向下的动态规划算法相似的效率。

### 最长公共子序列

给定一个序列X[1..m]，另一个序列Z[1..k]满足如下条件时称为X的子序列：存在一个严格递增的X的下标序列 i[1..k] ，对所有的 1<=j<=k，满足 x[i[j]] = z[j]。

c[i,j]表示X[i]和Y[j]的 **最长公共子序列**（longest commen subsequence，LCS），根据 LCS 的最优子结构性质，可得到如下公式

$$
c[i,j] = \begin{cases}
0,~if~i=0~or~j=0\\
c[i-1,j-1]+1,~if~i,j>0~and~x_i=y_j\\
max(c[i,j-1],c[i-1,j]),~if~i,j>0~and~x_i\neq y_j
\end{cases}
$$

通过动态规划的方法，可以先求解表c，再根据表c构造LCS。

> 另外，对于LCS算法，每个c[i,j]只依赖于c[i-1,j], c[i,j-1], c[i-1,j-1]和x,y的关系，用这些可以在常数时间内计算c[i,j]，因此完全可以去掉表c，只需要常量的存储。

### 最优二叉搜索树

**最优二叉搜索树**（optimal binary search tree）：给定一个n个不同关键字的已排序的序列K，希望构造一棵二叉搜索树。每个关键字都有一个概率表示其搜索频率，我们希望该二叉搜索树的期望搜索代价最小。

最优子结构：如果一棵最优二叉搜索树$$T$$有一棵子树$$T'$$，那么$$T'$$必然是其包含的关键字构成的子问题的最优解。递归式为：

$$
e[i,j] = \begin{cases}
q_{i-1},~if~j=i-1\\
\min_{i\leq r \leq j} \{ e[i,r-1]+e[r+1,j]+w(i,j) \},~if~i\leq j
\end{cases}
$$

可以通过类似矩阵连乘的算法进行求解，时间复杂度也是$$\Theta(n^3)$$。

## 贪心算法

### 活动选择问题

问题描述：假定有n个 **活动**（activity）的集合S，这些活动使用同一资源（即同一时刻只供一个活动使用）。每个活动有一个 **开始时间**（s[i]）和 **结束时间**（f[i]），在 **活动选择问题**中，我们希望选出一个最大兼容活动集。假定活动已按结束时间递增排序。

#### 动态规划法

$$S_{ij}$$ 表示结束时间在活动 $$i$$ 结束后 $$j$$ 开始前的活动集合，$$c[i,j]$$ 表示 $$S_{ij}$$ 的最优解的大小，则

$$
c[i,j]=\begin{cases}
0,~if S_{ij} = \emptyset\\\\
max\{ c[i,k]+c[k,j]+1 \},~if S_{ij} \neq \emptyset
\end{cases}
$$

可以通过带备忘的递归算法，或者自底向上法填写表项。

#### 贪心选择

加入无需求解所有子问题就可以选择一个活动加入最优解，将省去上式中考察所有选择的过程，即 **贪心选择**。
$$S_k={a_i\in S: s_i \geq f_k}$$ 为在 $$a_k$$ 结束后开始的任务集合。

递归贪心算法 RECURSIVE-ACTIVITY-SELECTOR 的输入为两个数组 $$s$$ 和 $$f$$，表示活动的开始和结束时间，下标 $$k$$ 指出要求解的子问题 $$S_k$$，以及问题规模 $$n$$。返回 $$S_k$$ 的一个最大兼容活动集。求解原问题可以调用 RECURSIVE-ACTIVITY-SELECTOR(s,f,0,n)。

```cpp
RECURSIVE-ACTIVITY-SELECTOR(s,f,k,n)
	m = k+1
	while m<=n and s[m]<f[k]
		m++
	if m<=n
		return {a[m]} U RECURSIVE-ACTIVITY-SELECTOR(s,f,m,n)
	else return null
```

可以转换为迭代贪心算法

```cpp
GREEDY-ACTIVITY-SELECTOR(s,f)
	n = s.length
	A={a[1]}
	k=1
	for m=2 to n
		if s[m] >= f[k]
			A = A U {a[m]}
			k = m
	return A
```

### 贪心算法原理

如果一个问题的最优解包含其子问题的最优解，则称此问题具有 **最优子结构**星坠，此性质是能否应用动态规划和贪心方法的关键要素。两者的差别在于 **贪心选择性质**（greedy-choice property）：我们可以通过做出局部最优（贪心）选择来构造全局最优解。

#### 贪心与动态规划

**0-1 背包问题**（0-1 knapsack problem）：正在抢劫商店的小偷发现n个商品，第i个商品价值v[i]美元，重w[i]磅。小偷希望拿走尽量多的物品，而他的背包最多容纳W磅的物品。对于每个商品小偷要么完整拿走，要么把它留下，不能部分拿走或拿走多次。
**分数背包问题**（fractional knapsack problem）中，设定于 0-1背包问题一样，但低于每一个商品，小偷可以拿走其一部分。

> 两个背包问题都具有最优子结构性质。但我们可以使用贪心策略求解分数背包问题，而不能求解0-1背包问题。原因是小偷无法装满背包时，空闲空间降低了方案的有效每磅价值。当我们考虑是否装入某商品时，必须比较包含此商品的子问题的解与不包含它的子问题的解，然后才能做出选择。这将产生大量的重叠子问题，即需要使用动态规划算法。

### 哈夫曼编码

我们考虑一种 **二进制字符编码**（或简称 **编码**）的方法，每个字符用唯一二进制串表示，称为 **码字**。 **变长编码**（variable-length code）可以达到比 **定长编码**好得多的压缩率，其思想是赋予高频字符短码字，赋予低频字符长码字。

在 **前缀码**（prefix code）中，没有任何码字是其他码字的前缀。此时编码文件的开始码字是无歧义的。我们可以简单地识别出开始码字，将其转换回原字符，然后对编码文件剩余部分重复这种解码过程。解码过程可以用二叉树方便地表示。

给定编码树 $$T$$，定义 $$d_T(c)$$ 为字母表 $$C$$ 中字符 $$c$$ 的叶结点的深度，即 $$c$$ 的码字长度。定义 $$T$$ 的 **代价**：
$$B(T) = \sum_{c\in C} c.freq \cdot d_T(c)$$

**哈夫曼编码**（Huffman code）是一种使用贪心算法构造的最优前缀码。$$C$$是$$n$$个字符的集合，$$C$$中的每个字符$$c$$有一个属性$$c.freq$$给出其出现频率。$$Q$$为以$$freq$$为关键字的最小优先队列。

```cpp
HUFFMAN(C)
	n = |C|
	Q = C
	for i = 1 to n-1
		allocate a new code z
		z.left = x = EXTRACT-MIN(Q)
		z.right = y = EXTRACT-MIN(Q)
		z.freq = x.freq + y.freq
		INSERT(Q,z)
	return EXTRACT-MIN(Q)	//return the root of the tree
```
假定 $$Q$$ 使用最小二叉堆实现，则堆操作时间为 $$O(n)$$，HUFFMAN 的运行时间为 $$O(n\lg n)$$，如果将最小二叉堆换为 van Emde Boas 树，可以将运行时间将为 $$O(n\lg\lg n)$$。

#### HUFFMAN 算法的正确性

引理1：令$$C$$为一个字母表，其中的每个字符$$c$$有一个频率$$c.freq$$。$$x$$和$$y$$为频率最低的两个字符。那么存在$$C$$的一个最优前缀码，x和y有相同的码字长度，且只有最有一个二进制位不同。

> 叶结点都会成对出现。因为如果出现单独的叶结点，用该结点替换其父结点，可以得到更优的树。
> 不会有任何结点深于频率最低的$$x$$和$$y$$。因为假如存在这样一个z，那么调换x与z，可以得到更优的树。
> 所以x和y可以位于最低的那两个叶结点上。

引理2：令$$C$$为一个字母表，其中的每个字符$$c$$有一个频率$$c.freq$$。$$x$$和$$y$$为频率最低的两个字符。令 $$C'$$ 为 $$C$$ 去掉 $$x$$ 和 $$y$$，加入 $$z(z.freq = x.freq+y.freq)$$ 得到的字母表。$$T'$$ 为 $$C'$$  的一个最优前缀码对应的编码树。则将$$T'$$ 的$$z$$$替换为一个有$$x$$和$$y$$子节点的内部结点得到的树$$T$$，表示$$C$$的一个最优前缀码。

> 因为 $$B(T) = B(T') + x.freq + y.freq$$，这样的替换将产生确定的代价差额。故T'是最优的可以得到T是最优的（由引理1可以得到总是存在这样的替换）。



