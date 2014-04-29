---
layout: article
title:  "算法导论"
categories: 读书
tags: 读书笔记 算法 数据结构
excerpt: 《算法导论》Thomas H.Cormen, Charles E.Leiserson, etc. 机械工业出版社
---

# 基础知识

##算法基础

### 插入排序

```cpp
//INSERTION-SORT(A)
for j = 2 to A.length
	key = A[j]
	//Insert A[j] into the sorted sequence A[1..j-1]
	i = j - 1 
	while i > 0 and A[i] > key
		A[i + 1] = A[i]
		i = i - 1
	A[i+1] = key
```

* 循环不变式：初始化、保持、终止

###分析算法

* 单处理器计算模型：随机访问机（random-access machine，RAM）：算数指令、数据移动指令、控制指令。
* 最坏情况、平均情况、增长量级

<!--more-->

###设计算法

####分治法

* 将原问题分解为几个规模较小但类似于原问题的子问题，递归地求解这些子问题，然后再合并这些子问题的解来建立原问题的解。
* 步骤：分解、解决、合并

```cpp
//MERGE(A,p,q,r)
n1 = q - p + 1
n2 = r - q
let L[1..n1+1] and R[1..n2+1] be new arrays
for i = 1 to n1
	L[i]=A[p+i-1]
for j = 1 to n2
	R[j] = A[q+j]
L[n1+1] = MAX
R[n2+1] = MAX
for k = p to r
	if L[i] <= R[j]
		A[k] = L[i]
		i = i+1
	else
		A[k] = R[j]
		j = j+1
```		

```cpp
//MERGE-SORT(A,p,r)
if p<r
	q=(p+r)/2
	MERGE-SORT(A,p,q)
	MERGE-SORT(A,q+1,r)
	MERGE(A,p,q,r)
```
####分析分支算法
归并排序算法的分析

* 分解：计算子数组的中间位置，D(n) = O(1)
* 解决：求解规模为n/2的子问题，将贡献 2T(n/2) 的运行时间
* 合并：C(n) = O(n)

最坏情况运行时间
$
T(n)=
 \begin{cases}
O(1)=c, n=1\\\\
2T(n/2)+O(n)=2T(n/2)+cn, n>1
\end{cases}
$

$T(n)=\Theta(n\lg n)$

## 函数的增长

### 渐进记号

* $\Theta$：渐进地给出一个函数的上界和下界
* $O$：只有一个渐进上界
* $\Omega$：只有一个渐进下界
* $o$：非渐进紧确的上界
* $\omega$：非渐进紧确的下界

### 标准记号与常用函数

* 单调性
* 向下取整与向上取整
* 模运算
* 多项式
* 指数
* 对数
* 阶乘
* 多重函数：重复多次作用在初值上
* 多重对数函数
* 斐波那契数

## 分治策略
在分治策略中，我们递归地求解一个问题，在每层递归中应用如下三个步骤：

* 分解（divide）
* 解决（conquer）
* 合并（combine）

三种求解递归式的方法：

* 代入法：猜测一个界，用数学归纳法证明
* 递归树法：将递归式转换为一棵树，级数求和
* 主方法

### 最大子数组问题

#### 暴力求解：$\Omega(n^2)$
#### 分治策略求解
任何连续数组所处的位置必然是以下三种之一：

* 完全位于左子数组
* 完全位于右子数组
* 跨越了中点：可在线性时间内求出跨越中点的最大子数组

运行时间
$T(n)=\Theta(n\lg n)$

### 矩阵乘法的 Strassen 算法

#### 直接计算
SQUARE-MATRIX-MULTIPLY：$T(n)=\Theta(n^3)$

#### 简单的分治算法
$T(n)=\Theta(n^3)$，简单的分治算法并不由于直接的SQUARE-MATRIX-MULTIPLY过程。

#### Strassen 算法
Strassen算法包括四个步骤：

1. 将输入矩阵A、B和输出矩阵C分解为$n/2\times n/2$的子矩阵。采用下标计算，时间为$\Omega(n^2)$
2. 创建10个$n/2\times n/2$的子矩阵$S_1,~S_2,~...,~S_{10}$，每个矩阵保存1中创建的两子矩阵和或差
3. 使用1中的子矩阵和2中的10个矩阵，递归地计算7个矩阵积$P_1,~P_2,~...,~P_{7}$
4. 通过 $P_i$ 矩阵的不同组合进行加减运算，计算出结果矩阵C的子矩阵$C_{11},~C_{12},~C_{21},~C_{22}$，花费时间：$\Omega(n^2)$

递归式：
$
T(n)=
 \begin{cases}
O(1)=c, n=1\\\\
7T(n/2)+O(n)=2T(n/2)+cn, n>1
\end{cases}
$
根据主方法，得到该递归式的解为$\Omega(n^{\lg 7})$

### 使用主方法求解递归式
对于递归式$T(n)=aT(n/b)+f(n)$，将函数$f(n)$与$n^{\log_ba}$进行比较：

* 若$f(n)$更大（在多项式意义上），解为$\Omega(f(n))$；
* 若$n^{\log_ba}$更大，解为$\Omega(n^{\log_ba})$；
* 若大小相当，解为$\Omega(f(n)\lg n)$。

## 概率分析和随机算法

### 雇用问题

假设应聘办公助理的候选人编号为1到n，在面试完应聘者i后，如果他比目前的办公助理更合适，就会辞掉当前的办公助理，然后聘用他。估算雇佣过办公助理的总费用（雇佣一个办公助理费用为$c_h$）。

```cpp
HIRE-ASSISTENT(n)
best = 0	//candidate 0 is a least-qualified dummy candidate
for i = 1 to n
	interview candidate i
	if candidate i is better than candidate best
		best = i
		hire candidate i
```

#### 最坏的情形

总费用为$O(c_hn)$

#### 平均情形

* 平均情况运行时间：概率分布在算法的输入上
* 期望运行时间：算法本身做出随机选择

### 指示器随机变量

给定样本空间S和一个事件A，那么事件A对应的 **指示器随机变量**$I\\{A\\}$定义为：
$I\\{A\\}=
\begin{cases}
1,~if~A~happened\\\\
0,~if~A~didn't~happen
\end{cases}
$

举一个简单的例子，我们来确定抛掷硬币时正面朝上的期望次数。样本空间为$S=\{H, T\}$，其中$Pr\{H\}=Pr\{T\}=1/2$，指示器随机变量
$X_H=I\\{H\\}=
\begin{cases}
1,~if~H~happened\\\\
0,~if~T~happened
\end{cases}
$

在一次抛掷中，正面朝上的期望次数为指示器变量$X_H$的期望值：
$E[X_H]=E[I\{H\}]=1\cdot Pr\{H\} + 0\cdot Pr\{T\} = 1\cdot (1/2)+ 0\cdot (1/2)=1/2$

n次抛掷中出现正面的总次数$X=\sum_{i=1}^n X_i$

正面朝上次数的期望 $E[X]=E\left[\sum_{i=1}^n X_i \right] = \sum_{i=1}^n E[X_i] = \sum_{i=1}^n 1/2 = n/2$

#### 用指示器随机变量分析雇用问题

应聘者i比1到i-1更有资格的概率为1/i，因而$E[X_i]=1/i$

故雇佣总数为 $E[X] = E\left[\sum^n_{i=1} X_i \right] = \sum_{i=1}^n 1/i = \ln n$，雇佣费用平均情形下为$O(c_h \ln n)$

### 随机算法

算法中的随机排列使得输入次序不再相关，因而没有特别的输入会引出它的最坏情况行为。

对于雇用问题，只需要随机地变换应聘者序列

```cpp
RANDOMIZED-HIRE-ASSISTANT(n)
randomly permute the list of candidates
best = 0	//candidate 0 is a least-qualified dummy candidate
for i = 1 to n
	interview candidate i
	if candidate i is better than candidate best
		best = i
		hire candidate i
```

产生 **均匀随机排列** （等可能地产生数字1~n的每一种排列）

```cpp
PERMUTE-BY-SORTING(A)
n = A.length
let P[1...n] be a new array
for i = 1 to n
	P[i] = RANDOM(1, n**3)
sort A, using P as sort keys
```
 可以证明，P中所有元素都唯一的概率至少是 $1-1/n$。假设所有优先级都不同，则过程PERMUTE-BY-SORTING产生输入的均匀随机排列。

```cpp
RANDOMIZE-IN-PLACE(A)
n = A.length
for i =1 to n
	swap A[i] with A[RANDOM(i, n)]
```
可以证明，过程RANDOMIZE-IN-PLACE可计算出一个均匀随机排列。

具有n个元素的 **k排列**（k-permutation）是包含这n个元素中的k个元素的序列，并且不重复，一共有 $n!/(n-k)!$种可能的k排列。

# 排序和顺序统计量

* 待排序的项称为 **记录**（record），每个记录包含一个 **关键字**（key），即排序问题中要重排的值，记录的剩余部分由 **卫星数据**（statellite data）组成。
* 如果输入数组中仅有常数个元素需要在排序过程中存储在数组之外，则称排序算法是 **原址的**（in place）。插入排序可以在$\Theta(n^2)$时间内将n个数排好序，是一种非常快的原址排序算法；归并排序有更好的渐近运行时间$\Theta(n\lg n)$，但它使用的MERGE过程并不是原址的。

| 算法 | 最坏情况运行时间 | 平均情况/期望运行时间     |
| ------------- |:---------------:|:---------:|
| 插入排序  | $\Theta(n^2)$ | $\Theta(n^2)$  |
| 归并排序  | $\Theta(n\lg n)$   |   $\Theta(n\lg n)$  |
| 堆排序  | $O(n\lg n)$   |   —  |
| 快速排序  | $\Theta(n^2)$   | $\Theta(n\lg n)$（期望） |
| 计数排序  | $\Theta(k+n)$   |   $\Theta(k+n)$  |
| 基数排序  | $\Theta(d(n+k))$   |   $\Theta(d(n+k))$  |
| 桶排序  | $\Theta(n^2)$   |   $\Theta(n)$（平均情况）  |

## 堆排序

| 算法 | 时间复杂度 | 空间原址性 |
| --- | --- | --- |
| 插入排序 | $O(n^2)$ | 是 |
| 归并排序 | $O(n\lg n)$ | 否 |
| 堆排序 | $O(n\lg n)$ | 是 |

### 堆

* 计算父节点、左右孩子节点下标

    ```cpp
    PARENT(i)
        return i/2

    LEFT(i)
        return 2i

    RIGHT(i)
        return 2i+1
    ```
* **最大堆**
	除了根以外的所有节点 i 满足：$A[\rm{PARENT}(i)]\geq A[i]$
* **最小堆**
	除了根以外的所有节点 i 满足：$A[\rm{PARENT}(i)]\leq A[i]$
* 对于完全二叉树，叶节点数 = 非叶节点数 或 非叶节点数+1
	
### 维护堆的性质

 MAX-HEAPIFY(A, i) 通过逐级下降，使得下标为 i 的根节点的子树符合最大堆的性质

```cpp
MAX-HEAPIFY(A, i)
l = LEFT(i)
r = RIGHT(i)
if l <= A.heap-size and A[l] > A[i]
	largest = l
else
	largest = i
if r <= A.heap-size and A[r] > A[largest]
	largest = r
if largest != i
	exchange A[i] with A[largest]
	MAX-HEAPIFY(A, largest)
```

