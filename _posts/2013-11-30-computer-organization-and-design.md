---
layout: blog
title:  Computer Organization and Design
subtitle: The Hardware/Software Interface
categories: 读书
tags: 读书笔记 体系结构
excerpt: '"Computer Organization and Design", David A. Patterson, John L. Hennessy, 机械工业出版社'
---

# Abstractions 

## Concepts

**Moore's law**
> Over the history of computing hardware, the number of transistors on integrated circuits doubles approximately every two years.

**Compiler**
> A program that translates high-level language statements into assembly language statements.

**Assembler**
> A program that translates a symbolic version of instructions into the binary version.

**High-level programming langrage**
> A portable language that is composed of words and algebraic notation that can be translated by a compiler into assembly language.

**Assembly language**
> Asymbolic representation of machine instructions.

**Machine language**
> A binary representation of machine instructions.

**5 components of a computer**

* Input
* Output
* Memory
* Datapath
* Control

> The last two sometimes combined and called the processor.

**Instruction set architecture**
One key interface between the levels of abstraction is the instruction set architecture-the interface between the hardware and low-level software.

<!--more-->

## Performance

### Measurement and Limitation

$$
\begin{eqnarray}
CPU~time &=& IC \times CPI \times Clock~cycle~time\\\\
        &=& \frac{IC \times CPI}{Clock~rate}
\end{eqnarray}
$$

$$
Power = Capacitive \times Voltage^2 \times Frequency
$$

## Fallacies and Pitfalls

> **Pitfall**: Expecting the improvement of one aspect of a computer to increse overall performance by an amount proportional to the size of the improvement.

**Amdahl's law**

$$
ET~after~improvement = \\\\
\frac{ET~affected}{Amount~of~improvement} + ET~unaffected
$$

> **Pitfall**: Using a subset of the performance equation as a performance metric.

For example:

$$
\begin{eqnarray}
MIPS &=& \frac{IC}{ET \times 10^6} \\\\
    &=& \frac{Clock~rate}{CPI \times 10^6}
\end{eqnarray}
$$

> Instruction per program is not considered.

Execution time is the only valid and unimpeachable measure of performance.


# Instructions

> Common goal of computer designers: to find a language that makes it easy to build the hardware and the compiler while maximizing performance and minimizing cost and power.

**Stored-program concept** 

The idea that instructions and data of many types can be stored in memory as numbers, leading to the stored-program computer.


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

# Arithmetic for Computers

## Addition and Subtraction

1. Add (`add`), and immediate (`addi`), and subtract (`sub`) cause exceptions on overflow.
    MIPS detects overflow with an *exception* (or *interrupt* ),  which is an unscheduled procedure call. The address of current instruction is saved and the computer jumps to predefined address to invoke the appropriate routine for that exception.

    > MIPS uses *exception program counter* (EPC) to contain the address of the instruction that causes the exception. The instruction *move from system control* (`mfc0`) is used to copy EPC into a general-purpose register.

2. Add unsigned (`addu`), add immediate unsigned (`addiu`), and subtract unsigned (`subu`) do not cause exceptions on overflow.
    Programmers can trap overflow anyway: when overflow occurs, the sign bit of the result is not properly set. Compairing with sign bits of operands, the sign bit of the result can be determined. 

> SIMD (single instruction, multiple data): By partitioning the carry chains within a 64-bit adder, a processor could perform simultaneous operations on a short vecters of eight 8-bit operands, four 16-bit operands, etc. Vectors and 8-bit data often appears in multimedia routine.

## Multiplication

multiplicand * multiplier = product

### Sequential Version of the Multiplication

![sequential-multiply](/assets/img/blog/multi1.png)

![sequential-multiply-illu](/assets/img/blog/multi-illu.png)

Refined version:

* Init: put multiplier to the left 32-bit of the product register.
* Cycle: 
    1. if the last bit of product register is 1, add the left 32-bit with the multiplicand
    2. shift right the product register
