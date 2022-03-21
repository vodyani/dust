import { Thread } from 'threads';

export type DustTaskWorkflow = (worker: Thread) => Promise<void>;
