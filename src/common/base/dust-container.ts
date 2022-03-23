import { FixedContext, isValidObject } from '@vodyani/core';
import { omit } from 'lodash';

import { DustOptions } from '../interface';

import { Dust } from './dust';

/**
 * DustContainer is a hybrid thread pool of different workers that can self-manage, self-assemble and interact externally.
 *
 * @publicApi
 */
export class DustContainer<KEY = any> {
  /**
   * DustContainer.store is a map of Dust instances.
   */
  private store: Map<KEY, Dust> = new Map();
  /**
   * Create a dust thread pool and put it within a container.
   *
   * @param key Identification key of the container
   * @param path dust handler file path, You can choose whether to pass in a relative path through the configuration (the default is an absolute path).
   * @param options dust creation parameters, contains handler and thread pool management parameters.
   *
   * @publicApi
   */
  @FixedContext
  public create(key: KEY, path: string, options?: DustOptions) {
    this.store.set(key, new Dust(path, options));
  }
  /**
   * Get the corresponding dust thread pool by container identification key
   *
   * @param key Identification key of the container
   *
   * @usageNotes
   * - ⚠️ If the key does not exist, this method will throw an exception!
   *
   * @publicApi
   */
  @FixedContext
  public get(key: KEY): Omit<Dust, 'close'> {
    const dustPool = this.store.get(key);

    if (!isValidObject(dustPool)) {
      throw new Error(`DustContainer.store does not declare this key: ${key}`);
    }

    return omit(dustPool, ['close']);
  }

  /**
   * Close the thread pool and release all thread resources
   *
   * @param key Identification key of the container
   * @param isForce By default the pool will wait until all scheduled tasks have completed before terminating the workers. Pass true to force-terminate the pool immediately.
   *
   * @publicApi
   */
  @FixedContext
  public async destroy(key: KEY, isForce = false) {
    const dustPool = this.store.get(key);

    if (isValidObject(dustPool)) {
      await dustPool.close(isForce);
      this.store.delete(key);
    }
  }
}
