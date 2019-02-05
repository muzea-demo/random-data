import fs from 'fs';
import { parse, generator } from './main.mjs';

/**
 * 在模板中的变量在求值之后应该被正确的存储到 store
 * 后面用到的时候应该被正确的取出
 */
(function basic() {
  const template = fs.readFileSync('./sample/basic.txt', { encoding: 'utf8' });
  const result = parse(template);
  const strResult = generator(...result);
  const list = strResult.split('\n');
  const n = parseInt(list[0], 10);
  if (list.filter(it => it).length === (n + 1)) {
    return true;
  }
  process.exit(1);
})();

