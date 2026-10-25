import { describe, expect, it } from "vitest";
import { diff } from "../src/dom/client.ts";
import type { ArrayVNode, HtmlVNode, TextVNode, VNode } from "../src/types.ts";

function text(name: string): TextVNode {
  return { type: "text", name };
}

function html(
  name: string,
  children: VNode[] = [],
  attributes: HtmlVNode["attributes"] = null,
): HtmlVNode {
  return { type: "html", name, attributes, children };
}

function array(children: VNode[]): ArrayVNode {
  return { type: "array", children };
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
      const last = html("ul", [
        array([
          html("li", [text("a")]),
          html("li", [text("b")])
        ]),
      ]);
      const next = html("ul", [
        array([
          html("li", [text("a")]),
          html("li", [text("b")]),
          added
        ]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "mount", path: [2], vnode: added }]);
    });
  });

  describe("unmount", () => {
    it("unmounts the last flattened child.", () => {
      const last = html("ul", [
        array([
          html("li", [text("a")]),
          html("li", [text("b")]),
          html("li", [text("c")]),
        ]),
      ]);
      const next = html("ul", [
        array([html("li", [text("a")]), html("li", [text("b")])]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "unmount", path: [2] }]);
    });

    it("unmounts an array item between static elements.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        array([
          html("span", [text("a")]),
          html("span", [text("b")]),
          html("span", [text("c")]),
        ]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([
          html("span", [text("a")]),
          html("span", [text("b")])
        ]),
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
      const next = html("div", [
        html("span", [text("before")]),
        nextChild,
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([
        { op: "replace", path: [1], vnode: nextChild },
      ]);
    });

    it("replaces an element with a text node.", () => {
      const nextChild = text("plain");
      const last = html("div", [
        html("span", [text("before")]),
        html("span", [text("target")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        nextChild,
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([
        { op: "replace", path: [1], vnode: nextChild },
      ]);
    });

    it("replaces an array item between static elements.", () => {
      const nextChild = html("b", [text("b")]);
      const last = html("div", [
        html("span", [text("before")]),
        array([
          html("span", [text("a")]),
          html("span", [text("b")]),
          html("span", [text("c")]),
        ]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([html("span", [text("a")]), nextChild, html("span", [text("c")])]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([
        { op: "replace", path: [2], vnode: nextChild },
      ]);
    });

    it("keeps a path segment for an html parent, and skips array nodes.", () => {
      const nextChild = html("strong", [text("target")]);

      expect(
        diff(
          html("div", [html("section", [html("span", [text("target")])])]),
          html("div", [html("section", [nextChild])]),
        ),
      ).toEqual([{ op: "replace", path: [0, 0], vnode: nextChild }]);

      expect(
        diff(
          html("div", [array([html("span", [text("target")])])]),
          html("div", [array([nextChild])]),
        ),
      ).toEqual([{ op: "replace", path: [0], vnode: nextChild }]);
    });

    it("replaces a child that becomes an empty array.", () => {
      const last = html("div", [
        html("span", [text("before")]),
        html("span", [text("target")]),
        html("span", [text("after")]),
      ]);
      const next = html("div", [
        html("span", [text("before")]),
        array([]),
        html("span", [text("after")]),
      ]);

      expect(diff(last, next)).toEqual([{ op: "replace", path: [1], vnode: array([]) }]);
    });

  });

  describe("props", () => {
    it("sets and unsets attributes.", () => {
      expect(
        diff(html("div", [], { class: "a" }), html("div", [], { class: "b" })),
      ).toEqual([{ op: "props", path: [], set: { class: "b" }, unset: [] }]);

      expect(
        diff(html("div", [], { id: "x" }), html("div", [], {})),
      ).toEqual([{ op: "props", path: [], set: {}, unset: ["id"] }]);
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

      expect(diff(last, next)).toEqual([
        { op: "props", path: [1], set: { class: "b" }, unset: [] },
      ]);
    });
  });
});
