/* eslint-disable @typescript-eslint/no-var-requires */
const { rmdirSync, existsSync } = require('fs');
const { resolve } = require('path');

const { expose } = require('threads/worker');

expose(
  async function removeFile() {
    const tempPath = resolve(__dirname, '../../temp');

    if (existsSync(tempPath)) {
      rmdirSync(tempPath, { recursive: true });
    }
  },
);
