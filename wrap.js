#!/usr/bin/env node
const { execSync } = require('child_process');

if (process.argv.length !== 3) {
  console.error('number of times is required');
  process.exit(1);
}
const result = execSync(`node --experimental-modules ${__dirname}/bin.mjs ${process.argv[2]} 2>/dev/null`, { encoding: 'utf8' });
console.log(result);
console.log('done');
