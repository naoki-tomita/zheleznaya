export type Observable<T> = T;

type InternalObj<T> = {
  callbacks: Array<() => void>;
  original: T;
  disabledEmit: boolean;
};

function isObservable(obj: any): obj is Observable<any> {
  return obj != null && (obj as any).__on__ != null;
}

export function wrap<T extends {}>(obj: T): T {
  if (typeof obj !== "object" || obj == null || (obj as any).__on__) {
    return obj;
  }
  if (!Array.isArray(obj) && (obj as any).__proto__ !== Object.prototype) {
    return obj;
  }

  const state: InternalObj<T> = {
    callbacks: [],
    original: obj,
    disabledEmit: false,
  };

  function emit() {
    if (!state.disabledEmit) {
      state.callbacks.forEach((it) => it());
    }
  }

  function subscribe(cb: () => void) {
    state.callbacks.push(cb);
  }

  function unsubscribe() {
    state.callbacks = [];
  }

  const newObj = Array.isArray(obj)
    ? obj.map((it) => {
        const newVal = wrap(it);
        if (isObservable(newVal)) newVal.__on__(emit);
        return newVal;
      })
    : Object.keys(obj).reduce((acc, key) => {
        const newVal = wrap((obj as any)[key]);
        if (isObservable(newVal)) newVal.__on__(emit);
        return { ...acc, [key]: newVal };
      }, {});

  const proxy = new Proxy(newObj, {
    set(target, p, newValue) {
      const old = (target as any)[p];
      if (old === newValue) return true;
      if (isObservable(old)) old.__off__();
      const v = ((target as any)[p] = wrap(newValue));
      if (isObservable(v)) v.__on__(emit);
      emit();
      return true;
    },
    get(target, p) {
      if (p === "__on__") return subscribe;
      if (p == "__off__") return unsubscribe;
      return (target as any)[p];
    },
    ownKeys(target) {
      return Object.getOwnPropertyNames(target);
    },
    getOwnPropertyDescriptor(target, p) {
      return Object.getOwnPropertyDescriptor(target, p);
    },
    deleteProperty(target, p) {
      const result = delete (target as any)[p];
      emit();
      return result;
    },
  }) as Observable<T> & InternalObj<T>;
  return proxy;
}
