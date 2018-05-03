---
layout: blog
title:  Computer Organization and Design 笔记 - Arithmetic for Computers
tags: 操作系统 加法器 乘法器 中断 异常
---

## Addition and Subtraction

1. Add (`add`), and immediate (`addi`), and subtract (`sub`) cause exceptions on overflow.
    MIPS detects overflow with an *exception* (or *interrupt* ),  which is an unscheduled procedure call. The address of current instruction is saved and the computer jumps to predefined address to invoke the appropriate routine for that exception.

    > MIPS uses *exception program counter* (EPC) to contain the address of the instruction that causes the exception. The instruction *move from system control* (`mfc0`) is used to copy EPC into a general-purpose register.

2. Add unsigned (`addu`), add immediate unsigned (`addiu`), and subtract unsigned (`subu`) do not cause exceptions on overflow.
    Programmers can trap overflow anyway: when overflow occurs, the sign bit of the result is not properly set. Compairing with sign bits of operands, the sign bit of the result can be determined. 

> SIMD (single instruction, multiple data): By partitioning the carry chains within a 64-bit adder, a processor could perform simultaneous operations on a short vecters of eight 8-bit operands, four 16-bit operands, etc. Vectors and 8-bit data often appears in multimedia routine.

<!--more-->

## Multiplication

multiplicand * multiplier = product

### Sequential Version of the Multiplication

![sequential-multiply](/assets/img/blog/multi1.png)

![sequential-multiply-illu](/assets/img/blog/multi-illu.png)

Refined version:

* Init: put multiplier to the left 32-bit of the product register.
* Cycle: 
    1. if the last bit of product register is 1, add the left 32-bit with the multiplicand
    2. shift right the product register
* Final: the product register contains the 64-bit product

![refined](/assets/img/blog/multi2.png)

### Faster Multiplication

A way to organize these 32 addtions is in a parallel tree:

![parallel](/assets/img/blog/multi3.png)

### Multiply in MIPS

The registers `Hi` and `Lo` contains the 64-bit product. Call `mflo` to fetch the 32-bit product, `mfhi` can be used to get `Hi` to test for overflow.

## Division

Dividend = Quotient * Divisor + Remainder

### Division Algorithm

![divide](/assets/img/blog/divide1.png)

![divide-illu](/assets/img/blog/divide-illu.png)

Improved version:

* Init: put the dividend in the right 32-bit of remainder register.
* Cycle: 
    1. subtract the left 32-bit of remainder by the divisor
    2. shift left the remaider register
    3. set the last bit as new quotient bit
* Final: the left 32-bit contains the remainder, right 32-bit contains the quotient.

![divede-improved](/assets/img/blog/divide2.png)

### Faster Division

**SRT division**: try to guess several quotient bits per step, using a table lookup based on the upper bits of the dividend and remainder. The key is guessing the value to subtract.

### Divide in MIPS

`Hi` contains the remainder, and `Lo` contains the quotient after the divide instruction complete.

> MIPS divide instructions ignore overflow. MIPS software must check the divisor to discover division by 0 as well as overflow.

## Floating Point

**scientific notation** A notation that renders numbers with a single digit to the left of the decimal point.

**normalized** A number in floating-point notation that has no leading 0s.

**fraction** The value, generally between 0 and 1, placed in the fraction field.

**exponent** In the numerical representation system of floating-point arithmetic, the value that is placed in the exponent field.

**overflow** the exponent is too large to be represented in the exponent field.

**floating point** Computer arithmetic that represents numbers in which the binary point is not fixed.

In general, floating-point numbers are of the form: $(-1)^S \times F \times 2^E$

MIPS float: sign(1 bit) + exponent(8 bit) + fraction(23 bit)
MIPS double: s(1 bit) + exponent(11 bit) + fraction(52 bit)

IEEE 754 uses a bias of 127 for single precesion, and makes the leading 1 implicit. Since 0 has no leading 1, it's given the reserved exponent 0 so that hardware won't attach a leading 1.

Thus 00...00 represents 0; the representation of the rest are in the following form:

$(-1)^S \times (1 + Fraction)\times 2^(Exponent - Bias)$

> The exponent is located left and the bias is for comparison convenience.


