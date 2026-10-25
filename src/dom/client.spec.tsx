import { describe, it, expect, vi } from "vitest";
import { h, createRoot } from "../index.ts";
import type { Component } from "../types.ts";
import { flushRender, setupDom } from "./test-helpers.ts";

describe("#render", () => {
  setupDom();

  describe("#mount", () => {
    it("should rendering dom.", () => {
      const { render } = createRoot();
      const someString = "someString";
      const Inner: Component = (props: { name: string }, children) => {
        return (
          <div>
            <div>
              child component {props.name}
            </div>
            {children}
            <div>
              child component end
            </div>
          </div>
        );
      }
      const App = () => {
        const list = ["foo", "bar", "hoge"]
        return (
          <div id="root">
            <h1>Hello world</h1>
            <h2 style={{ display: "flex", justifyContent: "center" }}>Style</h2>
            <h3 class="test-foo">className</h3>
            <h4>{someString}</h4>
            <div ref={el => el.innerHTML = "<span>ref innerHTML</span>"} />
            <Inner name="props.name" >Hello <div>world</div></Inner>
            <Inner name="array children">
              <ul>
                {list.map(key => <li>{key}</li>)}
              </ul>
            </Inner>
          </div>
        );
      }
      render(<App />)
      expect(document.body).toMatchSnapshot()
    });

    it("should render into the given root element.", () => {
      const rootElement = document.createElement("main");
      document.body.appendChild(rootElement);
      const { render } = createRoot(rootElement);

      render(<p>hello</p>);

      expect(rootElement.innerHTML).toBe("<p>hello</p>");
    });

    it("should call callback when button clicked.", () => {
      const { render } = createRoot();
      const spy = vi.fn();
      const App = () => {
        return <button onclick={spy} >click me!</button>
      }
      render(<App />);
      const button = document.body.querySelector("button")!;
      button.click();
      expect(spy).toHaveBeenCalled();
    });

    // https://github.com/naoki-tomita/zheleznaya/issues/20 (#3)
    it.fails("should create svg children in the svg namespace.", () => {
      const { render } = createRoot();
      // path や SVG の属性は JSX の型にないので h を直接使う。
      render(
        h(
          "svg",
          { width: "10", height: "10" },
          h("path", { id: "path", d: "M0 0 L10 10" }),
        ),
      );

      expect(document.querySelector("svg")!.namespaceURI).toBe(
        "http://www.w3.org/2000/svg",
      );
      expect(document.getElementById("path")!.namespaceURI).toBe(
        "http://www.w3.org/2000/svg",
      );
    });
  });

  describe("#update", () => {
    it("should not rerender when the vnode tree is unchanged.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ count: 0, unused: 0 });
      const App: Component = () => <p>{state.count}</p>;
      render(<App />);
      const p = document.querySelector("p")!;

      state.unused++;
      flushRender();

      expect(document.querySelector("p")).toBe(p);
    });

    // 一番外側の要素 (path が []) への patch が、rootElement (コンテナ) の方に当たっている。
    // find が path [] のときだけ root そのものを返すため。
    it.fails("should update attributes of the top-level element.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ name: "a" });
      const App: Component = () => <ul class={state.name} />;
      render(<App />);

      state.name = "b";
      flushRender();

      expect(document.querySelector("ul")!.getAttribute("class")).toBe("b");
      expect(document.querySelector("[data-z=root]")!.hasAttribute("class")).toBe(false);
    });

    it.fails("should append children into the top-level element.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a"] });
      const App: Component = () => (
        <ul>{state.items.map((k) => <li>{k}</li>)}</ul>
      );
      render(<App />);

      state.items.push("b");
      flushRender();

      expect(document.querySelector("[data-z=root]")!.innerHTML).toBe(
        "<ul><li>a</li><li>b</li></ul>",
      );
    });

    it("should update a text node when state has updated.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ count: 0 });
      const App: Component = () => <p>{state.count}</p>;
      render(<App />);
      const p = document.querySelector("p")!;

      state.count++;
      flushRender();

      expect(document.querySelector("p")).toBe(p);
      expect(p.textContent).toBe("1");
    });
  });
});

describe("#createStore", () => {
  it("should rerender when store changed.", () => {
    const { createStore } = createRoot();
    const store = createStore({ count: 0 });
    expect(store).toMatchSnapshot();
  });

  it("should return the created store from getStore.", () => {
    const { createStore, getStore } = createRoot();
    const store = createStore({ count: 0 });
    expect(getStore()).toBe(store);
  });
});
