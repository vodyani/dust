/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { resolve } = require('path');

const { toSleep } = require('@vodyani/core');
const { expose } = require('threads/worker');

expose(
  async function makeFile() {
    const tempPath = resolve(__dirname, '../../temp');

    if (!existsSync(tempPath)) {
      mkdirSync(tempPath);
    }

    await toSleep(200);

    writeFileSync(`${tempPath}/${Date.now()}.txt`, 'Hello, World!');
  },
);
