"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = void 0;
function wrap(obj) {
    if (typeof obj == null ||
        typeof obj !== "object") {
        return obj;
    }
    const settable = {
        __cb__: [],
        __emit__() {
            this.__cb__.forEach(it => it());
        },
        __on__(cb) {
            this.__cb__.push(cb);
        },
        __original__: obj
    };
    Object.keys(obj).forEach(key => {
        const wrapped = wrap(obj[key]);
        obj[key] = wrapped;
        wrapped.__on__?.(() => settable.__emit__());
    });
    function set(_, key, value) {
        const wrapped = wrap(value);
        obj[key] = wrapped;
        wrapped.__on__?.(() => settable.__emit__());
        settable.__emit__();
        return true;
    }
    if (Array.isArray(obj)) {
        return new Proxy(settable, {
            get(target, key) {
                if (["__cb__", "__emit__", "__on__", "__original__"].includes(key.toString())) {
                    return target[key];
                }
                if (["push", "pop", "shift", "unshift"].includes(key.toString())) {
                    return (...args) => {
                        const result = obj[key](...args);
                        settable.__emit__();
                        return result;
                    };
                }
                else if (["map", "forEach", "reduce", "filter", "find", "concat"].includes(key.toString())) {
                    return (...args) => obj[key](...args);
                }
                return obj[key];
            },
            set,
        });
    }
    return new Proxy(settable, {
        get(target, key) {
            if (["__cb__", "__emit__", "__on__", "__original__"].includes(key.toString())) {
                return target[key];
            }
            return obj[key];
        },
        set,
    });
}
exports.wrap = wrap;
//# sourceMappingURL=Settable.js.map