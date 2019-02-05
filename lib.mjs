/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
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

function isNumberString(str) {
  return /^-?\d+$/.test(str)
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
      return (value ? value : _global[key]);
    },
    has: function (_, key) {
      return true;
    },
  });
  return func(env);
}

export {
  shuffleArray,
  getRandomInt,
  isNumberString,
  isString,
  valueOf,
  range
}
