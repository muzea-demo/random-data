## 安装

via npm
```shell
npm -g i @woodenfish/random-data
```

via yarn
```shell
yarn global add @woodenfish/random-data
```

## 使用

### 在哪

程序总是在**当前目录**下生成测试数据。

比如我们要在 `test` 这个目录下生成测试数据，你需要准备两个文件

```shell
test
├── Main
└── template.txt
```

- `template.txt` 里面存放的是数据模板（类似 [graph示例](sample/graph.unlink.txt)）
- `Main` 是标程的可执行文件（可以没有，就不会生成测试输出了，也就是没有`XXXX.out`）

### 参数

只有一个参数，指明生成几份测试数据

### 示例

比如我们在 `test` 目录里面执行

```
random-data 10
```

将会得到

```
test
├── Main
├── template.10.in
├── template.10.out
├── template.1.in
├── template.1.out
├── template.2.in
├── template.2.out
├── template.3.in
├── template.3.out
├── template.4.in
├── template.4.out
├── template.5.in
├── template.5.out
├── template.6.in
├── template.6.out
├── template.7.in
├── template.7.out
├── template.8.in
├── template.8.out
├── template.9.in
├── template.9.out
└── template.txt
```
