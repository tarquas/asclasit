const $ = require('./class');

test('new $: abstract class', () => {
  expect(() => new $()).toThrow($.AbstractClassError);
});

class Level1 extends $ {
  static [$] = {
    wakeInit: true,
    wakeTimeout: 5000,
    wakeRetries: 3,
    wakeRetryDelay: 40,
    sleepImmediate: true,
  };

  events = [];

  constructor(arg1) {
    super();
    this.arg1 = arg1;
  }

  async *[$](retries) {
    try {
      this.l1conn = true;
      this.events.push('l1conn');

      while (this.l1conn) {
        this.events.push('l1use');
        yield;
      }
    } finally {
      this.l1conn = false;
      this.events.push('l1dc');
    }
  }

  async $_method(arg) {
    this.events.push(`l1method ${arg}`);
  }
}

class Level2 extends Level1 {
  static [$] = {
    ...this[$],
    wakeInit: false,
    sleepImmediate: false,
    sleepIdle: 120000,
    sleepTimeout: 3000,
    onSleepError: function (err) { this.lastSleepError = err; },
  };

  constructor(arg2, arg1) {
    super(arg1);
    this.arg2 = arg2;
  }

  *[$](retries) {
    try {
      this.events.push('l2try');
      if (retries < 3) throw new Error('fail');
      this.events.push('l2conn');
      this.l2conn = true;

      while (this.l2conn) {
        this.events.push('l2use');
        yield Promise.resolve(1);
      }
    } finally {
      this.events.push('l2dc');
      this.l2conn = false;
    }
  }

  async $_method(arg) {
    this.events.push(`l2method ${arg}`);
  }

  #prop = null;
  get $_prop() { this.events.push('propget'); return this.#prop; }
  set $_prop(value) { this.events.push('propset'); this.#prop = value; }
}

test('class: Level1 instance', async () => {
  const l1 = new Level1('A1');
  await $.tick();
  expect(l1.events).toEqual(['l1conn', 'l1use', 'l1dc']);
  l1.events = [];
  await l1.method('x');
  expect(l1.events).toEqual(['l1conn', 'l1use', 'l1method x', 'l1dc']);
});

test('class: Level2 instance', async () => {
  const l2 = new Level2('A2');

  const promise = l2.method('y');
  expect(!l2[$].awake).toBe(true);
  expect(l2[$].waking instanceof Promise).toBe(true);
  await promise;
  expect(l2[$].awake).toBe(true);
  expect(l2[$].waking).toBe(null);

  l2.method('a');
  l2.method('b');
  await l2.method('c');

  expect(l2.events).toEqual([
    'l1conn', 'l1use',
    'l2try', 'l2dc',
    'l2try', 'l2dc',
    'l2try', 'l2conn',
    'l2use', 'l2method y',
    'l1use', 'l2use',
    'l2method a',
    'l1use', 'l1use',
    'l2use', 'l2use',
    'l2method b',
    'l2method c',
  ]);

  l2.events = [];

  expect(l2[$].awake).toBe(true);
  l2.prop = 5;
  expect(await l2.prop).toBe(5);

  expect(l2[$].awake).toBe(true);
  expect(l2[$].sleeping).toBe(null);
  const sleep = l2[$].sleep();
  expect(l2[$].sleeping instanceof Promise).toBe(true);
  await sleep;
  expect(l2[$].sleeping).toBe(null);
  expect(l2[$].awake).toBe(false);

  expect(l2.events).toEqual([
    'l1use', 'l2use', 'propset',
    'l1use', 'l2use', 'propget',
    'l2dc', 'l1dc'
  ]);
});

test('class: sleep-wake concurrency', async () => {
  const l1 = new Level1();
  await $.tick();
  l1.events = [];
  l1[$].sleep();
  l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  await $.tick();
  await l1[$].sleep();

  expect(l1.events).toEqual([
    'l1conn', 'l1use', 'l1dc',
    'l1conn', 'l1use', 'l1use', 'l1use', 'l1dc',
  ]);
});

test('class: wake-sleep concurrency', async () => {
  const l1 = new Level1();
  await $.tick();
  l1.events = [];
  await l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  l1[$].sleep();
  l1[$].wake();
  await $.tick();
  await l1[$].sleep();

  expect(l1.events).toEqual([
    'l1conn', 'l1use', 'l1dc',
    'l1conn', 'l1use', 'l1dc',
    'l1conn', 'l1use', 'l1use', 'l1use', 'l1dc',
  ]);
});

test('class: wake condition', async () => {
  const l2 = new Level2();
  await l2.method('1');
  l2.l2conn = false;
  await l2.method('2');
  l2.l1conn = false;
  await l2.method('3');
  await l2[$].sleep();

  expect(l2.events).toEqual([
    'l1conn', 'l1use',
    'l2try', 'l2dc', 'l2try', 'l2dc', 'l2try', 'l2conn', 'l2use',
    'l2method 1',
    'l1use', 'l2dc',
    'l2try', 'l2dc', 'l2try', 'l2conn', 'l2use',
    'l2method 2',
    'l1dc', 'l1conn', 'l1use',
    'l2try', 'l2dc', 'l2try', 'l2dc', 'l2try', 'l2conn', 'l2use',
    'l2method 3',
    'l2dc', 'l1dc',
  ]);
});

class Delayed extends $ {
  static [$] = {wakeRetryDelay: 20};

  async *[$]() {
    try {
      while (true) {
        await $.delay(40);
        yield;
      }
    } finally {
      await $.delay(40);
    }
  }

  async $_method() {
    await $.delay(40);
  }
}

test('class: waking/running/sleeping', async () => {
  const a = new Delayed();
  a.method();
  //await $.tick();
  a[$].sleep();
  await a[$].wake();
  await a[$].sleep();
  a.method();
  await a[$].waking;
  expect(a[$].runningCount).toEqual(1);
  expect(a[$].running.first() instanceof Promise).toEqual(true);
  await a[$].sleep();
});

class WakeFailed extends $ {
  static [$] = {wakeRetryDelay: 20};
  *[$]() { }
}

test('class: wake failed', async () => {
  const wf = new WakeFailed();

  try {
    await wf[$].wake();
    throw null;
  } catch (err) {
    expect(err.constructor).toBe($.WakeFailedError);
  }
});

class WakeError extends $ {
  static [$] = {wakeRetryDelay: 20};
  *[$]() { throw new Error('bad'); }
}

test('class: wake error', async () => {
  const we = new WakeError();

  try {
    await we[$].wake();
    throw null;
  } catch (err) {
    expect(err.message).toBe('bad');
  }
});

class WakeTimeout extends $ {
  static [$] = {wakeTimeout: 40, wakeRetryDelay: 20};
  *[$]() { yield $.delay(100); }
}

test('class: wake timeout', async () => {
  const wt = new WakeTimeout();

  try {
    await wt[$].wake();
    throw null;
  } catch (err) {
    expect(err.constructor).toBe($.WakeTimeoutError);
  }
});

class SleepTimeout extends $ {
  static [$] = class extends $.$inst {
    sleepTimeout = 50;
    onSleepError(err) { this.lastSleepError = err; }
  };

  async *[$]() {
    try {
      yield;
    } finally {
      await $.delay(100);
    }
  }
}

test('class: sleep timeout', async () => {
  const st = new SleepTimeout();
  await st[$].wake();
  await st[$].sleep();
  expect(st.lastSleepError.constructor).toBe($.SleepTimeoutError);
});
