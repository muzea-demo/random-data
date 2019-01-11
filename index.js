const fs = require("fs");
const rawTemplate = fs.readFileSync("/dev/stdin", "utf-8");

/**
 * constraint n int lower higher
 * @todo constraint n float lower higher length
 * 
 * key is name
 * {
 *   type: 'int',
 *   lower: string,
 *   higher: string
 * }
 */
const constraint = {};

/**
 * repeat n CONTENT
 */

/**
 * repeat group n
 * line
 * line
 * end group
 */


 /**
  * {
  *   type: 'line'
  *   repeat?: string
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
const line = []

function isConstraint(line) {
  return line.startsWith('constraint')
}

function isRepeat(line) {
  return line.startsWith('repeat')
}

function isRepeatGroup(line) {
  return line.startsWith('repeat group')
}

function isGroupEnd(line) {
  return line.startsWith('end group')
}

const repeatGroupStartLength = 'repeat group '.length;

function addIntConstraint(name, [lower, higher]) {
  constraint[name] = {
    lower: lower,
    higher: higher
  };
}

// function parseLine(line) {
//   const ret = {
//     template: line,
//     variable: []
//   };
//   let index = 0;
//   const end = line.length;
//   let isVar = false;
//   while (index < end) {
//     let tokenEnd = index;
//     if (isVar) {
//       while (line[tokenEnd] !== '}') {
//         tokenEnd += 1;
//       }
//       ret.variable.push(line.substr(index, tokenEnd - index));
//       tokenEnd += 1;
//     } else {
//       tokenEnd = line.indexOf('${', tokenEnd)
//       if (tokenEnd >= 0) {
//         tokenEnd += 2;
//       } else {
//         break;
//       }
//     }
//     index = tokenEnd;
//     isVar = !isVar;
//   }
//   return ret;
// }

function parse(input) {
  const ret = [];
  const list = input.split('\n');
  let index = 0;
  const end = list.length;
  while (index !== end) {
    const line = list[index];
    while (true) {
      if (isConstraint(line)) {
        const [_, name, type, ...other] = line.split(' ');
        if (type === 'int') {
          addIntConstraint(name, other);
          break;
        }
        break;
      }
      if (isRepeatGroup(line)) {
        const repeat = line.substr(repeatGroupStartLength);
        const  children = [];
        index += 1;
        while (!isGroupEnd(list[index])) {
          const repeatLine = list[index];
          children.push({
            template: repeatLine,
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
  return ret;
}

const list = parse(rawTemplate);

function isNumberString(str) {
  return /^\d+$/.test(str)
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// 根据约束 产生一个随机值
function getRandomValue(store, name) {
  const constraintItem = constraint[name];

  // int
  const { lower, higher } = constraintItem;
  const min = getValueFromString(store, lower);
  const max = getValueFromString(store, higher);
  const value = getRandomInt(min, max);
  store[name] = value;
  return value;
}

// 获取一个值 没有的话就随机一个
function getValue(store, name) {
  if (!store.hasOwnProperty(name)) {
    store[name] = getRandomValue(store, name)
  }
  return store[name]
}

function getValueFromString(store, name) {
  if (isNumberString(name)) {
    return parseInt(name, 10);
  }
  return getValue(store, name);
}

const repeator = {
  line(store, repeat, template) {
    let i = 0;
    let ret = '';
    while (i !== repeat) {
      ret += template.replace(/\${(.+?)}/g, (_, name) => {
        return getRandomValue(store, name);
      })
      ret += '\n';
      i += 1;
    }
    return ret;
  }
}

function generator() {
  const store = {};
  let ret = '';
  list.forEach((item) => {
    switch (item.type) {
      case 'line': {
        const repeat = getValueFromString(store, item.repeat);
        ret += repeator.line(store, repeat, item.template);
      }
    }
  })
  return ret;
}

console.log(generator())
