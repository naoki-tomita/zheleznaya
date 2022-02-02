"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = void 0;
function wrap(obj) {
    if (typeof obj === "string" ||
        typeof obj === "number" ||
        typeof obj === "boolean") {
        return obj;
    }
    if (Array.isArray(obj)) {
        return {
            __original__: obj,
            push(...items) {
                this.__original__.push(...items);
                this.__emit__();
            },
            map(...args) {
                return this.__original__.map(...args);
            },
            includes(...args) {
                return this.__original__.includes(...args);
            },
            filter(...args) {
                return this.__original__.filter(...args);
            },
            splice(...args) {
                const result = this.__original__.splice(...args);
                this.__emit__();
                return result;
            },
            __cb__: [],
            __on__(cb) {
                this.__cb__.push(cb);
            },
            __emit__() {
                this.__cb__.forEach((it) => it());
            },
        };
    }
    const original = {};
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object") {
            original[key] = wrap(obj[key]);
            original[key].__on__(() => settable.__emit__());
        }
        else {
            original[key] = obj[key];
        }
    });
    const settable = {
        __original__: original,
        __on__(cb) {
            this.__cb__.push(cb);
        },
        __cb__: [],
        __emit__() {
            this.__cb__.forEach((it) => it());
        },
    };
    Object.keys(obj).forEach((key) => {
        Object.defineProperty(settable, key, {
            set(prop) {
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
            },
        });
    });
    return settable;
}
exports.wrap = wrap;
//# sourceMappingURL=Settable.js.map