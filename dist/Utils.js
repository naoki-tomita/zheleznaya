"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toKebabCaseFromSnakeCase = void 0;
var UPPER_CHAR = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function toKebabCaseFromSnakeCase(kebabCase) {
    return kebabCase
        .split("")
        .map(function (it) { return (UPPER_CHAR.includes(it) ? "-" + it.toLowerCase() : it); })
        .join("");
}
exports.toKebabCaseFromSnakeCase = toKebabCaseFromSnakeCase;
//# sourceMappingURL=Utils.js.map