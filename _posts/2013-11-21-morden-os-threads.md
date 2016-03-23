---
layout: blog
title:  Modern Operating Systems 笔记 - Threads
tags: fork pthread sed 线程 内核空间 操作系统 用户空间 进程
---

## Thread Usage

1. Multiple activities going on at once with the ability to share an address space
2. Lighter weight than processes, easy to create and destroy.
3. Overlap activities with substantial I/O to speeding up the application.
4. Useful on systems with multiple CPUs.

Three ways to construct a server

1. Thread. Parallelism, blocking system calls.
2. Single-threaded process. No parallelism, blocking system calls.
3. Finite-state machine. Parallelism, nonblocking system calles, use interrupts to simulate thread.

## Classical Thread Model

Processes are used to group resources together; threads are the entities scheduled for execution on the CPU. There are no protection betwwen threads because (1) it's impossible, and (2) it should not be nessessary.

While threads share one memory space, it takes fewer space to maintain a thread, including Program Counter, Registers, Stack and State.

<!--more-->

## POSIX Threads

`Pthread_create`: create a new thread.
`Pthread_exit`: terminate the calling thread.
`Pthread_join`: wait for a specific thread to exit.
`Pthread_yield`: release the CPU.
`Pthread_attr_init`: create and initialize a thread's attribute structure.
`Pthread_attr_destroy`: remove a thread's attribute structure.

## Implementing Threads in User Space

Advantages

1. useful on an OS that doesn't support threads
2. switching is faster than trapping to the kernal
3. allow process have its own scheduling algorithm

Problems

1. Implementation of blocking sys-calls.

    These calles intended to block the process (all threads in it) since the kernal know nothing about threads. This problem could be solved by adding **wrappers** to all blocking sys-calls.
2. Page faults.

    The same as above.
3. A running thread never voluntarily gives up the CPU since no clock interrupts in user space.
4. Substantial sys-calles are needed generally in threads. It's hardly any more work for the kernel to switch threads.

## Implementing Threads in the Kernel

> Due to the relatively greater cost of creating and destroying threads in the kernel, some systems take an environmentally correct approach and recycle their threads.

Problems

1. When a multithreades process forks
2. Signals sent to a multithread process

## Hybrid Implementations

Programmers can determine how many kernel threads to use and how many user-level threads to multiplex on each one.

## Scheduler Activations

The kernel notifies the process' run-time system to switch thread, thus avoiding unnecessary transitions between user and kernel space.

> This implementation violates the structure inherent in any layered system.

## Pop-Up Threads

On arrival of a message, the system creates a new thread to handle it. Since a pop-up thread has no history, it's quicker to create than swap.

## Making Single-Threaded Code Multithread

Problems should be solved

1. global variables

    Private global variables. A new library to create, set, read these variables is needed.
2. many library procedures are not reentrant

    A jacket for each of these procedures is needed.
3. signals
4. stack management

    overflows could not be awared.


