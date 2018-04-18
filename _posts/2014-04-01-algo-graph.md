---
title:  算法导论笔记 - 图算法
tags: Dijkstra 排序 算法 队列 最小生成树 单源最短路径 广度优先搜索 深度优先搜索
---

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
	

<!--more-->

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

在 **最短路径问题**中，给定一个带权重的有向图G=(V,E)和权重函数 
$\omega: E \to \vec{R}$ ，该函数将每条边映射到实数值的权重。
图中一条路径p的 **权重** w(p) 是构成该路径的所有边的权重之和：
$ \omega(p)=\sum\_{i=1}^k \omega(v_{i-1},v_i) $
从结点u到结点 v的 **最短路径权重**：

$$
\delta(u,v) = \begin{cases}\min\{\omega(p):u\to v\},\quad if~there~is~a~path~from~u~to~v\\\\ \infty,\quad other\end{cases}
$$

**最短路径的最优子结构性质**：两个结点之间的一条最短路径包含着其他的最短路径。

**最短路径问题的几个变体**

* **单源最短路径问题**：给定一个图G=(V,E)，找到从给定 **源点** $s\inV $ 到每个结点 $v\in V$ 的最短路径。
* **单目的地最短路径问题**：找到从每个结点 v 到给定 **目的地**结点 t 的最短路径。
* **单结点对最短路径问题**：找到给定结点 u 到给定结点 v 的最短路径。
* **所有结点对最短路径问题**：对于每对结点 u 和 v，找到从结点 u 到结点 v 的最短路径。

**引理**（最短路径的子路径也是最短路径）给定带权重的有向图G=(V,E)和权重函数 
$\omega: E \to \vec{R}$ 。设 $p=\<v_0,v_1,..,v\_k\>$ 
为从结点 v0 到结点 vk 的一条最短路径，并且对于任意 i 和 j，
$0\leq i \leq j\leq k$，设 $p\_{ij} = \<v_i,v_{i+1},...,v\_j>$ 
为路径p中从结点 vi 到结点 vj 的子路径。那么 $p_{ij}$ 是从结点 vi 到结点 vj 的一条最短路径。

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

**推论** 设G=(V,E)为一个带权重的源结点为s的有向图，其权重函数为 
$\omega: E \to \vec{R}$。图G不包含从 s 可以到达的权重为负值的环路，则对于所有结点 v，存在一条从 s 到 v 的路径当且仅当 BELLMAN-FRD 算法终止时有 $v.d<\infty$。

**定理**（Bellman-Ford算法的正确性）设BELLMAN-FORD算法运行在一带权重的源结点为 s 的有向图 G=(V,E) 上，该图的权重函数为 $\omega: E \to \vec{R}$。如果图G不包含从 s 可以到达的权重为负值的环路，则算法返回 TRUE，且对于所有结点 v，前驱子图 $G_\pi$ 是一棵根为 s 的最短路径树。如果G包含一条从 s 可以到达的权重为负值的环路，则算法返回FALSE。

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

**引理**（三角不等式）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$，源点为s。则对于所有边 $(u,v)\in E$，我们有：
$\delta(s,v) \leq \delta(s,u) + \omega(u,v)$

#### 最短路径估计值的松弛效果

**引理**（上界性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$，源点为s。该图由算法 INITIALIZE-SINGLE-SOURCE(G,s)执行初始化。那么对于所有结点 $v \in V, v.d \geq \delta(s,v)$，并且该不变式在对图G的边进行任何次序的松弛过程中保持成立。而且一旦v.d取得其下界将不再变化。

**推论**（非路径性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$，假定从源结点 s 到给定结点 v 之间不存在路径，则在该图由算法 INITIALIZE-SINGLE-SOURCE(G,s)进行初始化后，我们有 $v.d = \delta(s,v) = \infty$，并且该等式一直维持到G的所有松弛操作结束。

**引理** 设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$。那么对边 $(u,v) \in E$ 进行 RELAX(u,v,w)后，有 $v.d \leq u.d + \omega(u,v)$。
> 这即是松弛操作所做的工作。

