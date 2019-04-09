import { shuffleArray, getRandomInt, range, valueOf, splitArray, removeItem, Type, Flag } from './lib.mjs'

/**
 * 判断一个边是不是在边的集合里面
 * @param {[number, number][]} edgeList 边的集合
 * @param {[number, number]} edge 边
 * @return {boolean}
 */
function hasEdge(edgeList, edge) {
  const v1 = edge[0];
  const v2 = edge[1];
  return edgeList.some((item) => {
    return item[0] === v1 && item[1] === v2;
  })
}

function maxEdge(nodeNum) {
  return (nodeNum * (nodeNum - 1)) / 2;
}

/**
 * @param {number[][]} constraint
 * @param {number[]} edge
 * @returns {boolean} 是否满足约束
 */
function checkUnlink(constraint, edge) {
  return !constraint.some(constraintItem => constraintItem[0] === edge[0] && constraintItem[1] === edge[1]);
}

/**
 * 给定顶点的集合，边的数量，返回一个边的集合
 * 这个图是一个联通图
 *
 * connectivity 构建 left (被现有边集覆盖到的顶点) right (未被现有边集覆盖到的顶点)
 *              0. 根据 nodeList 过滤出有效约束
 *              1. 若有 link 约束 则将约束边加到边集 涉及到的点加到left 然后执行 3 否则执行 2
 *              2. 从 right 随机挑选一个点到 left
 *              3. 从 right 中挑选一个点 r 从 left 中挑选一个点 l
 *              4. 检查 l r 是否符合 unlink 约束
 *                 不符合则重新执行 3
 *                 符合则把边 (l, r) 加到返回值里面 同时把点 r 从 right 移动到 left
 *                 若此时 right 的长度为 0 则 执行 5 否则 执行 3
 *              5. 从 left 中挑选两个点组成一个边 检查 (node1, node2) 是否符合 unlink 约束
 *                 符合则增加一个边 (node1, node2) 重新执行 5 直到 选出来的边满足 edgeNumber
 *                 不符合则重新执行 5
 *
 * validity unlink 目前只在加边的时候校验
 *          link   暂无严格校验
 *
 * @param {number[]} nodeList 顶点集合
 * @param {number} edgeNumber 边的数量
 * @param {{[key: string]: number[][]}} staticConstraint 一些静态约束
 * @return {[number, number][]} 边的集合
 */
function getRandomSubGraph(nodeList, edgeNumber, staticConstraint) {
  const ret = [];
  const left = [];
  const right = nodeList.slice();
  const nodeCount = nodeList.length;
  const maxEdgeCount = maxEdge(nodeCount);
  const neededEdgeCount = edgeNumber;
  /**
   * step 0.
   */
  const effectiveUnlink = staticConstraint[Flag.unlink].filter(([node1, node2]) => {
    return nodeList.includes(node1) && nodeList.includes(node2);
  });
  const effectiveLink = staticConstraint[Flag.link].filter(([node1, node2]) => {
    return nodeList.includes(node1) && nodeList.includes(node2);
  });
  if ((neededEdgeCount + effectiveUnlink.length) > maxEdgeCount) {
    // 这里是数据错误，其实是不对的
    throw new Error('边的数量过大 无法生成图');
  }
  if (effectiveUnlink.length > edgeNumber) {
    // 这里是数据错误，其实是不对的
    throw new Error('[flag][link] 的约束过多 edgeNumber 无法满足要求');
  }
  if (effectiveLink.length) {
    /**
     * step 1.
     */
    effectiveLink.forEach((edge) => {
      if (edge[0] > edge[1]) {
        edge = [edge[1], edge[0]];
      }
      ret.push(edge);
      left.push(edge[0], edge[1]);
      removeItem(right, edge[0]);
      removeItem(right, edge[1]);
      edgeCount += 1;
    });
  } else {
    /**
     * step 2.
     */
    const pickMe = getRandomInt(0, right.length);
    /**
     * @todo 这里存在一个问题，有可能选出来的这个点无法和剩下的点组成边
     */
    left.push(right[pickMe]);
    right.splice(pickMe, 1);
  }
  shuffleArray(right);
  let whileCount = 0;
  while (right.length && whileCount < 233) {
    whileCount += 1;
    /**
     * step 3-4.
     * @todo 这里也存在问题 可能会频繁取到无法组成边的点
     */
    const rightNode = right[0];
    const pickMe = getRandomInt(0, left.length);
    const leftNode = left[pickMe];
    const edge = [leftNode, rightNode].sort((a, b) => a - b);
    if (!checkUnlink(effectiveUnlink, edge)) {
      continue;
    }
    ret.push(edge);
    left.push(rightNode);
    right.shift();
  }
  if (whileCount === 233) {
    throw new Error('循环过多 应该是bug');
  }
  while (neededEdgeCount > ret.length) {
    let i1;
    let i2;
    i1 = getRandomInt(0, nodeCount - 1);
    if (i1 === (nodeCount - 2)) {
      i2 = nodeCount - 1;
    } else {
      i2 = getRandomInt(i1 + 1, nodeCount)
    }
    const edge = [left[i1], left[i2]].sort((a, b) => a - b);
    if (hasEdge(ret, edge)) {
      continue;
    }
    if (!checkUnlink(effectiveUnlink, edge)) {
      continue;
    }
    ret.push(edge);
  }
  return ret;
}

