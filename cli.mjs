import { parse } from './parse.mjs'
import { generate } from './generate.mjs'
import { stringify } from './stringify.mjs'

// 使用示例
// cat sample/basic.txt| xargs -0 yarn run random
const ret = parse(process.argv[2]);
const list = generate(...ret);
console.log(
  JSON.stringify(list, null, 2)
);
console.log(stringify(list));
