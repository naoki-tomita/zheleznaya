interface Settable<T> {
  __original__: T;
  __on__(cb: () => void): void;
  __emit__(): void;
  __cb__: Array<() => void>;
}

export function wrap<T>(obj: T | null): Settable<T> | null {
  if (obj === null) {
    return null;
  }
  const settable: Settable<T> = {
    __original__: obj,
    __on__(cb: () => void) {
      this.__cb__.push(cb);
    },
    __cb__: [] as Array<() => void>,
    __emit__() {
      this.__cb__.forEach(it => it());
    }
  };
  Object.keys(obj).forEach(key =>
    Object.defineProperty(settable, key, {
      set(prop: any) {
        this.__original__[key] = typeof prop === "object" ? wrap(prop): prop;
        this.__emit__();
      },
      get() {
        return this.__original__[key];
      }
    })
  );
  return settable;
}
