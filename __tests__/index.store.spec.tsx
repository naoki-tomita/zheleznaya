declare const React = ""; // suppress error.
import { describe, it, expect } from "vitest";
import { h, createRoot, createStore, type Component } from "../index.ts";

function sleep(ms: number) {
  return new Promise(ok => setTimeout(ok, ms));
}

describe("#createStore", () => {
  it("should rerender when store changed.", async () => {
    const { render } = createRoot();
    const store = createStore({ count: 0 });
    const App: Component = () => {
      return (
        <div>{store.count}</div>
      );
    }
    render(<App />);
    expect(document.body).toMatchSnapshot();

    store.count = 2;

    await sleep(1); // wait for 1 tick.
    expect(document.body).toMatchSnapshot();
  });
});
