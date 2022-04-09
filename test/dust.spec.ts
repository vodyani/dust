import { resolve } from 'path';

import { describe, it } from '@jest/globals';

import { Dust } from '../src/base';

const blockingPath = resolve(__dirname, './worker/blocking-test.js');

describe('Dust', () => {
  it('blocking test', async () => {
    const handler = new Dust(blockingPath, { pools: { maxQueuedJobs: 2, size: 2 }});

    await Promise.all([
      handler.push('handler 1'),
      handler.push('handler 2'),
      handler.push('handler 3'),
    ]);

    handler.push('handler 1');
    handler.push('handler 2');
    handler.push('handler 3');

    await handler.commit();
    await handler.close();
  });
});