function generate(list, constraint) {

  // 根据约束 产生一个随机值
  function getRandomValue(store, name) {
    if (!(name in constraint)) {
      // 一个变量不存在，应该直接返回
      // 这个时候 getValue 会返回 undefined
      return;
    }
    const constraintItem = constraint[name];
    let value = {};
    switch (constraintItem.type) {
      case 'int': {
        value.type = Type.int;
        const { lower, higher, flag } = constraintItem;
        const min = getValueFromString(store, lower);
        const max = getValueFromString(store, higher);
        if (flag[Flag.shuffle]) {
          const hasShuffleObj = (typeof constraintItem[Flag.shuffle]) === 'object';
          if (!hasShuffleObj) {
            constraintItem[Flag.shuffle] = {
              list: shuffleArray(range(min, max)),
              index: 0,
            };
          }
          const shuffleObj = constraintItem[Flag.shuffle];
          if (shuffleObj.index === shuffleObj.list.length) {
            shuffleObj.list = shuffleArray(range(min, max));
            shuffleObj.index = 0;
          }
          value.value = shuffleObj.list[shuffleObj.index];
          shuffleObj.index += 1;
        } else {
          value.value = getRandomInt(min, max);
        }
        break;
      }
      case 'set': {
        value.type = Type.set;
        const { list, flag } = constraintItem;
        if (flag[Flag.shuffle]) {
          const hasShuffleObj = (typeof constraintItem[Flag.shuffle]) === 'object';
          if (!hasShuffleObj) {
            constraintItem[Flag.shuffle] = {
              list: shuffleArray(list.slice()),
              index: 0,
            };
          }
          const shuffleObj = constraintItem[Flag.shuffle];
          if (shuffleObj.index === shuffleObj.list.length) {
            shuffleObj.list = shuffleArray(list.slice());
            shuffleObj.index = 0;
          }
          value.value = shuffleObj.list[shuffleObj.index];
          shuffleObj.index += 1;
        } else {
          value.value = list[getRandomInt(0, list.length)];
        }
        break;
      }
      case 'graph': {
        value.type = Type.graph;
        const rret = getRandomGraph(store, constraintItem);
        value.value = rret.value;
        value.nodeList = rret.nodeList;
        break;
      }
      case 'alias': {
        value.type = Type.alias;
        const rret = getRandomValue(store, constraintItem.aliasName);
        value.value = rret.value;
        break;
      }
    }

    store[name] = value.value;
    return value;
  }

  function getRandomGraph(store, config) {
    let ret = [];
    const { nodeNum, edgeNum, graphNum, flag } = config;
    const graphValue = getValueFromString(store, graphNum);
    const nodeValue = getValueFromString(store, nodeNum);
    const edgeValue = getValueFromString(store, edgeNum);
    const nodeList = range(1, nodeValue + 1);
    const staticConstraint = {
      [Flag.link]: [],
      [Flag.unlink]: [],
    };
    if (Array.isArray(flag[Flag.link])) {
      flag[Flag.link].forEach(([n1, n2]) => {
        const node1 = getValueFromString(store, n1);
        const node2 = getValueFromString(store, n2);
        staticConstraint[Flag.link].push([node1, node2].sort((a, b) => a - b));
      });
    }
    if (Array.isArray(flag[Flag.unlink])) {
      flag[Flag.unlink].forEach(([n1, n2]) => {
        const node1 = getValueFromString(store, n1);
        const node2 = getValueFromString(store, n2);
        staticConstraint[Flag.unlink].push([node1, node2].sort((a, b) => a - b));
      });
    }
    // 等一个优雅的可以指定每个图有多少边的语法
    if (graphValue === 1) {
      Array.prototype.push.apply(ret, getRandomSubGraph(nodeList, edgeValue, staticConstraint));
    } else {
      const nodeListArr = splitArray(nodeList, graphValue);
      // 检查这个分法是不是可以满足边的约束
      let allEdge = 0;
      nodeListArr.forEach((list) => {
        allEdge += maxEdge(list.length);
      });
      if (allEdge < edgeValue) {
        throw new Error('边的数量过多 无法生成满足约束的图');
      }
      const p = edgeValue / allEdge;
      let usedEdge = 0;
      nodeListArr.forEach((list, index) => {
        const isLast = index === (nodeListArr.length - 1);
        const subMaxEdge = maxEdge(list.length);
        if (subMaxEdge === 0 || edgeValue === usedEdge) {
          if (list.length === 1) {
            return;
          }
          throw new Error('每一个子图都应该是联通的');
        }
        if (isLast) {
          Array.prototype.push.apply(ret, getRandomSubGraph(list, edgeValue - usedEdge, staticConstraint));
        } else {
          let subRealEdge = Math.min(subMaxEdge, Math.floor(p * subMaxEdge));
          subRealEdge = Math.max(subRealEdge, list.length - 1);
          if ((subRealEdge + usedEdge) > edgeValue) {
            Array.prototype.push.apply(ret, getRandomSubGraph(list, edgeValue - usedEdge, staticConstraint));
            usedEdge = edgeValue;
          } else {
            usedEdge += subRealEdge;
            Array.prototype.push.apply(ret, getRandomSubGraph(list, subRealEdge, staticConstraint));
          }
        }
      });
    }
    return { value: ret, nodeList };
  }

  // 获取一个值 没有的话就随机一个
  function getValue(store, name) {
    if (!store.hasOwnProperty(name)) {
      return getRandomValue(store, name);
    }
    // 模板不会引用一个老值
    return { value: store[name] };
  }

  /**
   * 约束 或者 重复 几次
   * 可能是数字也可能是表达式，所以要单独处理
   * @param store 
   * @param name 
   */
  function getValueFromString(store, name) {
    const handler = (varName) => {
      const ret = getValue(store, varName);
      if (ret) {
        return ret.value;
      }
      return ret;
    };
    return valueOf(name, handler);
  }

  function valueOfTemplate(store, template) {
    const values = [];
    const matchArr = template.match(/\${(.+?)}/g);
    if (Array.isArray(matchArr)) {
      matchArr.forEach((matched) => {
        values.push(
          getRandomValue(store, matched.slice(2, -1))
        );
      });
    }
    return values;
  }

  const repeator = {
    line(store, repeat, template) {
      let i = 0;
      let ret = [];
      // {
      //   template,
      //   values: []
      // }
      while (i !== repeat) {
        ret.push({
          template,
          values: valueOfTemplate(store, template)
        });
        i += 1;
      }
      return ret;
    },
    group(store, repeat, children) {
      let i = 0;
      let ret = [];
      while (i !== repeat) {
        children.forEach((item) => {
          const repeat = getValueFromString(store, item.repeat);
          Array.prototype.push.apply(ret, repeator.line(store, repeat, item.template));
        })
        i += 1;
      }
      return ret;
    }
  }

  const store = {};
  let ret = [];
  list.forEach((item) => {
    switch (item.type) {
      case 'line': {
        const repeat = getValueFromString(store, item.repeat);
        Array.prototype.push.apply(ret, repeator.line(store, repeat, item.template));
        break;
      }
      case 'group': {
        const repeat = getValueFromString(store, item.repeat);
        Array.prototype.push.apply(ret, repeator.group(store, repeat, item.children));
        break;
      }
    }
  })
  return ret;
}

export { generate }
