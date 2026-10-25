import { describe, expect, it } from "vitest";
import { diff } from "./client.ts";
import type { ArrayVNode, HtmlVNode, TextVNode, VNode } from "../types.ts";

function text(name: string): TextVNode {
  return { type: "text", name };
}

function html(name: string, children: VNode[] = [], attributes: HtmlVNode["attributes"] = null): HtmlVNode {
  return { type: "html", name, attributes, children };
}

function array(children: VNode[]): ArrayVNode {
  return { type: "array", children };
}

function li(key: string, label: string = key, attributes: Record<string, unknown> = {}): HtmlVNode {
  return html("li", [text(label)], { key, ...attributes });
}

describe("diff", () => {
  it("returns nothing when the trees match.", () => {
    const vnode = html("div", [text("a")]);

    expect(diff(vnode, html("div", [text("a")]))).toEqual([]);
  });

  describe("mount", () => {
    it("mounts the whole tree when there is no previous vnode.", () => {
      const vnode = html("div", [text("a")]);

      expect(diff(null, vnode)).toEqual([{ op: "mount", path: [], vnode }]);
    });

    it("mounts an added child at its flattened index.", () => {
      const added = html("li", [text("c")]);
      const last = html("ul", [array([html("li", [text("a")]), html("li", [text("b")])])]);
      const next = html("ul", [array([html("li", [text("a")]), html("li", [text("b")]), added])]);

      expect(diff(last, next)).toEqual([{ op: "mount", path: [2], vnode: added }]);
    });
  });

  describe("unmount", () => {
    it("unmounts the last flattened child.", () => {
      const last = html("ul", [array([html("li", [text("a")]), html("li", [text("b")]), html("li", [text("c")])])]);
      const next = html("ul", [array([html("li", [text("a")]), html("li", [text("b")])])]);

      expect(diff(last, next)).toEqual([{ op: "unmount", path: [2] }]);
    });

    it("unmounts an array item between static elements.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")]), html("span", [text("b")]), html("span", [text("c")])]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")]), html("span", [text("b")])]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "unmount", path: [3] }]);
    });
  });

  describe("replace", () => {
    it("replaces an element when the tag changes.", () => {
      const nextChild = html("strong", [text("target")]);
      const last = html("div", [
        html("span", [text("before")]),
        html("span", [text("target")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [html("span", [text("before")]), nextChild, html("span", [text("after")])]);

      expect(diff(last, next)).toEqual([{ op: "replace", path: [1], vnode: nextChild }]);
    });

    it("replaces an element with a text node.", () => {
      const nextChild = text("plain");
      const last = html("div", [
        html("span", [text("before")]),
        html("span", [text("target")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [html("span", [text("before")]), nextChild, html("span", [text("after")])]);

      expect(diff(last, next)).toEqual([{ op: "replace", path: [1], vnode: nextChild }]);
    });

    it("replaces an array item between static elements.", () => {
      const nextChild = html("b", [text("b")]);
      const last = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")]), html("span", [text("b")]), html("span", [text("c")])]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")]), nextChild, html("span", [text("c")])]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "replace", path: [2], vnode: nextChild }]);
    });

    it("keeps a path segment for an html parent, and skips array nodes.", () => {
      const nextChild = html("strong", [text("target")]);

      expect(
        diff(
          html("div", [html("section", [html("span", [text("target")])])]),
          html("div", [html("section", [nextChild])]),
        ),
      ).toEqual([{ op: "replace", path: [0, 0], vnode: nextChild }]);

      expect(diff(html("div", [array([html("span", [text("target")])])]), html("div", [array([nextChild])]))).toEqual([
        { op: "replace", path: [0], vnode: nextChild },
      ]);
    });

    // https://github.com/naoki-tomita/zheleznaya/issues/20#issuecomment-6397073919 (B)
    it.fails("does not diff children after replacing an element.", () => {
      const nextChild = html("main", [html("p", [text("a")])]);
      const last = html("div", [
        html("div", [html("p", [text("a")]), html("p", [text("b")])]),
      ]);
      const next = html("div", [nextChild]);

      expect(diff(last, next)).toEqual([
        { op: "replace", path: [0], vnode: nextChild },
      ]);
    });

    it("replaces a child that becomes an empty array.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        html("span", [text("target")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [html("span", [text("before")]), array([]), html("span", [text("after")])]);

      expect(diff(last, next)).toEqual([{ op: "replace", path: [1], vnode: array([]) }]);
    });
  });

  describe("props", () => {
    it("sets and unsets attributes.", () => {
      expect(diff(html("div", [], { class: "a" }), html("div", [], { class: "b" }))).toEqual([
        { op: "props", path: [], set: { class: "b" }, unset: [] },
      ]);

      expect(diff(html("div", [], { id: "x" }), html("div", [], {}))).toEqual([
        { op: "props", path: [], set: {}, unset: ["id"] },
      ]);
    });

    it("uses the flattened index of a nested element.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")], { class: "a" })]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")], { class: "b" })]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "props", path: [1], set: { class: "b" }, unset: [] }]);
    });
  });

  describe.skip("key", () => {
    it("updates the matched key in place.", () => {
      const last = html("ul", [array([li("a"), li("b", "old"), li("c")])]);
      const next = html("ul", [array([li("a"), li("b", "new"), li("c")])]);

      expect(diff(last, next)).toEqual([{ op: "replace", path: [1, 0], vnode: text("new") }]);
    });

    it("does not put key into the props patch.", () => {
      const last = html("ul", [array([li("b", "b", { class: "a" })])]);
      const next = html("ul", [array([li("b", "b", { class: "b" })])]);

      expect(diff(last, next)).toEqual([{ op: "props", path: [0], set: { class: "b" }, unset: [] }]);
    });

    it("unmounts the removed key instead of the last item.", () => {
      const last = html("ul", [array([li("a"), li("b"), li("c")])]);
      const next = html("ul", [array([li("a"), li("c")])]);

      expect(diff(last, next)).toEqual([{ op: "unmount", path: [1] }]);
    });

    it("mounts an inserted key at its new index.", () => {
      const added = li("b");
      const last = html("ul", [array([li("a"), li("c")])]);
      const next = html("ul", [array([li("a"), added, li("c")])]);

      expect(diff(last, next)).toEqual([{ op: "mount", path: [1], vnode: added }]);
    });

    it("unmounts a removed key between static elements.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        array([li("a"), li("b"), li("c")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([li("a"), li("c")]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "unmount", path: [2] }]);
    });

    it("moves a reordered key instead of remounting it.", () => {
      const last = html("ul", [array([li("a"), li("b"), li("c")])]);
      const next = html("ul", [array([li("c"), li("a"), li("b")])]);

      expect(diff(last, next)).toEqual([{ op: "move", from: [2], path: [0] }]);
    });

    it("moves a reordered key between static elements.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        array([li("a"), li("b"), li("c")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([li("c"), li("a"), li("b")]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "move", from: [3], path: [1] }]);
    });
  });
});