* Final: the product register contains the 64-bit product

![refined](/assets/img/blog/multi2.png)

### Faster Multiplication

A way to organize these 32 addtions is in a parallel tree:

![parallel](/assets/img/blog/multi3.png)

### Multiply in MIPS

The registers `Hi` and `Lo` contains the 64-bit product. Call `mflo` to fetch the 32-bit product, `mfhi` can be used to get `Hi` to test for overflow.

## Division

Dividend = Quotient * Divisor + Remainder

### Division Algorithm

![divide](/assets/img/blog/divide1.png)

![divide-illu](/assets/img/blog/divide-illu.png)

Improved version:

* Init: put the dividend in the right 32-bit of remainder register.
* Cycle: 
    1. subtract the left 32-bit of remainder by the divisor
    2. shift left the remaider register
    3. set the last bit as new quotient bit
* Final: the left 32-bit contains the remainder, right 32-bit contains the quotient.

![divede-improved](/assets/img/blog/divide2.png)

### Faster Division

**SRT division**: try to guess several quotient bits per step, using a table lookup based on the upper bits of the dividend and remainder. The key is guessing the value to subtract.

### Divide in MIPS

`Hi` contains the remainder, and `Lo` contains the quotient after the divide instruction complete.

> MIPS divide instructions ignore overflow. MIPS software must check the divisor to discover division by 0 as well as overflow.

## Floating Point

**scientific notation** A notation that renders numbers with a single digit to the left of the decimal point.

**normalized** A number in floating-point notation that has no leading 0s.

**fraction** The value, generally between 0 and 1, placed in the fraction field.

**exponent** In the numerical representation system of floating-point arithmetic, the value that is placed in the exponent field.

*overflow* the exponent is too large to be represented in the exponent field.

**floating point** Computer arithmetic that represents numbers in which the binary point is not fixed.

In general, floating-point numbers are of the form: $(-1)^S \times F \times 2^E$

MIPS float: sign(1 bit) + exponent(8 bit) + fraction(23 bit)
MIPS double: s(1 bit) + exponent(11 bit) + fraction(52 bit)

IEEE 754 uses a bias of 127 for single precesion, and makes the leading 1 implicit. Since 0 has no leading 1, it's given the reserved exponent 0 so that hardware won't attach a leading 1.

Thus 00...00 represents 0; the representation of the rest are in the following form:

$(-1)^S \times (1 + Fraction)\times 2^(Exponent - Bias)$

> The exponent is located left and the bias is for comparison convenience.

# The Processor

## Introduction

A abstract view of the implementation of the MIPS subset showing the major functional units and the major connections between them:

![abstract-view](/assets/img/blog/mips-abs.png)

The basic implementation of the MIPS subset, including the necessary multiplexors and control lines:

![mips-basic](/assets/img/blog/mips-basic.png)

**asserted**

The signal is logically high or true.

**deasserted**

The signal is logically low or false.

**Clocking methodology**

The approach used to determine when data is valid and stable relative to the clock.

**Edge-triggered clocking**

A clocking scheme in which all state changes occur on a clock edge.

**control signal**

A signal used for multiplexor selection or for directing the operation of a functional unit; contrasts with a *data signal* , which contains information that is operated on by a funcional unit. 

> The state element is changed only when the write control signal is asserted and a clock edge occurs.

## A Simple Implementation Scheme

*ALUOp* indicates whether the operation to be performed should be add for loas and stores, substract for beq, or determined by the operation encoded in the funct field.

**Multiple levels of decoding**

The main control unit generates the ALUOp bits, which then are used as input to the ALU control that generates the actual signals to control the ALU unit.

The datapath with all necessary multiplexors and all control lines identified:

![mips-all](/assets/img/blog/mips-all.png)

**Single-cycle implementation**

Also called single clock cycle implementation. An implementation in which an instruction is executed in one clock cycle.

> The clock cycle is determined by the longest possible path in the processor.

