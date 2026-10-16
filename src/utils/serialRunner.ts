// Wraps `task` so calls run one at a time. Calls made while a run is going share one rerun,
// which starts after the current run ends and so sees the latest state.
export function createSerialRunner<T>(task: () => Promise<T>): () => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve();
  let waiting: Promise<T> | null = null;

  return () => {
    if (waiting) return waiting;

    const run = tail.then(() => {
      waiting = null;
      return task();
    });
    waiting = run;
    tail = run.catch(() => undefined);
    return run;
  };
}
