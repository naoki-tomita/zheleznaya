import { h, render, state } from "zheleznaya";

function main() {
  function setCount(count: number) {
    state.setState("count", count);
  }
  function getCount(): number {
    return state.getState("count") ?? 0;
  }
  function incrementCount() {
    setCount(getCount() + 1);
  }

  render(
    <div className="foo bar">
      <ul style={{ color: "blue", display: "flex", listStyle: "none", margin: "0", padding: "0" }}>
        <li style={{ display: "block" }} id="foo">a</li>
        <li style={{ display: "block" }} id="bar">b</li>
        <li style={{ display: "block" }} id="hoge">c</li>
      </ul>
      <span>hoge</span>:<span>{getCount()}</span>
      <button onclick={incrementCount}>click</button>
    </div>
  );
}


main();
