import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { h, createRoot } from "../index.ts";
import type { Component } from "../types.ts";
import { childNodesOf, flushRender, setupDom } from "./test-helpers.ts";

setupDom();

describe("array children", () => {
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

  it("should reuse array children when unrelated state has updated.", () => {
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
          <p>{state.count}</p>
        </div>
      );
    }
    render(<App />);
    const li1 = document.body.querySelector("div > div > ul > li");

    state.count++;
    flushRender();

    expect(document.body.querySelector("div > div > ul > li")).toBe(li1);
  });

  it("should append an item when it is the only child.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ items: ["a", "b", "c"] });
    const App: Component = () => (
      <div>
        <ul>{state.items.map((k) => <li>{k}</li>)}</ul>
      </div>
    );
    render(<App />);

    state.items.push("d");
    flushRender();

    expect(document.querySelector("ul")!.textContent).toBe("abcd");
  });

  describe("followed by sibling nodes", () => {
    // https://github.com/naoki-tomita/zheleznaya/issues/20 (#2)
    // 配列は DOM 上では複数のノードに展開されるが、diff は vnode の子の番号をそのまま DOM の番号として使っている。
    const setup = () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b", "c"], text: "x" });
      const App: Component = () => (
        <div id="mixed">
          {state.items.map((it) => <span>{it}</span>)}
          <em>{state.text}</em>
        </div>
      );
      render(<App />);
      return state;
    };

    it.fails("should append an item before the following sibling.", () => {
      const state = setup();

      state.items.push("d");
      flushRender();

      expect(document.getElementById("mixed")!.innerHTML).toBe(
        "<span>a</span><span>b</span><span>c</span><span>d</span><em>x</em>",
      );
    });

    it.fails("should keep the following sibling when items are replaced after push.", () => {
      const state = setup();

      state.items.push("d");
      flushRender();
      state.items = ["a", "c", "d"];
      flushRender();

      expect(document.getElementById("mixed")!.innerHTML).toBe(
        "<span>a</span><span>c</span><span>d</span><em>x</em>",
      );
    });

    it.fails("should update the following sibling after items are replaced.", () => {
      const state = setup();

      state.items.push("d");
      flushRender();
      state.items = ["a", "c", "d"];
      flushRender();
      state.text = "y";
      flushRender();

      expect(document.getElementById("mixed")!.innerHTML).toBe(
        "<span>a</span><span>c</span><span>d</span><em>y</em>",
      );
    });

    it.fails("should update a following text node together with items.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b", "c"], text: "x" });
      const App: Component = () => (
        <div id="mixed">
          {state.items.map((it) => <span>{it}</span>)}
          {state.text}
        </div>
      );
      render(<App />);

      state.items.pop();
      state.text = "y";
      flushRender();

      expect(document.getElementById("mixed")!.textContent).toBe("aby");
    });
  });

  describe("removing several items at once", () => {
    // https://github.com/naoki-tomita/zheleznaya/issues/20#issuecomment-6397073919 (A)
    // diff は unmount の操作を計算した時点の番号のまま並べ、patch は先頭から順に適用する。
    // 1 つ消すと後ろの番号がずれ、次の unmount が存在しない番号を指して null.remove() になる。
    it.fails("should remove two trailing items.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b", "c"] });
      const App: Component = () => (
        <div>
          <ul>{state.items.map((k) => <li>{k}</li>)}</ul>
        </div>
      );
      render(<App />);

      state.items = ["a"];
      flushRender();

      expect(document.querySelector("ul")!.innerHTML).toBe("<li>a</li>");
    });

    it.fails("should remove a middle component whose children differ from the next one.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["A", "B", "X", "Y", "Z"] });
      const Item: Component<{ n: string }> = ({ n }) => (
        <section>
          <h2>{n}</h2>
          {n === "X" ? [<p>1</p>, <p>2</p>] : []}
        </section>
      );
      const App: Component = () => (
        <div>
          <main>
            {[...state.items.map((n) => <Item n={n} />), <aside>add</aside>]}
          </main>
        </div>
      );
      render(<App />);

      state.items = ["A", "B", "Y", "Z"];
      flushRender();

      expect(
        [...document.querySelector("main")!.children].map((it) => it.textContent),
      ).toEqual(["A", "B", "Y", "Z", "add"]);
    });
  });

  describe("key", () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
      warn.mockRestore();
    });

    // https://github.com/naoki-tomita/zheleznaya/issues/20#issuecomment-6396955230 (その他)
    // key の処理が `&& false` で無効になっていて、key を付けても警告を止められない。
    it.fails("should not warn when every array item has a key.", () => {
      const { render, createStore } = createRoot();
      const state = createStore({ items: ["a", "b"], count: 0 });
      const App: Component = () => (
        <div>
          <ul>{state.items.map((k) => h("li", { key: k }, k))}</ul>
          <p>{state.count}</p>
        </div>
      );
      render(<App />);

      state.count++;
      flushRender();

      expect(warn).not.toHaveBeenCalled();
    });
  });
});

