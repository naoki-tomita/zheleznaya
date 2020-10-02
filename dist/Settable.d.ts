interface Settable<T> {
  __original__: T;
  __on__(cb: () => void): void;
  __emit__(): void;
  __cb__: Array<() => void>;
}
export declare function wrap<T>(
  obj: T | string | number | boolean
): Settable<T> | string | number | boolean;
export {};
//# sourceMappingURL=Settable.d.ts.map
