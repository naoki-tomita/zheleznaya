import { h, render, createStore, Component } from "../index";

// function sleep(ms: number) {
//   return new Promise(ok => setTimeout(ok, ms));
// }

describe("#createStore", () => {
  it("should rerender when store changed.", async () => {
    const store = createStore({ count: 0 });
    const App: Component = () => {
      return (
        <div>{store.count}</div>
      );
    }
    render(<App />);
    expect(document.body).toMatchSnapshot();

    store.count = 2;
    expect(document.body).toMatchSnapshot();
  });
});
