import { cloneDeep } from 'lodash';
import { Pool, Thread, spawn } from 'threads';
import { FixedContext, isValidObject } from '@vodyani/core';

import { DustOptions } from '../interface';

import { DustWorker } from './dust-worker';

export class DustContainer<KEY = any> {
  private store: Map<KEY, Pool<Thread>> = new Map();

  @FixedContext
  public create(key: KEY, path: string, options?: DustOptions) {
    let dust: Pool<Thread> = null;

    if (!this.store.has(key)) {
      const worker = new DustWorker(path, options?.worker);

      dust = Pool(
        () => spawn(worker),
        // Prevents contamination of incoming configuration parameters
        isValidObject(options) && isValidObject(options.pool)
          ? cloneDeep(options.pool)
          : {},
      );

      this.store.set(key, dust);
    }
  }

  @FixedContext
  public async close(key: KEY, isForce = false) {
    if (this.store.has(key)) {
      this.store.get(key).terminate(isForce);
      this.store.delete(key);
    }
  }

  @FixedContext
  public async push(key: KEY, ...args: any[]) {
    if (this.store.has(key)) {
      const dust = this.store.get(key);

      dust.queue(
        async (threadHandler: any) => this.workflow(threadHandler, ...args),
      );

      await dust.settled();
    }
  }

  @FixedContext
  public async execute<T = any>(key: KEY, ...args: any[]) {
    if (this.store.has(key)) {
      const dust = this.store.get(key);

      const result = await dust.queue(
        async (threadHandler: any) => this.workflow(threadHandler, ...args),
      );

      return result as T;
    } else {
      return null;
    }
  }

  @FixedContext
  private async workflow(threadHandler: any, ...args: any[]) {
    try {
      const result = await threadHandler(...args);
      return result;
    } catch (error) {
      return null;
    }
  }
}
