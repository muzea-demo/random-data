import { parse, generator } from './main.mjs';

// 使用示例
// cat sample/basic.txt| xargs -0 yarn run random
const ret = parse(process.argv[2]);
console.log(generator(...ret));
