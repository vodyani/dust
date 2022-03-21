/* eslint-disable @typescript-eslint/no-var-requires */
const { isMainThread } = require('worker_threads');

const { expose } = require('threads/worker');


expose(
  function addTask(a, b) {
    return {
      count: a + b,
      isMainThread,
    };
  },
);
