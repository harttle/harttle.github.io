---
title: TypeScript 来做依赖注入的限制
tags: TypeScript 依赖注入 装饰器
---

[依赖注入](/2016/11/12/dependency-injection.html) 是编写可测试/复用代码的关键。
在 TypeScript 中所有对象、属性和方法都有类型，可以大幅简化人工标注的代码，这让很多人重新考虑在 JavaScript 中实现依赖注入。
比如 [Angular2 以后的 DI 实现](https://harttle.land/2019/05/27/how-angular-di-works.html)。
本文用来讨论 TypeScript 仍然无法解决哪些问题，以及相关技术可能存在的风险。

首先简单过一下基于 TypeScript 做依赖注入的步骤。
ES6 中提出了[Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
用来访问和操作对象对象属性。
而 [Reflect Metadata 提案](https://rbuckton.github.io/reflect-metadata)
让 Reflect API 可以提供对类型的元数据进行操作的方法。
这样就可以在 tsc 编译时产出注册元数据的代码，在运行时就可以读到编译时的类型了，这一类型就提供了依赖注入的 Token。
运行时的注入器根据函数签名的类型拿到依赖关系，再根据类型对应的 Provider 来创建依赖树。

<!--more-->

## 装饰器可能和标准分裂

TypeScript 编译 Reflect Metadata 需要打开一个叫做 [emitDecoratorMetadata](https://www.typescriptlang.org/docs/handbook/compiler-options.html) 的开关，
但这个开关只有在存在装饰器的方法上起作用。
不知这是设计缺陷还是故意的，总之要通过加装饰器来生成 metadata，两个特性是绑在一起的。
也就是说基于 TypeScript 做依赖注入一定要用 decorator。
坏消息是 ECMA 最新的 [Proposal Decorators](https://github.com/tc39/proposal-decorators) 和 TypeScript 提出的装饰器很不一样。
如果大量使用相关特性，后续可能面临代码迁移。

## 函数无法装饰

目前 TypeScript 的编译器中，装饰器不能修饰函数（对象之外的独立 function）。
装饰器无法装饰独立的方法，也就是说无法为独立的工厂方法自动生成依赖列表。
只能把工厂方法改成工厂类，否则就需要手动声明依赖。

> A Decorator is a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. --typescriptlang.org

这就是为什么 [Angular 中只有 factory 需要手动声明依赖列表](https://angular.io/guide/dependency-injection-providers#factory-providers)：

```typescript
export let heroServiceProvider =
  { provide: HeroService,
    useFactory: heroServiceFactory,
    deps: [Logger, UserService]
  };
```

[NestJS](https://docs.nestjs.com/fundamentals/custom-providers) 也只有 factory 类型的 provider 需要提供 inject 数组：

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};
```

## interface 仍然需要显式声明

这一小节标题比较抽象，需要先看个例子。
这是一个依赖注入的典型场景（省略了一些注册、装饰器等操作）：

```typescript
// 声明一个 Person 类
class Person {
  constructor(p: Parent, a: Age) {}
}

// 请求创建一个 Person 对象
const person = injector.create(Person)
```

依赖注入的核心设计就是使用和创建分离。
这里我们要用一个 Person 对象，如何创建完全交给 injector，它会去分析并创建 Person 的依赖（`[Parent, Age]`），然后再创建 Person 并返回。
如果 Parent 和 Age 不是具体的类而是接口，那么运行时拿到的依赖列表将会是 `[Object, Object]`，这样 injector 就无法知晓和创建依赖了。
所以对于接口类型，仍然需要声明一下给运行时一些信息，比如这样：

```typescript
class Person {
  constructor(@inject('IParnet') p: IParent, @inject('IAge') a: Age) {}
}
```

其实类似这样的声明有个通用的名字叫做 Inject Token，本是用于基本数据类型注入，或希望通过类型之外的信息来创建的时候。
只是在 TypeScript 中，即使是非常常用的接口也必须采用这种相对复杂的写法。
