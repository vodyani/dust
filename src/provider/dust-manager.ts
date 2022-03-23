import { FactoryProvider } from '@nestjs/common';
import { FixedContext } from '@vodyani/core';
import { DustManagerOptions } from 'src/common';

import { DustProvider } from './dust-provider';

export class DustManager {
  public static token = Symbol('DustManager');

  private provider: FactoryProvider;

  constructor(private readonly options: DustManagerOptions) {
    this.provider = {
      inject: [DustProvider],
      provide: DustManager.token,
      useFactory: this.useFactory,
    };
  }

  @FixedContext
  public getFactoryProvider() {
    return this.provider;
  }

  @FixedContext
  private async useFactory(dust: DustProvider) {
    this.options.forEach(({ dustKey, dustHandlerPath, dustOptions }) => {
      dust.create(dustKey, dustHandlerPath, dustOptions);
    });

    return dust;
  }
}
