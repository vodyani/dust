/* eslint-disable @typescript-eslint/no-var-requires */
const { expose } = require('threads/worker');

expose(
  function addTask(a, b) {
    return a + b;
  },
);
