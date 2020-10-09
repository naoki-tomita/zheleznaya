## what is zheleznaya?

Zheleznaya is React like framework.

Built by extremely simple and minute code.

You can write app by ultra simple code.

This documentation written by `zheleznaya`.

```tsx
import { h, render, createStore, Component } from "zheleznaya";

const store = createStore<{ name: string }>({ text: "" });

const Greet: Component<{ name: string }> = ({ name }) => {
  return (
    <h1>Hello {name}!</h1>
  );
}

const App: Component = () => {
  return (
    <div>
      <input onChange={el => (store.text = el.target.value)} />
      <Greet name={store.text} />
    </div>
  );
}

render(<App />);
```

> Zheleznaya is not production yet.

#### [next ->](#installation)
