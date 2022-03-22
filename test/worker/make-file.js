/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path');
const { writeFileSync, mkdirSync, existsSync } = require('fs');

const { expose } = require('threads/worker');

let count = 1;

expose(
  async function makeFile() {
    const tempPath = resolve(__dirname, '../../temp');

    if (!existsSync(tempPath)) {
      mkdirSync(tempPath);
    }

    count += 1;

    writeFileSync(`${tempPath}/${count}.txt`, 'Hello, World!');
  },
);