## An Overview of Pipelining

Assuming ideal conditions:

Time between instructions(pipelined) = Time between instructions(nonpipelined) / Number of pipe states

> Pipelining improves performance by increasing instruction throughput, as opposed to decreasing the execution time of an individual instruction, also called latency.

**Structual Hazards**

When a planned instruction cannot execute in the proper clock cycle because the hardware does not support the combination of instructions that are set to execute.

**Data Hazards**

Data Hazards occure when the pipeline must be stalled because one step must wait for another to complete.

**Control Hazards**

Arising from the need to make a decision based on the results of one instruction while others are executing.

## Pipelined Datapath and Control

The datapath is separated into 5 pieces:

1. IF: Instruction fetch
2. ID: Instruction decode and register file read
3. EX: Execution or address calculation
4. MEM: Data memory access
5. WB: Write back

We can divede the control lines into 5 groups according to the pipeline state

1. IF: Signals to read instruction memory and write PC are always asserted, nothing to control.
2. ID: As in the previous state, the same thing happens at every clock cycle, no optional control lines to set.
3. EX: The signals to be set are RegDst, ALUOp, and ALUSrc. The signals select the Result register, the ALU operation, and either Read data 2 or a sign-extended immediate for the ALU.
4. MEM: The control lines set are: Branch, MemRead, and MemWrite. These signals are set by the branch equal, load, and store instructions.
5. WB: MemtoReg, which decides between sending the ALU result or the memory value to the register file; Reg Write, which writes the chosen value.

**Multiple-clock-cycle pipeline diagram** gives overviews of pipelining situations:

![multiple-clock-cycle-pipeline](/assets/img/blog/multiple-clock-cycle-pipeline.png)

**Single-clock-cycle diagram** represents a vertical slice through a set of multiple-clock-cycle diagrams, showing the usage of the datapath by each of the instructions in the pipeline at the designated clock cycle.

![single-clock-cycle-pipeline](/assets/img/blog/single-clock-cycle-pipeline.png)


## Data Hazards

### Forwarding

When the result required by the current instruction is computed during EX stage of the previous instruction( or previous previous instruction), forwarding is used. See the two pairs of hazard conditions:

1. EX/MEM.RegisterRd = ID/EX.RegisterRs
2. EX/MEM.RegisterRd = ID/EX.RegisterRt
3. MEM/WB.RegisterRd = ID/EX.RegisterRs
4. MEM/WB.RegisterRd = ID/EX.RegisterRt

The *forwarding unit* is used to forward new values from EX/MEM and MEM/WB pipeline-register to ID/EX pipeline-register when the conditions above occured.

> Note that the values in EX/MEM is newer than MEM/WB, we will forward MEM/WB only when EX/MEM needn't to be forwarded.

### Stalls

When the result required by the current instruction is computed during MEM stage of the previous instruction, we must stall the pipeline.

The *hazard detection unit* operates during the ID stage, checking for load instructions and insert the stall between the load and its use. The single condition is:

```
if( ID/EX.MemRead and 
    ((ID/EX.RegisterRt = IF/ID.RegisterRs) or
     (ID/EX.RegisterRt = IF/ID.RegisterRt)))
        stall the pipeline
```

By identifying the hazard in the ID stage, we can insert a bubble into the pipeline by changing the EX, MEM and WB control fields of the ID/EX pipeline registeer to 0.

> Actually, only the signals RegWrite and MemWrite need be 0, while the other control signals can be don't cares.

![pipe-control](/assets/img/blog/pipe-control.png)

## Control Hazards

Discarding instructions means we must be able to flush instructions in the IF, ID, and EX stages of the pipeline.

Moving the branch decision up requires 2 actions to occur earlier: computing the branch target address and evaluating the branch decision.

**Dynamic branch prediction**

Prediction of branches at runtime using runtime information.

**Dynamic prediction buffer**

