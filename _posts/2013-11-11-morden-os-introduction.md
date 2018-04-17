---
title:  Modern Operating Systems 笔记 - Introduction
tags: Unix Windows 操作系统
---

## What is OS

1. **extendes machines** : providing programmers(and programs) a clean abstract set of resources instead of the messy hardware
2. **resource manager** : managing hardware resources

## History of OS

The first digital computer was designed by Charles Babbage. Ada Lovelace was the first programmer(hired by Babbage).

### 1st Generation Vacuum Tubes

* The first functioning digital computer, by John Atanasoff and Clifford Berry, Iowa State University.
* Z3, Konrad Zuse, Berlin.
* Colossus, a group at Bletchey Park, England
* Mark I, Howard Aiken, Harvard
* ENIAC, William Mauchley and J. Presper Eckert, University of Pennsylvania

<!--more-->

### 2nd Generation Transistors and Batch System

**batch system** 

1. Programmers bring cards to IBM 1401
2. 1401 read batch of jobs onto tape
3. Operator carries input tape to IBM 7094
4. 7094 does computing
5. Operator carries output tape to 1401
6. 1401 prints output

### 3rd Generation ICs and Multiprogramming

**IBM System/360** 

A series of software-compatible machines differed only in price and performance.

360 was the first major computer line to use **ICs(Integrated Circuits)**.

**OS/360** had to work on all models, the result was an enormous and complex OS, each release fixed some bugs and introduced new ones.

**multiprogramming** 

Partition memory into several pieces, with a different job in each partition. While one job was waiting for I/O, another job could be using the CPU.

**spooling** 

Simultaneous Peripheral Operation On Line, OS read jobs from cards onto the disk as soon as they were brought to the computer room, whenever a running job finished, the operating system could load a new job from the disk and run it.

**timesharing**

Proveding quick response time. The 1st general-purpose timesharing system, **CTSS(Compatible Time Sharing System) was developed at MIT.

**MULTICS(MULTiplexed Information and Computing Service)**

Developed by MIT, Bell Labs, and General Electric, MULTICS supports handreds of uses on a machine only slightly powerful than an Intel 386-based PC.

**minicomputer**

DEC PDP-1(1961) and other PDPs(all incompatible)

**UNIX**

Developed by Ken Thompson(based on PDP-7  minicomputer). There are 2 major versions: 

**System V**(from AT&T) and **BSD**(Berkeley Software Distribution)

1987, **MINIX** was released for educational purposes.

### 4th Generation Personal Computers

With the development of **LSI**(Large Scale Integration) circuits, **microcomputers** appears.

 Kildall developed **CP/M**(Control Program for Microcomputers, disk-based OS), which later supports 8080, Zilog Z80, and other CPU chips.

Bill Gates offered **DOS**(Disk Operating System, which renamed to MS-DOS later) to IBM.

Engelbart invented the **GUI**(Graphical User Interface), which was adopted by Xerox PARC.

**Apple**

Steve Jobs visited PARC and embarked on building an Apple with a GUI.

**Windows**

Microsoft released Windows 95, Windows 98(with 16-bit Intel CPU), Windows NT(New Technology, 32-bit), Windows Me(Millennium edition), Windows 2000(1999,renamed from Windows NT5), and Windows XP(2001).

**UNIX**

FreeBSD, originating from BSD project at Berkeley. X Window System(X11), MIT.

## OS ZOO

**Mainframe OS**

Oriented toward process many jobs at once, most of which need prodigious amounts of I/O.

**Server OS**

Serve multiple users at once over a network and allow the users to share hardware and software resources.

**Mutiprocessor OS**

Special features for communication, connectivity, and consistency.

**Personal Computer OS**

Provide good surport to a single user.

**Handheld Computer OS**

**PDA**(Personal Digital Assistant) and mobiles.

**Embedded OS**

Donot accept user-installed software.

**Sensor Node OS**

Tiny computers that communicate with each other and with a base station using wireless communication.

**Real-Time OS**

**hard real-time** the action absolutely must occur at a certain moment.

**soft real-time** missing an occasional deadline is acceptable and does not cause any permanent damage.

**Smart Card OS**

Some are Java-oriented. The ROM holds an interpreter for the JVM. 
Resource management and protection.

## OS Structure

### Monolithic Systems

Basic sturctures

1. A main program that invokes requested service procedure.
2. A set of service procedures that carry out the system calls.
3. A set of utility procedures that help the service procedures.

### Layered Systems

**THE** system built by E. W. Dijkstra.

|layer|function|
|:---:|:---|
|5|The operator|
|4|User programs|
|3|I/O management|
|2|Operator-process communication|
|1|Memory and drum management|
|0|Processor allocation and multiprogramming|

**MULTICS** was described as having a series of concentric rings, with the inner ones being more privileged than the outer ones.

> The advantage is that it can be easily extended to structure user subsystems.

### Microkernels

Achieve high reliability by spilitting the OS into small, well-defined modules, only one of which(the microkernel) runs in kernel mode.

An idea related to having a minimal kernal is to put the **mechanism** for doing something in the kernel but not **policy**.

> A few of better-known microkernels: Integrity, K42, Symbian, and MINIX 3.

### Client-Server Model

A slight variantion of the microkernel idea is to distinguish 2 classes of processes, the **servers**(providing services), and the **clients**(use these services).

### Virtual Machines

#### Type 1 hypervisor

Also known as **virtual machine monitor**, runs upon th e hardware.

**CP/CMS** , later renamed VM/370 is a timesharing system provedes 

1. multiprogramming 
2. extended machine with a more convenient interface than the bare hardware

**CMS** (Conversational Monitor System), a single-user, interactive processing OS.

#### Type 2 hypervisor

Runs upon the Host OS, like other applications.

### Exokernels

Rather than cloning the actual machine, another strategy is pratitioning it, giving each user a subset of the resources.

At the bottom layer, running in kernel mode, is a program called the **exokernal**.



