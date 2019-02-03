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

# 变量的运算

现在的变量支持一个简单的运算啦，目前只支持 '+' '*' '-'，写起来是这个样子的

```text
constraint M int N 2*N
```

只支持运算一次，且表达式里不能存在空格

# graph 图类型

语法

constraint g graph graphNum nodeNum edgeNum

- `graphNum` 这个图里面有几个联通图，目前只能是 1
- `nodeNum` 这个图里面有几个顶点
- `edgeNum` 这个图里面有几个边

示例参见 [graph](sample/graph.txt)
