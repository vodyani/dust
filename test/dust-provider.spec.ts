import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';

import { describe, it, expect } from '@jest/globals';

import { DustProvider } from '../src/provider';

const workers = {
  'task': resolve(__dirname, './worker/task.js'),
  'error': resolve(__dirname, './worker/error.js'),
  'make-file': resolve(__dirname, './worker/make-file.js'),
  'async-task': resolve(__dirname, './worker/async-task.js'),
  'remove-file': resolve(__dirname, './worker/remove-file.js'),
};

describe('DustContainer execute', () => {
  const provider = new DustProvider();

  it('Test create task and execute with pool', async () => {
    provider.create(
      'task',
      workers.task,
      {
        poolOptions: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const dust = provider.get('task');

    try {
      provider.get('errDust');
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

    await provider.destroy('task');
  });

  it('Test create async task and execute with pool', async () => {
    provider.create(
      'async-task',
      workers['async-task'],
      {
        poolOptions: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const dust = provider.get('async-task');

    const result = await dust.execute(
      1,
      2,
    );

    expect(result.count).toBe(3);
    expect(result.isMainThread).toBe(false);
    await provider.destroy('async-task');
  });

  it('Test create error task and execute with pool', async () => {
    provider.create(
      'error',
      workers.error,
      {
        poolOptions: { maxQueuedJobs: 1, size: 1 },
      },
    );

    const dust = provider.get('error');

    const result = await dust.execute('error');

    expect(result).toEqual((null));
    await provider.destroy('error');
  });
});

describe('DustContainer Push', () => {
  const provider = new DustProvider();

  it('Test create task and push with pool but use error path', async () => {
    try {
      provider.create(
        'error-task',
        workers.task,
        {
          handlerOptions: { useRelative: true },
        },
      );
    } catch (error) {
      expect(!!error).toBe(true);
    }
  });

  it('Test create task and push with pool', async () => {
    provider.create(
      'push-task',
      workers.task,
    );

    const dust = provider.get('push-task');

    dust.push(1, 2);
    dust.push(3, 4);
    dust.push(5, 6);

    await dust.commit();

    await provider.destroy('push-task');
  });

  it('Test make file task and push with pool', async () => {
    provider.create(
      'make-file',
      workers['make-file'],
    );

    provider.create(
      'remove-file',
      workers['remove-file'],
    );

    const dust = provider.get('make-file');

    dust.push();
    dust.push();
    dust.push();

    await dust.commit();

    expect(readdirSync(resolve(__dirname, '../temp')).length).toBe(3);

    const rmDust = provider.get('remove-file');

    rmDust.push();

    rmDust
      .commit()
      .then(async () => {
        expect(existsSync(resolve(__dirname, '../temp'))).toBe(false);

        await provider.destroy('make-file');
        await provider.destroy('remove-file');
      });
  });
});