describe("conditional children", () => {
  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#6)
  it.fails("should render nothing for false.", () => {
    const { render } = createRoot();
    const show = false;
    render(<p id="cond">{show && <b>shown</b>}</p>);

    expect(document.getElementById("cond")!.textContent).toBe("");
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#6)
  it.fails("should render nothing for true.", () => {
    const { render } = createRoot();
    render(<p id="cond">{true}</p>);

    expect(document.getElementById("cond")!.textContent).toBe("");
  });

  it("should render nothing for null and undefined.", () => {
    const { render } = createRoot();
    render(
      <p id="cond">
        {null}
        {undefined}
      </p>,
    );

    expect(document.getElementById("cond")!.textContent).toBe("");
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#4, #5)
  it("should remove elements that switched to empty strings.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ n: 3 });
    const App: Component = () => (
      <div id="shrink">
        {state.n >= 1 ? <i>1</i> : ""}
        {state.n >= 2 ? <i>2</i> : ""}
        {state.n >= 3 ? <i>3</i> : ""}
      </div>
    );
    render(<App />);

    state.n = 1;
    flushRender();

    expect(document.getElementById("shrink")!.innerHTML).toBe("<i>1</i>");
  });
});

describe("#unmount", () => {
  it("should remove the last item and keep the previous node.", () => {
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
    flushRender();

    const next = [...document.body.querySelectorAll("li")];
    expect(next.map((el) => el.textContent)).toEqual(["a", "b"]);
    expect(next[0]).toBe(items[0]);
    expect(next[1]).toBe(items[1]);
  });

  it("should remove a middle element and keep the following sibling.", () => {
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
    flushRender();

    const next = [...document.body.querySelectorAll("span")];
    expect(next.map((el) => el.textContent)).toEqual(["before", "after"]);
    expect(next[0]).toBe(spans[0]);
    expect(next[1]).toBe(spans[2]);
  });

  it("should remove an array item between static elements.", () => {
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
    flushRender();

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
  it("should replace an element when the tag changes and keep siblings.", () => {
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
    flushRender();

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

  // https://github.com/naoki-tomita/zheleznaya/issues/20#issuecomment-6397073919 (B)
  // (直った) replace のあとも子の差分を計算し続け、作り直した要素に古い差分を当てていた。
  it("should replace an element whose tag and children both change.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ main: false });

    const App: Component = () => (
      <div id="parent">
        {state.main ? (
          <main>
            <p>a</p>
          </main>
        ) : (
          <div>
            <p>a</p>
            <p>b</p>
          </div>
        )}
      </div>
    );
    render(<App />);

    state.main = true;
    flushRender();

    expect(document.getElementById("parent")!.innerHTML).toBe(
      "<main><p>a</p></main>",
    );
  });

  it("should replace an element with a text node and keep siblings.", () => {
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
    flushRender();

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

  it("should replace an array item between static elements.", () => {
    const { render, createStore } = createRoot();
    const state = createStore({ items: ["a", "b", "c"], replaced: "" });

    const App: Component = () => {
      return (
        <div id="parent">
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
    flushRender();

    const next = childNodesOf("#parent");
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
