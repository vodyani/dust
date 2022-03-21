import { resolve } from 'path';

import {
  toRetry,
  isValid,
  FixedContext,
  isValidArray,
  isValidObject,
} from '@vodyani/core';
import { cloneDeep, range } from 'lodash';
import { Pool, Thread, Worker, spawn } from 'threads';

import { DustTaskWorkflow } from './type';
import { getRelativePath } from './method';
import { DustWorkerOptions, DustOptions } from './interface';

export class DustWorker extends Worker {
  constructor(path: string, options?: DustWorkerOptions) {
    const workerFilePath = isValidObject(options) && options.isAbsolutePath
      ? getRelativePath(path, resolve(__dirname, './base'))
      : path;

    super(workerFilePath, cloneDeep(options));
  }
}

export class Dust {
  private worker: Worker;

  constructor(path: string, options?: DustWorkerOptions) {
    this.worker = new DustWorker(
      path,
      options,
    );
  }

  @FixedContext
  public async execute(...args: any[]) {
    const newDust = await spawn(this.worker);
    const result = await newDust(...args);

    await Thread.terminate(newDust);
    this.worker = null;

    return result;
  }
}

export class DustContainer<KEY = any> {
  private store: Map<KEY, Pool<Thread>> = new Map();

  @FixedContext
  public create(key: KEY, path: string, option?: DustOptions) {
    let dustPool: Pool<Thread> = null;

    if (!this.store.has(key)) {
      const worker = new DustWorker(path, option?.worker);

      dustPool = Pool(
        () => spawn(worker),
        // Prevents contamination of incoming configuration parameters
        isValidObject(option.pool) ? cloneDeep(option.pool) : {},
      );

      this.store.set(key, dustPool);
    }

    return dustPool;
  }

  @FixedContext
  public async close(key: KEY, isForce = false) {
    if (this.store.has(key)) {
      await toRetry(3, 1000, this.store.get(key).terminate, isForce);
      this.store.delete(key);
    }
  }

  @FixedContext
  public async execute(key: KEY, workflow: DustTaskWorkflow, count = 1): Promise<void> {
    if (this.store.has(key) && isValid(workflow)) {
      const dustPool = this.store.get(key);

      for (const task of range(count).map(() => workflow)) {
        dustPool.queue(task);
      }

      await dustPool.settled();
    }
  }

  @FixedContext
  public async publish(key: KEY, workflows: DustTaskWorkflow[]): Promise<void> {
    if (this.store.has(key) && isValidArray(workflows)) {
      const dustPool = this.store.get(key);

      for (const task of workflows) {
        dustPool.queue(task);
      }

      await dustPool.settled();
    }
  }
}
