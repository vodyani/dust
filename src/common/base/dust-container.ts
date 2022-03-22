import { FixedContext, isValidObject } from '@vodyani/core';

import { DustOptions } from '../interface';

import { Dust } from './dust';

export class DustContainer<KEY = any> {
  private store: Map<KEY, Dust> = new Map();

  @FixedContext
  public create(key: KEY, path: string, options?: DustOptions) {
    this.store.set(key, new Dust(path, options));
  }

  @FixedContext
  public get(key: KEY): Dust {
    const dustPool = this.store.get(key);

    if (!isValidObject(dustPool)) {
      throw new Error(`DustContainer.store does not declare this key: ${key}`);
    }

    return dustPool;
  }

  @FixedContext
  public async destroy(key: KEY) {
    const dustPool = this.store.get(key);

    if (isValidObject(dustPool)) {
      await dustPool.close();

      this.store.delete(key);
    }
  }
}