**引理**（收敛性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$，s为某个源点，$s \to u \to v$ 为G中的一条最短路径。假定G由INITIALIZE-SINGLE-SOURCE(G,s)初始化，并在这之后做了一系列松弛操作，其中包括对边(u,v)的松弛操作 RELAX(u,v,w)。如果在对边(u,v)进行松弛操作前的任意时刻有 $u.d = \delta(s,u)$，则在该松弛操作之后的所有时刻有 $v.d = \delta(s,v)$。

**引理**（路径松弛性质）设G=(V,E)为一个带权重的有向图，其权重函数为 
$\omega: E \to \vec{R}$，s为某个源点，考虑从s到vk的任意一条最短路径
$p=<v_0,v_1,...,v\_k>$。如果G由 $INITIALIZE-SINGLE-SOURCE(G,s)$ 
进行初始化，并在这之后进行了一系列的松弛操作，包括对 
$(v\_0, v\_1), (v\_1,v\_2), ..., (v\_{k-1},v\_k)$ 按照所列次序而进行的松弛操作，
则在这些操作后我们有 $v\_k.d = \delta(s,v_k)$ ，
并且该等式一直保持成立。该性质的成立与其他边的松弛操作及次序无关。

>使用归纳法证明。

#### 松弛操作与最短路径树

**引理** 设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$，s为某个源点，假定图中不包含从s可以到达的权重为负值的环路，则在图G由INITIALIZE-SINGLE-SOURCE(G,s)进行初始化之后，前驱子图 $G_\pi$ 形成根为s的有根树，并且对任何对G的边进行的任意松弛操作都将维持该性质不变。

**引理**（前驱子图性质）设G=(V,E)为一个带权重的有向图，其权重函数为 $\omega: E \to \vec{R}$，s为某个源点，假定图中不包含从s可以到达的权重为负值的环路，由INITIALIZE-SINGLE-SOURCE(G,s)对G进行初始化，然后对G的边进行任意次序的松弛操作。该松弛操作序列将针对所有结点生成 $v.d = \delta(s,v)$，则前驱子图 $G_\pi$ 形成根为s的最短路径树。
> 可用 cut & paste 证明。


## 所有结点对的最短路径问题

**前驱结点矩阵** $\Pi = (\pi_{ij})$，其中 $\pi\_{ij}$
在 i=j 或 i到j不存在路径时为 NIL，其他情况为 i 到 j 最短路径上j的前驱结点。对每个结点 i，定义图G对于结点 i 的 **前驱子图**为 
$G\_{\pi,i} = (V_{\pi,i}, E_{\pi,i})$ ，其中
$V\_{\pi,i} = \{ j \in V: \pi\_{i,j} \neq NIL\} \cup \{ i \},\quad E\_{\pi,i} = \{ (\pi_{ij},j): j \in V_{\pi,i} - \{i\}\}$
如果 $G_{\pi,i}$ 是一棵最短路径树，如下算法将打印 i 到 j 的一条最短路径。

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

$l\_{ij}^{(m)} = \min\_{1\leq k \leq n}\{ l\_{ik}^{(m-1)} + \omega\_{kj} \}$，其中 $\omega_{jj} = 0$

而最短路径由下式给出：
$\delta(i,j) = l_{ij}^{(n-1)}$

#### 算法实现

设 $L^{(m)} = (l^{(m)}\_{ij})$，则 $L^{(1)} = (\omega_{ij})$。下面伪代码程序可以在给定 $W=(\Omega_{ij})$和 $L^{(m-1)}$ 的情况下，计算 $L^{(m)}$（将最短路径扩展一条边）。

```
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
	构建传递闭包 $G^\*$ 的方法为：将(i,j) 置于 $E^*$ 当且仅当 $t_{ij}^{(n)} = 1$。其递归定义如下：
	$t_{ij}^{(0)} = \begin{cases}
	0 \quad if~i\neq j~and~(i,j)\in E\\\\
	1 \quad if~i=j~or~(i,j) \in E
	\end{cases}$
	$t\_{ij}^{(k)} = t\_{ij}^{(k-1)} \lor ( t_{ik}^{(k-1)} \land t_{kj}^{(k-1)}) \quad if~k \geq 1$
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

```
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


