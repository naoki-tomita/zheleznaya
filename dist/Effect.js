"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEffect = void 0;
const Equals_1 = require("./Equals");
function createEffect() {
    let lastUpdatedKeys = ["_____________________"];
    return function effect(cb, keys) {
        if (!(0, Equals_1.isEquals)(lastUpdatedKeys, keys)) {
            cb();
            lastUpdatedKeys = keys;
        }
    };
}
exports.createEffect = createEffect;
//# sourceMappingURL=Effect.js.map