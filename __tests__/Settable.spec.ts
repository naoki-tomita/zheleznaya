import { wrap } from "../Settable";

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

      const spy = jest.fn();
      obj.__on__(spy);
      obj.foo = "hoge";
      expect(spy).toBeCalledTimes(1);

      expect(obj.foo).toBe("hoge");
    });

    it("should fire changed event when object does not have property changed.", () => {
      const obj = wrap({ foo: "bar" });
      const spy = jest.fn();
      obj.__on__(spy);
      (obj as any).bar = "hoge";
      expect(spy).toBeCalledTimes(1);
    });

    it("should fire changed event when nested object property changed.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      expect(obj.foo.bar).toBe("hoge");

      const spy = jest.fn();
      obj.__on__(spy);
      obj.foo.bar = "foo.bar";
      expect(spy).toBeCalledTimes(1);

      expect(obj.foo.bar).toBe("foo.bar");
    });

    it("should fire changed event when new nested object property changed.", () => {
      const obj = wrap({ foo: { bar: "hoge" } });
      const spy = jest.fn();
      obj.__on__(spy);

      obj.foo = { bar: "foo.bar" };
      expect(spy).toBeCalledTimes(1);
      expect(obj.foo.bar).toBe("foo.bar");

      obj.foo.bar = "foo";
      expect(spy).toBeCalledTimes(2);
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
      const spy = jest.fn();
      obj.__on__(spy);

      obj.array.push("foo");
      expect(spy).toBeCalled();
    });

    it("should emulate map method when settable array", () => {
      const obj = wrap({ array: [{id: 1, name: "foo"}, {id: 2, name: "bar"}, {id: 3, name: "hoge"}] });

      const actual = obj.array.map(it => it.name);
      expect(actual).toEqual(["foo", "bar", "hoge"])
    });
  });
});
