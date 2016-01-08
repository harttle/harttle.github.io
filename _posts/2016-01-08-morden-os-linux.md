---
layout: blog
categories: reading
title:  Modern Operating Systems 笔记 - Linux
tags: OS MULTICS UNICS UNIX MINIX inode EXT2
---

## History of Unix and Linux

### MULTICS & UNICS

* Researchers at M.I.T. joined forces with Bell Labs and Generic Electric and began designing a second-generation system, **MULTICS(Multiplexed Information and Computing Service)**
* One of the Bell Labs researchers, Ken Thompson wrote a stripped-down MULTICS on a PDP-7 minicomputer. The system is called **UNICS(UNiplexed Information and Computing Service)** jokingly by Brian Kernighan, Bell Labs.
* Thompson tied to rewite UNIX with B language of his own design and failed. Ritchie then designed a successor to B, called C. Working together, they rewrote UNIX in C.
* Steve Johnson of Bell Labs designed and implemented the **portable C compiler**, which could be retargeted to produce code for any resonable machine with a only a moderate amount of effort.

### Standard UNIX

* AT&T released its first commercial UNIX: System III, then System V.
* Aided by U.S. Dept. of Defense, Berkeley released an improved PDP-11 called **1BSD(First Berkeley Software Distribution)**, which supported virtual memory, TCP/IP, vi, csh, etc.
* IEEE came up with **POSIX(Portable Operating System of UNIXish)**, witch reconcile the two flavors of UNIX.

<!--more-->

### MINIX & Linux

* Tanenbaum wrote a Unix-like MINIX based on a microkernel design.
* In 1991, Linus Torvalds wrote another UNIX, named **Linux**, according to MINIX.
* Linux comes with GPL Lisence devised by Richard Stallman. GNOME, KDE were written for Linux.

### Linux Goals

1. Be simple, elegant, and consistent. (Wildcards, cmd abbrs, etc.)
2. Power and flexibility. (every program just do one thing and do it well)
3. No redundancy.

## Processes in Linux

### Concepts

* One **PID(Process Identifier)** per process, and one **TID(Task Identifier)** per thread.
* **Child process** and **parent process** have their own memory images respectively, and share open files.
* **pipes**(which can be filled and then process blocked) and **signal**(`kill` cmd, for example) are used for inter-process communication.

### System Calls

* `fork` will create an exact duplicate of the original process(file descriptors, registers, and everything else), and applys the copy on write mechanism.
* `exec` will cause its entire core image to be replaced by the file named in its 1st parameter.
* `wait` is used to collect information and clean the zombie process left by the terminated child process.
* `pause` tells Linux to suspend the process until signal arrives.


### Thread

Kernel thread is supported by Linux using `clone` system call.

> When a thread was created, the original thread and the new one shared everything but their registers.

3 classes of threads for scheduling purposes:

1. Real-time FIFO.
2. Real-time round robin.
3. Timesharing.

### Booting

1. BIOS performs initial device discovery and initialization.
2. MBR is read into a fixed location and executed, which loads a standalone **boot** program like **GRUB(GRand Unified Bootloader)**.
3. `boot` reads in the OS kernel and jumps to it.
4. Process 0 checks devices, program the clock, mount the root FS, and create `init`(process 1), and page daemon(process 2).
5. `init` execs `/etc/rc/*`, finally opens tty and print `login:`

## Memory Management in Linux

### Concepts

* **text segement** lays in the lowest in virtual address space. It's readonly thus can be shared physically.
* **data segement** lays upside of text segment and contains 2 parts: initialized data and uninitialized data(called **BSS(block Started by Symbol)**, which can grow and shrink by system call `brk`).
* **stacks** starts at the top limit of virtual address. For a 32bit x86 platform, it would be 0xC0000000.
* **memory-mapped files** are often used for shared libraries.

> Text segment is read-only. Self-modifying programs went out of style in 1950s because they they were too difficult to understand and debug.

> The existence of uninitialized data is actually just an optimization to make binary programs smaller.

### Implementation

* Each linux process on a 32-bit machine typically gets 3GB of virtual address space for itself, with the remaining 1GB reserved for its page tables and other kerel data.
* The 1GB kernel memory typically resides in low physical memory but it's mapped in the top of each process virtual address space.
* Linux uses 4-level paging scheme
* **buddy algorithm** and **slab allocator** is used for memeory allocation for normal objects and kernel caches respectively.

## Input/Output in Linux

File systems under the VFS includes:

1. Regular file(with I/O scheduler and Block device driver)
2. Block special file(with I/O scheduler and Block device driver)
3. Char special file(with Optional line discipline and Char device driver)
4. Network socket(with Protocol drivers and Network device driver)

* I/O Scheduler is used to reorder or bundle r/w requests to block devices.
* Line disciplines are used to render the local line editing before submit by Carriage Return.
* Linux treat drivers as **loadable modules**.

## Linux File System

### Concepts

History of Linux FS:

1. The initial FS is MINIX 1 FS.
2. ext FS allowed 255 chars of filename and 2GB filesize, but slower.
3. ext2 allowed long filename, larger filesize, and provided better performance.
4. ext3 is a follow-on of ext2 with journaling.

Linux allows directory and file locking(byte range) with semaphore, including **shared locks** and **exclusive locks**.

### Implementation

4 main structures of VFS:

1. **superblock** contains critical information about the layout of the file system.
2. **i-nodes** each describe exactly one file.
3. **dentry** represents a directory entry.
4. **file** is an in-memory representation of an open file.

![ext2 layout](/assets/img/blog/10-31.bmp)

* With 1kb block, this design limits a block group to 8192 blocks(in practice) and 8192 inodes(not real restriction).
* Ext2 attempts to collocate ordinary files in the same block group as the parent directory, and data files in the same block as the original file i-node.
* Ext2 also preallocates a number(8) of additional blocks for that file to minimize the file fragmentation due to future write operations.
* inode contains addresses of first 12 disk blocks, single indirect, double indirect, and triple indirect when needed.



