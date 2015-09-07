---
layout: blog
categories: reading
title: 快速排序的时间和空间复杂度
tags: 算法 C++ 排序
excerpt: 平均情况下快速排序的时间复杂度是nlgn，最坏情况是n^2，但通过随机算法可以避免最坏情况。由于递归调用，快排的空间复杂度是lgn。
---

> Wikipedia: [快速排序][qsort]是由东尼霍尔所发展的一种排序算法。在平均状况下，排序n个项目要Ο(n log n)次比较。
> 在最坏状况下则需要Ο(n2)次比较，但这种状况并不常见。事实上，快速排序通常明显比其他Ο(n log )算法更，
> 因为它的内部循环（inner loop）可以在大部分的架构上很有效率地被实现出来。

快速排序是每个程序员都应当掌握的排序算法。当然我们接触的第一个排序算法可能是插入排序或者冒泡排序，但数据量一旦超过几万，插入和冒泡的性能会非常差。这时时间复杂度的渐进优势就表现出来了。
**平均情况下快速排序的时间复杂度是$\Theta(n\lg n)$，最坏情况是$n^2$，但通过随机算法可以避免最坏情况。由于递归调用，快排的空间复杂度是$\Theta(\lg n)$**。

<!--more-->

# 快排的思路

快速排序算法其实很简单，采用分治策略。步骤如下：

1. 选取一个基准元素（pivot）
2. 比pivot小的放到pivot左边，比pivot大的放到pivot右边
3. 对pivot左边的序列和右边的序列分别递归的执行步骤1和步骤2

伪码表示也很直观：

```
QUICKSORT(A, p, r)
    if p < r    
        q = PARTITION(A, p, r)
        QUICKSORT(A, p, q-1)
        QUICKSORT(A, q+1, r)

//将数组分为两部分，返回临界值下标
PARTITION(A, p, r)
    x = A[r]    //以最后一个数为主元（pivot element）
    i = p-1 //小于主元子数组的下标上限
    for j = p to r-1
        if A[j] <= x
            i = i+1 //增加小于主元子数组的大小
            exchange A[i] with A[j] //将A[j]加入小于主元的子数组
    exchange A[i+1] with A[r]   //将主元从数组末尾移动至子数组之间
    return i + 1
```

其实有比上述伪码更简单的算法，直接申请O(n)的空间，把左右两部分放到申请的空间中。
但上述算法维护了一个$[0, i]$的数组，其中所有元素都小于pivot。这使得空间占用从O(n)降到了O(lgn)，见下文。

# C++实现 

按照上述`PARTITION`过程，实现`quicksort`方法，用来排序数组`v`中的$[ begin, end )$部分。

```cpp
void quicksort(vector<int>& v, int begin, int end){
    if(end - begin<=1) return;
    int pivot = v[end-1], less_end = begin;

    for(int i=begin; i<end-1; i++)
        if(v[i]<pivot) swap(v[i], v[less_end++]);

    swap(v[end-1], v[less_end]);
    quicksort(v, begin, less_end);
    quicksort(v, less_end + 1, end);
}
```

实现思路是这样的：

1. 当只有一个元素时，它总是已经排好序的直接返回。
2. 取最后一个为`pivot`，比`pivot`小的元素存储在$[ 0, lessend )$中。
3. 遍历$[ begin, end-1 )$，如果它小于`pivot`就把它添加到$[ 0, lessend )$中，同时让`less_end++`。
4. 将`pivot`放到$[ 0, lessend )$的结尾。
5. 为$[ begin, lessend )$排序，此时`less_end`处的元素是`pivot`；同样为右边的$[ lessend + 1, end )$也排序。

上述`quicksort`是C++的实现方式，遵循STL风格。所有区间都是前闭后开的，它的调用方法也是STL风格的：

```cpp
quicksort(vec, 0, vec.size());
```

# 复杂度

平均情况下快速排序的时间复杂度是$\Theta(n\lgn)$，最坏情况是$\Theta(n^2)$。

当划分产生的两个子问题分别包含 n-1 和 0 个元素时，**最坏情况**发生。划分操作的时间复杂度为$\Theta(n)$，$T(0)=\Theta(1)$，这时算法运行时间的递归式为
$T(n) = T(n-1) + T(0) + \Theta(n) = T(n-1) + \Theta(n)$，解为$T(n) = \Theta(n^2)$。

当划分产生的两个子问题分别包含$\lfloor n/2 \rfloor$和$\lceil n/2 \rceil-1$个元素时，**最好情况**发生。算法运行时间递归式为
$T(n) = 2T(n/2) + \Theta(n)$，解为$T(n) = \Theta(n\lg n)$。

> 事实上只要划分是常数比例的，算法的运行时间总是$O(n\lg n)$。 假设按照 9:1 划分，每层代价最多为 cn，递归深度为 $\log_{10/9}n = \Theta(\lg n)$，故排序的总代价为$O(n\lg n)$。

平均情况下，比如一次坏的划分接着一次好的划分，坏的划分那一项可以合并到好的划分里，统计上来讲平均情况下的时间复杂度仍然是$\Theta(n\lg n)$。
更详细的平均情况下的讨论参见：[算法导论-排序和顺序统计量][intro2algo]。

快排的空间复杂度是$\Theta(\lgn)$，因为快排的实现是递归调用的， 而且每次函数调用中只使用了常数的空间，因此空间复杂度等于递归深度$\Theta(\lgn)$。

# 随机算法

可以通过在算法中引入随机性，使得算法对所有输入都能获得较好的期望性能。比如我们随机地选择pivot，这样上述的最坏情况就很难发生。
伪码描述是这样的：

```cpp
//新的划分程序，只是在真正进行划分前进行一次交换
RANDOMIZED-PARTITION(A, p, r)
	i = RANDOM(p, r)
	exchange A[r] with A[i]
	return PARTITION(A, p, r)
```

C++实现也很简单，只需要在排序前随机去一个元素和末端元素交换。

```cpp
void rand-quicksort(vector<int>& v, int begin, int end){
    if(end-begin<=1) return;

    int pindex = rand()%(end-begin) + begin;
    swap(v[end-1], v[pindex]);

    quicksort(v, begin, end);
}
```

随机算法保证了对任何的输入而言，都可以保证$\Theta(n\lg n)$的时间复杂度。

[qsort]: https://zh.wikipedia.org/wiki/%E5%BF%AB%E9%80%9F%E6%8E%92%E5%BA%8F
[intro2algo]: {% post_url 2013-10-28-introduction-to-algorithms %}
