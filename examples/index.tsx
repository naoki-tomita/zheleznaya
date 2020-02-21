import { h, createStore, render } from "zheleznaya";

const store = createStore({
  foo: "bar",
  bar: {
    bar: "foo"
  },
  check: false,
  count: 0,
});
const MyComponent = (props: { key: string }) => {
  return (
    <div>{props.key}</div>
  );
}

const App = () => {
  return (
    <div class="my-class">
      <div><input oninput={e => store.foo = (e as any).target.value} value={store.foo} /></div>
      <div><input onchange={() => store.check = !store.check} type="checkbox" checked={store.check}/></div>
      <div><button onclick={() => store.count++} >+1</button></div>
      <div style={{ backgroundColor: "black", color: "white" }} >{store.count}</div>
      <MyComponent key="hello" />
    </div>
  );
}

render(<App />);
