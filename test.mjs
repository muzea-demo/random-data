import fs from 'fs';
import { parse } from './parse.mjs'
import { generate } from './generate.mjs'
import { stringify } from './stringify.mjs'

/**
 * 在模板中的变量在求值之后应该被正确的存储到 store
 * 后面用到的时候应该被正确的取出
 */
(function basic() {
  const template = fs.readFileSync('./sample/basic.txt', { encoding: 'utf8' });
  const result = parse(template);
  const listResult = generate(...result);
  const strResult = stringify(listResult);
  const list = strResult.split('\n');
  const n = parseInt(list[0], 10);
  if (list.filter(it => it).length === (n + 1)) {
    return true;
  }
  process.exit(1);
})();

