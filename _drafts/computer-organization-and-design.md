---
layout: blog
title:  Computer Organization and Design
subtitle: The Hardware/Software Interface
categories: 笔记
tags: 读书笔记 体系结构
excerpt: '"Computer Organization and Design", David A. Patterson, John L. Hennessy, 机械工业出版社'
published: false
---

# Computer Abstractions and Technology

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
> One key interface between the levels of abstraction is the instruction set architecture-the interface between the hardware and low-level software.

## Performance

### Measurement and Limitation

$$
\begin{eqnarray}
CPU~time &=& Instruction~count \times CPI \times Clock~cycle~time\\\\
        &=& \frac{Instruction~count \times CPI}{Clock~rate}
\end{eqnarray}
$$

$$
Power = Capacitive~load \times Voltage^2 \times Frequency~switched
$$

### Fallacies and Pitfalls

> **Pitfall**: Expecting the improvement of one aspect of a computer to increse overall performance by an amount proportional to the size of the improvement.

**Amdahl's law**

$$
Execution~time~after~improvement = \\\\
\frac{Execution~time~affected~by~improvement}{Amount~of~improvement} + Execution~time~unaffected
$$

> **Pitfall**: Using a subset of the performance equation as a performance metric.

For example:

$$
\begin{eqnarray}
MIPS &=& \frac{Instruction~count}{Execution~time \times 10^6} \\\\
    &=& \frac{Clock~rate}{CPI \times 10^6}
\end{eqnarray}
$$

> Instruction per program is not considered.

Execution time is the only valid and unimpeachable measure of performance.


# Instructions: Language of the Computer

## Introduction

