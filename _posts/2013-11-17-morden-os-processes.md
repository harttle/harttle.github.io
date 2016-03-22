---
layout: blog
title:  Modern Operating Systems 笔记 - Processes 
tags: 操作系统 进程 fork kill Unix Windows
---

**pseudoparallelism**

The illusion of parallelism while CPU is switching from process to process quickly.

## The Process Model

**process** is an instance of an executing program, is the activity of a program.

> If a program is running twice, it counts as two processes.

## Process Creation

Processes are created when

1. System init
2. Process creation system call by a running process
3. A user request to create a new process.
4. Init of a batch job.

<!--more-->

In Unix, `fork` system call creates an exact clone of the calling process. `execve` is another syscall used to change its memory image and run a new program.

> This separation allows the child to manipulate its file descriptors after `fork` but before the `execve` in order to accomplish redirections.

In Windows, `CreateProcess` system call handles both process creation and loading with 10 parameters.

> It's possible for a newly created process to share resources such as open files.

## Process Termination

When processes terminate

1. Normal exit (voluntary)
2. Error exit (voluntary)
3. Fatal error (involuntary)
4. Killed by another process (involuntary)

Voluntary termination: `exit` in UNIX and `ExitProcess` in Windows. Kill someother process: `kill` in UNIX and `TerminateProcess` in Windows.

## Process Hierarchies

In UNIX, a process and all its children and further descendants form a process group. User signals are sends to all members in the group.

> `init` is the first process created in boottime. Thus all processes in the whole system belong to a single tree with `init` as the root.

Windows has no concept of process hierarchy, despite that a handle(a special token used to control the child) is returnd when creating a new process.

## Process States

1. Running (actually using the CPU)
2. Ready (runnable; temporariy stopped to let another process run)
3. Blocked (unable to run util some external event happens)

## Implementation of Processes

The OS maintains a **process table** , with one entry ( **process control block** ) per process. Each entry contains program counter, stack pointer, memory allocation, status of open files, scheduling information registers, and everything need to save when swapped out.

With a PCB, process can be saved when interrupted and swapped out. The interrupt routine may be as follows:

1. Hardware stacks program counter, etc
2. Hardware loads new program counter from interrupt vector
3. Assembly language procedure saves registers.
4. Assembly language procudure sets up new stack.
5. C interrupt service runs (typically reads and buffers input).
6. Scheduler decides which process is to run next.
7. C procedure returns to the assembly code.
8. Assembly language procedure starts up new current processes.

## Modeling Multiprogramming

Suppose p is the fraction of I/O time for a process. n is current count of processes. Then

$CPU~utilization = 1 - p^n$

where n is called the **degree of multiprogramming** .


