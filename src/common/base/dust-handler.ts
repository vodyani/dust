import { resolve } from 'path';

import { Worker } from 'threads';
import { cloneDeep, omit } from 'lodash';
import { getRelativePath, isValidObject } from '@vodyani/core';

import { DustHandlerOptions } from '../interface';

/**
 * Dust handler specific from the `worker_threads` module in nodejs
 *
 * @param path dust handler file path, You can choose whether to pass in a relative path through the configuration (the default is an absolute path).
 * @param options dust handler options, specific from the `worker` options in nodejs.
 *
 * @returns DustHandler
 *
 * @publicApi
 */
export class DustHandler extends Worker {
  constructor(path: string, options?: DustHandlerOptions) {
    let handlerOptions = {};
    let useRelative = false;

    if (isValidObject(options)) {
      if (options.useRelative) {
        useRelative = true;
      }

      handlerOptions = omit(cloneDeep(options), ['useRelative']);
    }

    const handlerFilePath = useRelative ? path : getRelativePath(path, resolve(__dirname, './dust-worker'));

    super(handlerFilePath, handlerOptions);
  }
}
