import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { isMainThread } from 'worker_threads';

import { describe, it, expect } from '@jest/globals';

import { DustThread, DustContainer } from '../src/common/base';

const workers = {
  'task': resolve(__dirname, './worker/task.js'),
  'error': resolve(__dirname, './worker/error.js'),
  'make-file': resolve(__dirname, './worker/make-file.js'),
  'async-task': resolve(__dirname, './worker/async-task.js'),
  'remove-file': resolve(__dirname, './worker/remove-file.js'),
  'transferable-task': resolve(__dirname, './worker/transferable-task.js'),
};

describe('Dust', () => {
  it('Test create task', async () => {
    const dustThread = new DustThread(workers.task);
    const result = await dustThread.execute(1, 2);

    expect(isMainThread).toBe(true);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
  });

  it('Test create async task', async () => {
    const dustThread = new DustThread(workers['async-task'], { useRelative: false });
    const result = await dustThread.execute(1, 2);

    expect(isMainThread).toBe(true);
    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
  });

  it('Test create task but use error path', async () => {
    try {
      // eslint-disable-next-line no-new
      new DustThread('../test/worker/task.js', { useRelative: true });
    } catch (error) {
      expect(!!error).toBe(true);
    }
  });

  it('Test create Error task', async () => {
    const dustThread = new DustThread(workers.error);

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
        pool: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const dust = container.get('task');

    try {
      container.get('errDust');
    } catch (error) {
      expect(error.message).toBe('DustContainer.store does not declare this key: errDust');
    }

    const result = await dust.execute(
      1,
      2,
    );

    const resultList = await Promise.all([
      dust.execute(10, 20),
      dust.execute(30, 40),
    ]);

    expect(result.count).toBe(3);

    expect(result.isMainThread).toBe(false);

    expect(resultList[0].count + resultList[1].count).toBe(100);

    await container.destroy('task');
  });

  it('Test create async task and execute with pool', async () => {
    container.create(
      'async-task',
      workers['async-task'],
      {
        pool: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const dust = container.get('async-task');

    const result = await dust.execute(
      1,
      2,
    );

    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
    await container.destroy('async-task');
  });

  it('Test create error task and execute with pool', async () => {
    container.create(
      'error',
      workers.error,
      {
        pool: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const dust = container.get('error');

    const result = await dust.execute('error');

    expect(result).toEqual((null));
    await container.destroy('error');
  });
});

describe('DustContainer Push', () => {
  const container = new DustContainer();

  it('Test create task and push with pool but use error path', async () => {
    try {
      container.create(
        'error-task',
        workers.task,
        {
          handler: { useRelative: true },
        },
      );
    } catch (error) {
      expect(!!error).toBe(true);
    }
  });

  it('Test create task and push with pool', async () => {
    container.create(
      'push-task',
      workers.task,
    );

    const dust = container.get('push-task');

    dust.push(1, 2);
    dust.push(3, 4);
    dust.push(5, 6);

    await dust.commit();

    await container.destroy('push-task');
  });

  it('Test make file task and push with pool', async () => {
    container.create(
      'make-file',
      workers['make-file'],
    );

    container.create(
      'remove-file',
      workers['remove-file'],
    );

    const dust = container.get('make-file');

    dust.push();
    dust.push();
    dust.push();

    await dust.commit();

    expect(readdirSync(resolve(__dirname, '../temp')).length).toBe(3);

    const rmDust = container.get('remove-file');

    rmDust.push();

    await rmDust.commit();

    expect(existsSync(resolve(__dirname, '../temp'))).toBe(false);

    await container.destroy('make-file');
    await container.destroy('remove-file');
  });
});