每个孩子的子树的大小最多为 $2n/3$（最坏情况发生在树的最底层半满的时候），故MAX-HEAPIFY运行时间 
$T(n) \leq T(2n/3) + \Theta(1)$，解为$T(n) = O(\lg n)$。

###建堆

BUILD-MAX-HEAP 把大小为 n = A.length 的数组 A[1..n] 转换为最大堆。

```cpp
BUILD-MAX-HEAP(A)
	A.heap-size = A.length
	// 子数组 $A(n/2+1..n)$ 中的元素都是叶节点
	for i = A.length/2 downto 1
		MAX-HEAPIFY(A, i)
```

* 渐近上界
	BUILD-MAX-HEAP 需要调用MAX-HEAPIFY O(n) 次，故总的时间复杂度为 $O(n\lg n)$，或者$O(nh)$。
* 更加紧确
	含n个元素的堆高度为 $\lfloor \lg n\rfloor$，高度为h的元素数最多为 $\lceil n/2^{h+1} \rceil$，于是 BUILD-MAX-HEAP的时间复杂度为
	$O\left( \sum_{h=0}^{\lfloor \lg n\rfloor} \lceil n/2^{h+1} \rceil O(h) \right) = O\left(n\sum_{h=0}^{\lfloor \lg n\rfloor}\frac{h}{2^h}\right) = O\left(n\sum_{h=0}^{\infty}\frac{h}{2^h}\right) = O(n)$
	
### 堆排序算法

```cpp
HEAPSORT(A)
	BUILD-MAX-HEAP(A)
	for i = A.length downto 2
		exchange A[1] wiith A[i]
		A.heap-size = A.heap-size - 1
		MAX-HEAPIFY(A, 1)
```
MAX-HEAPIFY 时间复杂度为 $O(\lg n)$，被HEAPSORT n-1 次调用，故 HEAPSORT 的时间复杂度为 $O(n\lg n)$

### 优先队列

* **优先队列** 是一种用来维护由一组元素构成的集合S的数据结构，每个元素有一个相关的值，称为 **关键字**（key）。优先队列同样有两种形式： **最大优先队列**和 **最小优先队列**。
* 一个最大优先队列支持以下操作：
	* INSERT(S, x)：把元素x插入集合S中。
	* MAXINUM(S)：返回S中具有最大关键字的元素。
	* EXTRACT-MAX(S)：去掉并返回S中具有最大关键字的元素。
	* INCREASE-KEY(S, x, k)：将元素x的关键字值加到k
* 最大优先队列用于共享计算机系统的作业调度，最小优先队列用于基于事件驱动的模拟器（关键字为事件发生时间）。

```cpp
HEAP-MAXINUM(A)
	return A[1]

HEAP-EXTRACT-MAX(A)
	if A.heap-size < 1
		error "heap underflow"
	max = A[1]
	A[1] = A[A.heap-size]
	A.heap-size = A.heap-size - 1
	MAX-HEAPIFY(A, 1)
	return max
```
HEAP-EXTRACT-MAX 的时间复杂度为 $O(\lg n)$（取决于MAX-HEAPIFY的时间复杂度）。

```cpp
HEAP-INCREASE-KEY(A, i, key)
	if key < A[i]
		error "new key is smaller than current key"
	A[i] = key
	while i > 1 and A[PARENT(i)] < A[i]
		exchange A[i] with A[PARENT(i)]
		i = PARENT(i)
```
HEAP-INCREASE-KEY 中当前元素不断与父元素比较，当前元素大则将二者交换，直至当前元素的关键字小于父节点。时间复杂度为$O(\lg n)$。

```cpp
MAX-HEAP-INSERT(A, key)
	A.heap-size = A.heap-size + 1
	A[A.heap-size] = - MAX_INT
	HEAP-INCREASE-KEY(A, A.heap-size, key)
```
MAX-HEAP-INSERT的时间复杂度为$O(\lg n)$。

## 快速排序

快速排序的时间复杂度为$\Theta(n\lg n)$，能够进行原址排序。

### 快速排序的描述

```cpp
QUICKSORT(A, p, r)
	if p < r	
		q = PARTITION(A, p, r)
		QUICKSORT(A, p, q-1)
		QUICKSORT(A, q+1, r)
		
//将数组分为两部分，返回临界值下标
PARTITION(A, p, r)
	x = A[r]	//以最后一个数为主元（pivot element）
	i = p-1	//小于主元子数组的下标上限
	for j = p to r-1
		if A[j] <= x
			i = i+1	//增加小于主元子数组的大小
			exchange A[i] with A[j]	//将A[j]加入小于主元的子数组
	exchange A[i+1] with A[r]	//将主元从数组末尾移动至子数组之间
	return i + 1
```
为了排序一个数组A，初始调用为：QUICKSORT(A, 1, A.length)。

### 快速排序的性能

#### 最坏情况

当划分产生的两个子问题分别包含 n-1 和 0 个元素时，最坏情况发生。划分操作的时间复杂度为$\Theta(n)$，$T(0)=\Theta(1)$，这时算法运行时间的递归式为
$T(n) = T(n-1) + T(0) + \Theta(n) = T(n-1) + \Theta(n)$，解为$T(n) = \Theta(n^2)$。

#### 最好情况划分

当划分产生的两个子问题分别包含$\lfloor n/2 \rfloor$和$\lceil n/2 \rceil-1$个元素时，最好情况发生。算法运行时间递归式为
$T(n) = 2T(n/2) + \Theta(n)$，解为$T(n) = \Theta(n\lg n)$。

#### 平衡的划分

只要划分是常数比例的，算法的运行时间总是$O(n\lg n)$。

> 假设按照 9:1 划分，每层代价之多为 cn，递归深度为 $\log_{10/9}n = \Theta(\lg n)$，故排序的总代价为$O(n\lg n)$。

#### 对平均情况的直观观察

* 对于一次差的划分接着一个好的划分，将产生三个大小为 0、(n-1)/2-1 和 (n-1)/2 的子数组，划分代价为$\Theta(n) + \Theta(n-1) = \Theta(n)$。
* 对于一次好的划分，将产生两个大小为 (n-1)/2 的子数组，划分代价为$\Theta(n)$。

从直观上看，差划分引起的二次划分代价$\Theta(n-1)$可以被吸收到差划分代价$\Theta(n)$中去，而得到与好划分一样好的结果。

### 快速排序的随机化版本

可以通过在算法中引入随机性，使得算法对所有输入都能获得较好的期望性能。

```cpp
//新的划分程序，只是在真正进行划分前进行一次交换
RANDOMIZED-PARTITION(A, p, r)
	i = RANDOM(p, r)
	exchange A[r] with A[i]
	return PARTITION(A, p, r)
```

### 快速排序分析

#### 最坏情况分析

使用代入法证明快速排序的时间复杂度为$O(n^2)$。假设T(n)为最坏情况下 QUICKSORT 在输入规模为 n 的数据集合上所花费的时间，则有
$T(n) = \max_{0\leq q \leq n-1}(T(q) + T(n-q-1)) + \Theta(n)$
将$T(n)\leq cn^2$带入右侧，得到
$T(n) \leq \max_{0\leq q \leq n-1}(cq^2 + c(n-q-1)^2) + \Theta(n) = cn^2 - c(2n-1) + \Theta(n) \leq cn^2$。
故$T(n) = O(n^2)$

#### 期望运行时间

设 PARTITION 的第4行所做的比较操作次数为X，则 QUICKSORT 的运行时间为 $O(n+X)$。
> 因为 PARTITION 至多被调用n次，每次调用包括固定的工作量和for循环，for循环都要执行第4行。

我们考察第四行的比较操作的实际执行次数：

* 将数组A的元素重命名为$z_1,~z_2,~...,~z_n$，其中$z_i$表示第i小的元素。
* 定义$Z_{ij} = \{ z_i~,z_{i+1},~...,~z_j \}$为$z_i$和$z_j$之间元素的集合。
* 定义指示器随机变量$X_{ij} = I(z_i compared with z_j)$。

因每一对元素至多比较一次，故总的比较次数：
$X=\sum_{i=1}^{n-1}\sum_{j=i+1}^{n}X_{ij}$，
总比较次数的期望：
$E(X) = \sum_{i=1}^{n-1}\sum_{j=i+1}^{n}Pr(z_i~compared~with~z_j)$。

$z_i$与$z_j$进行比较，当且仅当$Z_ij$（共j-i+1个元素）中被选中的第一个主元为$z_i$或$z_j$，即：
$Pr(z_i~compared~with~z_j) = \frac{2}{j-i+1}$
故总比较次数期望：
$E(X) = \sum_{i=1}^{n-1}\sum_{j=i+1}^{n}\frac{2}{j-i+1} \lt \sum_{i=1}^{n-1}\sum_{k=1}^{n}\frac{2}{k} = \sum_{i=1}^{n-1}O(\lg n) = O(n\lg n)$

## 线性时间排序

### 比较排序算法的下界

比较排序可以被抽象为一棵 **决策树**。决策树是一棵完全二叉树，它可以表示在给定输入规模情况下，某一特定排序算法对所有元素的比较操作。
> 在决策树中，每个内部结点以被比较数的下标 i:j 标记，每个叶节点都标注一个序列。排序算法的执行对应于一条从根节点到叶节点的路径，每个内部结点表示一次比较，左子树表示 a[i]<=a[j]的后续比较，右子树表示a[i]>a[j]的后续比较。如图。

