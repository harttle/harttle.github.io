---
layout: blog
title:  Computer Organization and Design 笔记 - Abstractions
tags: 操作系统 编译 汇编
---

## Concepts

**Moore's law**
> Over the history of computing hardware, the number of transistors on integrated circuits doubles approximately every two years.

**Compiler**
> A program that translates high-level language statements into assembly language statements.

**Assembler**
> A program that translates a symbolic version of instructions into the binary version.

**High-level programming langrage**
> A portable language that is composed of words and algebraic notation that can be translated by a compiler into assembly language.

**Assembly language**
> Asymbolic representation of machine instructions.

**Machine language**
> A binary representation of machine instructions.

**5 components of a computer**

* Input
* Output
* Memory
* Datapath
* Control

> The last two sometimes combined and called the processor.

**Instruction set architecture**
One key interface between the levels of abstraction is the instruction set architecture-the interface between the hardware and low-level software.

<!--more-->

## Performance

### Measurement and Limitation

$$
\begin{eqnarray}
CPU~time &=& IC \times CPI \times Clock~cycle~time\\\\
        &=& \frac{IC \times CPI}{Clock~rate}
\end{eqnarray}
$$

$$
Power = Capacitive \times Voltage^2 \times Frequency
$$

## Fallacies and Pitfalls

> **Pitfall**: Expecting the improvement of one aspect of a computer to increse overall performance by an amount proportional to the size of the improvement.

**Amdahl's law**

$$
ET~after~improvement = \\\\
\frac{ET~affected}{Amount~of~improvement} + ET~unaffected
$$

> **Pitfall**: Using a subset of the performance equation as a performance metric.

For example:

$$
\begin{eqnarray}
MIPS &=& \frac{IC}{ET \times 10^6} \\\\
    &=& \frac{Clock~rate}{CPI \times 10^6}
\end{eqnarray}
$$

> Instruction per program is not considered.

Execution time is the only valid and unimpeachable measure of performance.


