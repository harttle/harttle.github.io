---
title: 使用模逆元计算组合问题
tags: 模逆元 欧拉定理 费马小定理 扩展欧几里得算法
---

[模逆元][mmi]（modular multiplicative inverse）俗称模倒数，是指与原数的乘积和 1 同余的整数。即对于整数 $a$ 和 $n$：

$$
ax \equiv 1 \mod(n)
$$

x 就是 a 对于 n 的模逆元，因为除以一个数和乘以它的模倒数同余，就可以把除法转换为乘法。

> 存在性：，$a$ 与 $n$ 互质时模倒数存在，否则不存在。

这对于计算大数（10 以上）组合问题非常有效，适用于 [Sherlock and Permutations][sherlock-and-permutations] 和 [Matrix Tracing][matrix-tracing] 等问题，以及更基本的组合问题 ${n \choose m}$：由于这类问题的结果很大，通常只关心它对某个大质数 M（比如 $1e9 + 7$）的模，比如：

$$
{n \choose m} = C_n^m = \frac{n!}{m!(n-m)!} \mod{M}
$$

直接计算每一项的值可能会超出可用的内存，提前取模后又没法再相除。
当然你可以一边乘一边除来计算 $C_n^m$ 来避免溢出，但是对于更复杂的问题比如 $C_n^{m_1,m_2,m_3}$ 你还是会需要模逆元。利用模逆元，可以把上式转化为：


$$
{n \choose m} = C_n^m = n! \cdot Inv(m!) \cdot Inv((n-m)!) \mod{M}
$$

<!--more-->

转化为代码：

```cpp
typdef unsigned long long LL;
const LL M = 1000000007;

int comb(LL n, LL m) {
    LL a = 1, b = 1;
    for(int i = n + m; i > m; i--) a = a * i % M;
    for(int i = n; i > 1; i--) b = b * i % M;
    int x = modInverse(b, M)    // 模倒数的计算，见下文
    return a * x % M;
}
```

本文接下来的部分只讨论如何计算 $a$ 的模倒数，即 `modInverse` 的实现：

$$
x = a^{-1} \mod(n)
$$

## 暴力算法

暴力算法的思路是尝试每一个 x，直到找到了模逆元为止。复杂度是 $O(n)$：

```cpp
LL modInverse(LL a, LL M) {
    a %= M;
    for (LL x = 2; x < M; x++) {
        if (x * a % M == 1) return x;
    }
    return -1;
}
```

它的复杂度是 $O(M)$，对于 $M = 1e9 + 7$ 来讲是无法接受的。
下面我们通过费马小定理和扩展欧几里得算法两个方向来降低复杂度。

## 费马小定理

费马小定理（Fermat's Little Theorem）指出，小于质数 p 的整数的 p 次方和它自己对 p 同余：

$$
a^p \equiv a \mod(p)
$$

我们再做一个转换，可以看到 $a$ 的模倒数可以通过指数运算得到：

$$
x = a^{-1} \equiv a^{p - 2} \mod(p)
$$

也就是说 1000 对于 $1e9 + 7$ 的模倒数为 $1000^{1e9 + 7}$。
暴力计算的复杂度是 $O(p)$，下面介绍的**快速指数运算**可以把复杂度降低到 $O(\lg p)$。

## 快速指数运算

快速指数运算（fast exponentiation）的思路非常简单，就是递归的二分法。
比如计算 $2^{64}$ 只需要先计算 $2^{32}$ 再对它进行平方。直接上代码：

```cpp
LL expMod(LL a, LL p) {
    a %= M;
    if (p == 0) return 1;
    if (p & 1) return (a * expMod(a, p - 1)) % M;
    LL half = exp(a, p / 2);
    return half * half % M;
}
```

这样 $a$ 的模逆元 $x = a^{-1} \equiv a^{p - 2} \mod(p)$ 就是：

```cpp
int modInverse(LL a, LL M) {
    return expMod(a, M - 2) % M;
}
```

