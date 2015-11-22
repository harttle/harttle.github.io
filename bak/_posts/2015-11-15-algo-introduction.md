---
layout: blog
categories: reading
title:  算法导论笔记 - 基础知识
tags: 算法 排序 插入排序 分治 归并排序
---

# 算法基础

## 插入排序

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

##分析算法

* 单处理器计算模型：随机访问机（random-access machine，RAM）：算数指令、数据移动指令、控制指令。
* 最坏情况、平均情况、增长量级

<!--more-->

##设计算法

###分治法

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

###分析分支算法

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

# 函数的增长

## 渐进记号

* $\Theta$：渐进地给出一个函数的上界和下界
* $O$：只有一个渐进上界
* $\Omega$：只有一个渐进下界
* $o$：非渐进紧确的上界
* $\omega$：非渐进紧确的下界

## 标准记号与常用函数

单调性 , 向下取整与向上取整 , 模运算 , 多项式 , 指数 , 对数 , 阶乘 , 多重函数：重复多次作用在初值上 , 多重对数函数 , 斐波那契数

# 分治策略

在分治策略中，我们递归地求解一个问题，在每层递归中应用如下三个步骤：

* 分解（divide）
* 解决（conquer）
* 合并（combine）

三种求解递归式的方法：

* 代入法：猜测一个界，用数学归纳法证明
* 递归树法：将递归式转换为一棵树，级数求和
* 主方法

## 最大子数组问题

### 暴力求解：$\Omega(n^2)$
### 分治策略求解
任何连续数组所处的位置必然是以下三种之一：

* 完全位于左子数组
* 完全位于右子数组
* 跨越了中点：可在线性时间内求出跨越中点的最大子数组

运行时间
$T(n)=\Theta(n\lg n)$

## 矩阵乘法的 Strassen 算法

### 直接计算
SQUARE-MATRIX-MULTIPLY：$T(n)=\Theta(n^3)$

### 简单的分治算法
$T(n)=\Theta(n^3)$，简单的分治算法并不由于直接的SQUARE-MATRIX-MULTIPLY过程。

### Strassen 算法
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

## 使用主方法求解递归式
对于递归式$T(n)=aT(n/b)+f(n)$，将函数$f(n)$与$n^{\log_ba}$进行比较：

* 若$f(n)$更大（在多项式意义上），解为$\Omega(f(n))$；
* 若$n^{\log_ba}$更大，解为$\Omega(n^{\log_ba})$；
* 若大小相当，解为$\Omega(f(n)\lg n)$。

# 概率分析和随机算法

## 雇用问题

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

### 最坏的情形

总费用为$O(c_hn)$

### 平均情形

* 平均情况运行时间：概率分布在算法的输入上
* 期望运行时间：算法本身做出随机选择

## 指示器随机变量

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

### 用指示器随机变量分析雇用问题

应聘者i比1到i-1更有资格的概率为1/i，因而$E[X_i]=1/i$

故雇佣总数为 $E[X] = E\left[\sum^n_{i=1} X_i \right] = \sum_{i=1}^n 1/i = \ln n$，雇佣费用平均情形下为$O(c_h \ln n)$

## 随机算法

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


