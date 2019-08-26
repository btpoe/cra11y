module.exports = class AsyncPool {
  constructor(size) {
    this.size = size;
    this.paused = false;
    this.queue = [];
    this.running = 0;
  }

  async add(callback) {
    let result = null;
    let seat = false;

    try {
      seat = await this.nextSeat();
    } catch (e) {
      console.log('Queue cancelled');
    }

    if (seat) {
      try {
        result = await callback();
      } catch (e) {
        console.warn('AsyncPool task failed');
        console.warn(e);
      }
    }

    this.releaseSeat();
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

    next.resolve(true);
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