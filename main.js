
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

function parse(input) {
  const ret = [];
  /**
   * constraint n int lower higher
   * constraint n set value1 value2 value3
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
  function addIntConstraint(name, [lower, higher]) {
    constraint[name] = {
      lower: lower,
      higher: higher,
      type: 'int'
    };
  }
  function addSetConstraint(name, list) {
    constraint[name] = {
      list: list,
      type: 'set'
    };
  }
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
        if (type === 'set') {
          addSetConstraint(name, other);
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

function isNumberString(str) {
  return /^-?\d+$/.test(str)
}

function getRandomInt(min, max) {
  let fix = 0;
  if (min < 0) {
    fix = min;
    min = 0;
    max -= fix;
  }
  return Math.floor(Math.random() * (max - min)) + min + fix;
}

function generator(list, constraint) {

  // 根据约束 产生一个随机值
  function getRandomValue(store, name) {
    const constraintItem = constraint[name];
    let value = null;
    switch (constraintItem.type) {
      case 'int': {
        const { lower, higher } = constraintItem;
        const min = getValueFromString(store, lower);
        const max = getValueFromString(store, higher);
        value = getRandomInt(min, max);
        break;
      }
      case 'set': {
        const { list } = constraintItem;
        value = list[getRandomInt(0, list.length)];
        break;
      }
    }

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

  function valueOfTemplate(store, template) {
    return template.replace(/\${(.+?)}/g, (_, name) => {
      return getRandomValue(store, name);
    })
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
