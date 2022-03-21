import { resolve } from 'path';

import { describe, it } from '@jest/globals';

import { getRelativePath } from '../src/common/method';

const workers = {
  'task': resolve(__dirname, './worker/task.js'),
};

describe('getRelativePath', () => {
  it('get task', async () => {
    const result = getRelativePath(workers.task, __dirname);
    expect(result).toBe('./worker/task.js');
  });
});
