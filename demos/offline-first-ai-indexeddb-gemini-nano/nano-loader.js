/**
 * Loads a LanguageModel session seeded with restored history, and exposes
 * its readiness as a decoupled promise via Promise.withResolvers() — so
 * callers can `await manager.ready` without caring whether the session is
 * still downloading, already available, or failed.
 */

export class LocalGeminiManager {
  constructor(onStatus) {
    this.onStatus = onStatus ?? (() => {});
    const { promise, resolve, reject } = Promise.withResolvers();
    this.ready = promise;
    this._resolve = resolve;
    this._reject = reject;
    this.session = null;
  }

  async init(initialPrompts = []) {
    if (!('LanguageModel' in self)) {
      this.onStatus({ status: 'unavailable', reason: 'LanguageModel is not defined in this browser' });
      this._reject(new Error('LanguageModel unavailable'));
      return this.ready;
    }

    const availability = await LanguageModel.availability();
    if (availability === 'unavailable') {
      this.onStatus({ status: 'unavailable', reason: 'Model unsupported on this device' });
      this._reject(new Error('Model unavailable'));
      return this.ready;
    }

    try {
      this.session = await LanguageModel.create({
        initialPrompts,
        monitor: (m) => {
          m.addEventListener('downloadprogress', (e) => {
            // The exact shape of this event has drifted across Chrome
            // versions (a 0-1 fraction in `loaded` vs. byte counts in
            // `loaded`/`total`) — handle both rather than trust one.
            const pct = e.total ? (e.loaded / e.total) * 100 : e.loaded * 100;
            this.onStatus({ status: 'downloading', progress: Math.round(pct) });
          });
        },
      });
      this.onStatus({ status: 'ready' });
      this._resolve(this.session);
    } catch (err) {
      this.onStatus({ status: 'unavailable', reason: err.message });
      this._reject(err);
    }

    return this.ready;
  }
}
