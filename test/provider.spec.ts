import { resolve } from 'path';
import { isMainThread } from 'worker_threads';

import { describe, it, expect } from '@jest/globals';

import { DustThread, DustContainer } from '../src/common/base';

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

describe('DustContainer execute', () => {
  const container = new DustContainer();

  it('Test create task and execute with pool', async () => {
    container.create(
      'task',
      workers.task,
      {
        worker: { useAbsolute: true },
        pool: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const result = await container.execute(
      'task',
      1,
      2,
    );

    const result2 = await container.execute(
      'task2',
      1,
      2,
    );

    expect(result2).toBe(null);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
    await container.close('task');
  });

  it('Test create async task and execute with pool', async () => {
    container.create(
      'async-task',
      workers['async-task'],
      {
        worker: { useAbsolute: true },
        pool: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const result = await container.execute(
      'async-task',
      1,
      2,
    );

    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
    await container.close('async-task');
  });

  it('Test create error task and execute with pool', async () => {
    container.create(
      'error',
      workers.error,
      {
        worker: { useAbsolute: true },
        pool: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const result = await container.execute('error');

    expect(result).toEqual((null));
    await container.close('error');
  });
});

describe('DustContainer Push', () => {
  const container = new DustContainer();

  it('Test create task and push with pool but use error path', async () => {
    try {
      container.create(
        'error-task',
        workers.task,
      );
    } catch (error) {
      expect(!!error).toBe(true);
    }
  });

  it('Test create task and push with pool', async () => {
    container.create(
      'push-task',
      workers.task,
      {
        worker: { useAbsolute: true },
      },
    );

    container.push(
      'push-task',
      1,
      2,
    );

    await container.close('push-task');
  });
});
