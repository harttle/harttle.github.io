---
layout: blog
title:  Computer Organization and Design 笔记 - Exploiting Memory Hierarchy
tags: 操作系统 空间局部性 时间局部性 多级缓存 虚拟内存 页表 TLB 内存震荡
---

## Introduction

**Principle of locality**

* **Temporal locality** : If a data location is referenced then it will tend to be referenced again soon.
* **spatial locality** : If a data location is referenced, data locations with nearby addresses will tend to be referenced soon.

**Memory hierarchy**

A structrue that uses multiple levels of memories; as the distance from the processor increases, the size of the memories and the access time both increase.

> The main memory is implemented from DRAM, levels closer to the processor use SRAM, the largest and slowest level is usually magnetic disk.

<!--more-->

## The Basics of Caches

**direct mapped cache**

A cache structure in which each memory location is mapped to exactly one location in the cache.

Cache index = (Block address) modulo (Number of blocks in the cache)

> A **valid bit** is used to indicate whether an entry contains a valid address. **Tag** contains the address information required to identify whether the associated block in the hierarchy corresponds to a requested word.

### Accessing a Cache

![direct-mapped-cache@1.5x](/assets/img/blog/direct-mapped-cache.png)

Larger blocks exploit spatial locality to lower miss rate, while miss rate may go up eventually if the block size becomes a significant fraction to the cache size, because:

* The number of blocks can be held by the cache will become small, a great deal of competition occurs.
* The cost of miss increases.

> **early restart** : Uppon miss, resume execution as soon as the requested word of the block is returned, rather than wait for the entire block.

### Handling Misses

**Cache Miss** : A request for data from the cache that cannot be filled because the data is not present in the cache.

> Out-of-order processors can allow execution of instructions while waiting for a cache miss, In-order-processors stall on a cache miss.

### Handling Writes

**Write Through**

Always write the data in to both the memory and the cache.

**Write Buffer** 

A queue that holds data while the data is waiting to be written to memory. It's used for fewer memory access and higher performance.

**Write Back**

When write occurs, the new value is written only in the cache, the modified block is written to the lower level of the hierarchy when it's replaced.

**Split Cache**

A scheme in which a level of the memory hierarchy is composed of two independent caches that operate in parallel with each other, with one handling instructions and one handling data.

> A combined cache with a total size equal to the sum of the two split caches will usually have a better hit rate.

## Measuring and Improving Cache Performance

Memory-stall clock cycles = Insturctions / Program * Misses / Instruction * Miss penalty

AMAT(Average Memory Access Time) = Time for a hit + Miss rate * Miss penalty

### Reducing Cache Misses by More Flexible Placement of Blocks

**fully associative**

A cache structure in which a block can be placed in any location in the cache.

**set associative**

A cache that has a fixed number of locations where each block can be placed.

Set index = (Block nubmer) modulo (Number of sets in the cache)

Increasing degree of associativity:

* usually decreases the miss rate
* a potential increase in the hit time

**least recently used(LRU)**

A replacement scheme in which the block replaced is the one that has been unused for the longest time.

![set-associative@1.5x](/assets/img/blog/set-associative.png)

### Reducing Miss Penalty Using Multilevel Caches


The design for a primary and secondary cache are significantly different:

* The primary cache focus on minimizing hit time to yield a shorter clock cycle or fewer pipeline stages.
* The secondary cache focus on miss rate to reduce the penalty of long memory acess time.

**Global Miss Rate**

The fraction of references that miss in all relatives that miss in all levels of a multilevel cache.

**Local Miss Rate**

The fraction of references to one level of a cache that miss; used in multilevel hierarchies.

> Performance in out-of-order processors
> Memory-stall cycles / Instruction = Misses / Instruction * (Total miss latency - Overlapped miss latency)

> **autotuning** : Considering block size and number of caches, some numerical libraries parameterize their algorithms and then search the parameter space at runtime to find the best combination for a particular computer.

## Virtual Memory

**virtual Memory** implements the translation of a program's address space to physical addresses. 

Major motivations

* Allow efficient and safe sharing of memory among multiple programs
* Rmove the programming burdens of a small, limited amount of main memory

> A virtual memory is called a page, and a virtual memory miss is called a page fault.

**Address translation**

Also called address mapping, the process by which a virtual address is mapped to an address used to access memory.

Several decisions in designing virtual memory systems