![决策树模型](http://pic002.cnblogs.com/images/2012/369370/2012081216212084.gif)

在最坏情况下，任何比较排序算法都需要做 $\Omega(n\lg n)$ 次比较。
> * 因为输入数据的 n! 中可能的情况都必须出现在叶节点，故 $n! \leq 2^h$ ，即 $h \geq \lg(n!) = \Theta(n\lg n)$，$h=\Omega(n\lg n)$。
> * 比较算法最坏情况下的比较次数等于其决策树的高度。
> * 堆排序和归并排序都是渐近最优的比较排序算法。


### 计数排序

**计数排序**假设n个输入元素均为[0, k]的整数，当 k=O(n) 时，排序的运行时间为 $\Theta(n)$。

> 计数排序的基本思想是：对每一个输入x，确定小于x的元素个数，然后把x直接放到输出数组的相应位置上。

```cpp
COUNTING-SORT(A, B, k)
let C[0..k] be a new array
for i = 0 to k
	C[i] = 0
for j = 1 to A.length
	C[A[j]]=C[A[j]]+1
//now C[i] contains the number of elements equal to i
for i = 1 to k
	C[i]=C[i]+C[i-1]
//now C[i] contains the number of elements <= i
for j = A.length downto 1
	B[C[A[j]]]=A[j]
	C[A[j]]=C[A[j]]-1
```

* 计数排序遍历了两次A和C，故总时间代价为$\Theta(k+n)$。
* 计数排序是  **稳定的**。

### 基数排序

**基数排序** 先按 *最低有效位* 进行排序，之后用同样的方法按次低有效位进行排序，直至所有数都排好。
> * 计数排序是一种用在卡片排序机上的算法，因卡片机需要排成一排而不能从高位递归地排序。
> * 为了确保基数排序的正确性，一位数排序算法必须是稳定的。

```cpp
RADIX-SORT(A, d)
	for i = 1 to d
		use a stable sort to sort array A on digit i
```

给定n个k进制d位数，如果使用的稳定排序算法耗时$\Theta(n+k)$，那么RADIX-SORT的时间代价为$\Theta(d(n+k))$。

给定一个b位2进制数（k=2）和正整数r<=b，如果使用的稳定排序算法耗时$\Theta(n+k)$，那么RADIX-SORT的时间代价为$\Theta((b/r)(n+2^r))$。
> 将b位2进制数转化为b/2位$2^r$进制数。

假设$b \geq \lfloor \lg n \rfloor$，选择$r = \lfloor \lg n \rfloor$，得到RADIX-SORT运行时间为$\Theta(bn/\lg n)$。特殊地，如果$b = O(\lg n)$，将得到基数排序的运行时间：$\Theta(n)$。
> 渐近意义上，基数排序要比快速排序的期望运行时间（$\Theta(n\lg n)$）更好，但是两个表达式中隐含的常数因子是不同的。
> 利用计数排序作为中间稳定排序的基数排序不是原址排序。

### 桶排序

**桶排序**假设输入数据服从均匀分布，平均情况下时间代价为 O(n)。
> 桶排序将 [0, 1) 区间划分为 n 个相同大小的子区间，称为 **桶**。然后将 n 个输入按大小放入各个桶中，先对每个桶中的数进行排序，然后遍历输出每个桶中的数。

```cpp
BUCKET-SORT(A)
	n = A.length
	let B[0..n-1] be a new array
	for i = 0 to n-1
		make B[i] an empty list
	for i = 1 to n
		insert A[i] into list B[nA[i]]
	for i = 0 to n-1
		sort list B[i] with insertion sort
	concatenate the lists B[0],B[1],...,B[n-1] together in order
```

桶排序的时间代价为：
$T(n) = \Theta(n) + \sum^{n-1}_{i=0}O(n_i^2)$
期望运行时间：
$E[T(n)] = E\left[ \Theta(n) + \sum^{n-1}_{i=0}O(n_i^2) \right] = \Theta(n)+ \sum^{n-1}_{i=0}O(E[n_i^2])$

定义指示器随机变量 $X_{ij} = I\{A[j]~in~bucket~i\}$，则$n_i = \sum^n_{j=1}X_{ij}$，
$E[n^2_i] = E\left[ \left( \sum_{j=1}^n X_{ij} \right)^2 \right] = \sum^n_{j=1}E[X_{ij}^2] + \sum_{1\leq j \leq n} \sum_{1\leq k \leq n, k \neq j} E[X_{ij}X_{ik}]$

而$E[X_{ij}X_{ik}] = E[X_{ij}^2]=\frac{1}{n^2}$，$E[X_{ij}^2] = 1^2\cdot \frac{1}{n} + 0^2\cdot \left( 1-\frac{1}{n}) \right) = \frac{1}{n}$，
故$E[n^2_i] = 2 - 1/n$，桶排序的期望运行时间 $E[T(n)] = \Theta(n) + n\cdot O(2-1/n) = \Theta(n)$。

> 即使输入数据不服从均匀分布，只要所有桶的大小的平方和与元素数呈线性关系，期望运行时间就是$\Theta(n)$

## 中位数和顺序统计量

在一个由n个元素组成的集合中，第i个 **顺序统计量**（order statistic）是该集合中第i小的元素， **最小值** 是第一个顺序统计量， **最大值** 是第n个顺序统计量， **中位数** 是所属集合的“中点元素”。
> n为奇数时，中位数是唯一的；n为偶数时，存在两个中位数，分别为 **上中位数**和 **下中位数**。

**选择问题**定义为：

* **输入**：一个包含n个数的集合A和整数i（1<=i<=n）
* **输出**：元素$x\in A$，且A中恰好有i-1个其他元素小于它

### 最小值和最大值

```cpp
MINIMUM(A)
	min = A[1]
	for i = 2 to A.length
		if min > A[i]
			min = A[i]
	return min
```

* 找到最小值比较次数上界为 n-1
* 同时找出最大值和最小值比较次数上界为$3\lfloor n/2 \rfloor$
> 如果n为奇数，将最大值最小值设为第一个元素，成对比较其余元素，将较大者与最大值比较，将较小者与最小值比较；如果n为偶数，比较前两个，将最大值设为较大者，最小值设为较小者，此后继续成对比较。

### 期望为线性时间的选择算法

RANDOMIZED-SELECT以快速排序算法为模型，但只处理划分后的一边，期望运行时间为$\Theta(n)$。

```cpp
RANDOMIZED-SELECT(A, p, r, i)
	if p == r
		return A[p]
	q = RANDOMIZED-PARTITION(A, p, r)
	k = q-p+1
	if i == k	//the pivot value is the answer
		return A[q]
	else if i < k
		return RANDOMIZED-SELECT(A, p, q-1, i)
	else return RANDOMIZED-SELECT(A, q+1, r, i-k)
```

RANDOMIZED-SELECT的最坏情况运行时间为$\Theta(n^2)$，即使找最小元素也是如此，因为在每次划分时极不走运地总是按余下元素中最大的来进行划分，而划分操作需要$\Theta(n)$时间。

假设所有元素都是互异的，在期望线性时间内，我们可以找到任一顺序统计量，特别是中位数。即RANDOMIZED-SELECT算法的期望运行时间为$\Theta(n)$。
> 可通过定义子数组A[p..q]正好包含k个元素的顺序统计量来得到递归式并使用归纳法加以证明。直观地讲，因为平均每次只保留一半，每层调用的执行时间将是等比数列，求和后得到总时间为2n。

### 最坏情况为线性时间的选择算法

步骤如下：

1. 将n个元素划分为n/5组
2. 寻找每组的中位数
3. 使用SELECT找出上一步中找出的中位数的中位数x
4. 使用x作为主元执行PARTITION，则x为第k小的元素
5. 如果i==k，返回x；如果i<k，在低区调用SELECT找出第i小的元素；如果i>k，在高区调用SELECT查找第i-k小的元素

运行时间递归式为
$T(n) = 
\begin{cases}
O(1),~if~n<140\\\\
T(\lceil n/5 \rceil) + T(7n/10+6) + O(n),~if~n \geq 140
\end{cases}
$，解为$O(n)$

# 数据结构

## 栈和队列

**栈**（stack）实现的是一种后进先出策略。

```cpp
STACK-EMPTY(S)
	if S.top == 0
		return TRUE
	else return FALSE
	
 PUSH(S, x)
	S.top = S.top + 1
	S[S.top] = x

POP(S)
	if STACK-EMPTY(S)
		error "underflow"
	else S.top = S.top - 1
		return S[S.top +1]
```

**队列**（queue）实现的是一种先进先出策略。

```cpp
ENQUEUE(Q, x)
	Q[Q.tail] = x
	if Q.tail == Q.length
		Q.tail = 1
	else Q.tail = Q.tail + 1
	
DEQUEUE(Q)
	x = Q[Q.head]
	if Q.head == Q.length
		Q.head = 1
	else Q.head = Q.head + 1
	return x
```

### 链表

**双向链表**（doubly linked list）的每个元素都是一个对象，每个对象有一个关键字key和两个指针：next和prev。
> * 如果x.prev=NIL，则元素x没有先驱，因此是链表的第一个元素，即链表的 **头**（head）；如果x.next=NIL，则元素x没有后继，因此是链表的最后一个元素，即链表的 **尾**（tail）。
> * L.head 指向链表的第一个元素。如果L.head=NIL，则链表为空。
> * 如果一个链表是 **单链接的**（singly linked），则省略每个元素中的prev指针。

```cpp
LIST-SEARCH(L, k)
	x = L.head
	while x != NIL and x.key != k
		x = x.next
	return x
	
LIST-INSERT(L, x)
	x.next = L.head
	if L.head != NIL
		L.head.prev = x
	L.head = x
	x.prev = NIL

LIST-DELETE(L, x)
	if x.prev != NIL
		x.prev.next = x.next
	else L.head = x.next
	if x.next != NIL
		x.next.prev = x.prev
```

对于存在 **哨兵**（sentinel）的双向循环链表（circular，doubly linked list with a sentinel），L.nil.next指向表头，L.nil.prev指向表尾。
> 慎用哨兵，假如有许多个很短的链表，哨兵将造成严重的存储浪费。仅当可以真正简化代码时才使用哨兵。

```cpp
LIST-DELETE'(L, x)
	x.prev.next = x.next
	x.next.prev = x.prev

LIST-SEARCH'(L, k)
	x = L.nil.next
	while x != L.nil and x.key != k
		x = x.next
	return x
	
LIST-INSERT'(L, x)
	x.next = L.nil.next
	L.nil.next.prev = x
	L.nil.next = x
	x.prev = L.nil
```

### 指针和对象的实现

* 对象的单数组表示
* 对象的多数组表示
* 对象的分配与释放
	* **垃圾收集器**（garbage collector）负责确定哪些对象是未使用的。
	* 把自由对象保存在一个单链表中，称为 **自由表**（free list），自由表类似一个栈，下一个被分配的对象就是最后被释放的那个。
        
	```cpp
	//全局变量free指向自由表中的第一个元素
	ALLOCATE-OBJECT()
		if free == NIL
			error "out of space"
		else x = free
			free = x.next
			return x
			
	FREE-OBJECT(x)
		x.next = free
		free = x
	```
	
### 有根数的表示

**二叉树**T的属性p、left、right分别存放指向父结点、左孩子和右孩子的指针。
> 如果x.p = NIL，则x是根节点；如果x没有左孩子，则 x.left = NIL，右孩子的情况与此类似；属性T.root 指向整棵树T的根节点。如果T.root = NIL，则该树为空。

**分支无限制的有根数**可以使用 **左孩子有兄弟表示法**（left-child，right-sibling representation）
> x.left-child 指向结点x最左边的孩子结点
> x.right-sibling 指向右侧相邻的兄弟结点。

树的其他表示方法：对一棵完全二叉树使用堆来表示，堆用一个单数组加上堆的最末结点的下标表示。

## 散列表

**散列表**（hash table）是实现了字典操作（INSERT，SEARCH，DELETE）的一种有效数据结构。在一些合理的假设下，在散列表中查找一个元素的平均时间是 O(1) 。

### 直接寻址表

在直接寻址方式下，具有关键字k的元素被放在槽k中。
> 为表示动态集合，我们用一个称为 **直接寻址表**（direct-address table）的数组，记为 T[0..m-1]。数组中的位置称为 **槽**（slot），每个槽对应全域U中的一个关键字。如果该集合中没有关键字为k的元素，则 T[k]=NIL。

几个字典操作：

```cpp
DIRECT-ADDRESS-SEARCH(T, k)
	return T[k]

DIRECT-ADDRESS-INSEART(T, x)
	T[x.key] = x
	
DIRECT-ADDRESS-DELETE(T, x)
	T[x.key]=NIL
```

### 散列表

在散列方式下，具有关键字k的元素方舟子槽 h(k) 中。即利用 **散列函数**（hash function）h，由关键字 k 计算出槽的位置。函数h将关键字的全域U映射到 **散列表**（hash table）T的槽位上：
h: U -> {0,1,...,m-1}

#### 通过链接法解决冲突

```cpp
CHAINED-HASH-INSERT(T, x)
	insert x at the head of list T[h(x.key)]

CHAINED-HASH-SEARCH(T, k)
	search for an element with key k in list T[h(k)]
	
CHAINED-HASH-DELETE(T, x)
	delete x from the list T[h(x.key)]
```

#### 链接法散列的分析

