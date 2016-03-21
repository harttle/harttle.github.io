---
layout: blog
title:  Computer Organization and Design 笔记 - Instructions
tags: 操作系统 存储程序 字节序 补码 反码 寄存器 过程调用
---

> Common goal of computer designers: to find a language that makes it easy to build the hardware and the compiler while maximizing performance and minimizing cost and power.

**Stored-program concept** 

The idea that instructions and data of many types can be stored in memory as numbers, leading to the stored-program computer.

<!--more-->

## Design Principle

Each category of MIPS instructions is associates with constructs that appear in programming language:

* The arithmetic: assignment statements.
* Data transfer: dealing with data structures like arrays or structures.
* Conditional branches: *if* statement.
* Unconditional jumps: procedure call and returns and *for*, *case/switch* statements.


1. Simplicity favors regularity

    Requiring every instruction to have exactly three operands, no more and no less, conforms to the philosophy of keeping the hardware simple.

2. Smaller is faster

    Number of registers is limited in 32. A large number of registerss may increse the clock cycle time simply because it takes electronic signals longer when they must travel farther.

    **Big-endian and Small-endian**

    Big-endian: computers use the address of the leftmost byte ( or "big end" ) as the word address.
    Small-endian: otherwise.

    > MIPS is in the big-endian camp.

3. Make the common case fast

    Avoid the load instruction when arithmetic instruction's one operand is a constant.

    Example:

    ```
    addi    $s3,    $s3,    4

    # instead of
    lw      $t0,    AddrConst4($s1)
    add     $s3,    $s3,    $t0
    ```

    **One's complement**

    A notation that represents the most negative value by 10...000 and the most positive value by 01...11, leaving an equal number of negatives and positives but ending up with two 0s. 

    > The term is also used to mean the inversion of every bit.

    **two's complement**

    $-x = \bar{x}+1$, leading 0s mean positive, and leading 1s mean negative.

    > Two's complement gets its name from the rule that the unsigned sum of an n-bit number and its negative is $2^n$.

4. Good design demands good compromises

    The compromise chosen by the MIPS designers is to keep **all instructions the same length** , thereby requiring different kinds of instruction formats for different kinds of instructions.
    * R-type: op-6bits, rs-5bits, rt-5bits, rd-5bits, shamt-5bits, funct-6bits.
    * I-type: op-6bits, rs-5bits, rt-5bits, const or addr-16bits
    * J-type: op-6bits, addr-26bits

    **The simplicity of the "equipment"** : MIPS doesn't include branch on less than (`blt` is a pseudo-instruction) because it's too complicated; either it would stretch the clock cycle time or it would take extra clock cycles per instruction. Two faster instructions (`slt` and `beq`) are more usefull.

## Register usage

**Spilling registers**

The process of putting less commonly used variables (or those needed later) into memory.

**Dada-transfer instruction**

A command that moves data between memory and registers.

**Sign extension**

Copy the sign repeatedly to fill the rest of the bits in the left.

**Alignment restriction**

MIPS tries to keep the stack aligned to word addresses, allowing the program to always use `lw` and `sw` to access the stack.

> C string variable or an array of bytes will pack 4 bytes per word, and a Java variable or array of shorts packs 2 halfwords per word.

### Stack spilling  

`$sp` is a stack pointer, which is adjusted by one word for each register that is saved or restored.

### Procedure call  

* preserved by caller  

    `$t0-$t9`: ten temporary registers, `$a0-$a3`: four argument registers, `$v0-v1`: two return registers

    > Not preserved by the calee on a procedure call. The caller will push them.

* preserved by callee  

    `$s0-$s7`: eight saved registers, `$ra`: return address, `$sp`: the stack pointer and stack above `$sp`

    > Must be preserved on a procedure call. If used, the callee saves and restores them.  

> Iteration can significantly improve performance by removing the overhead associated with procedure calls.

### Data allocate

![mips-mem](/assets/img/blog/mips-mem.gif)

`$gp`: the global pointer that is reserved to point to the static area.  

`$fp`: A value denoting the location of the saved registers and local variables for a given procedure.

The frame point is convenient because all references to variables in the stack within a procedure will have the same offset.

> more than 4 paras: the trailing params are stored at `$fp+1`, `$fp+2`, etc.
> Pointers vs Arrays: we calculate address (index multiply 4) in array addressing, while add 4 directly in pointer addressing.

### Reserved registers

`$zero` always equals 0.
`$at` is reserved by the assembler to handle large constants in immediate instructions and addresses in load/store instructions.
`$k0, $k1` reserved for the operating system to handle exception procedure. They're used to retain the address of instruction that causes the exception (which can be get from EPC register), when exception procedure exits and restores all registers before the exception. Thus the program can jump back to the normal procedure.

## Addressing Mode

**Basic block**

Basic block is a sequence of instructions without branches, except possibly at the end , and without branch targets or branch labels, except possibly at the begining.

