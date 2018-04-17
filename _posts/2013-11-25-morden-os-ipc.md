---
title:  Modern Operating Systems 笔记 - Interprocess Communication
tags: 操作系统 IPC 中断 互斥量 信号量
---

**race conditions**

Two or more processes are reading or writing some shared data and the final result depends on who runs precisely when.

## Critical Regions

**mutual exclusion**

Prohibit more than one process from reading and writing the shared data at the same time.

**critical region**

Also called **critical section** , the part of the program where the shared memory is accessed.

Conditions to a good solution

1. No two processes may be simultaneously inside their critical regions
2. No assumptions may be made about speeds or the number of CPUs
3. No process running outside its critical region may block other processes
4. No process should have to wait forever to enter its critical region

<!--more-->

## Mutual Exclusion with Busy Waiting

### Disable Interrupts

Problems

1. It's unwise to give user processes the power to turn off interrupts.
2. It's convenient for the kernel itself to disable interrupts for a few instructions, when race conditions could occur.

### Lock Variables

This would not take place without atom operations.

### Strict Alternation

```cpp
//Process 1
while(TRUE){
    while (turn != 0);
    critical_region();
    turn = 1;
    noncritical_region();
}

//Process 2
while(TRUE){
    while(turn != 1);
    critical_region();
    turn = 0;
    noncritical_regino();
}
```

Problem: neither of them could run twice in a row, which violates condition 3.

> Continuously testing a variable until some value apperas is called **busy waiting** , a lock that uses busy waiting is called a **spin lock** .

### Peterson's Solution

Busy waiting lock variables.

```cpp
#define FALSE 0
#define TRUE 1
#define N 2

int turn;
int interested[N];

void enter_region(int process)
{
    int other = 1 - process;
    interested[process] = TRUE;
    turn = process;
    while (turn == process && interested[other] == TRUE);
}

void leave_region(int process)
{
    interested[process] = FALSE;
}
```

### TSL Instruction

```
TSL RX, LOCK
```
Test and lock lock instruction reads the content of the memory word `lock` into register `RX` and then stores a nonzero value at the memory address `lock`.

> It's guaranteed by the hardware that the read and set operations are indivisible.

```
enter_region:
    TSL REGISTER, LOCK
    JNE REGISTER, #0, enter_region
    RET     'return

leave_region:
    MOVE LOCK, #0
    RET
```

An alternative instruction to `TSL` is `XCHG`. The implementations are similiar.

## Sleep and Wakeup

Problems in busy waiting:

1. wasting CPU time
2. process with higer priority will keep busy waiting while lower priority process never run

### The Product-Consumer Problem

```python
Producer loop:
    if count == N:
        sleep
    else:
        produce one
    if count == 1:
        wakeup consumer

Consumer loop:
    if count == 0:
        sleep
    else:
        consume one
    if count == N-1
        wakeup producer
```

Since `count` is unconstrained, race condition could occur. When consumer is about to sleep, wakeup signal from producer is lost, causing both of them sleeping.

### Semaphores

Semaphores are used to buffer signals, keep them from losing. Value 0 indicating that no wakeups were saved; positive value if some wakeups were pending.

`down`(Proberen, try in Dutch) operation: checking the value and cosume one or sleep to wait one.
`up`(Verhogen, raise in Dutch) operation: produce one, if someone's waiting, wake him.

## Mutexes

**mutex**

A kind of semaphore, a variable that can be in 1 of 2 states: unlocked or locked, used when the semaphore's ability to count is not needed.

## Monitors

When several mutexes are refered to, deadlock could occur by a subtle error. **Monitors** are provided by some programming languages to manage a group of mutual exclusive threads.

> Only one of the threads in this group would run in a certain time. It's up to the compiler to arrange mutexes to accomplish the monitor.

## Message Passing

**message passing** is used for information exchange between machines. This method of interprocess communication uses 2 primitives, `send` and `receive`.

Approaches:

1. **mailbox**

    A mailbox is a place to buffer a certian number of messages.
2. **rendezvous**

    No buffering, either of each primitive is blocked until the other occurs.

## Barriers

With multiple processes, a **barrier** can be placed at the end of each phase. When a process reaches the barrier, it's blocked until all processes have reached the barrier.