* 定义一个能存放n个元素的，具有m个槽位的散列表T的 **装载因子**（load factor）$\alpha = n/m$。
* 简单均匀散列（simple uniform hashing）：任何一个给定元素等可能地散列到m个槽位中的任何一个，且与其他元素被散列到什么位置上无关。

在简单均匀三列的假设下，对于用链接法解决冲突的散列表，一次不成功查找的平均时间为 $\Theta(1+\alpha)$。
> 对于一次不成功的查找，首先计算槽位置 h(k)，时间为 $\Theta(1)$；然后遍历该槽上链表中的所有元素，平均个数为 $\alpha$。故一次不成功查找的平均时间为 $\Theta(1+\alpha)$。

在简单均匀三列的假设下，对于用链接法解决冲突的散列表，一次成功查找的平均时间为 $\Theta(1+\alpha)$。
> 同上，但是遍历槽上链表中的元素时，平均遍历个数为 $\alpha/2$，故一次成功查找的平均时间为 $\Theta(1+\alpha/2)=\Theta(1+\alpha)$。

### 散列函数

**好的散列函数的特点**

1. 满足简单均匀散列假设
1. 散列值在某种程度上应独立于数据可能存在的任何模式
1. 某些很近似的关键字具有截然不同的散列值

#### 除法散列法

h(k) = k mod m

当应用除法散列法时，要避免选择m的某些值（例如远离2的幂次）。
> 假设 $m=2^p-1$，k 为按基数$2^p$表示的字符串，则很容易证明，散列值只与字符串各字符ASCII值的和有关。

#### 乘法散列法

$h(k) = \lfloor m(kA \rm{mod}~1) \rfloor$，$0<A<1$

* 为存储方便，m一般选择2的幂次。
* A的最佳取值与待散列数据的特征有关。Knuth认为，$A \approx (\sqrt{5} -1)/2$

#### 全域散列法

任何一个特定的散列函数都可通过选择特定的关键字，使得n个关键字全部散列到同一个槽中，此时平均检索时间为$\Theta(n)$。为了避免这种情况，可以随机地选择散列函数，使之独立于要存储的关键字。这种方法称为 **全域散列**（universal hashing）

### 开放寻址法

在 **开放寻址法**（open addressing）中，所有的元素都存放在散列表里，每个表项包含动态集合中的一个元素，或者NIL。
> 此时，装载因子永远不会超过1。

为了插入一个元素，需要连续地检查散列表，称为 **探查**（probe）。
> 需要将散列函数加以扩充，将探查号作为第二个参数。对于每个关键字 k，产生 0~m-1 的探查序列（同样，m为槽数，n为元素数）。

```cpp
HASH-INSERT(T, k)
	i=0
	repeat
		j = h(k,i)	//j为探查序列的第i项的存储位置
		if T[j] == NIL
			T[j]=k
			return j
		else i=i+1
	until i==m
	error "hash table overflow"

HASH-SEARCH(T, k)
	i=0
	repeat
		j=h(k,i)
		if T[j] == k
			return j
		i = i+1
	until T[j] == NIL or i==m
	return NIL
```

删除操作比较困难。可以将删除的元素赋值为DELETED而不是NIL，使得在此仍可以插入元素，而SEARCH则会跳过该槽。
> 此时，查找时间不再依赖于装载因子了。为此，在必须删除关键字的应用中，更常见的做法是采用链接法来解决冲突。

####  线性探查

