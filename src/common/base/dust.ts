import { Pool, Thread, spawn } from 'threads';
import { FixedContext, isValid, isValidObject } from '@vodyani/core';

import { DustHandlerOptions, DustPoolOptions, DustOptions } from '../interface';

import { DustHandler } from './dust-handler';

/**
 * Dust is a wrapper for the thread pool module, providing easy-to-use call methods.
 *
 * @param path dust handler file path, You can choose whether to pass in a relative path through the configuration (the default is an absolute path).
 * @param options dust creation parameters, contains handler and thread pool management parameters.
 *
 * @publicApi
 */
export class Dust {
  /**
   * Thread pool.
   */
  private pool: Pool<Thread>;

  constructor(path: string, options?: DustOptions) {
    let dustPoolOptions: DustPoolOptions = {};
    let dustHandlerOptions: DustHandlerOptions = {};

    if (isValidObject(options)) {
      const { handlerOptions, poolOptions } = options;

      if (isValidObject(handlerOptions)) {
        dustHandlerOptions = handlerOptions;
      }

      if (isValidObject(poolOptions)) {
        dustPoolOptions = poolOptions;
      }
    }

    const dustHandler = new DustHandler(path, dustHandlerOptions);

    this.pool = Pool(() => spawn(dustHandler), dustPoolOptions);
  }
  /**
   * When you need to wait for the thread pool's collaborators to finish their work and return the results, use the execute method.
   * You can also leverage concurrency to return several task outcomes at the same time with the `execute` method.
   *
   * @param args handler parameters passed to the executor.
   *
   * @usageNotes
   *
   * - The thread and thread resources are released directly, regardless of whether the execution is successful or not.
   * - If the execution fails, the release thread will be executed before throwing an exception.
   *
   * @publicApi
   */
  @FixedContext
  public async execute<T = any>(...args: any[]): Promise<T> {
    if (isValid(this.pool)) {
      try {
        const result = await this.push(...args);
        return result;
      } catch (error) {
        return null;
      }
    }
  }
  /**
   * When you don't care about the outcome of the execution and just need to get the job into the thread pool, you should use the `push` method.
   *
   * @param args handler parameters passed to the executor.
   *
   * @usageNotes
   * - The push will not be executed immediately, you still need to execute the `commit` method.
   *
   * @publicApi
   */
  @FixedContext
  public async push(...args: any[]) {
    if (isValid(this.pool)) {
      return this.pool.queue(
        async (thread: any) => thread(...args),
      );
    }
  }
  /**
   * With the `commit` method, execution of the pending task will begin
   *
   * @usageNotes
   *
   * - It also returns a promise that resolves when all tasks have been executed.
   * - but it will also resolve instead of reject if a task fails. The returned promise resolves to an array of errors.
   *
   * @publicApi
   */
  @FixedContext
  public async commit() {
    if (isValid(this.pool)) {
      await this.pool.settled();
    }
  }
  /**
   * Close the thread pool and release all thread resources
   *
   * @param isForce By default the pool will wait until all scheduled tasks have completed before terminating the workers. Pass true to force-terminate the pool immediately.
   */
  @FixedContext
  public async close(isForce = false) {
    if (isValid(this.pool)) {
      await this.pool.terminate(isForce);

      this.pool = null;
    }
  }
}