Also called *branch history table* , a small memory that is indexed by the lower portion of the branch instruction and that contains one or more bits indicating whether the branch was recently taken or not.

The simple *1-bit prediction* scheme has a performance shortcoming: even if a branch is almost always taken, we can predict incorrectly twice, rather than once, when it is not taken.

In a *2-bit scheme**, a prediction must be wrong twice before it is changed.

**branch delay slot**

The slot directly after a delayed branch instruction, which in the MIPS architecture is filled by an instruction that does not affect the branch.

> The delayed branch is a simple solution to control hazards in a 5-stage pipeline. With longer pipelines, superscalar execution, and dymnamic branch prediction, it's now redundant.

**branch target buffer**

A structure that caches the destination PC or destination instruction for a branch. It's usually organized as a cache with tags, making it more costly than a simple prediction buffer.

**correlating predictor**

A branch predictor that combines local behavior of a particular branch and global information about the behavior of some recent number of executed branches.

**tournament branch predictor**

A branch predictor with multiple predictions for each branch and a selection mechanism that chooses which predictor to enable for a given branch.

## Exceptions

*exception* refer to unexpected change internal, while *interrupt* refer to that external.

MIPS save the address of the offending instruction in the *exception program counter (EPC)* , and the *Cause register* holds a field that indicates the reason for the exception.

**Vectored interrupt**

An interrupt for which the address to which control is transferrd is determined by the cause of the exception.

Exception Procedure

1. We must flush the instructions follow the offending instruction from the pipeline.
2. Use the EX.Flush signal to prevent the instruction in the EX stage from writing its result in the WB stage.
3. Save the address of the offending instruction in the EPC.

**Imprecise interrupt**

Also called *imprecise exception* , Interrupts or exceptions in pipelined computers that are not associated with the exact instruction that was the cause of the interrupt or exception.

**Precise interrupt**

Also called *precise exception* , An interrupt or exception that is always associated with the correct instruction in pipelined computers.

## Parallelism

**Instruction-level parallelism (ILP)**

The parallelism among instructions.

## Multiple issue

A scheme whereby multiple instructions are launched in one clock cycle.

### static multiple issue

An approach to implementing a multiple-issue processor where many decisions are made by the compiler before execution.

**issue slots**

The positions from which instructions could issue in a given block cycle.

**Very Long Instruction Word (VLIW)**

A style of instruction set architecture that launches many operations that are defined to be independent in a single wide instruction, typically with many separate opcode fields.

> A simple 2-issue MIPS processor: one of the instructions can be an integer ALU operation or branch and the other can be a load or store.

#### Dynamic multiple issue

An approach to implementing a multiple-issue processor where many decisions are made during executino by the processor.

**superscalar**

An advanced pipelining technique that enables the processor to execute more than one instruction per clock cycle by selecting them during execution.

**dynamic pipeline scheduling**

Hardware support for reordering the order of instruction execution so as to avoid stalls.

![dps](/assets/img/blog/dps.png)

register renaming:

1. when a instruction issues, it's copied to a reservation station for the appropriate functional unit.
2. If an operand is not in the register file or reorder buffer, it must be waiting to be preduced by a functional unit.

### speculation

An approach whereby the compiler or processor guesses the outcome of an instruction to remove it as a dependence in executing other instructions.

In the case of speculation in software, the compiler usually inserts additional instructions that check the accuracy of the speculation and provide a fix-up routine to use when speculation is incorrect.

In hardware speculation, the processor usually buffers the speculative results until it knows they are no longer speculative.

# Exploiting Memory Hierarchy

## Introduction

**Principle of locality**

* **Temporal locality** : If a data location is referenced then it will tend to be referenced again soon.
* **spatial locality** : If a data location is referenced, data locations with nearby addresses will tend to be referenced soon.

**Memory hierarchy**

A structrue that uses multiple levels of memories; as the distance from the processor increases, the size of the memories and the access time both increase.

> The main memory is implemented from DRAM, levels closer to the processor use SRAM, the largest and slowest level is usually magnetic disk.

