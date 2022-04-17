import { FixedContext, ProviderFactory } from '@vodyani/core';

import { DustManagerOptions } from '../common';

import { DustProvider } from './dust-provider';

export class DustManager implements ProviderFactory {
  public static token = Symbol('DustManager');

  constructor(
    private readonly options: DustManagerOptions,
  ) {}

  @FixedContext
  public create() {
    return {
      inject: [DustProvider],
      provide: DustManager.token,
      useFactory: this.useFactory,
    };
  }

  @FixedContext
  private async useFactory(provider: DustProvider) {
    this.options.forEach(({ dustKey, dustHandlerPath, dustOptions }) => {
      provider.create(dustKey, dustHandlerPath, dustOptions);
    });

    return provider;
  }
}
