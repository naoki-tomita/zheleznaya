interface Settable<T> {
    __original__: T;
    __on__(cb: () => void): void;
    __emit__(): void;
    __cb__: Array<() => void>;
}
export declare function wrap<T extends {}>(obj: T): T & Settable<T>;
export {};
//# sourceMappingURL=Settable.d.ts.map