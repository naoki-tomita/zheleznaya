import { h, Component } from "zheleznaya";
import { store } from "../Store";
import { Content } from "./Content";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Html } from "./Html";

export const App: Component = () => {
  return (
    <div>
      <Header />
      <Content>
        <Html html={store.html} />
      </Content>
      <Footer />
    </div>
  );
}
