import { isString } from './lib.mjs'

/**
 * 
 * @param {string} str
 */
function isFunctionFlag (str) {
  return str.includes('(')
}

function parseFlag(flagPart) {
  const ret = {};
  if (isString(flagPart)) {
    flagPart.split(' ').forEach((flagItem) => {
      const key = flagItem.trim();
      if (key) {
        if (isFunctionFlag(key)) {
          const preStr = key.replace(/[(),]/g, ' ')
          const [flagName, ...param] = preStr.split(' ')
          if (!Array.isArray(ret[flagName])) {
            ret[flagName] = []
          }
          ret[flagName].push(param)
        } else {
          ret[key] = true;
        }
      }
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
  function addAliasConstraint(name, aliasName) {
    constraint[name] = {
      aliasName,
      type: 'alias',
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
        if (type === 'alias') {
          addAliasConstraint(name, other[0]);
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

export { parse }