> One of the first early phases of compilation is breaking the program into basic blocks.

### Branch instruction

Branch instructions use 16-bit field address, which means no program will larger than $2^{16}$.

While the destination of branch instructions is likely to be close to the branch. If we use **PC-relative addressing** , the sum will allow the program to be as large as $2^{32}$.

> As the same time, the `L1` in `beq    $s0,    $s1,    L1` could be bigger than $2^{16}$, MIPS will break it into 2 instructions:
> ```
    bne     $s0,    $s1,    L2
    j       L1
L2:
```

### Jump instruction

Jump instructions use 26-bit field adress, MIPS stretch the distance by having it refer to the number of *words* to the next instruction instead of number of *bytes*. The address now becomes 28-bit, MIPS will add the first 4-bit of PC automatically to get a 32-bit address(**pseudodirect addressing**).

> The loader and linker must be careful to avoid placing a program across an address boundary of 256MB, which is $2^{28}$ bit. 

### Summary

* Immediate addressing: `addi $rs,  rt,   imm`
* Register addresing: `jr   $ra`
* Base addressing: `lw $rt, addr`
* PC-relative addressing: `bne  $s0,    $s1,    Label`
* Pseudodirect addressing: `j   Label`

## Parallelism and Synchronization

**Data Race**

Two memory accesses form a data race if they are from different threads to ssame location, at least one is a write, and they occur one after another.


One typical operation for building synchronization operations is the *atomic exchange* or *atomic swap*, while the challenge lies in that it requires both a memory read and a write in a single, uninterruptible instruction.

MIPS contains a pair of instructions called a `load linked` and `store conditional`. These are used in sequence: if the content of the memory specified by `load linked` is changed before the `store conditional`, then the store fails.

> Although it was presented for multi-processor sync, atomic exchange is also useful for the OS in dealing with multiple processes in a single processor. To ensure nothing interferes in a single processor, the `store conditional` also fails if the processor does a context switch between the two instructions.

> Store conditional will fail after either another attempted store or any exception, in particular, only register-register instructions can safely be permited between the two instructions; otherwise, it is possible to create deadlock situations.

## Translating & Starting

### Compiler

The compiler transforms the C program to *assembly language program*, a symbolic form of what the machine understands.

**Assembly Language**

A symbolic language that can be translated into binary machine language.


### Assembler

Assembler translate the *assembly language program* into machine language program, called object file.

> Pseudoinstructions give MIPS a richer set of assembly language instructions than those implemented by the hardware. The only cost is reserving one register, `$at`.

### Linker

**Linker**, also called *link editor*, is a systems program that combines independenty assembled machine language programs and resolves all undefined labels into an executable file. There are 3 steps for the linker:

1. Place code and data modules symbolically in memory.
2. Determine the addresses of data and instrucion labels.
3. Patch both the internal and external references.

> Linker allows compiling and assembling each procedure independently, particulaly library routines, avoiding processing the whole program every time a small routine changes.
> Typically, the *executable file* has the same format as an object file, except that it contains no unresolved references.

### Loader

A systems program that places an object program in main memory so that it is ready to execute.

### Dynamically linked libraries

The static libraries has a few cons:

* The library routines become part of the exe file. The program need re-compiled when library updated.
* It loads all libs that are called anywhere in the exe, even not called.

Lazy procedure linkage of DLLs:

The first time the lib is called, the program calls the dummy entry and follows the indirect jump. It points to code that puts a number in a register to identify the desired lib and jumps to the dynamic linker/loader. The linker/loader finds the lib, remap it, and chages the address in the indirect jump location to the lib.

### Starging a Java Program

Rather than compile to the assemly language of a target computer, Java is compiled first to the instructions that are easy tointerpret: the *Java bytecode* instruction set. A interpreter called *Java Virtual Machine* can execute Java bytecodes.

Pro: portability; Con: lower performance. *Just In Time compilers (JIT)* typically find the "hot" methods and compile them into native instruction set, and is saved for next run.

> Typically, the unoptimized C program is faster than the interpreted Java code. Using the JIT compiler makes Java faster than the unoptimized C and slightly slower than highest optimized C code.

## Fallacies and Pitfalls

> Fallacy: More powerful instructions mean higher performance.

Complex instructions consume more time.

> Fallacy: Write in assembly language to obtain the highest performance.

This battle between compilers and assembly language coders is one situation in which humans are losing ground. Today's C compilers generally ignore register hints made by programmers.

> Fallacy: The importance of commercial binary compatibility means successful instruction set don't change.

While backwards binary compatibility is sacrosanct, the x86 architecture has grown dramatically.

> Fallacy: Forgetting that sequential word addresses in machines with byte addressing do not differ by one.

The address of next word can be found by incrementing the address in a register by the size of word, not one.

> Pitfall: Using a pointer to an automatic variable outside its defining procedure.

The memory that contains the an array that is local to that procedure will be reused as soon as the procedure returns.


