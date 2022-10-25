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
var Equals_exports = {};
__export(Equals_exports, {
  isEquals: () => isEquals,
  range: () => range
});
module.exports = __toCommonJS(Equals_exports);
function isEquals(left, right) {
  if (typeof left !== typeof right) {
    return false;
  }
  switch (typeof left) {
    case "object":
      if (left === null || right === null) {
        return left === right;
      }
      if (Array.isArray(left) && Array.isArray(right)) {
        return isArrayEquals(left, right);
      }
      return isObjectEquals(left, right);
    default:
      return left === right;
  }
}
function isArrayEquals(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return range(left.length).every((index) => {
    return isEquals(left[index], right[index]);
  });
}
function isObjectEquals(left, right) {
  const [leftKeys, rightKeys] = [
    Object.keys(left).sort(),
    Object.keys(right).sort()
  ];
  if (!isArrayEquals(leftKeys, rightKeys)) {
    return false;
  }
  return leftKeys.every((key) => {
    return isEquals(left[key], right[key]);
  });
}
function range(size) {
  return Array(size).fill(null).map((_, i) => i);
}