## The Basics of Caches

**direct mapped cache**

A cache structure in which each memory location is mapped to exactly one location in the cache.

Cache index = (Block address) modulo (Number of blocks in the cache)

> A **valid bit** is used to indicate whether an entry contains a valid address. **Tag** contains the address information required to identify whether the associated block in the hierarchy corresponds to a requested word.

### Accessing a Cache

![direct-mapped-cache](/assets/img/blog/direct-mapped-cache.png)

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

![set-associative](/assets/img/blog/set-associative.png)

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

![page-table](/assets/img/blog/page-table.png)

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

![tlb](/assets/img/blog/tlb.png)

![tlb](/assets/img/blog/tlb-cache.png)

![tlb](/assets/img/blog/tlb-write-through.png)

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

# Storage and Other I/O Topics

## Introduction

![io-dev](/assets/img/blog/io-dev.png)

## Dependability, Reliability, and Availability

**Dependability** is the quality of delivered service such that reliance can justifiably be placed on this service.

**Reliability** is a measure of the continuous service accomplishment(or, equivalently, of the time to failure) from a reference point.

> **mean time to failure(MTTF)** is a reliability measure. **annual failure rate(AFR)** is the percentage of devices that would be expected to fail in a year for a given MTTF. Service interruption is measured as mean time to repair(MTTR). Mean time between failures(MTBF) is simply the sum of MTTF and MTTR.

**Availability** is a measure of service accomplishment with respect to the alternation between the two states of accomplishment and interruption.

Availability = MTTF / MTBF

3 ways to improve MTTF:

1. Fault avoidance: preventing fault occurrence by construction.
2. Fault tolerance: using redundancy to allow the service to comply with the service specification despite faults occurring, which applies primarily to hardware faults.
3. Fault forecasting: predicting the presence and creation of faults, which applies to hardware and software faults, allowing the component to be replaced before it fails.

## Disk Storage

**nonvolatile**

Storage device where data retins its value even when power is removed.

**track**

One of thousands of concentric circles that makes up the surface of a magnetic disk.

**sector**

One of the segments that make up a track on a magnetic disk; a sector is the smallest amount of information that is read or written on a disk.

> Originally, all tracks had the same number of sectors and the same number of bits. With the introduction of **zone bit recording(ZBR)** , disk drives changed to a varying number of sectors per track. Thus increasing the drive capacity.

**cylinder**

Cylinder referes to all the tracks under the heads at a given point on all surfaces.

**Seek time**

The time for the process of positioning a read/write head over the proper track on a disk.

**Rotational latency**

Also called **rotational delay** , the time required for the desired sector of a disk to rotate under the read/write head; usually assumed to be half the rotation time.

**Transfer time**

Transfer time is the time to transfer a block of bits.

**Disk controller** usually handles the detailed control of the disk and the transfer between the disk and the memory. **Controller time** is the overhead the controller imposes in performing an I/O access.

## Fash Storage

**NOR flash** : storage cell is similiar to a standard NOR gate. Typically used for BIOS memory.

**NAND flash** : offers greater storage density, but memory could only be read and written in blocks as wiring needed for random accesses was removed. Typically used for USB key.

**wear leveling**

To cope with bit wearing out, most NAND flash products include a controller to spread the writes by remaapping blocks that have been written many times to less trodden blocks.

## Connecting Processors, Memory, and I/O Devices

**processor-memory bus**

A bus that connects processor and memory and that is short, generally high speed, and matched to the memory system so as to maximize memory-processor bandwidth.

**I/O bus**

By contrast, I/O bus can be lengthy, can have many types of devices connected to them, and often have a wide range in data bandwidth of the devices connected to them.

**backplane bus**

A bus that is designed to allow processors, memory, and I/O devices to coexist on a single bus.

> I/O buses donot typically interface directly to the memoty but use either a processor-memory or a backplane bus to connect to memory.

