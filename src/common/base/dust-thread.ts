import { cloneDeep } from 'lodash';
import { spawn, Thread } from 'threads';
import { FixedContext, isValidObject } from '@vodyani/core';

import { DustWorkerOptions } from '../interface';

import { DustWorker } from './dust-worker';

export class DustThread {
  private worker: DustWorker;

  constructor(path: string, options?: DustWorkerOptions) {
    this.worker = new DustWorker(
      path,
      // Prevents contamination of incoming configuration parameters
      isValidObject(options) ? cloneDeep(options) : null,
    );
  }

  @FixedContext
  public async close(dustThread: Thread): Promise<void> {
    await Thread.terminate(dustThread);
    this.worker = null;
  }

  @FixedContext
  public async execute<T = any>(...args: any[]): Promise<T> {
    const dustThread = await spawn(this.worker);

    try {
      const result = await dustThread(...args);
      await this.close(dustThread);
      return result;
    } catch (error) {
      await this.close(dustThread);
      throw error;
    }
  }
}
