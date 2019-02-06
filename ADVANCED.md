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

给 `graph` 使用，指明是有向图。

但是处理联通和强联通上有些问题，所以暂时没有实现。

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

也可以参考一个 [可视化的demo](https://muzea-demo.github.io/random-data/graph.html) 它的源码 [源码](graph.html)
