import type { Element, VNode } from "../types.ts";
type DiffResult = PatchOperation[];
type IndexPath = number[];
type PatchOperation =
  | {
      op: "mount";
      vnode: VNode;
      path?: IndexPath;
    }
  | {
      op: "unmount";
      path: IndexPath;
    }
  | {
      op: "replace";
      path: IndexPath;
      vnode: VNode;
    }
  | {
      op: "props";
      path: IndexPath;
      set: Record<string, unknown>;
      unset: string[];
    };
export declare function diff(
  lastVNode: VNode | null,
  vnode: VNode | null,
  path?: IndexPath,
): DiffResult;
export declare function createRoot(rootElement?: globalThis.Element): {
  render: (nodeElement: Element) => void;
  createStore: <T extends {}>(initialValue: T) => T;
  getStore: <T>() => T;
};
export {};
//# sourceMappingURL=client.d.ts.map
