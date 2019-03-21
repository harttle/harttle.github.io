---
title: 前端为什么需要构建工具？
tags: Makefile Gulp CommonJS Grunt JavaScript 测试 模块化
---

社区中有不少项目引入[Gulp][gulp]，[Grunt][grunt]，[Webpack][webpack]等工具来支持测试和发布流程。
这些构建工具都有着这样的或者那样的缺点，此时Node社区悄悄兴起了一群npm党。
他们认为应该坚决干掉这些构建工具，其坚决程度好不亚于Vim党。

例如 2014 年发布在 keithcirkel 的[why-we-should-stop-using-grunt][why]
和 2016 年发布在 infoQ 上的[我为何放弃Gulp与Grunt，转投npm scripts][gulp-infoq]。
（抱歉又暴露出国内前端领域的2年落差）

虽然也烦透了Gulp/Grunt，但Harttle坚持认为我们需要构建工具。
本文梳理了Web前端的那些构建需求，整理了Harttle经历过的前端构建工具。
也给出了Harttle的信仰：[Makefile][make]

<!--more-->

## 前端有哪些构建需求？

我最近的前端开发已经离不开SASS，LESS等工具了，在多人协作项目中还会引入Lint和Test。
前端文件在上线前就需要运行这些任务。

### 预处理

JS/CSS/HTML在设计之初并未料及它们会这样流行，整个Web已经形成一个大的分布式文档。
低层语言的更换或升级都因兼容性问题而面临着巨大困难。
这催生了各种中间语言个预处理器，例如SASS，LESS，CoffeeScript，Babel等。

这些预处理工具可以将我们的中间代码转换为可运行的JavaScript。
这些预处理器使得我们可以预先使用ECMA Script6，以结构化的方式编写CSS，或者在CommonJS环境中编写JavaScript等等。

### 风格与测试

在一个典型的工作流中，每次Push主分支或npm发布都应首先运行代码风格检查和单元测试。
我们需要这些操作能够在合适的时候自动执行。

### 资源压缩

在开发网站代码时，我们希望模块化地进行编码。每个业务逻辑，通用工具，或者架构元素都需要组织在单独的文件中。
但是如果用户浏览网页时也载入这么多源文件，那么页面打开速度会大打折扣。

因此在网站发布时需要将源码合并压缩，
JavaScript可能还会需要模块化（AMD，CommonJS等），
CSS文件可能也需要合并、添加兼容性前缀（`-webkit-`, `-moz-`）等。
这些重复性工作我们也希望写成脚本。

### 静态资源替换

最为复杂的构建需求是静态资源的URL替换。
因为生产环境中的资源地址可能和开发环境中很不一样，
可能是由于JS合并、CSS合并，也可能是由于应用了CDN加速。

我们需要在部署时更改所有HTML文件中的静态资源地址。

## 前端有哪些构建工具？

目前前端构建工具已经非常丰富，甚至都有人感受到了厌烦。大致分一下类：

* 一类是任务管理工具（task runner）。通过声明和组合构建任务来进行整个网站的构建，
有自己的一套任务声明语法和任务实现接口。例如Grunt和Gulp，这两个都是插件式的架构。有大量的插件可用，缺点就在于做什么都只能用插件，没有就自己写一个。
* 一类是打包工具（package tool）。通过为每一类文件配置需要的处理方式，来实现整个站点的构建。如[Webpack][webpack]和[FIS][fis]，这两个都是整个站点的整体构建解决方案。
* 一类是构建工具（build tool）。比如[Make][make]。

### 任务管理工具

任务管理工具中我们可以声明若干个任务，比如压缩、测试、替换等。
这些任务间可互相依赖（往往用来定义顺序），可以是同步的也可以是异步的。
然后我们可以自由地选择运行哪个任务，任务管理工具会帮我们运行它（以及它的依赖）。

在[天码营][tmy]的第一年我们都在使用Grunt构建和部署整个网站。
tmy
Grunt的问题在于所有事情都依赖于插件，而插件之间不一定能够很好地协作。
在此期间我们写了几百行的构建脚本，同时引入了大量的插件。
维护Gruntfile是我们最头疼的事之一。

