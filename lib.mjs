/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * @param {any[]} array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function isString(maybe) {
  return (typeof maybe) === 'string';
}

function isUndefined(value) {
  return value === undefined;
}

/**
 * 
 * @param {number} min
 * @param {number} max
 * @return {number} [min, max)
 */
function getRandomInt(min, max) {
  let fix = 0;
  if (min < 0) {
    fix = min;
    min = 0;
    max -= fix;
  }
  return Math.floor(Math.random() * (max - min)) + min + fix;
}

/**
 * 返回一个列表 [start, end)
 * @param {number} start 
 * @param {number} end 
 * @return {number[]}
 */
function range(start, end) {
  const ret = [];
  while (start < end) {
    ret.push(start);
    start += 1;
  }
  return ret;
}

/**
 * 分割数组里面的元素
 * @param {number[]} list
 * @param {number} num 要分割成几份
 * @return {number[][]}
 */
function splitArray(list, num) {
  const indexList = range(1, list.length);
  shuffleArray(indexList);
  const usedIndex = indexList.slice(0, num - 1).sort();
  const ret = [];
  let start = 0;
  usedIndex.forEach((value) => {
    ret.push(list.slice(start, value));
    start = value;
  });
  ret.push(list.slice(start));
  return ret;
}

let _global;
try {
  _global = global;
} catch (error) {
  _global = window;
}

function valueOf(expStr, getValue) {
  const func = new Function('env', `with(env){return ${expStr}}`);
  const env = new Proxy({}, {
    get: function(_, key){
      const value = getValue(key);
      return (isUndefined(value) ? _global[key] : value);
    },
    has: function (_, key) {
      return true;
    },
  });
  return func(env);
}

const Flag = {
  shuffle: 'shuffle',
};

const Type = {
  int: 'int',
  set: 'set',
  graph: 'graph',
};

export {
  shuffleArray,
  getRandomInt,
  isString,
  valueOf,
  range,
  splitArray,
  Flag,
  Type,
}
