---
title:  Modern Operating Systems 笔记 - File System
tags: 操作系统 文件系统
---

## Files

**File structures**

Byte sequence , Record sequence , Tree

**File Types**

Regular files , Directories , Character special files , Block special files

**File operations**

Create , Delete , Open , Close , Read , Write , Append , Seek , Get attributes , Set attributes , Rename.

<!--more-->

## Directories

Forms of directory system: Single-Level Directory Systems , Hierarchical Directory Systems

### Path names

**Absolute path name**: Consists the path from the root directory to the file.
**Relative path name**: This is used in conjunction with the concept of the *working deirectory*(*current directory*)

### Directory operations

Create , Delete , Opendir , Closedir , Readdir , Rename , Link , Unlink

## File system implementation

### File System Layout

**MBR(Master Boot Record)** is the first sector(sector 0) of the disk, which contains the partition table(one is marked as active).

**Superblock** is contained by every partition, which lays after the boot block and contains all the key parameters about the filesystem.

> MBR is loaded and executed by BIOS. The MBR program locate the active prtition, read in its first block(**boot block**), and execute it. The the program in the boot block load the OS contained in that partition.

![file system layout](/assets/img/blog/4-9.png)

### Implementing Files

* Contiguous Allocation
* Linked List Allocation
* Linked List Allocation Using a Table(File Allocation Table) in Memory
* I-nodes

### Implementing Directories

Longer, variable-length file names supporting. There are 3 implementations below:

* Set a limit on file name length.
* Each entry contains a fixed portion, followed by the actual file name.
* Make the directory entries all fixed length and keep the file names together in a heap at the end of the directory.

### Shared Files

2 solutions:

1. Disk blocks are not listed in directories, but in a little data structure associated with the file itself.
2. **Symbolic linking** The new link file just contains the path of the file to which it is linked.

### Log-Structured File Systems

All pending writes are bufferd in memory, and collected into a single segment and written to the disk as a single contiguous segment at the end of the log.

> An i-node map is maintained to make it possible to find i-nodes.
> LFS has a cleaner thread that spends its time scanning the log circularly to compact it. (Removing overwitten blocks)

### Journaling File System

Keeps a log of what the file system is going to do before it does it, so that if the system crashes before it can do its planned work, upon rebooting the system can look in the log to see what was going on at hte time of the crash and finish the job.

> Only after the log entry has been written, do the various operations begin. After the operations complete successfully, the log entry is erased.
> The logged operations must be **idempotent**.

### Virtual File System

**VFS** tries to integrate multiple file systems into an orderly structure.

> In fact, the origina motivation for Sun to build the VFS was to support remote file systems using the **NFS(Network File System)** protocol.

## File System Management and Optimization

### Disk Space Management

#### Block Size

If the allocatoin unit is too large, we waste space; if it's too small, we waste time.

> The disk operation time is the sum of the seek, rotational delay, and transfer time. While the first 2 of them dominated the access time.

#### Keeping Track of Free Blocks

1. Linked list.
2. bitmap.
3. Keep track of runs of blocks(rather than single blocks).

### File System Backups

* Incremental dump
* physical dump
* logical dump

### File System Consistency

* Block consistency. Count how many times each block is present in a file; how often each block is present in the free list.
* File consistency. Count for that file's usage count(hard links, directories).

### File System Performance

* Caching. Hash the device and disk address and look up the result in a hash table.
* Block Read Ahead. Only works for files that are being read sequentially.
* Reducing Disk Arm Motion. I-node allocation.



