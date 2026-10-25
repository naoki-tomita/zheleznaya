import { isEquals } from "./Equals.js";
export function createEffect() {
    let lastUpdatedKeys = ["_____________________"];
    return function effect(cb, keys) {
        if (!isEquals(lastUpdatedKeys, keys)) {
            cb();
            lastUpdatedKeys = keys;
        }
    };
}
//# sourceMappingURL=Effect.js.map