---
title:  算法导论笔记 - 排序和顺序统计量
tags: 排序 数组 算法 队列 二叉树
---

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

<!--more-->

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

### 建堆

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

<script type="math/tex">
T(n) = \Theta(n) + \sum^{n-1}_{i=0} O(n_i^2)
</script>

期望运行时间：

<script type="math/tex; mode=display">
E[T(n)] = E\left[ \Theta(n) + \sum^{n-1}_{i=0}O(n_i^2) \right] = \Theta(n)+ \sum^{n-1}_{i=0}O(E[n_i^2])
</script>

定义指示器随机变量 

<script type="math/tex">
X_{ij} = I\{A[j]~in~bucket~i\}$，则$n_i = \sum^n_{j=1}X_{ij}
</script>

则：

<script type="math/tex; mode=display">
E[n^2_i]
    = E\left[ \left( \sum_{j=1}^n X_{ij} \right)^2 \right] 
    = \sum^n_{j=1}E[X_{ij}^2] + 
        \sum_{1\leq j \leq n} \sum_{1\leq k \leq n, k \neq j} E[X_{ij}X_{ik}]
</script>

同时，我们有：

<script type="math/tex; mode=display">
E[X_{ij}X_{ik}] = E[X_{ij}^2]=\frac{1}{n^2}
</script>

<script type="math/tex; mode=display">
E[X_{ij}^2] = 1^2\cdot \frac{1}{n} + 0^2\cdot \left( 1-\frac{1}{n}) \right) 
    = \frac{1}{n}
</script>

故 $E[n^2_i] = 2 - 1/n$，桶排序的期望运行时间为：

<script type="math/tex; mode=display">
E[T(n)] = \Theta(n) + n\cdot O(2-1/n) = \Theta(n)
</script>

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


