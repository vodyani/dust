/* eslint-disable @typescript-eslint/no-var-requires */
const { expose } = require('threads/worker');


expose(
  function error() {
    throw new Error('Something went wrong');
  },
);
