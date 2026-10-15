import { createSerialRunner } from '../serialRunner';

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createSerialRunner', () => {
  it('runs immediately when idle', async () => {
    const task = jest.fn(async () => 'done');
    const run = createSerialRunner(task);

    await expect(run()).resolves.toBe('done');
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('waits for the current run before starting the next', async () => {
    const first = deferred();
    const started: number[] = [];
    let calls = 0;
    const run = createSerialRunner(async () => {
      const n = ++calls;
      started.push(n);
      if (n === 1) await first.promise;
    });

    run();
    await flush();
    run();
    await flush();
    expect(started).toEqual([1]);

    first.resolve();
    await flush();
    expect(started).toEqual([1, 2]);
  });

  it('merges calls made during a run into one rerun', async () => {
    const first = deferred();
    let calls = 0;
    const run = createSerialRunner(async () => {
      calls += 1;
      if (calls === 1) await first.promise;
    });

    run();
    await flush();
    const a = run();
    const b = run();
    const c = run();
    expect(a).toBe(b);
    expect(b).toBe(c);

    first.resolve();
    await Promise.all([a, b, c]);
    expect(calls).toBe(2);
  });

  it('starts a new run for a call made after the rerun has started', async () => {
    const gates = [deferred(), deferred()];
    let calls = 0;
    const run = createSerialRunner(async () => {
      const gate = gates[calls];
      calls += 1;
      if (gate) await gate.promise;
    });

    run();
    await flush();
    run();
    gates[0].resolve();
    await flush();
    expect(calls).toBe(2);

    const third = run();
    gates[1].resolve();
    await third;
    expect(calls).toBe(3);
  });

  it('keeps running after a run fails', async () => {
    const first = deferred();
    let calls = 0;
    const run = createSerialRunner(async () => {
      calls += 1;
      if (calls === 1) await first.promise;
      return calls;
    });

    const failed = run();
    await flush();
    const next = run();
    first.reject(new Error('boom'));

    await expect(failed).rejects.toThrow('boom');
    await expect(next).resolves.toBe(2);
  });
});