此后我们迁移到Gulp，脚本缩减为几十行，Gulp是一个优秀的构建工具。
Gulp也是插件式架构的任务管理工具，与Grunt最大的区别在于采取流式接口，
减少代码量的同时插件之间的衔接也很顺畅。下面这段话来自Gulp官网：

> By enforcing strict plugin guidelines, we ensure that plugins stay simple and work as expected.

然而像Grunt一样，Gulp也有着JavaScript任务管理工具的缺点。
每个JS工具库都需要包装为Gulp插件来使用，我无法选择我喜欢的版本或者我喜欢的小众工具。
与此同时，Gulp比Grunt还要难以调试：基于Stream的构建流程中很难插入一条`console.log`。

### 打包工具

Webpack给出了一体化的构建方案。我们无需关心构建过程的实现细节，
只需要为每种文件设置它应该经过哪些预处理、哪些转换，并且给定打包地址。
Webpack甚至会自动替换HTML中的相应资源。

打包工具的学习曲线也较为陡峭，这类工具功能都相当强大。
缺点也很明显：很难精确地定义构建过程，所以和AMD混用时会产生非常多的坑。
如果你和Harttle一样有着洁癖一定不能忍这种粗暴的工具，
Harttle仍然相信自己能够把依赖定义清楚。

### 构建工具

关于构建工具Harttle只想提`make`。Make不仅仅是『目标+依赖+命令』！

Make是以来解决工具，可以解决任何树状依赖并根据文件修改时间来智能地更新。
因Make直接使用Bash，Unix强大的工具库只需STDIN和STDOUT便能解决绝大多数文件处理问题。

构建工具的优势在于可直接调用JS工具的CLI接口，可以自由地选择任何JS工具而不需包装。
缺点便是没有针对Web前端提供更多的构建功能。

### 关于NPM Script

我们知道NPM是包管理工具，但随着NPM的流行它的[NPM Script][npm-s]开始被广泛用于构建。
NPM Script是定义在`package.json`中的脚本，可通过`npm run`来运行。

> NPM Script在使用上也有个不直观的地方：`npm test`会运行`script:test`，
> 而`npm build`却不会运行`script:build`。
> 作为建议，统一使用`npm run`来运行npm script以避免不必要的误解。

NPM Script不依赖于任何外部工具，而且有着`./node_modules/.bin`作为`PATH`，
在NPM包中做简单的JavaScript构建相当便捷。

## 我们需要构建工具吗？

因NPM Script如此方便，[npm][npm] 党支持替换掉其他的构建工具，但Harttle认为不可。
反对构建工具的观点大概包括『为什么我需要构建工具？』
以及『为什么我为构建学习一个框架？』

毫无疑问第二个问题问的非常好，在现有工具可以解决所有问题时没必要学习新的工具。
因此npm党会选择使用[npm script][npm-s]来替代Gulp/Grunt，非常clean。
然而npm script只是npm软件的一个子功能，并非严格意义上的构建工具，
那么命令间存在依赖怎么办？需要中间处理过程怎么办？那么如果命令非常复杂怎么办？
他们会搞一个JavaScript文件来手写整个构建流。

到此为止npm党解决了所有问题。

需要构建不同的目标怎么办？那么就编写若干个JavaScript构建流。
构建流之间的代码复用怎么办？那么抽取为新的JavaScript文件。
复用部分的代码需要配置怎么办？通过参数或文件来传递配置。
Ok，现在npm党已经完成了一个简单的构建工具。
那么何不直接使用一个构建工具呢？Harttle认为Make就很合适，刚好与JS工具库能够互补：

* [Make][make]提供依赖解决。
* JS工具库提供具体的构建过程实现。

[tmy]: https://www.tianmaying.com
[why]: https://www.keithcirkel.co.uk/why-we-should-stop-using-grunt/
[gulp-infoq]: http://www.infoq.com/cn/news/2016/02/gulp-grunt-npm-scripts-part1
[make]: http://www.gnu.org/software/make/manual/make.html
[gulp]: http://gulpjs.com/
[grunt]: http://gruntjs.com/
[webpack]: https://webpack.github.io/docs/
[fis]: http://fis.baidu.com/
[npm]: https://www.npmjs.com/
[npm-s]: https://docs.npmjs.com/misc/scripts
