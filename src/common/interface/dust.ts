import { DustHandlerOptions } from './dust-handler';

/**
 * Thread pool management parameters
 */
export interface DustPoolOptions {
  /**
   * Maximum no. of tasks to run on one worker thread at a time. Defaults to one.
   */
  concurrency?: number;
  /**
   * Maximum no. of jobs to be queued for execution before throwing an error.
   */
  maxQueuedJobs?: number;
  /**
   * Gives that pool a name to be used for debug logging, letting you distinguish between log output of different pools.
   */
  name?: string;
  /**
   * No. of worker threads to spawn and to be managed by the pool.
   */
  size?: number;
}
/**
 * Dust creation parameters, contains handler and thread pool management parameters.
 */
export interface DustOptions {
  /**
   * Dust worker creation parameters
   */
  handler?: DustHandlerOptions;
  /**
   * Dust pool initialization parameters
   */
  pools?: DustPoolOptions;
}
