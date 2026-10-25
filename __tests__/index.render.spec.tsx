import { describe, it, expect, vi, beforeEach } from "vitest";
import { h, createRoot } from "../src/index.ts";
import type { Component } from "../src/types.ts";

function sleep(ms: number) {
  return new Promise(ok => setTimeout(ok, ms));
}

describe("#render", () => {

  beforeEach(() => {
    document.body.innerHTML = "";
  });

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

    it("should render children that has array children", () => {
      const { render } = createRoot();
      const ChildrenWrapper: Component = (_, children) => {
        return (
          <div>
            <div>
              sample
            </div>
            <div>
              {children}
            </div>
          </div>
        );
      }
      const App: Component = () => {
        return (
          <div>
            <ChildrenWrapper>
              <ul>
                {["a", "b", "c"].map(k => <li>{k}</li>)}
              </ul>
            </ChildrenWrapper>
          </div>
        );
      }
      render(<App />);
      expect(document.body).toMatchSnapshot();
    });

    it("should render children that has array children when state has updated.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ count: 0 });
      const ChildrenWrapper: Component = (_, children) => {
        return (
          <div>
            {children}
          </div>
        );
      }

      const App: Component = () => {
        return (
          <div>
            <ChildrenWrapper>
              <ul>
                {["a", "b", "c"].map(k => <li>{k}</li>)}
              </ul>
            </ChildrenWrapper>
          </div>
        );
      }
      render(<App />);
      const li1 = document.body.querySelector("div > div > ul > li");

      state.count++;
      await sleep(1);

      expect(document.body.querySelector("div > div > ul > li")).toBe(li1);
    });
  });

  describe("#update", () => {
    it("should render children that has updated state.", async () => {
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
      await sleep(1);

      const newInput = document.body.querySelector("input")!;
      expect(newInput.value).toBe("1");
    });
  })
});
