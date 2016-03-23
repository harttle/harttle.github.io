---
layout: blog
title:  算法导论笔记 - 数据结构
tags: 栈 指针 数组 算法 链表 队列 二叉树 哈希表 字符串 红黑树 线段树 全局变量
---

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

<!--more-->

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

## 哈希表

**哈希表**（hash table）是实现了字典操作（INSERT，SEARCH，DELETE）的一种有效数据结构。在一些合理的假设下，在哈希表中查找一个元素的平均时间是 O(1) 。

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

### 哈希表

在哈希方式下，具有关键字k的元素方舟子槽 h(k) 中。即利用 **哈希函数**（hash function）h，由关键字 k 计算出槽的位置。函数h将关键字的全域U映射到 **哈希表**（hash table）T的槽位上：
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

#### 链接法哈希的分析

* 定义一个能存放n个元素的，具有m个槽位的哈希表T的 **装载因子**（load factor）$\alpha = n/m$。
* 简单均匀哈希（simple uniform hashing）：任何一个给定元素等可能地哈希到m个槽位中的任何一个，且与其他元素被哈希到什么位置上无关。

在简单均匀三列的假设下，对于用链接法解决冲突的哈希表，一次不成功查找的平均时间为 $\Theta(1+\alpha)$。
> 对于一次不成功的查找，首先计算槽位置 h(k)，时间为 $\Theta(1)$；然后遍历该槽上链表中的所有元素，平均个数为 $\alpha$。故一次不成功查找的平均时间为 $\Theta(1+\alpha)$。

在简单均匀三列的假设下，对于用链接法解决冲突的哈希表，一次成功查找的平均时间为 $\Theta(1+\alpha)$。
> 同上，但是遍历槽上链表中的元素时，平均遍历个数为 $\alpha/2$，故一次成功查找的平均时间为 $\Theta(1+\alpha/2)=\Theta(1+\alpha)$。

### 哈希函数

**好的哈希函数的特点**

1. 满足简单均匀哈希假设
1. 哈希值在某种程度上应独立于数据可能存在的任何模式
1. 某些很近似的关键字具有截然不同的哈希值

#### 除法哈希法

h(k) = k mod m

当应用除法哈希法时，要避免选择m的某些值（例如远离2的幂次）。
> 假设 $m=2^p-1$，k 为按基数$2^p$表示的字符串，则很容易证明，哈希值只与字符串各字符ASCII值的和有关。

#### 乘法哈希法

$h(k) = \lfloor m(kA \rm{mod}~1) \rfloor$，$0<A<1$

* 为存储方便，m一般选择2的幂次。
* A的最佳取值与待哈希数据的特征有关。Knuth认为，$A \approx (\sqrt{5} -1)/2$

#### 全域哈希法

任何一个特定的哈希函数都可通过选择特定的关键字，使得n个关键字全部哈希到同一个槽中，此时平均检索时间为$\Theta(n)$。为了避免这种情况，可以随机地选择哈希函数，使之独立于要存储的关键字。这种方法称为 **全域哈希**（universal hashing）

### 开放寻址法

在 **开放寻址法**（open addressing）中，所有的元素都存放在哈希表里，每个表项包含动态集合中的一个元素，或者NIL。
> 此时，装载因子永远不会超过1。

为了插入一个元素，需要连续地检查哈希表，称为 **探查**（probe）。
> 需要将哈希函数加以扩充，将探查号作为第二个参数。对于每个关键字 k，产生 0~m-1 的探查序列（同样，m为槽数，n为元素数）。

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

在 **线性探查**（linear probing）中，采用哈希函数：
$h(k, i) = (h'(k) +i )\rm{mod}~m,~i=0,1,...,m-1$

> 随着连续被占用的槽不断增加，平均查找时间随之增加。称为 **一次群集**（primary clustering）。

#### 二次探查

在 **二次探查**（quadratic probing）中，采用哈希函数：
$h(k, i) = (h'(k) + c_1 i + c_2 i^2 ) \rm{mod}~m$

> 在二次探查中，如果两关键字的初始探查位置相同，在他们的探查序列也是相同的。称为 **二次群集**（secondary clustering）。

#### 双重哈希

**双重哈希**（double hashing）是用于开放寻址法的最好方法之一。采用如下哈希函数
$h(k,i) = (h_1(k) + ih^2(k)) \rm{mod}~m$

#### 开放寻址哈希的分析

给定一个装载因子为$\alpha$的开放寻址哈希表，并假设均匀哈希，则对于一次不成功的查找，期望的探查次数至多为$1/(1-\alpha)$。
> 对于不成功的查找，第j次查找相当于在 m-(j-1) 个未探查的槽中，查找 n-(j-1) 个元素中的任一个。

给定一个装载因子为$\alpha$的开放寻址哈希表，平均情况下，向一个装载因子为 $\alpha$ 的开放寻址哈希表中插入一个元素至多需要做 $1/(1-\alpha)$ 次探查。

对于一个装载因子为$\alpha<1$的开放寻址哈希表，一次成功查找中的探查期望数至多为$\frac{1}{\alpha} \ln \frac{1}{1-\alpha}$。

### 完全哈希

**完全哈希**（perfect hashing）进行查找时，能在最坏情况下用 O(1) 次访存完成。
> 采用两级的哈希方法设计完全哈希方案。

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

### 线段树

通过扩张红黑树来支持由区间构成的动态集合上的一些操作：

* INTERVAL-INSEART(T, x)：将包含区间属性int的元素x插入到线段树T中
* INTERVAL-DELETE(T, x)：从线段树T中删除元素x
* INTERVAL-SEARCH(T, i)：返回一个指向线段树T中元素x的指针，使 x.int 与 i 重叠；若此元素不存在，则返回 T.nil

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


