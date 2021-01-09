"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = exports.isEquals = void 0;
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
exports.isEquals = isEquals;
/**
 * @param {Array<any>} left
 * @param {Array<any>} right
 */
function isArrayEquals(left, right) {
    if (left.length !== right.length) {
        return false;
    }
    return range(left.length).every(function (index) {
        return isEquals(left[index], right[index]);
    });
}
function isObjectEquals(left, right) {
    var _a = [
        Object.keys(left).sort(),
        Object.keys(right).sort(),
    ], leftKeys = _a[0], rightKeys = _a[1];
    if (!isArrayEquals(leftKeys, rightKeys)) {
        return false;
    }
    return leftKeys.every(function (key) {
        return isEquals(left[key], right[key]);
    });
}
function range(size) {
    return Array(size)
        .fill(null)
        .map(function (_, i) { return i; });
}
exports.range = range;
//# sourceMappingURL=Equals.js.map