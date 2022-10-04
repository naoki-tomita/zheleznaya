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
            push: function () {
                var _a;
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i] = arguments[_i];
                }
                (_a = this.__original__).push.apply(_a, items);
                this.__emit__();
            },
            map: function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return (_a = this.__original__).map.apply(_a, args);
            },
            includes: function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return (_a = this.__original__).includes.apply(_a, args);
            },
            filter: function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return (_a = this.__original__).filter.apply(_a, args);
            },
            splice: function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var result = (_a = this.__original__).splice.apply(_a, args);
                this.__emit__();
                return result;
            },
            __cb__: [],
            __on__: function (cb) {
                this.__cb__.push(cb);
            },
            __emit__: function () {
                this.__cb__.forEach(function (it) { return it(); });
            },
        };
    }
    var original = {};
    Object.keys(obj).forEach(function (key) {
        if (typeof obj[key] === "object") {
            original[key] = wrap(obj[key]);
            original[key].__on__(function () { return settable.__emit__(); });
        }
        else {
            original[key] = obj[key];
        }
    });
    var settable = {
        __original__: original,
        __on__: function (cb) {
            this.__cb__.push(cb);
        },
        __cb__: [],
        __emit__: function () {
            this.__cb__.forEach(function (it) { return it(); });
        },
    };
    Object.keys(obj).forEach(function (key) {
        Object.defineProperty(settable, key, {
            set: function (prop) {
                var _this = this;
                this.__original__[key] =
                    typeof prop === "object" && prop !== null
                        ? wrap(prop.__original__ || prop)
                        : prop;
                this.__original__[key].__on__ &&
                    this.__original__[key].__on__(function () { return _this.__emit__(); });
                this.__emit__();
            },
            get: function () {
                return this.__original__[key];
            },
        });
    });
    return settable;
}
exports.wrap = wrap;
//# sourceMappingURL=Settable.js.map