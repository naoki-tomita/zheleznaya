import { h, render } from "zheleznaya";

const MyComponent = (props: { key: string }) => {
  return (
    <div>{props.key}</div>
  );
}

const App = () => {
  return (
    <div class="my-class">
      <input checked/>
      <div onclick={(e) => console.log(e)} >fuga</div>
      <div>poyo</div>
      <MyComponent key="hello" />
    </div>
  );
}

render(App);
