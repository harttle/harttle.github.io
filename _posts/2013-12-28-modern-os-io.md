---
title:  Modern Operating Systems 笔记 - Input/Output
tags: 操作系统 DMA 内存映射 中断 Unix
redirect_from: /2013/11/11/modern-os-introduction.html
---

## Principles of I/O Hardware

### Devices & Controllers

* **block devices** stores information in fixed-size blocks, each one with its own address.
* **character devices** delivers or accepts a stream of characters, without regard to any block structure.
* **device controller/adapter** takes the form of a chip on the parentboard or a printed circuit card that can be inserted into a (PCI) expansion slot.

### Memory-Mapped I/O

Each control register is assigned a unique memory address to which no memory is assigned.

Pros:

* if special I/O instructions are needed to read/write the device control registers, access to them requires nothing more than standard C code, otherwise needs the use of addembly code.
* with memory-mapped I/O, no special protection mechanism is needed to keep user processes from performing I/O.
* With memory-mapped I/O, every instruction that can reference memory can also reference control registers.

Cons:

* most computers nowadays have some form of caching of memory words. Caching a device control register would be disastrous.
* If there is only one address space, then all memory modules and all I/O devices must examine all memory references to see which ones to respond to.

<!--more-->

### Direct Memory Access(DMA)

**Direct memory access (DMA)** is a feature of modern computers that allows certain hardware subsystems within the computer to access system memory independently of the CPU.

Bus mode thus DMA controller mode:

* **cycle stealing** the device controller sneaks in and steals an occasional bus cycle from the CPU once in a while(when CPU doesn't want the bus).
* **burst mode** the DMA controller tells the device to acquire the bus, issue a series of transfers, then release the bus.

### Interrupts Revisited

* **interrupt vector** is used to save program counters for a table of the corresponding interrupt service procedure.
* Most CPUs save the context on the stack when interrupt happens.

**Precise interrupt**

1. The PC is saved in a known place.
2. All instructions before the one pointed to by the PC have fully executed.
3. No instruction beyond the one pointed to by the PC has been executed.
4. The execution state of the instruction pointed to by the PC is known.

An interrupt doesn't meet these requirements is called an **imprecise interrupt**.

## Principles of I/O Software

### Goals of I/O Software

* **Device independece** programs can access any I/O device without having to specify the device in advance.
* **uniform naming** thus a path name in UNIX systems.
* **error handling** try to correct the error or told upper layers.
* **synchronous** or **asynchronous**
* **buffering**

## I/O Software Layers

1. User-level I/O software
2. Device-independent operating system software
3. Device drivers
4. Interrupt handlers
5. Hardware

### Device-Independent I/O Softwares

####Uniform Interfacing for Device Drivers

* The interface between the device drivers and the rest of the operating system.
* How I/O devices are named.

> in Unix a device name such as `/dev/disk0/`, uniquely specifies the i-node for a special file. This i-node contains **major device number** to locate the appropriate driver, and the **minor device number** which is passed as a parameter to the driver and specifies the read/write unit.

####Buffering

**double buffering** is used to store another buffer when the first buffer is being brought out and characters are keeping arriving.
**circular buffer** is another widely used form of buffering.


