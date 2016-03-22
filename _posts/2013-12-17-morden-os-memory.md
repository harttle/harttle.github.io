---
layout: blog
title:  Modern Operating Systems 笔记 - Memory Management
tags: 操作系统 虚拟内存 页表 LTB
---

## No Memory Abstraction

Running multiple programs by **static relocation**: Modify the second program on the fly as it loaded it into memory.

> The lack of memory abstraction is still common in embedded and smart card systems.

## A Memory Abstraction: Address Spaces

**Address space** is the set of addresses that a process can use to address memory.

**Dynamic relocation** uses base and limit registers to map each process' address space onto a different part of physical memory in a simple way.

> The disadvantage of relocation using base and limit registers is the need to perform an addition and comparison on every memory reference.

**Swapping** is used to deal with memory overload, bringing in each process in its entirety, running for a while, then putting it back on the disk.

> When swapping creates multiple holes in memory, it's possible to combine them all into one big one, which is called **memory compaction**.
> Free memory can be recorded as bitmaps or linked lists.

<!--more-->

## Virtual Memory

Processes use program generated addresses, called **virtual address**. They go to an **MMU(Memory Management Unit)** that maps the virtual addresses onto the physical addresses when a memory access occurs.

> **virtual memory** allows programs to run even when they are only partially in main memory.

### Page Tables

The virtual address space is divided into fixed-size units called **pages**. The corresponding units in the physical memory are called **page frames**.

The virtual address is split into a virtual page number and an offset. The virtual page number is used as and index into the page table to find the entry for that page. Each **page table entry(PTE)** consists a Caching disabled bit, Referenced bit, Modified bit, Present/absent bit and page frame number.

### TLB

**TLB(Translation Lookaside Buffers)** is used to speed up paging. It's usually inside the MMU and consists of a small number of entries. Each entry contains information about one page, including the virtual page number, a bit that is set when the page is modified, the protection code, and the physical page frame in which the page is locted.

### Page Tables for Large Memories

**multilevel page table** avoids keeping all the page tables in memory all the time.

**Inverted page table** is a solution for 64-bit computers. There is one entry per page frame in real memory, rather than one entry per page of virtual address space.

### Page Replacement Algorithms

#### The optimal page replacement algorithm

Each page can be labeled with the number of instructions that will be executed before that page is first referenced. And the page with the highest label should be removed.

> The only problem with this algorithm is that it's unrealizable.

### The Not Recently Used Page Replacement Algorithm

### The First-in, First-out Page Replacement Algorithm

### The Second-Chance Page Repcacement Algoritm

### The Clock Page Replacement Algorithm

### The Least Recently Used Page Replacement Algorithm

### The Working Set Page Replacement Algorithm

Keep track of each process' working set and make sure that it is in memory before letting the process run, which is called **prepaging**.


