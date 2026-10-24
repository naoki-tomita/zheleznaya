export function isEquals(left, right) {
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
/**
 * @param {Array<any>} left
 * @param {Array<any>} right
 */
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
        Object.keys(right).sort(),
    ];
    if (!isArrayEquals(leftKeys, rightKeys)) {
        return false;
    }
    return leftKeys.every((key) => {
        return isEquals(left[key], right[key]);
    });
}
export function range(size) {
    return Array(size)
        .fill(null)
        .map((_, i) => i);
}
//# sourceMappingURL=Equals.js.map