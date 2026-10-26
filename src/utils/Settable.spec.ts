import { describe, it, expect, vi } from "vitest";
import { wrap } from "./Settable.ts";

describe("Settable", () => {
  describe("#wrap", () => {
    it("should wrap object.", () => {
      const obj = wrap({ foo: "bar" });
      expect(obj.__cb__).toEqual([]);
      expect(typeof obj.__emit__).toBe("function");
      expect(typeof obj.__on__).toBe("function");
      expect(obj.__original__).toEqual({ foo: "bar" });
      expect(obj.foo).toBe("bar");
    });

    it("should fire changed event when object property changed.", () => {
      const obj = wrap({ foo: "bar" });

      const spy = vi.fn();
      obj.__on__(spy);
      obj.foo = "hoge";
      expect(spy).toHaveBeenCalledTimes(1);

      expect(obj.foo).toBe("hoge");
    });

    it("should fire changed event when object does not have property changed.", () => {
      const obj = wrap({ foo: "bar" });
      const spy = vi.fn();
      obj.__on__(spy);
      (obj as any).bar = "hoge";
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should fire changed event when nested object property changed.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      expect(obj.foo.bar).toBe("hoge");

      const spy = vi.fn();
      obj.__on__(spy);
      obj.foo.bar = "foo.bar";
      expect(spy).toHaveBeenCalledTimes(1);

      expect(obj.foo.bar).toBe("foo.bar");
    });

    it("should fire changed event when new nested object property changed.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      const spy = vi.fn();
      obj.__on__(spy);

      obj.foo = { bar: "foo.bar" };
      expect(spy).toHaveBeenCalledTimes(1);
      expect(obj.foo.bar).toBe("foo.bar");

      obj.foo.bar = "foo";
      expect(spy).toHaveBeenCalledTimes(2);
      expect(obj.foo.bar).toBe("foo");
    });

    it("should provide array function when settable array", () => {
      const obj = wrap({ array: [] });
      expect(obj.array.push).toBeDefined();
      expect(obj.array.map).toBeDefined();
      expect(obj.array.includes).toBeDefined();
      expect(obj.array.filter).toBeDefined();
      expect(obj.array.splice).toBeDefined();
    });

    it("should emit array function when settable array", () => {
      const obj = wrap<{ array: string[] }>({ array: [] });
      const spy = vi.fn();
      obj.__on__(spy);

      obj.array.push("foo");
      expect(spy).toHaveBeenCalled();
    });

    it("should emulate map method when settable array", () => {
      const obj = wrap({
        array: [
          { id: 1, name: "foo" },
          { id: 2, name: "bar" },
          { id: 3, name: "hoge" },
        ],
      });

      const actual = obj.array.map((it) => it.name);
      expect(actual).toEqual(["foo", "bar", "hoge"]);
    });

    it("should set null parameter", () => {
      const obj = wrap<{ null: null | string; text: string }>({
        null: null,
        text: "text",
      });
      const spy = vi.fn();
      obj.__on__(spy);

      expect(obj.null).toBe(null);

      obj.null = "not null";
      expect(obj.null).toBe("not null");
      expect(spy).toHaveBeenCalledTimes(1);

      obj.null = null;
      expect(obj.null).toBe(null);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    // https://github.com/naoki-tomita/zheleznaya/issues/20 (#7)
    // Proxy の target が settable なので、has / deleteProperty が元の配列に届かない。
    it("should splice a settable array.", () => {
      const obj = wrap({ items: ["a", "c", "d"] });

      const removed = obj.items.splice(0, 1);

      expect(removed).toEqual(["a"]);
      expect([...obj.items]).toEqual(["c", "d"]);
    });

    // https://github.com/naoki-tomita/zheleznaya/issues/20 (#9)
    // 組み込みオブジェクトも Proxy で包むので、メソッドの this が Proxy になり TypeError になる。
    // (issue では AudioNode で確認。jsdom には AudioContext がないので Map / Date で再現する)
    it.fails("should keep a Map usable.", () => {
      const obj = wrap({ map: new Map([["key", "value"]]) });

      expect(obj.map.get("key")).toBe("value");
    });

    it.fails("should keep a Date usable.", () => {
      const obj = wrap({ date: new Date(0) });

      expect(obj.date.getTime()).toBe(0);
    });
  });
});