在 **线性探查**（linear probing）中，采用散列函数：
$h(k, i) = (h'(k) +i )\rm{mod}~m,~i=0,1,...,m-1$

> 随着连续被占用的槽不断增加，平均查找时间随之增加。称为 **一次群集**（primary clustering）。

#### 二次探查

在 **二次探查**（quadratic probing）中，采用散列函数：
$h(k, i) = (h'(k) + c_1 i + c_2 i^2 ) \rm{mod}~m$

> 在二次探查中，如果两关键字的初始探查位置相同，在他们的探查序列也是相同的。称为 **二次群集**（secondary clustering）。

#### 双重散列

**双重散列**（double hashing）是用于开放寻址法的最好方法之一。采用如下散列函数
$h(k,i) = (h_1(k) + ih^2(k)) \rm{mod}~m$

#### 开放寻址散列的分析

给定一个装载因子为$\alpha$的开放寻址散列表，并假设均匀散列，则对于一次不成功的查找，期望的探查次数至多为$1/(1-\alpha)$。
> 对于不成功的查找，第j次查找相当于在 m-(j-1) 个未探查的槽中，查找 n-(j-1) 个元素中的任一个。

给定一个装载因子为$\alpha$的开放寻址散列表，平均情况下，向一个装载因子为 $\alpha$ 的开放寻址散列表中插入一个元素至多需要做 $1/(1-\alpha)$ 次探查。

对于一个装载因子为$\alpha<1$的开放寻址散列表，一次成功查找中的探查期望数至多为$\frac{1}{\alpha} \ln \frac{1}{1-\alpha}$。

### 完全散列

**完全散列**（perfect hashing）进行查找时，能在最坏情况下用 O(1) 次访存完成。
> 采用两级的散列方法设计完全散列方案。

## 二叉搜索树

### 什么是二叉搜索树

**二叉搜索树**：对任何结点x，其左子树中的关键字最大不超过x.key，其右子树中的关键字最小不低于x.key。
> 二叉搜索树不一定是平衡的，其操作时间为 O(h)。当其非常不平衡时，O(h) 将远远超过 O(lg n)。

**中序遍历**（inorder tree walk）：输出的子树根的关键字位于其左子树的关键字值和右子树的关键字值之间。
> 类似， **先序遍历**（preorder tree walk）中输出根的关键字在其子树的关键字之前； **后序遍历**（postorder tree walk）输出的根的关键字在其子树的关键字之后。

```cpp
INORDER-TREE-WALK(x)
	if x != NIL
		INORDER-TREE-WALK(x.left)
		print x.key	
		INORDER-TREE-WALK(x.left)
```

### 查询二叉搜索树

#### 查找关键字k

> 输入一个指向树根的指针x和关键字k，如果这个结点存在，TREE-SEARCH返回一个指向关键字为k的结点的指针；否则返回NIL。

```cpp
TREE-SEARCH
	if x==NIL or k==x.key
		return x
	if k < x.key
		return TREE-SEARCH(x.left, k)
	else return TREE-SEARCH(x.right, k)
```

或者采用非递归方式
> 在大多数计算机，接待版本的效率要高得多

```cpp
ITERATIVE-TREE-SEARCH(x, k)
	while x!=NIL and k!=x.key
		if k<x.key
			x = x.left
		else x = x.right
	return x
```

#### 查找最小和最大元素

```cpp
TREE-MINIMUM(x)
	while x.left != NIL
		x = x.left
	return x
	
TREE-MAXIMUM(x)
	while x.right != NIL
		x = x.right
	return x
```

#### 先驱和后继

```cpp
TREE-SUCCESSOR(x)
	if x.right != NIL	//右子树存在：返回右子树最小值
		return TREE-MINIMUM(x, right)
	y = x.p
	while y != NIL and x == y.right	//右子树不存在：返回第一个在右侧的祖父结点
		x = y
		y = y.p
	return y
```

在一棵高度为h的二叉搜索树上，动态集合上的操作 SEARCH、MINIMUM、MAXIMUM、SUCCESSOR和PREDECESSOR可以在O(h)时间内完成。

### 插入和删除

#### 插入

```cpp
TREE-INSERT(T, z)
	y = NIL
	x = T.root
	while x != NIL
		y = x
		if z.key < x.key
			x = x.left
		else x = x.right
	z.p = y
	if y == NIL
		T.root = z
	elseif z.key < y.key
		y.left = z
	else y.right = z
```

#### 删除

从二叉搜索树T中删除结点x分为以下4中情况：

1. x无左子树
	使用x的右子树代替x
2. x无右子树
	使用x的左子树代替x
3. x右子树无左子树
	使用x的右子树代替x，x的左子树作为x右子树的左子树
4. x右子树有右子树
	使用x的右子树代替x，递归右子树的左子树直至NIL，x的左子树代替这个NIL

> 左子树（如果有的话）应放在右子树的MINIMUM处。

在一棵高度为h的二叉搜索树上，动态集合上的操作 TREE-INSERT、TREE-DELETE可以在O(h)时间内完成。


### 随机构建二叉搜索树

**随机构建二叉搜索树**（randomly built binary search tree）为按随机次序插入这些关键字到一棵初始的空树而生成的树，这里输入关键字的 n! 个排列中的每个都是等可能地出现。

* 我们用 $X_n$ 表示一棵有n个不同关键字的二叉搜索树的 **高度**
* **指数高度**（exponential height）定义为$Y_n = 2^{X_n}$
* 关键字的 **秩**（rank）$R_n$代表该关键字在排好序的集合中占据的位置

## 红黑树

### 红黑树的性质

**红黑树**（red-black tree）是许多“平衡”搜索树中的一种，可以保证在最坏情况下基本动态集合操作的时间复杂度为 O(lg n)。

一棵红黑树是满足下面 **红黑性质**的二叉搜索树：

1. 每个结点或是红色的，或是黑色的
2. 根结点是黑色的
3. 每个叶结点（NIL）都是黑色的
4. 如果一个结点是红色的，则它的两个子结点都是黑色的
5. 对每个结点，从该结点到其所有后代叶结点的简单路径上，均包含相同数目的黑色结点

> 从某个结点x出发到达一个叶结点的任意一条简单路径上的黑色结点个数称为该结点的 **黑高**（black-height），记为 bh(x)。定义 **红黑树的黑高**为其根节点的黑高。

一棵有n个内部结点的红黑树的高度至多为 $2\lg (n+1)$。

## 数据结构的扩张

通过存储额外信息的方法来扩张一种标准的数据结构，然后对这种数据结构，编写新的操作来支持所需要的应用。

### 动态顺序统计

修改红黑树，使得可以在 O(lg n) 时间内确定任何顺序统计量。给每个结点x添加一个属性size保存以x为根的子树的结点个数。

#### 查找具有给定秩的元素

过程OS-SELECT(x, i)返回一个指针，指向以x为根的子树中包含第i小关键字的结点。

```cpp
OS-SELECT(x, i)
	r = x.left.size + 1
	if i == r
		return x
	elseif i< r
		return OS-SELECT(x.left, i)
	else return OS-SELECT(x.right, i-r)
```

#### 确定一个元素的秩

过程OS-RANK返回对T中序遍历对应的线性序列中x的位置。

```cpp
OS-RANK(T, x)
	r = x.left.size +1
	y = x
	while y != T.root
		if y == y.p.right
			r = r + y.p.left.size +1
		y = y.p
	return r
```

### 如何扩张数据结构

扩张一种数据结构可以分为四个步骤

1. 选择一种基础数据结构
2. 确定基础数据结构中要维护的附加信息
3. 检验基础数据结构上的基本修改操作能否维护附加信息
4. 设计一些新的操作

设f是n个结点的红黑树T扩张的属性，且假设对任一结点x，f的值仅依赖于结点x、x.left、x.right的信息，还可能包括x.left.f和x.right.f。那么我们可以在插入和删除操作期间对T的所有节点的f值进行维护，并且不影响这两个操作 O(lg n) 的渐近时间性能。

### 区间树

通过扩张红黑树来支持由区间构成的动态集合上的一些操作：

* INTERVAL-INSEART(T, x)：将包含区间属性int的元素x插入到区间树T中
* INTERVAL-DELETE(T, x)：从区间树T中删除元素x
* INTERVAL-SEARCH(T, i)：返回一个指向区间树T中元素x的指针，使 x.int 与 i 重叠；若此元素不存在，则返回 T.nil

> **区间三分率**（interval trichotomy）：1. i 与 i' 重叠；2. i 在 i' 的右边；3. i 在 i' 的左边
> **高端点**（high endpoint）：i.hight
> **低端点**（low endpoint）：i.low
> **重叠**（overlap）：i.low <= i'.high 且 i'.low <= i.high

附加信息：在结点x中添加属性 max，它是以x为根的子树中所有区间端点的最大值。

新的操作：INTERVAL-SEARCH(T, i)，用来查找树T中与区间i重叠的那个结点，若不存在返回哨兵 T.nil 的指针。

```cpp
INTERVAL-SEARCH(T, i)
	x = T.root
	while x!=T.nil and i does not overlap x.int
		if x.left != T.nil and x.left.max >= i.low
			x = x.left
		else
			x = x.right
	return x
```

# 高级设计和分析技术

## 动态规划

动态规划方法通常用来求解 **最优化问题**（optimization problem），通常有四个步骤：

1. 刻画一个最优解的特征
2. 递归地定义最优解的值
3. 计算最优解的值
4. 利用计算出的信息构造一个最优解

> **动态规划**（dynamic programming）与分治方法相似，都是通过组合子问题的解来求解原问题。区别在于分治法的子问题互不相交，而动态规划应用于子问题重叠的情况。

### 钢条切割问题

问题定义：给定一段长度为n的钢条和价格表$p_i (i=1,2,...,n)$，求切割钢条方案，使得销售收益$r_n$最大。

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

扩展 BOTTOM-UP-CUT-ROD 算法，计算最大收益$r_j$同时，记录最优解对应的第一段钢条的切割长度 $s_j$。

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

### 矩阵链乘法

**矩阵链乘法**（matrix-chain multiplication problem）可描述如下：给定n个矩阵的链 <A1,A2,...An>，矩阵 Ai 的规模为 $p_{i-1}\times p_i$，求完全括号化方案，使得计算乘积 A1A2...An 所需的标量乘法次数最少。

我们称有如下性质的矩阵乘积链为 **完全括号化**（fully parenthesized）：它是单一矩阵，或者两个完全括号化的矩阵乘积链的积，且已外加括号。括号化方案的数量与n呈指数关系，通过暴力搜索穷尽所有可能的括号化方案来寻找最优方案，是一个糟糕的策略。

> 一个例子，计算三个矩阵连乘{A1，A2，A3}；维数分别为10*100 , 100*5 , 5*50
> 按此顺序计算需要的次数（（A1*A2）*A3）:10X100X5+10X5X50=7500次
> 按此顺序计算需要的次数（A1*（A2*A3））:10X5X50+10X100X50=75000次
> 所以问题是：如何确定运算顺序，可以使计算量达到最小化。

子问题：令m[i][j]表示第i个矩阵至第j个矩阵这段的最优解。
如果i=j，则m[i][j]这段中就一个矩阵，需要计算的次数为0；
如果i>j，则m[i][j]=min{m[i][k]+m[k+1][j]+p[i-1]Xp[k]Xp[j]}，其中i<=k<j ;

注意计算顺序，保证在计算 m[i][j] 的时候，m[i][k]和m[k+1][j]已经计算出来了。

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

给定一个有向图 G=(V,E) 和两个顶点 $u,~v\in V$。
**无权最短路径**：找到一条从 u 到 v 的边数最少的路径。这条路径必然是简单路径。
**无权最长路径**：找到一条从 u 到 v 的边数最多的路径，这条路径要求是简单路径。

无权最短路径具有最优子结构性质，而无权最长路径没有该性质。原因在于，虽然最长路径问题和最短路径问题的解都用到了两个子问题，但两个最长简单路径子问题是相关的，而两个最短路径子问题是 **无关的**（independent）。

如果递归算法反复求解相同的子问题，我们就称最优化问题具有 **重叠子问题**（overlapping subproblems）性质。与之相反，适合用分治方法求解的问题通常在递归的每一步都生成全新的问题。直接的递归算法无疑会重复计算每个子问题，而带备忘的递归算法可以达到与带备忘自顶向下的动态规划算法相似的效率。

### 最长公共子序列

给定一个序列X[1..m]，另一个序列Z[1..k]满足如下条件时称为X的子序列：存在一个严格递增的X的下标序列 i[1..k] ，对所有的 1<=j<=k，满足 x[i[j]] = z[j]。

c[i,j]表示X[i]和Y[j]的 **最长公共子序列**（longest commen subsequence，LCS），根据 LCS 的最优子结构性质，可得到如下公式
$
c[i,j] = \begin{cases}
0,~if~i=0~or~j=0\\\\
c[i-1,j-1]+1,~if~i,j>0~and~x_i=y_j\\\\
max(c[i,j-1],c[i-1,j]),~if~i,j>0~and~x_i\neq y_j
\end{cases}
$

通过动态规划的方法，可以先求解表c，再根据表c构造LCS。

> 另外，对于LCS算法，每个c[i,j]只依赖于c[i-1,j], c[i,j-1], c[i-1,j-1]和x,y的关系，用这些可以在常数时间内计算c[i,j]，因此完全可以去掉表c，只需要常量的存储。

### 最优二叉搜索树

**最优二叉搜索树**（optimal binary search tree）：给定一个n个不同关键字的已排序的序列K，希望构造一棵二叉搜索树。每个关键字都有一个概率表示其搜索频率，我们希望该二叉搜索树的期望搜索代价最小。

最优子结构：如果一棵最优二叉搜索树T有一棵子树T‘，那么T'必然是其包含的关键字构成的子问题的最优解。递归式为：
$
e[i,j] = \begin{cases}
q_{i-1},~if~j=i-1\\
\min_{i\leq r \leq j} \{ e[i,r-1]+e[r+1,j]+w(i,j) \},~if~i\leq j
\end{cases}
$

可以通过类似矩阵链乘的算法进行求解，时间复杂度也是$\Theta(n^3)$。

## 贪心算法

### 活动选择问题

问题描述：假定有n个 **活动**（activity）的集合S，这些活动使用同一资源（即同一时刻只供一个活动使用）。每个活动有一个 **开始时间**（s[i]）和 **结束时间**（f[i]），在 **活动选择问题**中，我们希望选出一个最大兼容活动集。假定活动已按结束时间递增排序。

#### 动态规划法

$S_{ij}$ 表示结束时间在活动 i 结束后 j 开始前的活动集合，c[i,j] 表示 $S_{ij}$ 的最优解的大小，则
$
c[i,j]=\begin{cases}
0,~if S_{ij} = \emptyset\\\\
max\{ c[i,k]+c[k,j]+1 \},~if S_{ij} \neq \emptyset
\end{cases}
$
可以通过带备忘的递归算法，或者自底向上法填写表项。

#### 贪心选择

加入无需求解所有子问题就可以选择一个活动加入最优解，将省去上式中考察所有选择的过程，即 **贪心选择**。$S_k={a_i\in S: s_i \geq f_k}$ 为在 $a_k$ 结束后开始的任务集合。

递归贪心算法 RECURSIVE-ACTIVITY-SELECTOR 的输入为两个数组 s 和 f，表示活动的开始和结束时间，下标 k 指出要求解的子问题 $S_k$，以及问题规模 n。返回 $S_k$ 的一个最大兼容活动集。求解原问题可以调用 RECURSIVE-ACTIVITY-SELECTOR(s,f,0,n)。

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

### 赫夫曼编码

我们考虑一种 **二进制字符编码**（或简称 **编码**）的方法，每个字符用唯一二进制串表示，称为 **码字**。 **变长编码**（variable-length code）可以达到比 **定长编码**好得多的压缩率，其思想是赋予高频字符短码字，赋予低频字符长码字。

在 **前缀码**（prefix code）中，没有任何码字是其他码字的前缀。此时编码文件的开始码字是无歧义的。我们可以简单地识别出开始码字，将其转换回原字符，然后对编码文件剩余部分重复这种解码过程。解码过程可以用二叉树方便地表示。

给定编码树 T，定义 $d_T(c)$ 为字母表 C 中字符 c 的叶结点的深度，即 c 的码字长度。定义 T 的 **代价**：
$B(T) = \sum_{c\in C} c.freq \cdot d_T(c)$

**赫夫曼编码**（Huffman code）是一种使用贪心算法构造的最优前缀码。C是n个字符的集合，C中的每个字符c有一个属性c.freq给出其出现频率。Q为以freq为关键字的最小优先队列。

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
假定 Q 使用最小二叉堆实现，则堆操作时间为 O(n)，HUFFMAN的运行时间为 O（n lg n)，如果将最小二叉堆换为 van Emde Boas 树，可以将运行时间将为 O(n lg lg n)。

####HUFFMAN算法的正确性

引理1：令C为一个字母表，其中的每个字符c有一个频率c.freq。x和y为频率最低的两个字符。那么存在C的一个最优前缀码，x和y有相同的码字长度，且只有最有一个二进制位不同。
> 叶结点都会成对出现。因为如果出现单独的叶结点，用该结点替换其父结点，可以得到更优的树。
> 不会有任何结点深于频率最低的x和y。因为假如存在这样一个z，那么调换x与z，可以得到更优的树。
> 所以x和y可以位于最低的那两个叶结点上。

引理2：令C为一个字母表，其中的每个字符c有一个频率c.freq。x和y为频率最低的两个字符。令 C' 为 C 去掉 x 和 y，加入 z(z.freq = x.freq+y.freq) 得到的字母表。T‘ 为 C’ 的一个最优前缀码对应的编码树。则将T' 的z替换为一个有x和y子节点的内部结点得到的树T，表示C的一个最优前缀码。
> 因为 B(T) = B(T') + x.freq + y.freq，这样的替换将产生确定的代价差额。故T'是最优的可以得到T是最优的（由引理1可以得到总是存在这样的替换）。


# 高级数据结构

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

# 图算法

## 基本的图算法

### 图的表示

图 G=(V,E) 可以用两种标准表示方法表示。

1. **邻接链表**：由一个包含 |V| 条链表的数组 Adj 构成，每个结点有一条链表。
	>**权重图**：直接将边 (u,v) 的权重值 w(u,v) 存放在 u 的邻接链表里。
	>邻接链表表示 **稀疏图**（边的条数|E|远小于$|V|^2$）时非常紧凑。
2. **邻接矩阵**：由$|V|\times |V|$的矩阵 $A=(a_{ij})$ 表示：
	$a_{ij}=
	\begin{cases}
	1,~if~(i,j)\in E\\\\
	0,~other
	\end{cases}
	$
	>邻接矩阵更适合表示 **稠密图**、需要快速判断任意两个点是否相连的图。
	
### 广度优先搜索

**广度优先搜索**是最简单的图搜索算法之一，也是许多重要的图算法的原型。算法需要发现所有距离源点s为k的结点之后，才会发现距离源点s为k+1的结点。

u.color 记录结点u的颜色，u.pi 记录u的前驱结点，u.d 记录广度优先搜索计算出的与源点s的距离。

```cpp
BFS(G,s)
	for each vertex u in G.V ={s}
		u.color = WHITE
		u.d = MAX
		u.pi = NIL
	s.color = GRAY
	s.d = 0
	s.pi = NIL
	Q = NULL
	ENQUEUE(Q,s)
	while Q != NULL
		u = DEQUEUE(Q)
		for each v in G.Adj[u]
			if v.color == WHITE
				v.color = GRAY
				v.d = u.d + 1
				v.pi = u
				ENQUEUE(Q,v)
		u.color = BLACK
```
扫描邻接链表的总时间为 O(E)，初始化成本为 O(V)，故BFS的总运行时间为 O(V+E)。

#### 最短路径

**最短路径距离** $\delta(s,v)$为从源点s到结点v之间所有路径里面最少的边数。称从源点s到结点v的长度为$\delta(s,v)$的路径为 **最短路径**。

**引理** 给定有向图或无向图G=(V,E)，任意结点$s\in V$，则对于任意边 $(u,v) \in E$，$\delta(s,v)\leq \delta(s,u)+1$。

**引理** 给定有向图或无向图G=(V,E)，任意结点$v\in V$，$v.d \geq \delta(s,v)$。

**引理** 设BFS的队列Q为 <v1,v2,...,vr>，则 $v_r.d \leq v_1.d +1$，并且对于 i=1,2,...,r-1，$v_i.d \leq v_{i+1}.d$。
> 即队列中前面的 d 不大于后面的，且首位差距不超过 1。

**定理** 给定有向图或无向图G=(V,E)，BFS将发现所有从源点s可到达的结点v，且对任意 $v\in V$，v.d = \delta(s,v)$。s 到 v.pi 的最短路径加上边(v.pi,v) 为一条 s 到 v的最短路径。

#### 广度优先树

**前驱子图**：$G_\pi  = (V_\pi, E_\pi)$，其中 $V_\pi = \{ v\in V: v.\pi \neq NIL \} \cup \{ s \}$，$E_\pi = \{ (v.\pi,v): v \in V_\pi - \{ s \} \}$。

**引理** 给定有向图或无向图G=(V,E)，BFS过程建造出来的 pi 属性使得前驱子图 $G_\pi  = (V_\pi, E_\pi)$ 称为一棵广度优先树。

打印广度优先树

```cpp
PRINT-PATH(G,s,v)
	if v == s
		print s
	elseif v.pi == NIL
		print "no path from" s "to" v "exists"
	else PRINT-PATH(G,s,v.pi)
		print v
```

### 深度优先搜索

**深度优先搜索的前驱子图**：$G_\pi  = (V, E_\pi)$，其中 $E_\pi = \{ (v.\pi,v): v \in V~and~v.\pi \neq NIL\}$。

深度优先搜索会在每个结点盖上两个 **时间戳**：第一个时间戳 v.d 记录v第一次被发现的时间（涂上灰色）；第二个时间戳 v.f 记录完成对 v 的邻接链表扫描的时间（涂上黑色）。

DFS输入G是无向图或有向图，time为全局变量用来计算时间戳。

```cpp
DFS(G)
	for each vertex u in G.V
		u.color = WHITE
		u.pi = NIL
	time = 0
	for each vertex u in G.V
		if u.color == WHITE
			DFS-VISIT(G,u)

DFS-VISIT(G,u)
	time++
	u.d = time
	u.color = GRAY
	for each v in G:Ajd[u]
		if v.color == WHITE
			v.pi = u
			DFS-VISIT(G,v)
	u.color = BLACK
	time++
	u.f = time
```
初始化时间为 $\Theta(V)$，遍历邻接链表时间为 $\Theta(E)$，故算法运行时间为 $\Theta(V+E)$。

#### 深度优先搜索的性质

**定理** 在对有向图或无向图 G=(V,E) 进行DFS时，对任意结点 u 和 v：以下三种情况只有一种成立：

1. [u.d,u.f]与[v.d,v.f]完全分离：深度优先森林中，u与v互相不为对方后代
2. [u.d,u.f]完全包含于[v.d,v.f]：深度优先森林中，u是v的后代
3. 与2相反的情况

**推论** 在深度优先森林中，v是u的真后代当且仅当 u.d<v.d<v.f<u.f。

**白色路径定理**：在G的深度优先森林中，v是u的后代当且仅当发现u时，存在u到v的由全部由白色结点构成的路径。

#### 边的分类

1. **树边**：深度优先森林 $G_\pi$ 的边。
2. **后向边**：结点u连接到所在深度优先树中一个祖先结点v的边。
3. **前向边**：结点u连接到所在深度优先树中一个后代结点v的边。
4. **横向变**：其他所有的边。

第一次探索边 (u,v) 时，结点v的颜色会反应边的信息：

1. v 为白色：(u,v) 为树边
2. v 为灰色：(u,v) 为后向边
3. v 为白色：(u,v) 为前向边或横向边

**定理** 对无向图G进行DFS时，每条边要么是树边，要么是后向边
> 有向图中的横向边在无向图中成为树边或后向边。

### 拓扑排序

**拓扑排序**是G中所有结点的一种线性排序，满足：如果G包含边(u,v)，则u在拓扑排序中处于结点v的前面。

如下算法完成对有向无环图的拓扑排序：

```cpp
TOPOLOGICAL-SORT(G)
	call DFS(G) to compute finishing times v.f for each vertex v
	as each vertex is finished, insert it onto the front of a linked list
	return the linked list of vertex
```

**引理** 有向图G是无环的当且仅当对其DFS不产生后向边。

### 强连通分量

有向图G=(V,E)的 **强连通分量**为一个最大结点集合 $C \subset V$，对于该集合中任意两点可以互相到达。

定义图G=(V,E)的转置为$G^T=(V,E^T)$，其中 $E^T = \{ (u,v): (v,u) \in E \}$。下面的线性时间（$\Theta(V+E)$）算法使用两次DFS计算G的强连通分量。分别运行在G和$G^T$上。

```cpp
STRONGLY-CONNECTED-COMPONENTS(G)
	call DFS(G) to compute finishing times u.f for each vertex u
	compute G^T
	call DFS(G^T), but in the main loop of DFS, consider the vertices in order of decreasing u.f
	output the vertices of each tree in the DFS forest formed in line 3 as a separate strongly connected component
```
> 对G的DFS建立了深度优先森林，计算 $G^T$ 将该森林中所有边反转，对 $G^T$ 的DFS选择从上述森林的根结点出发，尝试到达原来的叶结点，能走通的结点加入到强连通分量。

**引理** C和C'为G的两个不同的强连通分量，$u,v\in C$，$u‘,v’\in C‘$。如果G包含u到u’的路径，则不可能包含 v' 到 u' 的路径。

**引理** C和C'为G的两个不同的强连通分量，如果存在边 $(u,v)\in E$，$u\in C$，$v\in C'$，则 f(C)>f(C')。
> 定义d(U)和f(U)为U中所有结点最早和最晚发现时间。

**推论** C和C'为G的两个不同的强连通分量，如果存在边 $(u,v)\in E^T$，$u\in C$，$v\in C'$，则 f(C)<f(C')。


## 最小生成树

对于连同无向图G=(V,E)，我们希望找到一个五环子集 $T\subsetE$，既能将所有结点连接起来，又具有最小的权重（$w(T)=\sum_{(u,v)\in T}w(u,v)$），由于T无环，T必然是一棵树，称为图G的 **生成树**，求取该生成树的问题为 **最小生成树问题**。

### 最小生成树的形成

在每一时刻生长最小生成树的一条边，并维护如下循环不变式：
> 在每次循环之前，边集合A是某棵最小生成树的一个子集。

这样不破坏循环不变式的的边(u,v)称为集合A的 **安全边**。

```cpp
GENERIC-MST(G,w)
	A=NULL
	while A does not form a spanning tree
		find an edge(u,v) that is safe for A
		A = A U {(u,v)}
	return A
```

无向图G=(V,E)的一个 **切割**(S,V-S)是集合V的一个划分。如果一条边 $(u,v)\in E$ 的一个端点位于S，另一个端点位于V-S，则称该边 **横跨**该切割。如果集合A中不存在横跨该切割的边，则称该切割 **尊重**集合A。在横跨一个切割的所有边中，权重最小的边称为 **轻量级边**。

**定理** 设G=(V,E)是一个在边E上定义了实数权重函w的连通无向图。A为E的子集，且在G的某棵最小生成树中。(S,V-S)为尊重集合A的任意一个切割。(u,v)是横跨该切割的一条轻量级边。则边(u,v)对于集合A是安全的。
> 假设(u.v)不在最小生成树T中，因u v必然在树中相连，故(u,v)与树中两者的连线构成环。至少有两边横跨该切割，一边为(u,v)，设另一边为(x,y)。考虑新的一棵生成树：T'=T-{(x,y)}+{(u,v)}，因(u,v)是轻量级边，故w(T')不大于w(T)，即T'也是最小生成树。显然(x,y)不在A中，于是A与(u,v)都在T'中，即(u,v)对于集合A是安全的。

**推论** 设G=(V,E)是一个在边E上定义了实数权重函w的连通无向图。A为E的子集，且在G的某棵最小生成树中。设 $C=(V_C,E_C)$为森林 $G_A=(V,A)$ 中的一棵树。如果边(u,v)是连接C 和 $G_A$ 中其他树的一条轻量级边，则该边对于A是安全的。

### Kruskal算法和Prim算法

#### Kruskal算法

在所有连接森林中两棵不同树的边里面，找到权重最小的加入最小生成树。Kruskal算法属于贪心算法。

FIND-SET(u)用来返回包含u的集合的代表元素，UNION过程对两棵树进行合并，判断FIND-SET(u)==FIND-SET(v)可知两点是否在同一集合。

```cpp
MST-KRUSKAL(G,w)
	A=NULL
	for each vertex v in G.V
		MAKE-SET(v)	//each tree contains one vertex
	sort the edges of G.E into nondecreasing order by weight w
	for each edge(v,u) in G.E, taken in nondecreasing order by weight w
		if FIND-SET(u) != FIND-SET(v)
			A = A U {(u,v)}
			UNION(u,v)
	return A
```
共有O(E)个FIND-SET和UNION操作，|V|个MAKE-SET操作，故总运行时间为 O(E lgV + V lgV) = O(E lgE)（对于连通图：$E \geq V-1$）。注意到 $|E|<|V|^2$，运行时间为O(E lgV)。

#### Prim 算法

集合A中的边总是构成一棵树，每次选择一条轻量级边加入A。Prim算法属于贪心算法。

所有不在A中的结点存放于以key为权值的最小优先队列Q中。对每一个结点v，v.key保存连接v和树中结点的所有边中最小边的权重。

```cpp
MST-PRIM(G,w,r)	//对于任意指定的根结点r，都可生成拥有同样边集合的树
	for each u in G.V
		u.key = MAX
		u.pi = NIL
	r.key = 0
	Q = G.V
	while Q!=NULL
		u = EXTRACT-MIN(Q)
		for each v in G.Adj[u]
			if v in Q and w(u,v) < v.key
				v.pi = u
				v.key = w(u,v)
```
> 每次循环结束后，保证了下一次循环中EXTRACT-MIN得到的u都是最小生成树中的结点（因为本次循环中(u,v)为轻量级边）。

建造堆的时间为 O(V)；EXTRACT-MIN的时间为 O(lg V)，遍历结点循环次数为 |V|；修改key用到的DECREASE-KEY在二叉最小堆的时间为 O(lg V)，在斐波那契堆的时间为 O(1)，遍历边循环次数为|E|。故算法MST-PRIM的运行时间为 O(V + V lgV + E lgV)=O(E lgV)（最小二叉堆实现）或者 O(E + V lgV)（斐波那契堆实现）。

##单源最短路径

在 **最短路径问题**中，给定一个带权重的有向图G=(V,E)和权重函数 $\omega: E \to \vec{\bm{R}}$，该函数将每条边映射到实数值的权重。
图中一条路径p的 **权重** w(p) 是构成该路径的所有边的权重之和：$\omega(p)=\sum_{i=1}^k \omega(v_{i-1},v_i)$。
从结点u到结点 v的 **最短路径权重** $\delta(u,v) = \begin{cases}\min\{\omega(p):u\to v\},\quad if~there~is~a~path~from~u~to~v}\\\\ \infty,\quad other\end{cases}$
**最短路径的最优子结构性质**：两个结点之间的一条最短路径包含着其他的最短路径。

**最短路径问题的几个变体**

* **单源最短路径问题**：给定一个图G=(V,E)，找到从给定 **源点** $s\inV $ 到每个结点 $v\in V$ 的最短路径。
* **单目的地最短路径问题**：找到从每个结点 v 到给定 **目的地**结点 t 的最短路径。
* **单结点对最短路径问题**：找到给定结点 u 到给定结点 v 的最短路径。
* **所有结点对最短路径问题**：对于每对结点 u 和 v，找到从结点 u 到结点 v 的最短路径。

**引理**（最短路径的子路径也是最短路径）给定带权重的有向图G=(V,E)和权重函数 $\omega: E \to \vec{\bm{R}}$。设 $p=<v_0,v_1,..,v_k>$ 为从结点 v0 到结点 vk 的一条最短路径，并且对于任意 i 和 j，$0\leq i \leq j\leq k$，设 $p_{ij} = <v_i,v_{i+1},...,v_j>$ 为路径p中从结点 vi 到结点 vj 的子路径。那么 $p_{ij}$ 是从结点 vi 到结点 vj 的一条最短路径。

**负权重的边**
如果图G不包含从源点s可到达的权重为负的环路，则对所有结点，最短路径权重都有精确定义；如果从结点s到结点v的某条路经上存在权重为负的环路，我们定义$\delta(s,v)=-\infty$。

**环路**
最短路径不能包含权重为正值的环路。

**最短路径表示**
**前驱子图** $G_\pi = (V_\pi, E_\pi)$，其中 $V_\pi = \{ v\in V: v.\pi \neq \rm{NIL} \} \cup \{s\}$，$V_\pi = \{ (v.\pi,V) \in E: v\in V_\pi - \{s\}\}$。
算法终止时，$G_\pi$是一棵“最短路径树”：有根结点的树，包括了从源结点 s 到每个可以从 s 到达的结点的一条最短路径。

**松弛操作**

对每个结点维护一个属性 v.d，记录从源结点 s 到结点 v 的最短路径权重的上界。称为 **最短路径估计**。
使用 $\Theta(V)$ 运行时间的算法对最短路径估计和前驱结点初始化：

```cpp
INITIALIZE-SINGLE-SOURCE(G,s)
	for each vertex v in G.V
		v.d = MAX
		v.pi = NIL
	s.d = 0
```

对一条边(u,v)的 **松弛**操作：

```cpp
RELAX(u,v,w)
	if v.d > u.d+w(u,v)
		v.d = u.d+w(u,v)
		v.pi = u
```

### Bellman-Ford算法

Bellman-Ford算法解决的是一般情况下的单源最短路径问题。该算法返回TRUE当且仅当输入图不包含可以从源结点到达的权重为负值的环路。

```cpp
BELLMAN-FORD(G,w,s)
	INITIALIZE-SINGLE-SOURCE(G,s)
	for i=1 to |G.V|-1
		for each edge(u,v) in G.E
			RELAX(u,v,w)
	for each edge(u,v) in G.E
		if v.d>u.d+w(u.v)
			return FALSE
	return TRUE
```
总运行时间为 O(VE)。

**推论** 设G=(V,E)为一个带权重的源结点为s的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$。图G不包含从 s 可以到达的权重为负值的环路，则对于所有结点 v，存在一条从 s 到 v 的路径当且仅当 BELLMAN-FRD 算法终止时有 $v.d<\infty$。

**定理**（Bellman-Ford算法的正确性）设BELLMAN-FORD算法运行在一带权重的源结点为 s 的有向图 G=(V,E) 上，该图的权重函数为 $\omega: E \to \vec{\bm{R}}$。如果图G不包含从 s 可以到达的权重为负值的环路，则算法返回 TRUE，且对于所有结点 v，前驱子图 $G_\pi$ 是一棵根为 s 的最短路径树。如果G包含一条从 s 可以到达的权重为负值的环路，则算法返回FALSE。

### 有向无环图中的单源最短路径问题

根据结点的拓扑排序次序来对带权重的有向无环图 G=(V,E) 进行边的松弛操作，便可以在 $\Theta(V+E)$ 时间内计算出从单个源结点到所有结点之间的最短路径。每次对一个结点进行处理时，我们队从该结点发出的所有边进行松弛操作。

```cpp
DAG-SHORTEST-PATHS(G,w,s)
	topologically sort the vertices of G
	INITIALIZE-SINGLE-SOURCE(G,s)
	for each vertex u, taken in topologically sorted order
		for each vertex v in G.Adj[u]
			RELAX(u,v,w)
```
算法的总运行时间为$\Theta(V+E)$。

**定理** 如果带权重无环路的有向图G=(V,E)有一个源结点s，则在算法DAG-SHORTEST-PATHS终止时，对于所有结点v，我们有 $v.d=\delta(s,v)$，且前驱子图 $G_\pi$ 是一棵最短路径树。

### Dijkstra 算法

Dijkstra算法解决的是带权重的有向图上单源最短路径问题，该算法要求所有边的权重都为非负值。Dijkstra 算法在运行过程中维持的关键信息是一组结点集合S：从源结点 s 到该集合中每个结点之间的最短路径已经被找到。

```cpp
DIJKSTRA(G,w,s
	INITIALIZE-SINGLE-SOURCE(G,s)
	S=NULL
	Q=G.V
	while Q!=NULL
		u = EXTRACT-MIN(Q)
		S=S U {u}
		for each vertex v in G.Adj[u]
			RELAX(u,v,w)
```

**定理**（Dijkstra算法的正确性）Dijkstra算法运行在带权重的有向图G=(V,E)时，如果所有权重为非负值，则在算法终止时，对于所有结点 u，有 $u.d=\delta(s,u)$。
> 可通过循环不变式证明：4~8行的while语句每次循环开始前，对于每个结点 $v \in S$，有 $v.d = \delta(s,v)$。
> Q中最小结点所有连接到S的路径已被探测过，且pi已经标记为最短路径上的前驱结点。

**推论** 如果在带权重的有向图G=(V,E)上运行Dijkstra算法，其中的权重皆为非负值，源点为s，则在算法终止时，前驱子图 $G_\pi$ 是一棵根结点为 s 的最短路径树。

Dijkstra算法的时间复杂度同最短路径的 Prim 算法，依赖于最小优先队列的实现：

* 数组实现：$O(V^2+E)=O(V^2)$
* 最小二叉堆实现：$O((V+E) \lg V)=O(E\lg V)$
* 斐波那契堆实现：$O(V\lg V + E)$

### 差分约束和最短路径

####线性规划

寻找一个 n 维向量 x，使得在由 $Ax\leq b$（A为$m \times n$矩阵，b为m维向量）给定的m个约束条件下优化目标函数 $\sum^n_{i=1} c_i x_i$（c为n维向量，“优化”通常是指取值最大）。
> 有时我们并不关注目标函数，而是仅仅希望找到一个 **可行解**。

#### 差分约束系统

在一个 **差分约束系统**中，线性规划矩阵A的每一行只包括一个1和一个-1，其他项为0。因此 $Ax \leq b$ 所给出的约束条件变为 m 个涉及 n 个变量的 **差额限制条件**。其中每个条件可以表示为：$x_j-x_i \leq b_k$。这里 $1 \leq i,j \leq n,~i \neq j,~1\leq k \leq m$。

**引理** 设向量 $x = (x_1,x_2,...,x_n)$ 为差分约束系统 $Ax \leq b$ 的一个可行解，设 d 为任意常数，则 x+d 也睡该差分约束系统的一个解。

给定差分约束系统 $Ax \leq b$，其对应的 **约束图**是一个带权重的有向图 G=(V,E)，其中：
$V=\{ v_0,v_1,...,v_n \}$
$E = \{ (v_i,v_j): x_j-x_i \leq b_k~is~a~constraint  \} \cup \{ (v_0,v_1),(v_0,v_2),...,(v_0,v_n) \}$。

**定理** 给定差分约束系统 $Ax \leq b$，设G=(V,E)是该系统对应的约束图，如果G不包含权重为负的环路，则
$x = (\delta(v_0,v_1),\delta(v_0,v_2),...,\delta(v_0,v_n))$
为该系统的一个可行解。如果图G包含权重为负值的环路，该系统没有可行解。
> 对任意一条边(vi,vj)，根据三角不等式，$\delta(v_0,j_j) \leq \delta(v_0,v_i) + \omega(v_i,v_j)$，即 $\delta(v_0,v_j) - \delta(v_0,v_i) \leq w(v_i,v_j)$，即 $x_j - x_i \leq b_k$。

### 最短路径性质

#### 三角不等式性质

**引理**（三角不等式）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，源点为s。则对于所有边 $(u,v)\in E$，我们有：
$\delta(s,v) \leq \delta(s,u) + \omega(u,v)$

#### 最短路径估计值的松弛效果

**引理**（上界性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，源点为s。该图由算法 INITIALIZE-SINGLE-SOURCE(G,s)执行初始化。那么对于所有结点 $v \in V, v.d \geq \delta(s,v)$，并且该不变式在对图G的边进行任何次序的松弛过程中保持成立。而且一旦v.d取得其下界将不再变化。

**推论**（非路径性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，假定从源结点 s 到给定结点 v 之间不存在路径，则在该图由算法 INITIALIZE-SINGLE-SOURCE(G,s)进行初始化后，我们有 $v.d = \delta(s,v) = \infty$，并且该等式一直维持到G的所有松弛操作结束。

**引理** 设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$。那么对边 $(u,v) \in E$ 进行 RELAX(u,v,w)后，有 $v.d \deq u.d + \omega(u,v)$。
> 这即是松弛操作所做的工作。

**引理**（收敛性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，s为某个源点，$s \to u \to v$ 为G中的一条最短路径。假定G由INITIALIZE-SINGLE-SOURCE(G,s)初始化，并在这之后做了一系列松弛操作，其中包括对边(u,v)的松弛操作 RELAX(u,v,w)。如果在对边(u,v)进行松弛操作前的任意时刻有 $u.d = \delta(s,u)$，则在该松弛操作之后的所有时刻有 $v.d = \delta(s,v)$。

**引理**（路径松弛性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，s为某个源点，考虑从s到vk的任意一条最短路径$p=<v_0,v_1,...,v_k>$。如果G由INITIALIZE-SINGLE-SOURCE(G,s)进行初始化，并在这之后进行了一系列的松弛操作，包括对 $(v_0,v_1),(v_1,v_2),...,(v_{k-1},v_k)$ 按照所列次序而进行的松弛操作，则在这些操作后我们有 $v_k.d =  \delta(s,v_k)$，并且该等式一直保持成立。该性质的成立与其他边的松弛操作及次序无关。
>使用归纳法证明。

#### 松弛操作与最短路径树

**引理** 设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，s为某个源点，假定图中不包含从s可以到达的权重为负值的环路，则在图G由INITIALIZE-SINGLE-SOURCE(G,s)进行初始化之后，前驱子图 $G_\pi$ 形成根为s的有根树，并且对任何对G的边进行的任意松弛操作都将维持该性质不变。

**引理**（前驱子图性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{\bm{R}}$，s为某个源点，假定图中不包含从s可以到达的权重为负值的环路，由INITIALIZE-SINGLE-SOURCE(G,s)对G进行初始化，然后对G的边进行任意次序的松弛操作。该松弛操作序列将针对所有结点生成 $v.d = \delta(s,v)$，则前驱子图 $G_\pi$ 形成根为s的最短路径树。
> 可用 cut & paste 证明。


## 所有结点对的最短路径问题

**前驱结点矩阵** $\Pi = (\pi_{ij})$，其中 $\pi_{ij}$ 在 i=j 或 i到j不存在路径时为 NIL，其他情况为 i 到 j 最短路径上j的前驱结点。对每个结点 i，定义图G对于结点 i 的 **前驱子图**为 $G_{\pi,i} = (V_{\pi,i}, E_{\pi,i})$，其中
$V_{\pi,i} = \{ j \in V: \pi_{i,j} \neq NIL\} \cup \{ i \},\quad E_{\pi,i} = \{ (\pi_{ij},j): j \in V_{\pi,i} - \{i\}\}$
如果 $G_{\pi,i}$是一棵最短路径树，如下算法将打印 i 到 j 的一条最短路径。

```cpp
PRINT-ALL-PAIRS-SHORTEST-PATH(PI, i, j)
	if i==j
		print i
	elseif PI[i,j] == NIL
		print "no path from" i "to" j "exists"
	else PRINT-ALL-PAIRS-SHORTEST-PATH(PI, i, PI[i,j])
		print j j
```

### 最短路径和矩阵算法

#### 递归解

定义 $l_{ij}^{(m)}$ 为 i 到 j 的至多包含 m 条边的所有路径中最小的权重，则：
$l_{ij}^{(0)} = \begin{cases}
0 \quad if~i=j\\\\
\infty \quad if~i\neq j
\end{cases}$

$l_{ij}^{(m)} = \min_{1\leq k \leq n}\{ l_{ik}^{(m-1)} + \omega_{kj} \}$，其中 $\omega_{jj} = 0$

而最短路径由下式给出：
$\delta(i,j) = l_{ij}^{(n-1)}$

#### 算法实现

设 $L^{(m)} = (l^{(m)}_{ij})$，则 $L^{(1)} = (\omega_{ij})$。下面伪代码程序可以在给定 $W=(\Omega_{ij})$和 $L^{(m-1)}$ 的情况下，计算 $L^{(m)}$（将最短路径扩展一条边）。

```cpp
EXTEND-SHORTEST-PATHS(L,W)
	n = L.rows
	let L' be a new nXn matrix
	for i=1 to n
		for j=1 to n
			l'[i,j] = MAX
			for k=1 to n
				l'[i,j] = min(l'[i,j], l[i,k]+w[k,j])
	return L'
```
该算法运行时间为 $\Theta(n^3)$。

下面伪代码程序在 $\Theta(n^4)$ 时间内计算出 $L^{(n-1)}$：

```cpp
SLOW-ALL-PAIRS-SHORTEST-PATHS(W)
	n = W.rows
	L1 = W
	for m=2 to n-1
		let Lm be a new nXn matrix
		Lm = EXTEND-SHORTEST-PATHS(L(m-1),W)
	return L(n-1)
```

#### 矩阵转换

注意到递归式相似于矩阵相乘的规则：$c_{ij} = \sum_{k=1}^n a_{ik} \cdot b_{kj}$。且算法结构与 SQUARE-MATRIX-MULTIPLY(A,B) 一致。可以使用矩阵乘法的交换性改进算法性能。仅用 $\lceil \lg (n-1) \rceil$ 次矩阵乘积计算矩阵 $L^{(n-1)}$。计算方法如下：

$L^{(1)} = W$
$L^{(2)} = L^{(1)} \cdot L^{(1)}$
$L^{(4)} = L^{(2)} \cdot L^{(2)}$
$\cdot \cdot \cdot$

下面过程使用 **重复平方**技术来计算上述矩阵序列。

```cpp
FASTER-ALL-PAIRS-SHORTEST-PATHS(W)
	n=W.rows
	L(1) = W
	m = 1
	while m < n-1
		let L(2m) be a new nXn matrix
		L(2m) = EXTEND-SHORTEST-PATHS(L(m), L(m))
		m = 2m
	return L(m)
```
算法运行时间为 $\Theta(n^3 \lg n)$

### Floyd-Warshall 算法

#### 递归解

设 $d_{ij}^{(k)}$ 为 i 到 j 的中间结点都在 {1,2,...,k} 的最短路径的权重。显然 $d_{ij}^{(0)}=\omega_{ij}$，
$d_{ij}^{(k)} = \begin{cases}
\omega_{ij} \quad k=0\\\\
\min\left(d_{ij}^{(k-1)},d_{ik}^{(k-1)} + d_{kj}^{(k-1)}\right) \quad k \geq 1
\end{cases}$

矩阵 $D^{(n)} = (d_{ij}^{(n)})$ 给出了 $\delta(i,j) = d_{ij}^{(n)}$。

#### 算法实现

Floyd-Warshalll 算法将所有点编号，逐个加入结果矩阵。输入为 $n\times n$ 的矩阵 W，算法返回最短路径权重矩阵 $D^{(n)}$。

```cpp
FLOYD-WARSHALL(W)
	n = W.rows
	D(0) = W
	for k=1 to n
		let D(k) be a new nXn matrix
		for i=1 to n
			for j=1 to n
				d[i,j](k) = min(d[i,j](k-1), d[i,k](k-1) + d[k,j](k-1))
	return D(n)
```
该算法运行时间为 $\Theta(n^3)$。

#### 构建最短路径

我们可以在计算矩阵 $D^{(k)}$ 的同时计算前驱矩阵 $\Pi$，下面给出 $\pi_{ij}^{(k)}$ 的递归式：

$\pi_{ij}^{(0)} = \begin{cases}
NIL \quad if~i=j ~ or ~ \omega_{ij}=\infty \\\\
i \quad if~i \neq j ~ and ~ \omega_{ij}<\infty
\end{cases}$

$\pi_{ij}^{(k)} = \begin{cases}
\pi_{ij}^{(k-1)} \quad  if~d_{ij}^{(k-1)} \leq d_{ik}^{(k-1)} + d_{kj}^{(k-1)}\\\\
\pi_{kj}^{(k-1)} \quad if~d_{ij}^{(k-1)} > d_{ik}^{(k-1)} + d_{kj}^{(k-1)}
\end{cases}$

#### 有向图的传递闭包

定义图G的 **传递闭包**为图 $G^* = (V, E^*)$，其中 $E^* = \{ (i,j): \quad if there is a path from i to j in G \}$。有两种方法可以求得G的传递闭包：

1. 给E中所有边赋值1，运行 Floyd-Warshall 算法。时间复杂度为 $\Theta(n^3)$。
> 如果存在 i 到 j 的路径，则 $d_{ij} < n$，否则，$d_{ij} = \infty$。时间复杂度为 $\Theta(n^3)$。

2. 我们定义：如果图G中 i 到 j 的路径的中间结点都取自 {1,2,...,k}，则 $t_{ij}^{(k)} = 1$；否则为 0 。
	构建传递闭包 $G^*$ 的方法为：将(i,j) 置于 $E^*$ 当且仅当 $t_{ij}^{(n)} = 1$。其递归定义如下：
	$t_{ij}^{(0)} = \begin{cases}
	0 \quad if~i\neq j~and~(i,j)\in E\\\\
	1 \quad if~i=j~or~(i,j) \in E
	\end{cases}$
	$t_{ij}^{(k)} = t_{ij}^{(k-1)} \lor ( t_{ik}^{(k-1)} \land t_{kj}^{(k-1)}) \quad if~k \geq 1$
> 即使用逻辑或操作（$\lor$）和逻辑与操作（$\land$）替换 Floyd-Warshall 算法中的 min 和 +。

如 Floyd-Warshall 算法一样，我们以 k 递增的次序来计算矩阵 $T^{(k)} = (t_{ij}^{(k)})$。

```cpp
TRANSITIVE-CLOSURE(G)
	n = |G.V|
	let T(0) be a new nXn matrix
	for i=1 to n
		for j=1 to n
			if i==j or (i,j) in G.E
				t[i,j](0)=1
			else
				t[i,j](0)=0
	for k=1 to n
		let T(k) be a new nXn matrix
		for i=1 to n
			for j=1 to n
				t[i,j](k) = t[i,j](k-1) or (t[i,k](k-1) and t[k,j](k-1))
	return T(n)
```

### 用于稀疏图的 Johnson 算法
Johnson算法使用的技术成为 **重新赋予权重**：

1. 如果图G的所有边权重为非负值，对每个结点运行一次 Dijkstra 算法得到最短路径。使用斐波那契堆时的算法运行时间为 $V^2 \lg V + VE$。
2. 如果图G包含权重为负的边，但没有负值环路，那么只有计算出一组非负权重值，然后使用同样的方法。
> 新赋予的权重应满足下面两个性质：
> 1. 对所有结点对，其最短路径不能因权重的变化而变化。
> 2. 对所有边，新权重 $w'(u,v)$ 非负。

#### 定义新的权重

1. 定义 $w'(u,v) = w(u,v) + h(u) - h(v)$，则路径权重 $w'(p) = \sum_{i=1}^k w'(v_{i-1}, v_i) = w(p) + h(v_0) - h(v_k)$。即对于同样的结点对，各路径权重增加一个常数，其大小关系不发生变化。

2. 定义图 G' = (V',E')，其中 $V'=V \cup \{s\}$（s 为新结点），$E' = E \cup \{ (s,v):~v\in V \}$。对所有结点 $v \in V'$，定义 $h(v) = \delta(s,v)$，则根据三角不等式 $h(v)\leq h(u)+w(u,v)$，即新的权重 $w'(u,v) = w(u,v)+h(u)-h(v) \geq 0$。

#### 算法实现

```cpp
JOHNSON(G,w)
	compute G'
	for v in G.V
		w(s,v) = 0 
	if BELLMAN-FORD(G',w,s) == FALSE
		print "the input graph contains a negative-weight cycle"
	else
		for each v in G'.V
			h(v) = delta(s,v) computed by the Bellman-Ford algorithm
		for each (u,v) in G'.V
			w'(u,v) = w(u,v) + h(h) - h(v)
		let D be a new nXn matrix
		for each u in G.V
			run DIJKSTRA(G,w',u) to compute delta'(u,v) for v in G.V
			for each v in G.V
				d[u,v] = delta'[u,v] + h(v) -h(u) //recover the weight
	return D
```

使用斐波那契堆实现 Dijkstra 算法的最小优先队列，则 Johnson 算法的运行时间为 $O(V^2 \lg V + VE)$；使用二叉最小堆实现则运行时间为 $O(VE \lg V)$。在稀疏图情况下，仍比 Floyd-Warshall 算法的时间表现好。


