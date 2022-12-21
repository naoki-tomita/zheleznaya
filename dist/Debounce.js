"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
function debounce(fn, timeout) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), timeout);
    };
}
exports.debounce = debounce;
//# sourceMappingURL=Debounce.js.map