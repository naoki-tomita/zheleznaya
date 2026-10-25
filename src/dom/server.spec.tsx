import { describe, it, expect } from "vitest";
import { h } from "../index.ts";
import { renderToText } from "./server.ts";
import type { Component } from "../types.ts";

describe("renderToText", () => {
  it("should rendered string match to snapshots.", () => {
    const someString = "someString";
    const Inner: Component = (props: { name: string }, children) => {
      return (
        <div>
          child component {props.name}
          <div>{children}</div>
        </div>
      );
    }
    const App = () => {
      return (
        <div id="root">
          <h1>Hello world</h1>
          <h2 style={{ display: "flex", justifyContent: "center" }}>Style</h2>
          <h3 class="test-foo">className</h3>
          <h4>{someString}</h4>
          <div ref={el => el.innerHTML = "<span>ref innerHTML</span>"} />
          <Inner name="props.name" >Hello <div>world</div></Inner>
        </div>
      );
    }

    expect(renderToText(<App />)).toMatchSnapshot();
  });

  // https://github.com/naoki-tomita/zheleznaya/issues/20 (#6)
  it.fails("should render nothing for booleans.", () => {
    const show = false;
    expect(renderToText(<p>{show && <b>shown</b>}{true}</p>)).toBe("<p ></p>");
  });
});
