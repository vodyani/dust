import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { DustModule } from '../src/module';
import { DustProvider } from '../src/provider';
import { DustManagerOptions } from '../src/common';

const options: DustManagerOptions = [
  {
    dustKey: 'task',
    dustOptions: {},
    dustHandlerPath: resolve(__dirname, './worker/task.js'),
  },
];

let dustProvider: DustProvider = null;

beforeEach(async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [DustModule.forRoot(options)],
  }).compile();

  dustProvider = moduleRef.get<DustProvider>(DustProvider);
});

describe('Dust execute', () => {
  it('Test create task and execute with pool', async () => {
    const dust = dustProvider.get('task');

    expect((await dust.execute(1, 2)).count).toBe(3);

    await dust.close();
    await dustProvider.destroy('task');
  });
});
