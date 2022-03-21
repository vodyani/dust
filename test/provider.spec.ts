import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';

import { Dust } from '../src/common/base';

const workers = {
  'task': resolve(__dirname, './worker/task.js'),
  'async-task': resolve(__dirname, './worker/async-task.js'),
  'transferable-task': resolve(__dirname, './worker/transferable-task.js'),
};

describe('Dust', () => {
  it('Test create Dust task', async () => {
    const dust = new Dust(workers.task, { isAbsolutePath: true });
    const result = await dust.execute(1, 2);
    expect(result).toBe(3);
  });
});
