/* eslint-disable @typescript-eslint/no-var-requires */
const { expose } = require('threads/worker');
const { toDelay } = require('@vodyani/core');

expose(
  async function blocking(name) {
    let count = 0;

    while (count < 2) {
      count++;

      console.log(`${name} - ${count}`);

      await toDelay(100);
    }

    return count;
  },
);
