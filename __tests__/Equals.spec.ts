import { isEquals, range } from "../Equals";

describe("Equals", () => {
  describe("#isEquals", () => {
    const tests: { left: any, right: any, expected: boolean }[] = [
      {
        left: "",
        right: "",
        expected: true,
      },
      {
        left: "text",
        right: "text",
        expected: true,
      },
      {
        left: "text",
        right: "fail",
        expected: false,
      },
      {
        left: 42,
        right: 42,
        expected: true,
      },
      {
        left: 42,
        right: 0,
        expected: false,
      },
      {
        left: true,
        right: true,
        expected: true,
      },
      {
        left: true,
        right: false,
        expected: false,
      },
      {
        left: true,
        right: false,
        expected: false,
      },
      {
        left: [42, "text", true],
        right: [42, "text", true],
        expected: true
      },
      {
        left: [42, "text", true],
        right: [42, "____", true],
        expected: false
      },
      {
        left: undefined,
        right: null,
        expected: false
      },
      {
        left: undefined,
        right: undefined,
        expected: true
      },
      {
        left: null,
        right: null,
        expected: true
      },
      {
        left: { foo: "bar" },
        right: { foo: "bar" },
        expected: true
      },
      {
        left: { foo: "foo" },
        right: { foo: "bar" },
        expected: false
      }
    ];
    tests.forEach(({ left, right, expected }) => {
      it("should check deep equaly two object.", () => {
        expect(isEquals(left, right)).toEqual(expected);
      });
    });
  });

  describe("#range", () => {
    it("should return indexed array.", () => {
      expect(range(8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    });
  });
});
