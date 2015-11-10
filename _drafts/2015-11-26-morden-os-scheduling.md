---
layout: blog
categories: reading
title:  Modern Operating Systems 笔记 - Scheduling
tags: OS Round-Robin Multiple-Queues
---

## Introduction to Scheduling

### Personal Computer

Scheduling is simpler in personal computers because (1) there is only one active process, (2) CPU is more faster than I/O.

### Process Behavior

Compute-bound: long CPU bursts and thus infrequent I/O waits.
I/O-bound: short CPU bursts and thus frequent I/O waits.

<!--more-->

### When to Schedule

1. A new process is created
2. A process exits
3. A process blocks on I/O
4. I/O interrupt occurs

Types of schedule algorithm

1. **nonpreemptive** scheduling algorithm: picks a process to run until it blocks, exit, or voluntarily release the CPU.
2. **preemptive** scheduling algorithm: picks a process and lets it run for a maximum of some fixed time.

### Goals of Scheduling Algorithms

All systems

* Fainess - giving each process a fair share of the CPU
* Policy enforcement - seeing that stated policy is carried out
* Balance - keeping all parts of the system busy

Batch systems

* Throughput - maximize jobs per hour
* Turnaround tiem - minimize time between submission and termination
* CPU utilization - keep the CPU busy all the time

Interactive systems

* Response time - respond to requests quickly
* Propertionality - meets user's expectations

Real-time systems

* Meeting deadlines - avoid losing data
* Predictability - avoid quality degradation in multimedia systems

## Scheduling in Batch Systems

### First-Come First-Served

### Shortest Job First

Reduce the mean turnaround time.

### Shortest Remaining Time Next

When new process enterd, its executime is compared with the remaining time of current process.

## Scheduling in Interactive Systems

### Round-Robin Scheduling

Each process is assigned a time interval, called its **quantum** , during which it is allowed to run. The CPU switches when the process blocks, of course.

Setting the quantum too short causes too many process switches and lowers the CPU efficiency, but setting it too long may cause poor response to short interactive requests. A quantum arount 20-50 msec is often a resnable compromise.

### Priority Scheduling

Each process is assigned a priority, and the runable process with the highest priority is allowed to run. The priority of the running process decreases at each clock tick.

> A simple algorithm for giving a good service to I/O bound processes is to set the priority to 1/f, where f is the fraction of the last quantum that a process used.

### Multiple Queues

Set up priority classes, a group of processes sorted by priority in each class.

Whenever a process used up all the quanta allocted to it, it was moved down one class, saving the CPU for short, interactive processes.

Whenever a carriage return was typed at a terminal, the process belonging to that terminal was moved to the highest priority class.

> This prevents a process that needed to run for a long time when it first started but became interactive later, from being punished forever.

### Shorted Process Next

To a certain extent, it would be nice if this algorithm used in batch systems could be used for interactive processes.

**aging**

Estimating running time as $t = aT_0 + (1-a)T_1$

### Guaranteed Scheduling

Make real promises to the users about performance ahd then live up to those promises.

1. Compute the ratio of actual CPU time consumed to CPU time entitled.
2. Run the process with the lowest ratio until its ratio is no longer the lowest.

### Lottery Scheduling

Give processes lottery tickets for various system resources. Whenever a scheduling decision has to be made, a lottery ticket is chosen at random, and the process holding that ticket gets the resource.

Advantages

1. lottery scheduling is highly responsive, the process have more lottery tickets is more likely to get the turn.
2. processes can exchange lottery tickets, the server and the client for example.

### Fair-Share Scheduling

Each user is allocated some fraction of the CPU and the scheduler picks processes in such a way to enforce it.

For example, user 1 created process A B C D, while user 2 only created process E, the scheduling sequence should be:

A E B E C E ...

If user 1 is entitled to twice as much CPU time as user 2, the sequence should be:

A B E C D E ...

## Scheduling in Real-Time Systems

The events that a real-time system may have to respond to can be categorized as **periodic** (occurring at regular intevals) or **aperiodic** (occurring unpredictably).

Depending on how much time each event requires for processing, it may not even be possible to handle them all. A real-time system that meets this requirement is said to be **schedulable** .

## Policy versus Mechanism

Separate the scheduling mechanism from the scheduling policy to alow more flexible scheduling. What this means is that the scheduling algorithm is parameterized in some way.

## Thread Scheduling

![thread-scheduling](/assets/img/blog/thread-scheduling.png)

* Kernel-level thread doesn't block the entire process when blocking sys-calls are made, unlike user-level thread.
* Since the kernel knows that switching from a thread in process A to a thread in process B is more expensive than running a second thread in process A, it can take this into account when making a decision.
* User-level threads can employ an application-specific thread scheduler.


