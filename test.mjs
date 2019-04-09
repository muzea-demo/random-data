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


(function unlink() {
  const template = fs.readFileSync('./sample/graph.unlink.txt', { encoding: 'utf8' });
  const result = parse(template);
  const listResult = generate(...result);
  const [limit, graph] = listResult;
  const maxNodeNum = limit.values[0].value;
  const edgeNum = limit.values[1].value;
  const _c1 = limit.values[2].value;
  const _c2 = limit.values[3].value;
  const [c1, c2] = [_c1, _c2].sort((a, b) => a - b);
  const edgeList = graph.values[0].value;
  if (edgeList.length !== edgeNum) {
    process.exit(1);
  }
  if (edgeList.some((edge) => {
    if (c1 === edge[0] && c2 === edge[1]) {
      return true;
    }
    return edge[0] <=0 || edge[1] <=0 || edge[0] > maxNodeNum || edge[1] > maxNodeNum;
  })) {
    process.exit(1);
  }
})();
