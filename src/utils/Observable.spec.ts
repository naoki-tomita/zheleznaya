import { describe, it, expect, vi } from "vitest";
import { wrap, type Observable } from "./Observable.ts";

type WithOn = {
  __on__(callback: () => void): void;
};

function subscribe(target: object, callback: () => void): void {
  (target as WithOn).__on__(callback);
}

describe("Observable", () => {
  describe("#wrap", () => {
    it("should return a plain object with the same fields.", () => {
      const obj = wrap({ foo: "bar", count: 1 });

      expect(obj.foo).toBe("bar");
      expect(obj.count).toBe(1);
      expect({ ...obj }).toEqual({ foo: "bar", count: 1 });
    });

    it("should return an array with the same elements.", () => {
      const array = wrap(["a", "b"]);

      expect(array).toHaveLength(2);
      expect(array[0]).toBe("a");
      expect(array[1]).toBe("b");
      expect([...array]).toEqual(["a", "b"]);
      expect(array.map((item) => item.toUpperCase())).toEqual(["A", "B"]);
      expect(array.filter((item) => item === "b")).toEqual(["b"]);
      expect(array.includes("a")).toBe(true);
    });

    it("should keep nested objects and arrays readable.", () => {
      const obj = wrap({
        child: { name: "foo" },
        items: [{ id: 1 }, { id: 2 }],
      });

      expect(obj.child.name).toBe("foo");
      expect(obj.items.map((item) => item.id)).toEqual([1, 2]);
    });
  });

  describe("observable", () => {
    it("should keep __on__ hidden from enumeration and from the public type.", () => {
      const hiddenFromType: "__on__" extends keyof Observable<{ foo: string }> ? true : false = false;
      expect(hiddenFromType).toBe(false);

      const obj = wrap({ foo: "bar" });
      expect(typeof (obj as unknown as WithOn).__on__).toBe("function");
      expect(Object.keys(obj)).toEqual(["foo"]);
      expect(JSON.parse(JSON.stringify(obj))).toEqual({ foo: "bar" });

      const keys: string[] = [];
      for (const key in obj) {
        keys.push(key);
      }
      expect(keys).toEqual(["foo"]);

      const array = wrap(["a"]);
      expect(typeof (array as unknown as WithOn).__on__).toBe("function");
      expect(Object.keys(array)).toEqual(["0"]);
      expect(JSON.parse(JSON.stringify(array))).toEqual(["a"]);
    });

    it("should call the callback after a property is set.", () => {
      const obj = wrap({ foo: "bar" });
      let seen = "";
      const spy = vi.fn(() => {
        seen = obj.foo;
      });
      subscribe(obj, spy);

      obj.foo = "hoge";

      expect(obj.foo).toBe("hoge");
      expect(seen).toBe("hoge");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call the callback when a new property is set.", () => {
      const obj = wrap<{ foo: string; bar?: string }>({ foo: "bar" });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.bar = "hoge";

      expect(obj.bar).toBe("hoge");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call the root callback when a nested property is set.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.foo.bar = "foo.bar";

      expect(obj.foo.bar).toBe("foo.bar");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call the root callback when a deeply nested property is set.", () => {
      const obj = wrap({ a: { b: { c: "start" } } });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.a.b.c = "next";

      expect(obj.a.b.c).toBe("next");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should observe an object assigned later.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.foo = { bar: "foo.bar" };

      expect(spy).toHaveBeenCalledTimes(1);
      expect(obj.foo.bar).toBe("foo.bar");
      expect(typeof (obj.foo as unknown as WithOn).__on__).toBe("function");

      obj.foo.bar = "foo";

      expect(spy).toHaveBeenCalledTimes(2);
      expect(obj.foo.bar).toBe("foo");
    });

    it("should observe an array assigned later.", () => {
      const obj = wrap({ items: ["a"] });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.items = ["b"];

      expect(spy).toHaveBeenCalledTimes(1);
      expect([...obj.items]).toEqual(["b"]);

      obj.items.push("c");

      expect(spy).toHaveBeenCalledTimes(2);
      expect([...obj.items]).toEqual(["b", "c"]);

      obj.items[0] = "d";

      expect(spy).toHaveBeenCalledTimes(3);
      expect(obj.items[0]).toBe("d");
    });

    it("should call the callback when an array element is set.", () => {
      const array = wrap(["a", "b"]);
      const spy = vi.fn();
      subscribe(array, spy);

      array[1] = "c";

      expect(array[1]).toBe("c");
      expect([...array]).toEqual(["a", "c"]);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call the callback when an array is mutated with push.", () => {
      const array = wrap(["a"]);
      const spy = vi.fn();
      subscribe(array, spy);

      const length = array.push("b");

      expect(length).toBe(2);
      expect([...array]).toEqual(["a", "b"]);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call the callback when an array is mutated with splice.", () => {
      const array = wrap(["a", "c", "d"]);
      const spy = vi.fn();
      subscribe(array, spy);

      const removed = array.splice(0, 1);

      expect(removed).toEqual(["a"]);
      expect([...array]).toEqual(["c", "d"]);
      expect(spy).toHaveBeenCalledTimes(4);
    });

    it("should call the callback once when an array is mutated with unshift.", () => {
      const array = wrap(["a"]);
      const spy = vi.fn();
      subscribe(array, spy);

      const length = array.unshift("z");

      expect(length).toBe(2);
      expect([...array]).toEqual(["z", "a"]);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should call the callback once when an array is reversed.", () => {
      const array = wrap(["a", "b", "c"]);
      const spy = vi.fn();
      subscribe(array, spy);

      array.reverse();

      expect([...array]).toEqual(["c", "b", "a"]);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should call the callback when an array is mutated with pop.", () => {
      const array = wrap(["a", "b"]);
      const spy = vi.fn();
      subscribe(array, spy);

      const value = array.pop();

      expect(value).toBe("b");
      expect([...array]).toEqual(["a"]);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should call the callback when an array length is shrunk.", () => {
      const array = wrap(["a", "b", "c"]);
      const spy = vi.fn();
      subscribe(array, spy);

      array.length = 0;

      expect(array).toHaveLength(0);
      expect([...array]).toEqual([]);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call the root callback when a nested array changes.", () => {
      const obj = wrap({ items: ["a"] });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.items.push("b");
      obj.items[0] = "c";

      expect([...obj.items]).toEqual(["c", "b"]);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should call the root callback when an object inside an array changes.", () => {
      const obj = wrap({ items: [{ name: "a" }] });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.items[0].name = "b";

      expect(obj.items[0].name).toBe("b");
      expect(spy).toHaveBeenCalledTimes(1);

      obj.items.push({ name: "c" });
      obj.items[1].name = "d";

      expect(obj.items[1].name).toBe("d");
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it("should notify the nested observable and the root.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      const root = vi.fn();
      const child = vi.fn();
      subscribe(obj, root);
      subscribe(obj.foo, child);

      obj.foo.bar = "next";

      expect(child).toHaveBeenCalledTimes(1);
      expect(root).toHaveBeenCalledTimes(1);
    });

    it("should not call the callback when a property is only read.", () => {
      const obj = wrap({ foo: "bar" });
      const spy = vi.fn();
      subscribe(obj, spy);

      expect(obj.foo).toBe("bar");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should call every registered callback.", () => {
      const obj = wrap({ foo: "bar" });
      const first = vi.fn();
      const second = vi.fn();
      subscribe(obj, first);
      subscribe(obj, second);

      obj.foo = "hoge";

      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });

    it("should notify when null is set.", () => {
      const obj = wrap<{ value: string | null }>({ value: "text" });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.value = null;

      expect(obj.value).toBeNull();
      expect(spy).toHaveBeenCalledTimes(1);

      obj.value = "text";

      expect(obj.value).toBe("text");
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should wrap an object that already contains null.", () => {
      const obj = wrap<{ value: string | null }>({ value: null });
      const spy = vi.fn();
      subscribe(obj, spy);

      expect(obj.value).toBeNull();

      obj.value = "text";

      expect(obj.value).toBe("text");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should wrap an array that already contains null.", () => {
      const array = wrap<(string | null)[]>([null]);

      expect(array[0]).toBeNull();
    });

    it("should wrap an object that already contains undefined.", () => {
      const obj = wrap<{ value?: string }>({ value: undefined });

      expect(obj.value).toBeUndefined();
    });

    it("should notify the parent once when a reassigned child changes.", () => {
      const child = wrap({ n: 1 });
      const obj = wrap<{ foo: { n: number } | number }>({ foo: 0 });
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.foo = child;
      obj.foo = child;

      expect(spy).toHaveBeenCalledTimes(1);

      child.n = 9;

      expect(obj.foo.n).toBe(9);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should stop notifying the parent after a child is replaced.", () => {
      const obj = wrap({ foo: { n: 1 } });
      const previous = obj.foo;
      const spy = vi.fn();
      subscribe(obj, spy);

      obj.foo = { n: 2 };

      expect(spy).toHaveBeenCalledTimes(1);

      previous.n = 3;

      expect(obj.foo.n).toBe(2);
      expect(previous.n).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should keep a Map usable.", () => {
      const obj = wrap({ map: new Map([["key", "value"]]) });

      expect(obj.map.get("key")).toBe("value");
    });

    it("should keep a Date usable.", () => {
      const obj = wrap({ date: new Date(0) });

      expect(obj.date.getTime()).toBe(0);
    });
  });
});
