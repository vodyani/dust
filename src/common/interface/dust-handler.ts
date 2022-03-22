import { ThreadsWorkerOptions } from 'threads/dist/types/master';

/**
 * Dust handler options, specific from the `worker` options in nodejs.
 */
export interface DustHandlerOptions extends ThreadsWorkerOptions {
  /**
   * Whether to use relative paths
   */
  useRelative?: boolean;
}
