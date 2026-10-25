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

  describe.only("#update", () => {
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

  describe("#unmount", () => {
    it("should remove the last item and keep the previous node.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b", "c"] });

      const App: Component = () => {
        return (
          <ul>
            {state.items.map((k) => (
              <li>{k}</li>
            ))}
          </ul>
        );
      };
      render(<App />);

      const items = [...document.body.querySelectorAll("li")];
      expect(items.map((el) => el.textContent)).toEqual(["a", "b", "c"]);

      state.items.pop();
      await sleep(1);

      const next = [...document.body.querySelectorAll("li")];
      expect(next.map((el) => el.textContent)).toEqual(["a", "b"]);
      expect(next[0]).toBe(items[0]);
      expect(next[1]).toBe(items[1]);
    });

    it("should remove a middle element and keep the following sibling.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ show: true });

      const App: Component = () => {
        return (
          <div>
            <span>before</span>
            {state.show ? <span>target</span> : []}
            <span>after</span>
          </div>
        );
      };
      render(<App />);

      const spans = [...document.body.querySelectorAll("span")];
      expect(spans.map((el) => el.textContent)).toEqual([
        "before",
        "target",
        "after",
      ]);

      state.show = false;
      await sleep(1);

      const next = [...document.body.querySelectorAll("span")];
      expect(next.map((el) => el.textContent)).toEqual(["before", "after"]);
      expect(next[0]).toBe(spans[0]);
      expect(next[1]).toBe(spans[2]);
    });

    it("should remove an array item between static elements.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b", "c"] });

      const App: Component = () => {
        return (
          <div>
            <span>before</span>
            {state.items.map((k) => (
              <span>{k}</span>
            ))}
            <span>after</span>
          </div>
        );
      };
      render(<App />);

      const spans = [...document.body.querySelectorAll("span")];
      expect(spans.map((el) => el.textContent)).toEqual([
        "before",
        "a",
        "b",
        "c",
        "after",
      ]);

      state.items.pop();
      await sleep(1);

      const next = [...document.body.querySelectorAll("span")];
      expect(next.map((el) => el.textContent)).toEqual([
        "before",
        "a",
        "b",
        "after",
      ]);
      expect(next[0]).toBe(spans[0]);
      expect(next[1]).toBe(spans[1]);
      expect(next[2]).toBe(spans[2]);
      expect(next[3]).toBe(spans[4]);
    });
  });

  describe("#replace", () => {
    it("should replace an element when the tag changes and keep siblings.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ bold: false });

      const App: Component = () => {
        return (
          <div>
            <span>before</span>
            {state.bold ? <strong>target</strong> : <span>target</span>}
            <span>after</span>
          </div>
        );
      };
      render(<App />);

      const spans = [...document.body.querySelectorAll("span")];
      expect(spans.map((el) => el.textContent)).toEqual([
        "before",
        "target",
        "after",
      ]);

      state.bold = true;
      await sleep(1);

      const next = [...spans[0].parentElement!.childNodes];
      expect(next.map((el) => el.textContent)).toEqual([
        "before",
        "target",
        "after",
      ]);
      expect(next[0]).toBe(spans[0]);
      expect(next[1]).not.toBe(spans[1]);
      expect((next[1] as HTMLElement).tagName).toBe("STRONG");
      expect(next[2]).toBe(spans[2]);
    });

    it("should replace an element with a text node and keep siblings.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ text: false });

      const App: Component = () => {
        return (
          <div>
            <span>before</span>
            {state.text ? "plain" : <span>target</span>}
            <span>after</span>
          </div>
        );
      };
      render(<App />);

      const spans = [...document.body.querySelectorAll("span")];
      expect(spans.map((el) => el.textContent)).toEqual([
        "before",
        "target",
        "after",
      ]);

      state.text = true;
      await sleep(1);

      const next = [...spans[0].parentElement!.childNodes];
      expect(next.map((el) => el.textContent)).toEqual([
        "before",
        "plain",
        "after",
      ]);
      expect(next[0]).toBe(spans[0]);
      expect(next[1].nodeType).toBe(Node.TEXT_NODE);
      expect(next[2]).toBe(spans[2]);
    });

    it("should replace an array item between static elements.", async () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b", "c"], replaced: "" });

      const App: Component = () => {
        return (
          <div>
            <span>before</span>
            {state.items.map((k) =>
              state.replaced === k ? <b>{k}</b> : <span>{k}</span>,
            )}
            <span>after</span>
          </div>
        );
      };
      render(<App />);

      const spans = [...document.body.querySelectorAll("span")];
      expect(spans.map((el) => el.textContent)).toEqual([
        "before",
        "a",
        "b",
        "c",
        "after",
      ]);

      state.replaced = "b";
      await sleep(1);

      const next = [...spans[0].parentElement!.childNodes];
      expect(next.map((el) => el.textContent)).toEqual([
        "before",
        "a",
        "b",
        "c",
        "after",
      ]);
      expect(next[0]).toBe(spans[0]);
      expect(next[1]).toBe(spans[1]);
      expect(next[2]).not.toBe(spans[2]);
      expect((next[2] as HTMLElement).tagName).toBe("B");
      expect(next[3]).toBe(spans[3]);
      expect(next[4]).toBe(spans[4]);
    });
  });
});
