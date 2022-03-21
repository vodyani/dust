import { Thread } from 'threads';

export type DustWorkflow<T = any> = (worker: Thread) => Promise<T>;
