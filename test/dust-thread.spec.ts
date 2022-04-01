/* eslint-disable no-new */
import { resolve } from 'path';
import { isMainThread } from 'worker_threads';

import { describe, it, expect } from '@jest/globals';

import { DustThread } from '../src/base';

const handlers = {
  'task': resolve(__dirname, './worker/task.js'),
  'error': resolve(__dirname, './worker/error.js'),
  'asyncTask': resolve(__dirname, './worker/async-task.js'),
};

describe('DustThread', () => {
  it('Test create task', async () => {
    const dustThread = new DustThread(handlers.task);
    const result = await dustThread.execute(1, 2);

    expect(isMainThread).toBe(true);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
  });

  it('Test create async task', async () => {
    const dustThread = new DustThread(handlers.asyncTask, { useRelative: false });
    const result = await dustThread.execute(1, 2);

    expect(isMainThread).toBe(true);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
  });

  it('Test create Error task', async () => {
    const dustThread = new DustThread(handlers.error);

    try {
      await dustThread.execute();
    } catch (error) {
      expect(error.message).toBe('ERROR_BY_DUST');
    }
  });
});
