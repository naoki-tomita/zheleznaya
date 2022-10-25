import { h, render, Component } from "../index";
describe("#render", () => {
  it("should rendering dom.", () => {
    const someString = "someString";
    const Inner: Component = (props: { name: string }, children) => {
      return (
        <div>
          <div>
            child component {props.name}
          </div>
          {children}
          <div>
            child component end
          </div>
        </div>
      );
    }
    const App = () => {
      const list = ["foo", "bar", "hoge"]
      return (
        <div id="root">
          <h1>Hello world</h1>
          <h2 style={{ display: "flex", justifyContent: "center" }}>Style</h2>
          <h3 class="test-foo">className</h3>
          <h4>{someString}</h4>
          <div ref={el => el.innerHTML = "<span>ref innerHTML</span>"} />
          <Inner name="props.name" >Hello <div>world</div></Inner>
          <Inner name="array children">
            <ul>
              {list.map(key => <li>{key}</li>)}
            </ul>
          </Inner>
        </div>
      );
    }
    render(<App />)
    expect(document.body).toMatchSnapshot()
  });

  it("should call callback when button clicked.", () => {
    const spy = jest.fn();
    const App = () => {
      return <button onclick={spy} >click me!</button>
    }
    render(<App />);
    const button = document.body.querySelector("button")!;
    button.click();
    expect(spy).toBeCalled();
  });
});
