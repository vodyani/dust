import { cloneDeep } from 'lodash';
import { Pool, Thread, spawn } from 'threads';
import { FixedContext, isValid, isValidObject } from '@vodyani/core';

import { DustHandlerOptions, DustPoolOptions, DustOptions } from '../interface';

import { DustHandler } from './dust-handler';

export class Dust {
  private pool: Pool<Thread>;

  constructor(path: string, options?: DustOptions) {
    let dustPoolOptions: DustPoolOptions = {};
    let dustHandlerOptions: DustHandlerOptions = {};

    if (isValidObject(options)) {
      const { handler, pool } = options;

      if (isValidObject(handler)) {
        dustHandlerOptions = handler;
      }

      if (isValidObject(pool)) {
        dustPoolOptions = cloneDeep(pool);
      }
    }

    const dustHandler = new DustHandler(path, dustHandlerOptions);

    this.pool = Pool(() => spawn(dustHandler), dustPoolOptions);
  }

  @FixedContext
  public async push(...args: any[]) {
    return this.pool.queue(
      async (thread: any) => thread(...args),
    );
  }

  @FixedContext
  public async execute<T = any>(...args: any[]) {
    try {
      const result = await this.push(...args);
      return result as T;
    } catch (error) {
      return null;
    }
  }

  @FixedContext
  public async commit() {
    await this.pool.settled();
  }

  @FixedContext
  public async close(isForce = false) {
    if (isValid(this.pool)) {
      await this.pool.terminate(isForce);

      this.pool = null;
    }
  }
}
