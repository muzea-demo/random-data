# 对语法的影响

出现了更多的关键字，`constraint` 语句中 `'+' '*' '-' '|'` 都成为关键字了

# flag

`flag` 语法是在约束语句后面的第一个 `|` 后面的部分，会对随机取值的方法造成影响

## shuffle

对于int类型的数据，将直接生成一个数组，里面包含 [min, max) 的所有数字，然后做一次随机化（类似洗牌），

用到的时候，从头开始取这个数组里面的数据，取完之后会重新随机化一次，保证每个数字被取一次之前，不会重复。

对 set 类型也会做类似处理。

示例

```text
constraint c int 1 N | shuffle
constraint 名 set 一 二 三 四 | shuffle
```

多个的时候类似
```text
constraint n int 1 10 | flag1 flag2
```

## directed

**尚未实现**

给 `graph` 使用，指明是有向图。

但是处理联通和强联通上有些问题，所以暂时没有实现。


## reference

**目前只支持`generator`**，会保存每次随机的值，到局部变量 `ref`，可以使用类似 `ref[-1]` 的语法来访问之前的取值。

# 变量的运算

现在的变量支持一个简单的运算啦，目前只支持 '+' '*' '-'，写起来是这个样子的

```text
constraint M int N 2*N
```

**只运算一次，且表达式里不能存在空格。**

上面的只是建议，实际求值的时候你可以使用 js 里面的大部分的操作，**只要你不写空格，也不换行**。因为求值实际上会创建一个 `function` 去执行，所以语法上和 js 会保持一致，但是你需要保证结果是一个整数，这里我并不会去检查输出是否合法 :)。

当然你会注意到 `repeatContent` 里面是不能包含表达式做运算的（CFG里面也有体现），这是我的设计问题，后面可能会让这边的语法统一。

# graph 图类型

语法

constraint g graph graphNum nodeNum edgeNum

- `graphNum` 这个图里面有几个联通图，目前只能是 1
- `nodeNum` 这个图里面有几个顶点
- `edgeNum` 这个图里面有几个边

虽然说 `graphNum` 也可以是别的数字，但是这个会导致一些问题，

比如分割后的几个图没法生成足够的边，无法满足 `edgeNum` （不分割的时候也会有这个问题）

所以在有图类型的时候，会出现抛出异常的情况 (*ゝω・)ﾉ

示例参见 [graph](sample/graph.txt)

也可以参考一个 [可视化的demo](https://muzea-demo.github.io/random-data/graph.html) 它的源码 [源码](graph.html)，在输出数据有 `graph` 的时候会自动画图。


# generator 生成器类型

指定一个表达式来生成一个数据

这个类型引入了本地变量的概念，`ref`、`prev`、`index`，在这里会成为局部的保留字

语法

constraint g generator initValue expression

- `initValue` 初始值 **第一次取值的时候仍然会用 `expression` 去求一次值**，也就是说，`initValue` 是 `ref[0]`，第一次输出的值是 `ref[1]`
- `expression` 一个合法的、不换行的 `js_Expression` 它需要返回一个值

例如

```text
constraint g generator 0 prev+index
```

## 什么是局部的保留字

显然这个类型我们需要引用一些特殊的信息，比如当前处在 `列表` 的第几个，之前的值是什么样子的，所以需要在里面占用掉一些变量的名字。

但是这几个变量只有在这个约束求值的时候才会存在，所以叫做局部的保留字。

你仍然可以使用 `index` 作为一个约束的变量名，这不会冲突，只是在 `generator` 约束的求值中无法访问这个变量。

# format 语法

现在允许重写一个约束渲染时候的 `template`

语法

format varName template

比如

```text
constraint w int 1 10
constraint g graph graphNum nodeNum edgeNum
format g ${value[0]} ${value[1]} ${w}
```

这样可以实现有权图，目前这个语法主要用来扩展 `graph` 类型

## 影响

这个信息会挂在到约束上面

因为 `stringify` 的时候是没有 `format` 信息的，所以这里

@todo

- [ ] 如果数据挂在到约束上面 (现在的 `shuffle`) 那么多 `store` 的设计会有问题，需要修改
- [ ] 如果不挂到约束上面，可能需要重新设计几个模块交互的api `rawTemplate` `rawValue`
- [ ] 求值顺序 对于一个 `graph` 来说，是求完所有的边再取 `format` 计算，还是一条边算完 `format` 再算下一条边

## 对其他类型

可以配合 `reference` 来实现一些数据的输出
