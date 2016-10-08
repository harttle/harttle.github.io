---
title: 吐槽一下那些无用的代码注释
tags: 封装 接口 算法 注释 重构
---

最令程序员头痛的事情莫过于阅读别人的代码，但其实时间一久阅读自己的代码也会很痛苦。
问题不是出在『自己或别人』，而是在代码本身。
必要的注释可以阐明实现细节和设计意图，以此节约自己和别人的时间。
然而很多时候注释起的作用却适得其反，比如自动生成的过多的注释分散阅读者的注意力，
而过期的失效的注释更是误导阅读者。

<!--more-->

# 自动生成的注释

代码注释的泛滥想必是从Eclipse，Visual Studio等IDE开始的。
这些IDE提供了很多快捷功能，生成类/接口的骨架，具有Getter/Setter的属性等等。
如果用过IDE，下面的代码你一定不会陌生：

```java
/**
 * @param args
 */
public static void main(String[] args) {
    // TODO Auto-generated method stub
}
```

上述6行代码中的4行注释包含的信息量是0，既没有阐释参数args是何物，也没有说明main的用途。
然而大量的项目中都充斥着这样的自动生成注释。

『建议』：如果有参数或机制需要说明，请补充这些信息。否则请删除自动生成注释。
当然，用于生成文档的注释除外。

# 过多的注释

总会有人不厌其烦地编写长篇累牍的注释，或无微不至，或语焉不详，或晦涩难懂，或文采飞扬。
总之没有帮助我更快阅读代码的注释都是失败的注释。

为了说明问题，Harttle克隆了4.x [Linux Kernel源码][linux-kernel]，
来大致分析一下其注释行数。
我们知道内核代码95%以上是C语言，所以统计`.c`文件就足够说明问题了。

```bash
➜  linux git:(master) git clone git@github.com:torvalds/linux.git --depth=1
➜  linux git:(master) find . -name "*.c" -o -name "*.h" -exec grep -E '^\s*((\*)|(/[/*]))' {} \; | wc -l
724804
➜  linux git:(master) find . -name "*.c" -o -name "*.h" -exec cat {} \; | wc -l
4018961
➜  linux git:(master) node
> 724804/(4018961-724804)
0.22002715717556875
```

内核仓库中的代码大概是402万行（未移除空行），其中注释72万行，占比22%。
Linux内核使用低级的C语言编写，涉及到复杂的CPU调度、内存管理，驱动程序。
因此注释会偏多一些，一般的项目注释应小于这个数值。

『建议』：如果你的代码中注释超过了20%，那么显然你过度注释了。

# 文件头注释

很多编辑器/IDE都会生成默认的文件头，例如：

```javascript
/**
 * @file /tmp/xxx.js
 * @author harttle(yangjvn@126.com)
 * @date 2016-08-30 22:33
 * @description A XXX Implementation for XXX.
 */
```

文件头注释清晰地列出了文件的作者、功能描述等信息，看起来很有用。
不过这样的文件头存在的问题在于其维护性：

* 其他人做小的修改时未必会修改@author，甚至连@author都不知道现在该文件已经面目全非。
* 每次移动该文件，是否还需要花功夫更新 @file 信息？
* 谁会在每次代码修改后记得更新 @description，于是@description也总是误导读者。

文件头注释意在维护代码文件的元信息，以便在分发和部署过程中维护作者版权等信息。
然而在拥有版本控制的代码仓库中，这些信息不再需要手动维护，甚至可以通过`git blame`查看每一行代码的作者和时间信息。

『建议』：使用版本控制工具，删除文件头注释。版权信息可在构建或分发时生成。

# 冗余的注释

意图非常清楚的代码原则上不需要注释，多余的注释反而会造成维护性问题。
尤其是非英语母语的作者常常会掉到这个坑里。比如变量和函数的注释：

```javascript
/*
 * 获取用户数目
 */
function getUserCount(){
    // 用户的列表
    var userList = [];
}
```

这不是废话么！冗余的注释问题仍然在于维护性，例如调整函数功能、调整参数顺序，
或者更换变量名时我们不得不更新这些注释。否则这些注释就会误导下一个读者。

【建议】：不说废话。

# 抽取注释到标识符

可能读者也会有这样的经验：当我们写了一大段代码时，往往需要把它们分为几块。
然后在每一块开头添加一段注释。例如：

```javascript
function calcTotalCharge(movies, user){
    // Calculate Movie Charge
    var movieCharge = 0;
    for(var i=0; i<movies.length; i++){
        var charge = 0;
        if(movie.type === 'discount'){
            charge = movie.charge * 0.8;
        }
        else if(movie.type === 'short'){
            charge = movie.charge * 2;
        }
        else if(movie.type === 'normal'){
            charge = movie.charge;
        }
        movieCharge += charge;
    }

    // Calculate User Charge
    var rentCharge = 0;
    if(user.isVIP1){
        rentCharge = 10;
    }
    if(user.isVIP2){
        rentCharge = 200;
    }
    else if(user.isVIP3){
        rentCharge = 300;
    }
    else if(user.isVIP4){
        rentCharge = 500;
    }

    // Calculate Total Charge
    return movieCharge + rentCharge;
}
```

上述代码中的三段注释确实加速了阅读代码的速度，
但每当代码需要注释才能读懂时就应该警醒：是不是结构设计有问题。
对于上述代码，我们可以通过更加可复用的结构来消除注释：

```javascript
function calcTotalCharge(movies, user){
    return calcMovieCharge(movies) + calcUserCharge(user);
}
function calcMovieCharge(movies){
    var total = 0;
    for(var i=0; i<movies.length; i++){
        total += calcSingleMovieCharge(movie);
    }
    return total;
}
function calcSingleMovieCharge(movie){
    if(movie.type === 'discount') return movie.charge * 0.8;
    else if(movie.type === 'short') return movie.charge * 2;
    else if(movie.type === 'normal') return movie.charge;
    return 0;
}
function calcUserCharge(user){
    if(user.isVIP1) return 10;
    else if(user.isVIP2) return 200;
    else if(user.isVIP3) return 300;
    else if(user.isVIP4) return 500;
    return 0;
}
```

代码重构之后原来的注释就变得毫无意义，代码意图都被清晰的表述在标识符的命名中。
通常重构会带来代码量的减小，因为封装了分支、每个单元的逻辑也更加明确。

【建议】：当我们发现不得不进行注释时，需要警醒是否结构设计发生了问题。

# 有用的注释

至此Harttle已描述了这么多反模式，并非为了说明代码注释不重要。
而是为了说明『代码注释存在的意义在于帮助理解代码本身』。
例如在编写一些Trick，Polyfill，临时代码，以及复杂算法时，注释变得相当重要。
例如：

* Tricks and Polyfills。有时简单的Trick就可解决多数问题问题，
    为没必要编写复杂的普适算法，
    例如检测浏览器的DOM API支持，检测AMD/CommonJS环境等等。
    这时我们需要清晰地说明这些Trick的意图，甚至可以将这些代码抽离为polyfill模块。
* 复杂算法。有时我们会编写数学性非常强的算法，一眼望去不知所云。
    在开始这些算法前清晰地说明其意图何在，读者也就不必花大功夫读懂这些数学了。
* 公有接口。模块的对外接口从逻辑上定义了模块类型，公有接口代码也更容易被人读到。
    尤其是JavaScript接口：如果不注释options中到底是什么，谁晓得接口如何使用。

[linux-kernel]: https://github.com/torvalds/linux
