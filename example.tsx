import { h, createStore, render, Component } from "./index";

const store = createStore({
  foo: "bar",
  bar: {
    bar: "foo",
    foo: {
      foo: "bar"
    }
  },
  check: false,
  count: 3,
  countDouble: 3,
});

const MyInput = (props: { value: string, oninput: (text: string) => void }, _: Component[]) => {
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

const MyWrapper: Component = (_, children) => {
  return (
    <div>
      <div>children↓</div>
      {children}
      <div>children↑</div>
    </div>
  );
}
const InnerChild = () => {
  return <div>child</div>;
}

const Inner = () => {
  return <InnerChild/>
}

const App = () => {
  console.log("render");
  const check = store.check ? "checked" : undefined;
  return (
    <div class="my-class">
      <div><input oninput={e => store.foo = (e as any).target.value} value={store.foo} /></div>
      <div>{store.foo}</div>
      <div><input onchange={() => store.check = !store.check} type="checkbox" checked={store.check}/></div>
      <div>{check && check.toUpperCase()}</div>
      <div><button onclick={() => (store.count++, store.countDouble *= store.count)} >+1</button></div><div><button onclick={() => (store.count--, store.countDouble /= store.count)} >-1</button></div>
      <div style={{ backgroundColor: "black", color: "white" }} >{store.count}</div>
      <div style={{ backgroundColor: "purple", color: "white" }} >{store.countDouble}</div>
      <Inner></Inner>
      <MyComponent key="hello" />
      <MyWrapper>
        <ul>
          {range(store.count).map((_, i) => i).map(it => <li><div>{it}</div></li>)}
        </ul>
      </MyWrapper>
      <ul>
        {range(store.count).map((_, i) => i).map(it => <li><div>{it}</div></li>)}
      </ul>
      <div>aaaaa</div>
    </div>
  );
}

function range(size: number) {
  return Array(size).fill(null);
}

render(<App />);
