"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Settable_exports = {};
__export(Settable_exports, {
  wrap: () => wrap
});
module.exports = __toCommonJS(Settable_exports);
function wrap(obj) {
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
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
      }
    };
  }
  const original = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      original[key] = wrap(obj[key]);
      original[key].__on__(() => settable.__emit__());
    } else {
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
    }
  };
  Object.keys(obj).forEach((key) => {
    Object.defineProperty(settable, key, {
      set(prop) {
        this.__original__[key] = typeof prop === "object" && prop !== null ? wrap(prop.__original__ || prop) : prop;
        this.__original__[key].__on__ && this.__original__[key].__on__(() => this.__emit__());
        this.__emit__();
      },
      get() {
        return this.__original__[key];
      }
    });
  });
  return settable;
}
