/* eslint-disable @typescript-eslint/no-var-requires */
const { existsSync, rmSync } = require('fs');
const { resolve } = require('path');

const { expose } = require('threads/worker');

expose(
  async function removeFile() {
    const tempPath = resolve(__dirname, '../../temp');

    if (existsSync(tempPath)) {
      rmSync(tempPath, { recursive: true });
    }
  },
);
