/* A "page scope" for the legacy behaviour modules.
 * Everything a module attaches to window/document, every timer, animation frame and observer
 * goes through here, so dispose() returns the browser to a clean state when the page unmounts. */
export function createScope(navigate) {
  const ac = new AbortController();
  const timeouts = new Set();
  const intervals = new Set();
  const frames = new Set();
  const observers = new Set();
  let disposed = false;

  const on = (target, type, fn, opts) => {
    if (!target || typeof target.addEventListener !== "function") return;
    const o = typeof opts === "boolean" ? { capture: opts } : { ...(opts || {}) };
    o.signal = ac.signal;
    target.addEventListener(type, fn, o);
  };

  const wrapObserver = (Ctor) =>
    Ctor &&
    class extends Ctor {
      constructor(...a) {
        super(...a);
        observers.add(this);
      }
    };

  return {
    on,
    navigate: (to, opts) => {
      if (disposed) return;
      navigate(to, opts);
    },
    setTimeout: (fn, ms, ...args) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        if (!disposed) fn(...args);
      }, ms);
      timeouts.add(id);
      return id;
    },
    setInterval: (fn, ms, ...args) => {
      const id = window.setInterval(() => {
        if (!disposed) fn(...args);
      }, ms);
      intervals.add(id);
      return id;
    },
    requestAnimationFrame: (fn) => {
      const id = window.requestAnimationFrame((t) => {
        frames.delete(id);
        if (!disposed) fn(t);
      });
      frames.add(id);
      return id;
    },
    IntersectionObserver: wrapObserver(window.IntersectionObserver),
    ResizeObserver: wrapObserver(window.ResizeObserver),
    MutationObserver: wrapObserver(window.MutationObserver),
    dispose() {
      disposed = true;
      ac.abort();
      timeouts.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
      frames.forEach((id) => window.cancelAnimationFrame(id));
      observers.forEach((o) => {
        try {
          o.disconnect();
        } catch (e) {
          /* ignore */
        }
      });
    },
  };
}
