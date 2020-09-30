import { Component, h } from "zheleznaya";
import { Link } from "../Router";

export const Header: Component = () => {
  return (
    <header>
      <h1><Link href="/">Zheleznaya</Link></h1>
      <small><code><a href="https://github.com/naoki-tomita/zheleznaya">Github</a></code></small>
    </header>
  );
}
