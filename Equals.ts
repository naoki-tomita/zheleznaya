export function isEquals(left: any, right: any): boolean {
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
function isArrayEquals(left: any[], right: any[]) {
  if (left.length !== right.length) {
    return false;
  }

  return range(left.length).every(index => {
    return isEquals(left[index], right[index]);
  });
}

function isObjectEquals(left: any, right: any) {
  const [leftKeys, rightKeys] = [
    Object.keys(left).sort(),
    Object.keys(right).sort()
  ];
  if (!isArrayEquals(leftKeys, rightKeys)) {
    return false;
  }
  return leftKeys.every(key => {
    return isEquals(left[key], right[key]);
  });
}

export function range(size: number) {
  return Array(size)
    .fill(null)
    .map((_, i) => i);
}
