import { DynamicModule } from '@nestjs/common';

import { DustManagerOptions } from './common';
import { DustProvider, DustManager } from './provider';

export class DustModule {
  /**
   * Creating dynamic modules
   *
   * @param options Used by DustManager to batch create dust execution thread pools based on configuration.
   * @param global When "true", makes a module global-scoped. default `false`
   *
   * @publicApi
   */
  static forRoot(options: DustManagerOptions, global = false): DynamicModule {
    const providers = [
      DustProvider,
      new DustManager(options).create(),
    ];

    return {
      global,
      providers,
      exports: providers,
      module: DustModule,
    };
  }
}
