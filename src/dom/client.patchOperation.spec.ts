import { describe, expect, it } from "vitest";
import { patchOperationSorter } from "./client.ts";
import type { TextVNode } from "../types.ts";

const vnode: TextVNode = { type: "text", name: "" };

function mount(path?: number[]) {
  return { op: "mount" as const, vnode, path };
}

function unmount(path: number[]) {
  return { op: "unmount" as const, path };
}

function replace(path: number[]) {
  return { op: "replace" as const, path, vnode };
}

function props(path: number[]) {
  return { op: "props" as const, path, set: {}, unset: [] as string[] };
}

type Operation =
  ReturnType<typeof mount> | ReturnType<typeof unmount> | ReturnType<typeof replace> | ReturnType<typeof props>;

function sort(...operations: Operation[]) {
  return operations.toSorted(patchOperationSorter).map((operation) => {
    const path = operation.path?.join(".") ?? "";
    return path.length > 0 ? `${operation.op}:${path}` : operation.op;
  });
}

describe("#patchOperationSorter", () => {
  it("runs props, then replace, then mount and unmount.", () => {
    expect(sort(unmount([0]), mount([0]), replace([0]), props([0]))).toEqual([
      "props:0",
      "replace:0",
      "unmount:0",
      "mount:0",
    ]);
  });

  it("runs a higher priority operation before a lower one with a deeper path.", () => {
    expect(sort(unmount([2, 2]), props([0]), replace([9]))).toEqual(["props:0", "replace:9", "unmount:2.2"]);
  });

  it("runs a deeper path first.", () => {
    expect(sort(unmount([0]), unmount([0, 1, 2]), unmount([0, 1]))).toEqual([
      "unmount:0.1.2",
      "unmount:0.1",
      "unmount:0",
    ]);
  });

  it("runs a larger index first when the depth is the same.", () => {
    expect(sort(unmount([0]), unmount([2]), unmount([1]))).toEqual(["unmount:2", "unmount:1", "unmount:0"]);
  });

  it("compares the earlier path segment before the later one.", () => {
    expect(sort(unmount([0, 9]), unmount([1, 0]))).toEqual(["unmount:1.0", "unmount:0.9"]);
  });

  it("runs a path with an index before a mount that has no path.", () => {
    expect(sort(mount(), mount([0]))).toEqual(["mount:0", "mount"]);
  });

  it("keeps the original order when the priority and the path are equal.", () => {
    expect(sort(unmount([1]), mount([1]))).toEqual(["unmount:1", "mount:1"]);
    expect(sort(mount([1]), unmount([1]))).toEqual(["mount:1", "unmount:1"]);
  });
});
