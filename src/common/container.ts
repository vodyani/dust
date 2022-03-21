import { cloneDeep, range } from 'lodash';
import { Pool, Thread, spawn } from 'threads';
import { FixedContext, toRetry, isValid, isValidArray, isValidObject } from '@vodyani/core';

import { DustTaskWorkflow } from './type';
import { DustPoolOptions } from './interface';

export class Dust {
  @FixedContext
  public async execute(workerPath: string, ...args: any[]) {
    const newDust = await spawn(new Worker(workerPath));

    const result = await newDust(...args);

    await Thread.terminate(newDust);

    return result;
  }
}

export class DustHybridContainer<KEY = any> {
  private store: Map<KEY, Pool<Thread>> = new Map();

  @FixedContext
  public create(key: KEY, workerPath: string, option?: DustPoolOptions) {
    let dustPool: Pool<Thread> = null;

    if (!this.store.has(key)) {
      const worker = new Worker(workerPath);

      dustPool = Pool(
        () => spawn(worker),
        // Prevents contamination of incoming configuration parameters
        isValidObject(option) ? cloneDeep(option) : {},
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