1. Pages should be large enough to amortize the high access time
2. Organizations that reduce the page fault are attractive: fully associative placement
3. Page faults can be handled in software because the overhead will be small compared to the disk access time.
4. Write-through will not work since write takes too long. Instead, virtual memory use write-back.

> **segmentation** : A variable-size address mapping scheme in which an address consists of 2 parts: a segment number, which is mapped to a physical address, and a segment offset.

### Memory Page

**page table**

The table contains the virtual to physical address translations in a virtual memory system. The table, which is stored in memory, is typically indexed by the virtual page number; each entry in the table contains the physical page number for that virtual page if the page is currently in memory.

![page-table@1.5x](/assets/img/blog/page-table.png)

**reference bit**

Also called use bit, which is set whenever a page is accessed. A simple inplementation for LRU(least recently used).

**dirty bit**

Dirty bit is set when any word in a page is written, which indicates whether the page needs to be written out before it's memory can be given to another page.

> A modified page is often called a dirty page.

Techs used to reduce page table storage:

1. Keep a limit register that restricts the size of the page table for a given process.
2. Divide the page table and let it grow from the highest addr down, and from the lowest addr up. There will be 2 pagetables and 2 separate limits.
3. Apply a hashing function to the virtual addr so that the page table need be only the size of the number of physical pages in main memory.
4. Multilevel page tables.
5. Allow the page tables to be paged, just as memory data.

### TLB

**translation-lookaside buffer(TLB)**

A cache that keeps track of recently used address mappings to try to avoid an access to the page table, which makes addressing translation fast.

> The hardware maintains an index that indicates the recommended entry to replace, thich is chosen randomly considering the complexity for hardware.

![tlb@1.5x](/assets/img/blog/tlb.png)

![tlb@1.5x](/assets/img/blog/tlb-cache.png)

![tlb@1.5x](/assets/img/blog/tlb-write-through.png)

### Virtual Addressed Cache

**virtual addressed cache**

A cache that is accessed with a virtual address rather than a physical address.

**Aliasing** occurs when there are two virtual addresses for the same page. This ambiguity would allow one program to write the data without the other program being aware that the data had changed.

A common compromise between physical addressing and virtual addressing is caches that are virtually indexed using just the page offset portion(which is physical address), but use physical tags. There is no alias problem in this case.

### Implementing Protection with Virtual Memory

The hardware must provide at least 3 basic capabilities:

1. At least 2 modes to indicate kernel(or supervisor) process, or user(or executive) process.
2. A portion of processor state that a user process can read but not write.
3. The processor can go from user mode to supervisor mode and vice versa.

> Sharing information across processes: the operating system modifies the page table of the accessing process, the write access bit can be used to restrict the sharing to just read.

**Context Switch**

* Without TLB: change the page table register to the new address.
* With TLB: clear the TLB entries that belong to the older process.

### Handling TLB Misses and Page Faults

All misses are classified into one of the 3 categories:

1. Compulsory misses: A block that has never been in the cache.
2. Capacity misses: Blocks are replaced and then later retieved.
3. Conflick misses: Also called collision misses, these are cache misses that occur in set -associative or direct-mapped caches when multiple blocks compete for the same set.

Upon page fault, the OS complete:

1. Look up the page table entry to find the location of the referenced disk page.
2. Choose a physical page to replace. Write back the page if it's dirty.
3. Read in the physical page.

Since TLB miss is much more frequent, the OS loads the TLB from the page table without examine the entry and restarts the instruction. If the entry is invalid, another exception occurs and the OS recognizes the page fault.

> When an exception first occurs, the processor sets a bit that disables all other exceptions.

**unmapped**

A portion of the address space that cannot have page faults.

> The OS places exception entry point code and the exception stack in unmapped memory.

**thrashing** and **wording set**

Continuously swapping pages between memory and disk is called thrashing, the set of popular pages is called working set.

**prefeching**

A tech in which data blocks needed in the future are brought into the cache early by the use of special instructions that specify the address of the block.

## Fallacies and Pitfalls

> Pitfall: Forgeting to account for byte addressing or the cache block size in simulating a cache.

> Pitfall: Ignoring memory system behavior when writing programs or then generate code ina a compiler.

> Pitfall: Using average memory access time to evaluate the memory hierarchy of an out-of-order processor.

If the processor continues to execute instructions, and may even sustain more cache misses during a cache miss.

> Pitfall: Extending an address space by adding segments on top of an unsegmented address space.

This would cause addressing problems.

 Exploiting Memory Hierarchy
