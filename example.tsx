import { h, createRoot } from "./src/index.ts";
import type { Component } from "./src/types.ts";

const { render, createStore } = createRoot();
const state = createStore({ items: ["a", "b", "c"], text: "x" });
      const App: Component = () => (
        <div id="mixed">
          {state.items.map((it) => <span>{it}</span>)}
          {state.text}
        </div>
      );
render(<App />);

globalThis.state = state;
