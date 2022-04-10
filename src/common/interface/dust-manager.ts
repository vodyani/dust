import { DustOptions } from './dust';

/**
 * DustContainerOptions
 */
export interface DustContainerOptions {
  /**
   * Identification key of the `DustManager` provider.
   */
  dustKey: any;
  /**
   * dust handler file path, You can choose whether to pass in a relative path through the configuration (the default is an absolute path).
   */
  dustHandlerPath: string;
  /**
   * dust creation parameters, dust handler and thread pool management parameters.
   */
  dustOptions?: DustOptions
}
