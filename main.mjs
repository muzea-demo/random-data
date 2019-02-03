import { shuffleArray, isString, getRandomInt, isNumberString, range } from './lib.mjs'

/**
 * repeat n CONTENT
 */

/**
 * repeat group n
 * repeat line
 * repeat line
 * end group
 */


/**
 * {
 *   type: 'line'
 *   repeat: string
 *   template: string,
 * }
 * 
 * 
 * {
 *   type: 'group'
 *   repeat: string
 *   children: line[]
 * }
 * 
 * 
 */


const Flag = {
  shuffle: 'shuffle',
};

function parseFlag(flagPart) {
  const ret = {};
  if (isString(flagPart)) {
    flagPart.split(' ').forEach((flagItem) => {
      const key = flagItem.trim();
      ret[key] = true
    });
  }
  return ret;
}

function isConstraint(line) {
  return line.startsWith('constraint');
}

function isRepeat(line) {
  return line.startsWith('repeat');
}

function isRepeatGroup(line) {
  return line.startsWith('repeat group');
}

function isGroupEnd(line) {
  return line.startsWith('end group');
}

const repeatGroupStartLength = 'repeat group '.length;

function parse(input) {
  const ret = [];
  /**
   * constraint n int lower higher | flags
   * constraint n set values | flags
   * constraint n graph 1 nodeNumber edgeNumber | flags
   * @todo constraint n float lower higher length
   * 
   * flags   shuffle directed
   * 
   * key is name
   * {
   *   type: 'int',
   *   lower: string,
   *   higher: string
   * }
   */
  const constraint = {};
  function addIntConstraint(name, [lower, higher], flag) {
    constraint[name] = {
      lower: lower,
      higher: higher,
      type: 'int',
      flag
    };
  }
  function addSetConstraint(name, list, flag) {
    constraint[name] = {
      list: list,
      type: 'set',
      flag
    };
  }
  function addGraphConstraint(name, [graphNum, nodeNum, edgeNum], flag) {
    constraint[name] = {
      graphNum,
      nodeNum,
      edgeNum,
      type: 'graph',
      flag
    };
  }
  const list = input.split('\n');
  let index = 0;
  const end = list.length;
  while (index !== end) {
    const line = list[index];
    while (true) {
      if (isConstraint(line)) {
        const [definePart, flagsPart] = line.split('|');
        const [_, name, type, ...other] = definePart.split(' ');
        const flag = parseFlag(flagsPart);
        if (type === 'int') {
          addIntConstraint(name, other, flag);
          break;
        }
        if (type === 'set') {
          addSetConstraint(name, other, flag);
          break;
        }
        if (type === 'graph') {
          addGraphConstraint(name, other, flag);
          break;
        }
        break;
      }
      if (isRepeatGroup(line)) {
        const repeat = line.substr(repeatGroupStartLength);
        const children = [];
        index += 1;
        while (!isGroupEnd(list[index])) {
          const repeatLine = list[index];
          const repeatStart = 'repeat '.length;
          const repeatEnd = repeatLine.indexOf(' ', repeatStart);
          const repeat = repeatLine.substr(repeatStart, repeatEnd - repeatStart);
          children.push({
            template: repeatLine.substr(repeatEnd + 1),
            repeat: repeat,
            type: 'line'
          });
          index += 1;
        }
        ret.push(
          {
            type: 'group',
            repeat: repeat,
            children: children
          }
        );
        break;
      }
      if (isRepeat(line)) {
        // repeat n CONTENT
        const repeatStart = 'repeat '.length;
        const repeatEnd = line.indexOf(' ', repeatStart);
        const repeat = line.substr(repeatStart, repeatEnd - repeatStart);
        ret.push({
          template: line.substr(repeatEnd + 1),
          repeat: repeat,
          type: 'line',
        });
        break;
      }
      break;
    }
    index += 1;
  }
  return [ret, constraint];
}

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
  const maxEdgeCount = (nodeCount * (nodeCount - 1)) / 2;
  const neededEdgeCount = edgeNumber;
  if (neededEdgeCount >= maxEdgeCount) {
    // 全联通图
    let index = 0;
    while (index !== nodeCount) {
      const indexValue = nodeList[index];
      let childIndex = index + 1;
      while (childIndex !== nodeCount) {
        const childValue = nodeList[childIndex];
        if (childValue > indexValue) {
          ret.push([indexValue, childValue])
        } else {
          ret.push([childValue, indexValue])
        }
        childIndex += 1;
      }
      index += 1;
    }
    return ret;
  }
  // 随机一个生成树出来，先整一个联通图
  const sa = shuffleArray(nodeList.slice());
  // 还未添加子节点的列表开始
  let prevParentIndex = 0;
  // 还未使用过的节点的开始
  let index = 1;
  // 剩余节点数量
  let remainder = nodeList.length - 1;
  while (prevParentIndex !== index && remainder) {
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

function generator(list, constraint) {

  // 根据约束 产生一个随机值
  function getRandomValue(store, name) {
    const constraintItem = constraint[name];
    let value = null;
    switch (constraintItem.type) {
      case 'int': {
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
          value = shuffleObj.list[shuffleObj.index];
          shuffleObj.index += 1;
        } else {
          value = getRandomInt(min, max);
        }
        break;
      }
      case 'set': {
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
          value = shuffleObj.list[shuffleObj.index];
          shuffleObj.index += 1;
        } else {
          value = list[getRandomInt(0, list.length)];
        }
        break;
      }
      case 'graph': {
        value = getRandomGraph(store, constraintItem);
        break;
      }
    }

    store[name] = value;
    return value;
  }

  function getRandomGraph(store, config) {
    let ret = '';
    const { nodeNum, edgeNum } = config;
    const nodeValue = getValueFromString(store, nodeNum);
    const edgeValue = getValueFromString(store, edgeNum);
    const nodeList = range(1, nodeValue + 1);
    const edgeList = getRandomSubGraph(nodeList, edgeValue);
    edgeList.forEach((edge) => {
      ret += `${edge[0]} ${edge[1]}\n`;
    });
    return ret;
  }

  // 获取一个值 没有的话就随机一个
  function getValue(store, name) {
    if (!store.hasOwnProperty(name)) {
      store[name] = getRandomValue(store, name);
    }
    return store[name];
  }

  function getValueFromString(store, name) {
    if (isNumberString(name)) {
      return parseInt(name, 10);
    }
    // 支持运算，这个就比较复杂了 目前只支持运算一次，仅限于 int 类型
    // 拙劣的实现 见笑了
    // 运算符一般不是第一个字符
    if (name.indexOf('*') > 0) {
      const [v1, v2] = name.split('*');
      return getValueFromString(store, v1) * getValueFromString(store, v2);
    }
    if (name.indexOf('+') > 0) {
      const [v1, v2] = name.split('+');
      return getValueFromString(store, v1) + getValueFromString(store, v2);
    }
    if (name.indexOf('-') > 0) {
      const [v1, v2] = name.split('-');
      return getValueFromString(store, v1) - getValueFromString(store, v2);
    }
    // 暂时没有除法
    return getValue(store, name);
  }

  function valueOfTemplate(store, template) {
    return template.replace(/\${(.+?)}/g, (_, name) => {
      return getRandomValue(store, name);
    });
  }

  const repeator = {
    line(store, repeat, template) {
      let i = 0;
      let ret = '';
      while (i !== repeat) {
        ret += valueOfTemplate(store, template)
        ret += '\n';
        i += 1;
      }
      return ret;
    },
    group(store, repeat, children) {
      let i = 0;
      let ret = '';
      while (i !== repeat) {
        children.forEach((item) => {
          const repeat = getValueFromString(store, item.repeat);
          ret += repeator.line(store, repeat, item.template);
        })
        i += 1;
      }
      return ret;
    }
  }

  const store = {};
  let ret = '';
  list.forEach((item) => {
    switch (item.type) {
      case 'line': {
        const repeat = getValueFromString(store, item.repeat);
        ret += repeator.line(store, repeat, item.template);
        break;
      }
      case 'group': {
        const repeat = getValueFromString(store, item.repeat);
        ret += repeator.group(store, repeat, item.children);
        break;
      }
    }
  })
  return ret;
}

export { parse, generator }
