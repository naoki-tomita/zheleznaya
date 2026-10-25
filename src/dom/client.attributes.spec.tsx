import { describe, it, expect, vi } from "vitest";
import { h, createRoot } from "../index.ts";
import type { Component } from "../types.ts";
import { flushRender, setupDom } from "./test-helpers.ts";

setupDom();

describe("attributes", () => {
  it("should update attributes when state has updated.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ name: "a" });
    const App: Component = () => (
      <div>
        <div id="target" class={state.name} />
      </div>
    );
    render(<App />);
    const div = document.getElementById("target")!;

    state.name = "b";
    flushRender();

    expect(document.getElementById("target")).toBe(div);
    expect(div.getAttribute("class")).toBe("b");
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#8)
  // diff は unset を計算しているが、patch (updateProps) で使っていない。
  it.fails("should remove attributes that no longer exist.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ on: true });
    const App: Component = () => (
      <div>
        <div id="target" {...(state.on ? { class: "a", "aria-label": "x" } : {})} />
      </div>
    );
    render(<App />);

    state.on = false;
    flushRender();

    const div = document.getElementById("target")!;
    expect(div.hasAttribute("class")).toBe(false);
    expect(div.hasAttribute("aria-label")).toBe(false);
  });

  it("should toggle boolean attributes.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ disabled: true });
    const App: Component = () => (
      <div>
        <button disabled={state.disabled}>b</button>
      </div>
    );
    render(<App />);
    const button = document.querySelector("button")!;
    expect(button.hasAttribute("disabled")).toBe(true);

    state.disabled = false;
    flushRender();

    expect(button.hasAttribute("disabled")).toBe(false);
  });
});

describe("style", () => {
  it("should apply a style object.", () => {
    const { render } = createRoot();
    render(<div id="target" style={{ color: "red", fontWeight: "bold" }} />);

    const div = document.getElementById("target")!;
    expect(div.style.color).toBe("red");
    expect(div.style.fontWeight).toBe("bold");
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#8)
  it.fails("should remove style keys that no longer exist.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ bold: true });
    const App: Component = () => (
      <div>
        <div
          id="target"
          style={state.bold ? { color: "red", fontWeight: "bold" } : { color: "red" }}
        />
      </div>
    );
    render(<App />);

    state.bold = false;
    flushRender();

    const div = document.getElementById("target")!;
    expect(div.style.color).toBe("red");
    expect(div.style.fontWeight).toBe("");
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#8)
  // 型では文字列を渡せるが、DOM 側では Object.entries(文字列) になる。
  it.fails("should apply a style string.", () => {
    const { render } = createRoot();
    render(<div id="target" style="color: red" />);

    expect(document.getElementById("target")!.style.color).toBe("red");
  });
});

describe("input", () => {
  it("should update the value of an input when state has updated.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ count: 0 });

    const App: Component = () => {
      return (
        <div>
          <input value={state.count.toString()} />
        </div>
      );
    }
    render(<App />);

    const input = document.body.querySelector("input")!;
    expect(input.value).toBe("0");

    state.count++;
    flushRender();

    const newInput = document.body.querySelector("input")!;
    expect(newInput.value).toBe("1");
  });
});

describe("events", () => {
  it("should replace an event handler when it has updated.", () => {
    const { render, createStore } = createRoot();
    const first = vi.fn();
    const second = vi.fn();
    const state = createStore({ second: false });
    const App: Component = () => (
      <div>
        <button onclick={state.second ? second : first}>b</button>
      </div>
    );
    render(<App />);

    state.second = true;
    flushRender();
    document.querySelector("button")!.click();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });
});

describe("ref", () => {
  it("should call ref only once when the element is created.", () => {
    const { render, createStore } = createRoot();
    const ref = vi.fn();
    const state = createStore({ count: 0 });
    const App: Component = () => (
      <div>
        <div ref={ref} />
        <p>{state.count}</p>
      </div>
    );
    render(<App />);

    state.count++;
    flushRender();

    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
