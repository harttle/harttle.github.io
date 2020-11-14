---
title:  Modern Operating Systems 笔记 - Deadlocks
tags: 操作系统 算法 死锁
---

## Resources

A **preemptable resource** is one that can be taken away from the process owning it with no ill effects.

A **nonpreemptable resource** is one that cannot be taken away from its current owner without causing the computation to fail.

Resource Acquisition

1. Request the resource.
2. Use the resource.
3. Release the resource.

A possible implementation:

1. `down` on the semaphore to aquire the resource.
2. using the resource.
3. `up` on the semaphore to release the resource.

<!--more-->

## Introduction to Deadlocks

A set of processes is **deadlocked** if each process in the set is waiting for an event that only another process in the set can cause.

Conditions for Resource Deadlocks:

1. Mutual exclusion condition.
2. Hold and wait condition.
3. No preemption condition.
4. Circular wait condition.

Strategies used for dealing with deadlocks:

1. Just ignore the problem.
2. Detection and recovery.
3. Dynamic avoidance by careful resource allocation.
4. Prevention, by structurally negating one of the four required conditions.

## The Ostrich Algorithm

Just ignore the problem when the deadlock isn't that often, that serious.

> Few current systems will detect the deadlock between CD-ROM and printer.

## Deadlock Detection and Recovery

### Deadlock Detection with One Resource of Each Type

For such a system, we can construct a resource graph of the resources and processes. If this graph contains cycles, a deadlock exists.

### Deadlock Detection with Multiple Resources of Each Type

E is the **existing resource vector**, which gives the total nmber of instances of each resource in existence.

A is the **available resource vector**, which gives the number of instances of resource that are currently available.

C is the **current allocation matrix**, the i-th row of C tells how many instances of each resource class $P_i$ currently holds.

R is the **request matrix**, holds the number of instances of resource that processes want.

The following algorithm will mark all processes that are not deadlocked.

1. Look for an unmarked process, $P_i$, for which the i-th wor of R is less than or equal than A.
2. If such a process is found, add the i-th row of C to A, mark the process, and go back to step 1.
3. If no such process exists, the algorithm terminates.

### Recovery from Deadlock

* Recovery from Preemption
* Recovery through Rollback, which requires processes periodically **checkpointed**(memory image and resource state).
* Recovery through Killing Processes.

## Deadlock Avoidance

### Resource Trajectories

![trajectories](/assets/img/blog/6-8.gif)

### Safe and Unsafe States

A state is said to be **safe** if there is some scheduling order in which every process can run to completion even if all of them suddenly request their maximum number of resources immediately.

> It worth nothing that an unsafe state is not a deadlocked state. The system can run for a while and one process can even complete. The difference between a safe state and an unsafe state is that from a safe state the system can **guarantee** that all processes will finish; from an unsafe state, no such guarantee can be given.

### The Banker's Algorithm for a Single Resource

This Algorithm considers each request as it occurs, and sees if granting it leads to a safe state. If it does, the request is granted; otherwise, it is postponed until later.

### The Banker's Algorithm for Multiple Resources

1. Look for a row, R, whose unmet resource needs are all smaller than or equal to A. If no such row exists, the system will eventually deadlock since no process can run to completion.
2. Assume the process of the row chosen requests all the resources it needs and finishes. Mark that process as terminated and add all its resources to the A vector.
3. Repeat steps 1 and 2 until either all processes are marked terminated or no process is left whose resource needs can be met.

## Deadlock Prevention

Condition | Approach
--------- | --------
Mutual exclusion | Spool everything
Hold and wait | Request all resources initially
No preemption | Take resources away
Circular wait | Order resources numerically

## Other Issues

**two-phase locking**

1. In the first phase, the process tries to lock all the records it needs, one at a time.
2. If it succeds, it begins the second phase, performing its updates and releasing the locks.
3. If during the first phase, some record is already locked, the process just release all its locks and starts the first phase all over.

**conmunication deadlocks**, unlike resource deadlocks, these are caused by communication errors.

**livelock**, polling(busy waiting) processes uses up its CPU quantum without making progress but also without blocking.

**Starvation**, some policy is needed to make a decision about who gets which resource when. This policy may lead to some processes never getting service even though they are not deadlocked.

> Starvation can be avoided by using a first-come, first-served, resource allocation policy.


