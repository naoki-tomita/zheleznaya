import { describe, it, expect } from "vitest";
import { h } from "./index.ts";
import { renderElement } from "./VNode.ts";
import type { Child, Component, VNode } from "./types.ts";

function renderChildren(...children: Array<Child | Child[]>): VNode[] {
  const vnode = renderElement(h("p", null, ...children));
  if (vnode.type !== "html") {
    throw new Error("expected an html vnode");
  }
  return vnode.children;
}

describe("#renderElement", () => {
  it("should resolve components into html vnodes.", () => {
    const Inner: Component<{ name: string }> = ({ name }, children) =>
      h("p", { class: name }, ...children);

    expect(renderElement(h(Inner, { name: "a" }, "text"))).toEqual({
      type: "html",
      name: "p",
      attributes: { class: "a" },
      children: [{ type: "text", name: "text" }],
    });
  });

  it("should render strings and numbers as text vnodes.", () => {
    expect(renderChildren("a", 1)).toEqual([
      { type: "text", name: "a" },
      { type: "text", name: "1" },
    ]);
  });

  it("should render an array child as an array vnode.", () => {
    expect(renderChildren(["a", "b"])).toEqual([
      {
        type: "array",
        children: [
          { type: "text", name: "a" },
          { type: "text", name: "b" },
        ],
      },
    ]);
  });

  it("should render null and undefined as empty text vnodes.", () => {
    expect(renderChildren(null, undefined)).toEqual([
      { type: "text", name: "" },
      { type: "text", name: "" },
    ]);
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#6)
  // renderChild が boolean を文字列にしている。
  it.fails("should not render booleans as text.", () => {
    const children = renderChildren(false, true);

    expect(children).not.toContainEqual({ type: "text", name: "false" });
    expect(children).not.toContainEqual({ type: "text", name: "true" });
  });
});
