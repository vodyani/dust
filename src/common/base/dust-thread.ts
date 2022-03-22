import { spawn, Thread } from 'threads';
import { FixedContext } from '@vodyani/core';

import { DustHandlerOptions } from '../interface';

import { DustHandler } from './dust-handler';

/**
 * Passing in the parameter to create `DustHandler` will assign an executable thread to execute the method by default.
 *
 * @param path dust handler file path, You can choose whether to pass in a relative path through the configuration (the default is an absolute path).
 * @param options dust handler options, specific from the `worker` options in nodejs.
 *
 * @returns DustThread
 *
 * @publicApi
 */
export class DustThread {
  private dustHandler: DustHandler;

  constructor(path: string, options?: DustHandlerOptions) {
    this.dustHandler = new DustHandler(path, options);
  }

  /**
   * Assigns you a thread executor based on the built-in work handler, which will release all resources of the thread by default when execution is complete.
   *
   * @param args handler Parameters passed to the executor.
   *
   * @usageNotes
   *
   * - The thread and thread resources are released directly, regardless of whether the execution is successful or not.
   * - If the execution fails, the release thread will be executed before throwing an exception.
   *
   * @returns execution result
   *
   * @publicApi
   */
  @FixedContext
  public async execute<T = any>(...args: any[]): Promise<T> {
    const thread = await spawn(this.dustHandler);

    try {
      const result = await thread(...args);

      await this.close(thread);

      return result;
    } catch (error) {
      await this.close(thread);

      throw error;
    }
  }

  /**
   * will be closed by default after thread execution, no need to release manually.
   *
   * @param thread worker thread
   */
  @FixedContext
  private async close(thread: Thread): Promise<void> {
    await Thread.terminate(thread);

    this.dustHandler = null;
  }
}
