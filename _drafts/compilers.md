---
layout: blog
categories: reading
title: Compilers
tags: 笔记 编译
exerpt: '"Compilers", Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman'
---

# Introduction

Difference between **compilers** and **interpreters** :

* Compilers accepts source program and generates target program.
* Interpreters accepts source program and input, generates output.


The phases of a compiler:

![diff-compiler-interpreter](/assets/img/blog/phases.gif)

1. Lexical analysis. Also called scanning, convert character stream into meaningful sequences called *lexemes* (represented like \<token-name, attributes\>).
2. Syntax analysis. Also called parsing, creates a *syntax tree* inwhich each interior node represents an opration and the children represent the arguments of the operation.
3. Semantic analysis. Checks semantic consistency with the language definition, such as *type checking* .
4. Intermediate code generation. Generates *three-address code* , which consists no more than 3 operands and at most one operator on the right side.
5. Code optimization, attempts to improve the intermediate code so that better(faster) code will result.
6. Code generation, a crucial aspect of which is the judicious assignment of registers.

As for the history of programming language:

* 1st generation languages are machine languages.
* 2nd generation the assembly languages.
* 3rd generation like Fortran, Cobol, Lisp, C, C#
* 4th generation languages are designed for specific apps, like SQL, Postscript
* 5th generation language has been applied to logic- and constraint-based languages like Prolog and OPS5.

**environment** is mapping from names to locations in the store. **state** is a mapping from locations in store to their values. Both of them could be static or dynamic.

**Scopes** can be resolved staticly (within block structure) or dynamicly (virtual methods, etc.).

**Parameter passing** includes "call-by-value" and "call-by-reference". The latter caused aliasing problem.

> In the early programming language Algol 60, "call-by-name" mechanism is used. The formal parameters are substituted by actual parameters as if macros.


