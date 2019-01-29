<h1>随机数据产生姬</h1>

这是一个字符串拼接工具，可以用于OJ的测试数据生成， [点我在线体验](https://muzea-demo.github.io/random-data/)。

- [语法](#语法)
  - [constraint 的语法](#constraint-的语法)
    - [int类型](#int类型)
    - [set类型](#set类型)
  - [repeat 的语法](#repeat-的语法)
    - [line类型](#line类型)
    - [group类型](#group类型)
- [案例](#案例)
  - [普通案例](#普通案例)
  - [sql测试数据](#sql测试数据)
- [更新计划](#更新计划)

## 语法

假装自己有个 CFG

```bnf
template      = *[statement 1*breakLine]
breakLine     = "\n"
statement     = constraint | repeat
constraint    = intConstraint | setConstraint
intConstraint = "constraint" " " varName " " "int" " " number " " number
setConstraint = "constraint" " " varName " " "set" " " setValues
setValues     = stringValue [ " " setValues ]
repeat        = repeatLine | repeatGroup
repeatLine    = "repeat" " " varName|number " " repeatContent
repeatGroup   = "repeat group" " " varName|number breakLine *[ repeatLine breakLine ] "end group"
repeatContent = (utf8char - "$") | ( "${" varName "}" ) *repeatContent
varName       = stringValue
number        = 1*digit
digit         = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
stringValue   = 1*utf8char
```



现在只支持两种语句

constraint 约束 限制变量取值

repeat 重复 会输出内容

重要 每一个变量都需要有约束

### constraint 的语法

#### int类型
```text
constraint 变量名 int 最小值 最大值
```
比如
```text
constraint n int 1 233
```
变量名 最好都是字母（汉字也行）

最小值和最大值可以是别的变量名

区间是左闭右开

#### set类型
```text
constraint 变量名 set value1 value2 value3
```
比如
```text
constraint 数字 set 一 二 三 四
```
value之间使用空格分隔

### repeat 的语法

#### line类型

repeat 重复次数 重复的内容

重复次数 可以是一个数字，也可以是一个变量

从紧跟 重复次数 的空格后面开始，到这一行结束都会被视为一个模板，我们使用 `${变量名}` 来引用一个变量

比如
```text
repeat 1 ${n}
```
亦或者
```text
repeat 1 prefix string ${n}
```
都是被允许的

#### group类型

```text
repeat group 重复次数
repeat line
repeat line
repeat line
end group
```

重复次数 可以是一个数字，也可以是一个变量

## 案例

### 普通案例

举个例子，假如我们的数据是

第一行输入一个n，代表接下来有n行数据，每行数据有三个数a b c

那么就是
```text
repeat 1 ${n}
repeat n ${a} ${b} ${c}
```
然后补充一下约束就好了

再举一个例子

假如我们的数据是这个样子的

第一行是n，代表接下来有n组数据

每组数据的第一行有三个数row min max，代表接下来有row个数字，每个数字的取值是 [min, max)

那我们可以这样写

```text
constraint n int 5 10
constraint row int 10 20
constraint min int 150 200
constraint max int 500 1000
constraint num int min max
repeat 1 ${n}
repeat group n
repeat 1 ${row} ${min} ${max}
repeat row ${num}
end group
```

来一个set的例子

```text
constraint 姓 set 赵 钱 孙 李
constraint 名 set 一 二 三 四
repeat 10 ${姓}${名}
```

当然，本质是个字符串拼接，也可以写别的东西

### sql测试数据

```text
constraint 姓 set 赵 钱 孙 李
constraint 名 set 一 二 三 四
constraint value int 10 1000
constraint status int 0 2
repeat 10 INSERT INTO list (name, value, status) VALUES ("${姓}${名}", ${value}, ${status});
```

**程序没有检查输入是否合法，所以需要你自己注意一下 :)**

## 更新计划

不存在的
