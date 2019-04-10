import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { parse } from './parse.mjs';
import { generate } from './generate.mjs';
import { stringify } from './stringify.mjs';

const templateFileName = 'template.txt';
const mainFileName = 'Main';
const cwd = process.cwd();
const times = parseInt(process.argv[2], 10);
const hasMain = existsSync(join(cwd, mainFileName));

if (times < 1 || times > 99) {
  console.error('number of times is required');
  process.exit(1);
}

const templateConfig = parse(readFileSync(join(cwd, templateFileName), { encoding: 'utf8' }));
const templateConfigStr = JSON.stringify(templateConfig);
let i = 0;
while (i !== times) {
  const list = generate(...JSON.parse(templateConfigStr));
  i += 1;
  const outputFileName = `template.${i}.in`;
  writeFileSync(join(cwd, outputFileName), stringify(list));
  if (hasMain) {
    execSync(`cat ./${outputFileName} | ./Main > template.${i}.out`);
  }
}
