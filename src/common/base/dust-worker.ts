import { resolve } from 'path';

import { Worker } from 'threads';
import { cloneDeep } from 'lodash';
import { isValidObject } from '@vodyani/core';

import { getRelativePath } from '../method';
import { DustWorkerOptions } from '../interface';

export class DustWorker extends Worker {
  constructor(path: string, options?: DustWorkerOptions) {
    const workerFilePath = isValidObject(options) && options.useAbsolute
      ? getRelativePath(path, resolve(__dirname, './dust-worker'))
      : path;

    super(workerFilePath, cloneDeep(options));
  }
}
