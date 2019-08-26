type Callback = (...args: any[]) => any

interface QueueItem {
  promise: Promise<any>
  resolve: Callback
  reject: Callback
}

export class AsyncPool {
  size: number;
  paused: boolean;
  private queue: QueueItem[];
  private running: number;

  constructor(size: number) {
    this.size = size;
    this.paused = false;
    this.queue = [];
    this.running = 0;
  }

  async add(callback: Callback) {
    let result = null;

    try {
      await this.nextSeat();
      result = await callback();
      this.releaseSeat();
    } catch (e) {
      console.log('Queue cancelled');
    }

    return result;
  }

  async nextSeat() {
    const deferred = {
      promise: Promise.resolve(),
      resolve() {},
      reject() {},
    };

    if (this.running < this.size) {
      this.running++;
    } else {
      deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });

      this.queue.push(deferred);
    }

    return deferred.promise;
  }

  releaseSeat() {
    const next = this.queue.shift();

    if (!next || this.paused) {
      this.running--;
      return;
    }

    next.resolve();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    if (this.running < this.size) {
      this.releaseSeat();
    }
  }

  flush() {
    this.queue.forEach(({ reject }) => reject());
    this.queue = [];
  }
}