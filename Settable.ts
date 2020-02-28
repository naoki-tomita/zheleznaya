interface Settable<T> {
  __original__: T;
  __on__(cb: () => void): void;
  __emit__(): void;
  __cb__: Array<() => void>;
}

export function wrap<T>(
  obj: T | string | number | boolean
): Settable<T> | string | number | boolean {
  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return {
      __original__: obj,
      push(...items: any[]) {
        this.__original__.push(...items);
        this.__emit__();
      },

      map(pred: any) {
        return this.__original__.map(pred);
      },
      __cb__: [] as Array<() => void>,
      __on__(cb: () => void) {
        this.__cb__.push(cb);
      },
      __emit__() {
        this.__cb__.forEach(it => it());
      }
    } as Settable<any>;
  }

  const original: any = {};
  Object.keys(obj).forEach(key => {
    if (typeof (obj as any)[key] === "object") {
      original[key] = wrap((obj as any)[key]);
      original[key].__on__(() => settable.__emit__());
    } else {
      original[key] = (obj as any)[key];
    }
  });
  const settable: Settable<T> = {
    __original__: original,
    __on__(cb: () => void) {
      this.__cb__.push(cb);
    },
    __cb__: [] as Array<() => void>,
    __emit__() {
      this.__cb__.forEach(it => it());
    }
  };
  Object.keys(obj).forEach(key => {
    Object.defineProperty(settable, key, {
      set(prop: any) {
        this.__original__[key] =
          typeof prop === "object" && prop !== null
            ? wrap(prop.__original__ || prop)
            : prop;
        this.__original__[key].__on__ &&
          this.__original__[key].__on__(() => this.__emit__());
        this.__emit__();
      },
      get() {
        return this.__original__[key];
      }
    });
  });
  return settable;
}
