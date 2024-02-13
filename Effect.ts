import { isEquals } from "./Equals";

export function createEffect() {
  let lastUpdatedKeys: any[] = ["_____________________"];
  return function effect(cb: () => void, keys: any[]) {
    if (!isEquals(lastUpdatedKeys, keys)) {
      cb();
      lastUpdatedKeys = keys;
    }
  };
}
