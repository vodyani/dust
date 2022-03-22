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
  public getWorkFlow(key: KEY) {
    if (this.store.has(key)) {
      return {
        commit: () => this.commit(key),
        push: (...args: any[]) => this.push(key, ...args),
      };
    }
  }

  @FixedContext
  public async execute<T = any>(key: KEY, ...args: any[]) {
    try {
      const result = await this.push(key, ...args);
      return result as T;
    } catch (error) {
      return null;
    }
  }

  @FixedContext
  private async push(key: KEY, ...args: any[]) {
    if (this.store.has(key)) {
      const dust = this.store.get(key);

      return dust.queue(
        async (threadHandler: any) => threadHandler(...args),
      );
    }
  }

  @FixedContext
  private async commit(key: KEY) {
    if (this.store.has(key)) {
      const dust = this.store.get(key);
      await dust.settled();
    }
  }
}
