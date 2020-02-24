import { h, createStore, render, Component } from "zheleznaya";

const store = createStore({
  foo: "bar",
  bar: {
    bar: "foo",
    foo: {
      foo: "bar"
    }
  },
  check: false,
  count: 0,
});
const MyInput = (props: { value: string, oninput: (text: string) => void }, children: Component[]) => {
  return (
    <div>
      {props.value}
      <input value={props.value} oninput={e => (e && props.oninput((e.target as any).value))} />
    </div>
  );
}

const MyComponent = (props: { key: string }) => {
  return (
    <div>
      <div>{props.key}</div>
      <MyInput value={store.bar.foo.foo} oninput={t => store.bar.foo.foo = t}/>
    </div>
  );
}

const App = () => {
  return (
    <div class="my-class">
      <div><input oninput={e => store.foo = (e as any).target.value} value={store.foo} /></div>
      <div>{store.foo}</div>
      <div><input onchange={() => store.check = !store.check} type="checkbox" checked={store.check}/></div>
      <div><button onclick={() => store.count++} >+1</button></div>
      <div style={{ backgroundColor: "black", color: "white" }} >{store.count}</div>
      <MyComponent key="hello" />
    </div>
  );
}

render(<App />);
