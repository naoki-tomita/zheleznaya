import { Component, h } from "zheleznaya";
import { Link } from "../Router";

export const Content: Component = (_, children) => {
  return <main><article>{children}</article></main>;
}
