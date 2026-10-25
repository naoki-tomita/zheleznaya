import { describe, it, expect } from "vitest";
import { createRoot } from "../src/index.ts";

describe("#createStore", () => {
  it("should rerender when store changed.", async () => {
    const { createStore } = createRoot();
    const store = createStore({ count: 0 });
    expect(store).toMatchSnapshot();
  });
});
