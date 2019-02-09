import { Type } from './lib.mjs'

function stringify(list) {
  let ret = '';
  list.forEach(({ template, values }) => {
    let i = 0;
    ret += template.replace(/\${(.+?)}/g, () => {
      const value = values[i];
      i += 1;
      switch (value.type) {
        case Type.int: case Type.set: {
          return value.value;
        }
        case Type.graph: {
          return value.value.map((edge) => `${edge[0]} ${edge[1]}`).join('\n');
        }
      }
    });
    ret += '\n';
  });
  return ret;
}

export { stringify }
