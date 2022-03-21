import { Module } from '@nestjs/common';

import { DustProvider } from './provider';

@Module({
  exports: [DustProvider],
  providers: [DustProvider],
})
export class DustModule {}
