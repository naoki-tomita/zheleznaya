import { h, render, createStore, Component } from "../index";

describe("#createStore", () => {
  it("should rerender when store changed.", () => {
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
