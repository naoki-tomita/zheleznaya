import { toKebabCaseFromSnakeCase } from "../Utils";

describe("#toKebabCaseFromSnakeCase", () => {
  const tests = [
    { from: "helloWorld", to: "hello-world" },
    { from: "fooBarHoge", to: "foo-bar-hoge" },
  ]

  tests.forEach(({ from, to }) => {
    it("should convert kebab-case", () => {
      expect(toKebabCaseFromSnakeCase(from)).toBe(to);
    });
  })
});