**I/O transaction**

A sequence of operations over the interconnect that includes a request and may include a response, either of which may caryy data. A transaction is initiated by a single request and may take many individual bus operations.

**Synchronous bus**

A bus that includes a clock in the control lines and a fixed protocol for communicating that is relative to the clock.

**Asynchronous interconnect**

Uses a handshaking protocol for coordinating usage rather than a clock; can accommodate a wide variety of devices of differing speeds.

**handshaking protocol**

A series of steps used to coordinate asynchronous bus transfers in which the sender and receiver proceed to the next step only when both parties agree that the current step has been completed.

### The I/O Interconnects of the x86 Processors

**north bridge**

The chip for memory controller hub next to the processor.

**south bridge**

The one connected to north bridge, witch is the I/O controller hub.

![intel-io](/assets/img/blog/intel-io.png)

## Interfacing I/O Devices to the Processor, Memory, and Operating System

### Giving commands to I/O devices

**memory-mapped I/O**

An I/O scheme in which portions of address space are assigned to I/O devices, and reads and writes to those addresses are interpreted as commands to the I/O device.

### Communicating with the Processor

1. **polling** : The process of periodically checking the status of an I/O device to determine the need to service the device.
2. **Interrupt-driven I/O** : An I/O scheme that employs interrupts to indicate to the processor that an I/O device needs attention.

### Transferring the Data between a Device and Memory

1. Use the processor to transfer data between a device and memory based on polling.
2. Make the transfer of data interrupt friven.
3. **direct memory access (DMA)** : Having the device controller transfer data directly to ro from the memory without involving the processor.

## I/O Performance Measures

**transaction processing**

A type of application that involves handing small short operations(called transactions) that typically require both I/O and computation. Transaction processing applications typically have both response time requirements and throughput performance.

**I/O Rate**

Performance measure of I/Os per unit time, such as reads per second.

**data rage**

Performance measure of bytes per unit time, such as GB/sec.

## Designing and I/O System

General approaches:

1. Find the weakest link in the I/O system, which will constrain the design.
2. Configure this component to sustain the required bandwidth.
3. Determine the requirements for the rest of the system and configure them to support this bandwidth.

## Parallelism and I/O: Redundant Arrays of Inexpensive Disks

**redundant arrays of inexpensive disks (RAID)**

An organization of disks that uses an array of small and inexpensive disks so as to increase both performance and reliability.

### No Redundancy (RAID 0)

Simply spreading data over multiple disks, called striping.

### Mirroring (RAID 1)

Writing the identical data to multiple disks to increase data availability.

### Error Detecting and Correcting Code (RAID 2)

RAID 2 borrows an error detection and correction scheme most often used for memories.

### Bit-Interleaved Parit (RAID 3)

**protection group** is the group of data disks or blocks that share a common check disk or block. The cost of higher availability can be reduced to 1/n, where n is the number of disks in a protection group.

### Block-Interleaved Parity (RAID 4)

The parity is stored as blocks and associated with a set of data blocks.

### Distributed Block-Interleaved Parity (RAID 5)

To fix the parity-write bottleneck, the parity information can be spread throughout all the disks so that there is no single bottleneck for writes.

### P+R Redundancy (RAID 6)

When a single failure correction is not sufficient, parity can be generalized to have a second calculation over the data and another check disk of information. The second check block allows recovery from a second failure.

## Fallacies and Pitfalls

> Fallacy: The rated mean time to failure of disks is almost 140 years, so disks practically never fail.

MTTF is calculated by putting thousands of disks in a room, run them for a few months, and count the number that fail.

The **annual failure rate (AFR)** is a more useful measure.

> Fallacy: A GB/sec interconnect can transfer 1 GB of data in 1 second.

1. Generally cannot use 100% of any computer resource.
2. The definition of a GB of storage ($2^30$) and a GB persecond of bandwidth ($10^9$) donot agree.

> OSs are the best place to schedule disk accesses.

