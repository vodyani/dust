import {
  toRetry,
  isValid,
  FixedContext,
  isValidArray,
  isValidObject,
} from '@vodyani/core';
import { cloneDeep, fill } from 'lodash';
import { Pool, Thread, spawn } from 'threads';

import { DustWorkflow } from '../type';
import { DustOptions } from '../interface';

import { DustWorker } from './dust-worker';

export class DustContainer<KEY = any> {
  private store: Map<KEY, Pool<Thread>> = new Map();

  @FixedContext
  public create(key: KEY, path: string, options?: DustOptions) {
    let dustThreadPool: Pool<Thread> = null;

    if (!this.store.has(key)) {
      const worker = new DustWorker(path, options?.worker);

      dustThreadPool = Pool(
        () => spawn(worker),
        // Prevents contamination of incoming configuration parameters
        isValidObject(options) && isValidObject(options.pool) ? cloneDeep(options.pool) : {},
      );

      this.store.set(key, dustThreadPool);
    }

    return dustThreadPool;
  }

  @FixedContext
  public async close(key: KEY, isForce = false) {
    if (this.store.has(key)) {
      await toRetry(3, 1000, this.store.get(key).terminate, isForce);

      this.store.delete(key);
    }
  }

  @FixedContext
  public async execute<T = any>(key: KEY, workflow: DustWorkflow<T>, count = 1): Promise<T> {
    if (this.store.has(key) && isValid(workflow)) {
      const dustThreadPool = this.store.get(key);

      // push to thread queue
      fill(Array(count), workflow).forEach(task => dustThreadPool.queue(task));

      const result = await dustThreadPool.completed();
      return result;
    } else {
      return null;
    }
  }

  @FixedContext
  public async hybridExecute<T = any>(key: KEY, workflows: DustWorkflow<T>[]): Promise<T> {
    if (this.store.has(key) && isValidArray(workflows)) {
      const dustThreadPool = this.store.get(key);

      // push to thread queue
      workflows.forEach(task => dustThreadPool.queue(task));

      const result = await dustThreadPool.completed();
      return result;
    } else {
      return null;
    }
  }
}
