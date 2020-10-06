import { Zheleznaya, Component, h } from "../index";

describe("Zheleznaya", () => {
  describe("#createVNode", () => {
    it("should create VNode", () => {
      const target = new Zheleznaya();
      const Inner: Component<{ name: string }> = ({ name }) => {
        return <div>{name}</div>
      }
      const App: Component = () => {
        return (
          <div>
            <Inner name="hoge" />
            <ul>
              <li>top</li>
              {["foo", "bar", "hoge"].map(it => <li>{it}</li>)}
            </ul>
            <div style={{ display: "flex" }} class="my-class">INNNER TEXT</div>
          </div>
        );
      }
      expect(target.createVNode(<App />)).toMatchSnapshot();
    });
  });

  describe("#createHTMLElement", () => {

    it("should create array node with all type node.", () => {
      const target = new Zheleznaya();
      expect(target.createHTMLElement({
        name: "",
        type: "array",
        attributes: {},
        children: [{
          name: "TEXT",
          type: "text",
          attributes: {},
          children: [],
        }, {
          name: "input",
          type: "html",
          attributes: {
            class: "my-class",
            onclick: () => console.log("clicked"),
            style: { display: "flex" },
            value: "INPUT VALUE"
          },
          children: [],
        }, {
          name: "",
          type: "array",
          attributes: {},
          children: [{
            name: "INNER TEXT",
            type: "text",
            attributes: {},
            children: [],
          }],
        }],
      })).toMatchSnapshot()
    });

  });
});