Since the disk knows the actual mapping of the logical addresses onto a physical geometry of sectors, tracks, and surfaes, it can reduce the rotational and seek latencies by rescheduling.

> Pitfall: Using the peak transfer rate of a portion of the I/O system to make performance projections or performance comparisons.

The peak performance is based on unrealistic assumptions about the system or are unattainble because of other system limitations.

# Multicores, Multiprocessors, and Clusters

## Introduction

**multiprocessor**

A computer system with at least two processors. This is in contrast to a **uniprocessor** , which has one.

**job-level parallelism** or **process-level parallelism**

Utilizing multiple processors by running independent programs simultaneously.

**parallel processing program**

A single program that runs on multiple processors simultaneously.

**cluster**

A set of compters connected over a local area network (LAN) that functions as a single large message-passing multiprocessor.

**multicore microprocessor**

A microprocessor containing multiple processors ("cores") in a single integrated circuit.

![para-cate](/assets/img/blog/para-cate.png)

## The Difficulty of Creating Paralel Processing Programs

According to **Amdahl's law** 

Execution time after improvement = Execution time affected by improvement / Amount of improvement + Execution time unaffected.

Thus,
$$$
Speed-up = \frac{1}{(1 - Fraction~time~affected) + \frac{Fraction~time~affected}{100}}
$$$

**Strong scaling**

Speed-up achieved on a multiprocessor without increasing the size of problem.

**Weak scaling**

Speed-up achieved on a multiprocessor while increasing the size of the problem proportionally to the increase in the number of processors.

## Shared Memory Multiprocessors

**shared memory multiprocessor (SMP)** 

A parallel processor with a single address space, implying implicit communication with loads and stores.

Single address space multiplrocessors come in two styles:

1. **uniform memory access (UMA)** : A multiprocessor in which accesses to main memory take about the same amount of time no matter which processor requets the access and no matter which word is asked.
2. **nonuniform memory access (NUMA)** : A type of single address space multiprocessor in which some memory accesses are much faster than others depending on which processor asks for which word.

Data sharing:

**synchronization**

The process of coordinating the behavior of two or more processes, which may be running on different processors.

**lock**

A synchronization device that allows access to data to only one processor at a time.

![shared-mem](/assets/img/blog/shared-mem.png)

## Distributed Memory Multiprocessors

![distri-mem](/assets/img/blog/distri-mem.png)

There were several attempts to build high-performance computers based on high-performance message-passing networks, while they were all too expensive than using LAN.

A weakness of separate memories for user memory turns into a strength in system availability.

1. It's easier to replace a machine without bringing down the system in a cluster than in an SMP.
2. It's easier to expand the system without bringing down the application that runs on top of the cluster.

Lower cost, high availability, improved power efficiency, and rapid, incremental expandability make clusters attractive to service providers for the Word Wide Web.

## Hardware Multithreading

**hardware multithreading**

Increasing utilization of a processor by switching to annoher thread when one thread is stalled. To permit this, we must duplicate the independent state. For example, each thread would have a separate copy of the register file and the PC.

There are two main approaches to hardware multithreading.

1. **Fine-grained multithreading** A version of hardware multithreading that suggests switching between threads after every instruction.

    > Hiding the throughput losses that arise from both short and long stalls; while slows down the execution of the individual threads.

2. **Coarse-grained multithreading** A version of hardware multithreading that suggests switching between threads onlly after significant events, such as a cache miss.

    > Relieves the need to have thread switching be essentially free and  is much less likely to slow down the execution of an individual thread; while it's limited in its ability to overcome throughput losses, especially from shorter stalls, since thread switch requires pipeline be emptied or frozen (pipeline start-up cost).

3. **Simultaneous multithreading (SMT)** A version of multithreading that lowers the cost of multithreading by utilizing the resources neede for multiple issue, dynamically schedule microarchitecture.

![thread-multi](/assets/img/blog/thread-multi.png)

