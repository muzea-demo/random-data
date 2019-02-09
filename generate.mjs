import { shuffleArray, getRandomInt, range, valueOf, splitArray, Type, Flag } from './lib.mjs'

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
 * 给定顶点的集合，边的数量，返回一个边的集合
 * 这个图是一个联通图
 * @param {number[]} nodeList 顶点集合
 * @param {number} edgeNumber 边的数量
 * @return {[number, number][]} 边的集合
 */
function getRandomSubGraph(nodeList, edgeNumber) {
  const ret = [];
  const nodeCount = nodeList.length;
  const maxEdgeCount = maxEdge(nodeCount);
  const neededEdgeCount = edgeNumber;
  if (neededEdgeCount > maxEdgeCount) {
    // 这里是数据错误，其实是不对的
    throw new Error('边的数量过大 无法生成图');
  }
  // 随机一个生成树出来，先整一个联通图
  const sa = shuffleArray(nodeList.slice());
  // 还未添加子节点的列表开始
  let prevParentIndex = 0;
  // 还未使用过的节点的开始
  let index = 1;
  // 剩余节点数量
  let remainder = nodeList.length - 1;
  while (remainder) {
    const currentValue = sa[prevParentIndex];
    const childCount = getRandomInt(1, remainder + 1);
    let childIndex = 0;
    while (childIndex !== childCount) {
      const currentChildValue = sa[index + childIndex];
      if (currentValue > currentChildValue) {
        ret.push([currentChildValue, currentValue])
      } else {
        ret.push([currentValue, currentChildValue])
      }
      childIndex += 1;
    }
    prevParentIndex += 1;
    remainder -= childCount;
    index += childCount;
  }
  // 现在我们有了一个联通图了，接下来就是胡乱加边
  // 其实我觉得可以直接完全随机出所有的边，然后随机化一下，把前面的直接挑出来用
  // 一个图如果接近全联通的时候，随机加边的效率会比较低
  // 度比较小的时候整出来所有的边效率会比较低
  // 等我写完基本逻辑后对比一下 :)
  while (neededEdgeCount > ret.length) {
    let i1;
    let i2;
    i1 = getRandomInt(0, nodeCount - 1);
    if (i1 === (nodeCount - 2)) {
      i2 = nodeCount - 1;
    } else {
      i2 = getRandomInt(i1 + 1, nodeCount)
    }
    const v1 = nodeList[i1];
    const v2 = nodeList[i2];
    const edge = [];
    if (v1 > v2) {
      edge.push(v2, v1);
    } else {
      edge.push(v1, v2);
    }
    if (!hasEdge(ret, edge)) {
      ret.push(edge);
    }
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
    }

    store[name] = value.value;
    return value;
  }

  function getRandomGraph(store, config) {
    let ret = [];
    const { nodeNum, edgeNum, graphNum } = config;
    const graphValue = getValueFromString(store, graphNum);
    const nodeValue = getValueFromString(store, nodeNum);
    const edgeValue = getValueFromString(store, edgeNum);
    const nodeList = range(1, nodeValue + 1);
    // 等一个优雅的可以指定每个图有多少边的语法
    if (graphValue === 1) {
      Array.prototype.push.apply(ret, getRandomSubGraph(nodeList, edgeValue));
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
          Array.prototype.push.apply(ret, getRandomSubGraph(list, edgeValue - usedEdge));
        } else {
          let subRealEdge = Math.min(subMaxEdge, Math.floor(p * subMaxEdge));
          subRealEdge = Math.max(subRealEdge, list.length - 1);
          if ((subRealEdge + usedEdge) > edgeValue) {
            Array.prototype.push.apply(ret, getRandomSubGraph(list, edgeValue - usedEdge));
            usedEdge = edgeValue;
          } else {
            usedEdge += subRealEdge;
            Array.prototype.push.apply(ret, getRandomSubGraph(list, subRealEdge));
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
