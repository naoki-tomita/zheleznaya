interface Settable<T> {
  __original__: T;
  __on__(cb: () => void): void;
  __emit__(): void;
  __cb__: Array<() => void>;
}

export function wrap<T extends {}>(obj: T): T & Settable<T> {
  if (
    obj == null ||
    typeof obj !== "object"
  ) {
    return obj as any;
  }

  const settable: Settable<T> = {
    __cb__: [],
    __emit__() {
      this.__cb__.forEach(it => it())
    },
    __on__(cb) {
      this.__cb__.push(cb);
    },
    __original__: obj
  }

  Object.keys(obj).forEach(key => {
    const wrapped = wrap((obj as any)[key]);
    (obj as any)[key] = wrapped;
    wrapped?.__on__?.(() => settable.__emit__());
  });

  function set(_: any, key: string, value: any) {
    const wrapped = wrap<{}>(value);
    (obj as any)[key as any] = wrapped;
    wrapped?.__on__?.(() => settable.__emit__());
    settable.__emit__();
    return true;
  }


  if (Array.isArray(obj)) {
    return new Proxy(settable, {
      get(target, key) {
        if (["__cb__", "__emit__", "__on__", "__original__"].includes(key.toString())) {
          return (target as any)[key as any];
        }
        if (["push", "pop", "shift", "unshift"].includes(key.toString())) {
          return (...args: any[]) => {
            const result = (obj as any)[key](...args);
            settable.__emit__();
            return result;
          }
        } else if (["map", "forEach", "reduce", "filter", "find", "concat"].includes(key.toString())) {
          return (...args: any[]) => (obj as any)[key](...args);
        }
        return (obj as any)[key];
      },
      set,
    }) as any;
  }

  return new Proxy(settable, {
    get(target, key) {
      if (["__cb__", "__emit__", "__on__", "__original__"].includes(key.toString())) {
        return (target as any)[key as any];
      }
      return (obj as any)[key as any];
    },
    set,
  }) as any;
}