它的复杂度是 $lg M$，这样组合算法的复杂度为 $O(n + lg M)$，前者 $O(n)$ 来自 `comb()` 函数里的阶乘。

## 欧拉定理

费马小定理成立的条件是模 n 为质数，如果 n 不是质数呢？
只要 n 和 a 互质（即模逆元存在），我们就可以使用费马小定理的泛化形式“欧拉定理”：

$$
a^{\varphi(n)} = 1 \mod(n)
$$


其中 $\varphi(n)$ 是欧拉函数表示小于 n 的数中与 n 互质的自然数的个数。

使用欧拉定理的关键在于计算欧拉函数 $\varphi(n)$，如果使用辗转相除法来判定，找到 n 以内的欧拉函数值复杂度为 $O(n * lgn)$。
对于典型的 $n = 1e9$ 的量级计算量太大，而且欧拉定理要求合数 n 和 a 互质，
所以欧拉定理通常并不实用（如果 n 为质数可以直接应用费马小定理）。

**和费马小定理的关系**

费马小定理是欧拉定理在 n 为质数时的特殊形式，这时 $\varphi(n) = n - 1$），代入得到：

$$
a^{\varphi(n)} = a^{n - 1} = 1 \mod(n) 
$$

即费马小定理（令质数 $n=p$）：

$$
a^p = a \mod(p) 
$$


## 扩展欧几里得算法

[欧几里得算法][euclidean] 俗称辗转相除法，是求最大公约数的常用算法，其复杂度为 $O(\lg n)$。
[龙胆虎威中的四加仑水迷题（Die Hard 3）](https://harttle.land/2019/09/21/die-hard-problem.html) 一文中用到的也是该算法。
我们知道最大公约数总是可以写作两个数的线性组合，辗转相除法最终得到的正是最大公约数：

$$
xa + yb = gcd(a, b)
$$

[扩展欧几里得算法][Extended_Euclidean_algorithm] 是在运行欧几里得算法的同时记录下系数 $x, y$。
这一系数就是[贝祖数][bi]（Bézout's identity）。
在模逆元问题中 $a = a, b = n$，且 $a$ 与 $n$ 互质（这时才存在逆元），代入后得到：

$$
xa + yn = gcd(a, n) = 1
$$

$$
xa = 1 \mod(n)
$$

即 a 对应的贝祖数 x 就是 a 的模逆元。
注意这个过程中我们只假设了 a 与 n 互质，因此比费马小定理的适用范围更大。
下面是扩展欧几里得算法的实现：

```cpp
int extEuclid (int a, int b, LL& x, LL& y) {
    if (a < b) return extEuclid(b, a, y, x);
    if (a % b == 0) {
        x = 0; y = 1;
        return b;
    }
    LL cx, cy;
    int ans = extEuclid(b, a % b, cx, cy);
    x = cy;
    y = (cx - (cy * (a / b  % M) % M) + 2 * M) % M;
    return ans;
}
```

对于本文涉及的组合问题 a 和 n 互质，GCD 总是 1，`extEuclid()` 的返回值并不重要。
我们只需要得到贝祖系数 x 的值，它就是 $a$ 的模逆元 $x=a^{-1}$：

```cpp
int modInverse(LL a, LL M) {
    LL x, y;
    extEuclid(a, M, x, y);
    return x;
}
```

扩展欧几里得算法的复杂度是 M 的位数 $O(lg M)$，这样组合算法的复杂度为 $O(n + lg M)$，前者 $O(n)$ 来自 `comb()` 函数里的阶乘。

[bi]: https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity
[Extended_Euclidean_algorithm]: https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
[euclidean]: https://en.wikipedia.org/wiki/Euclidean_algorithm
[fermat]: https://en.wikipedia.org/wiki/Fermat%27s_little_theorem
[mmi]: https://en.wikipedia.org/wiki/Modular_multiplicative_inverse
[matrix-tracing]: https://www.hackerrank.com/challenges/matrix-tracing/problem
[sherlock-and-permutations]: https://www.hackerrank.com/challenges/sherlock-and-permutations
