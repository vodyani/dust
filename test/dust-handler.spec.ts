/* eslint-disable no-new */
import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';

import { DustHandler } from '../src/base';

const taskPath = resolve(__dirname, './worker/task.js');

describe('DustHandler', () => {
  it('create handler test without options', async () => {
    const handler = new DustHandler(taskPath);
    expect(!!handler).toBe(true);
    await handler.terminate();
  });

  it('create handler test with options', async () => {
    const handler = new DustHandler(
      taskPath,
      {
        useRelative: false,
        resourceLimits: {
          maxOldGenerationSizeMb: 5,
          maxYoungGenerationSizeMb: 5,
          codeRangeSizeMb: 5,
        },
      },
    );
    expect(!!handler).toBe(true);
    await handler.terminate();
  });

  it('create handler with error relative path', async () => {
    try {
      new DustHandler('./error.js', { useRelative: true });
    } catch (error) {
      expect(!!error).toBe(true);
    }
  });
});
