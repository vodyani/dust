import { resolve } from 'path';
import { isMainThread } from 'worker_threads';

import { describe, it, expect } from '@jest/globals';

import { DustThread } from '../src/common/base';

const workers = {
  'task': resolve(__dirname, './worker/task.js'),
  'error': resolve(__dirname, './worker/error.js'),
  'async-task': resolve(__dirname, './worker/async-task.js'),
  'transferable-task': resolve(__dirname, './worker/transferable-task.js'),
};

describe('Dust', () => {
  it('Test create task', async () => {
    const dustThread = new DustThread(workers.task, { useAbsolute: true });
    const result = await dustThread.execute(1, 2);

    expect(isMainThread).toBe(true);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
  });

  it('Test create async task', async () => {
    const dustThread = new DustThread(workers['async-task'], { useAbsolute: true });
    const result = await dustThread.execute(1, 2);

    expect(isMainThread).toBe(true);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
  });

  it('Test create task but use error path', async () => {
    try {
      // eslint-disable-next-line no-new
      new DustThread('../test/worker/task.js');
    } catch (error) {
      expect(!!error).toBe(true);
    }
  });

  it('Test create Error task', async () => {
    const dustThread = new DustThread(workers.error, { useAbsolute: true });

    try {
      await dustThread.execute();
    } catch (error) {
      expect(error.message).toBe('Something went wrong');
    }
  });
});
