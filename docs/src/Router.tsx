import { h, Component } from "zheleznaya";

type RouteCallback = (route: string) => void;
const cbs: RouteCallback[] = [];
export function onRouteChange(cb: RouteCallback) {
  cbs.push(cb);
  cb(location.hash.replace("#", ""));
}

function emit() {
  cbs.forEach(it => it(location.hash.replace("#", "")));
}

window.addEventListener("hashchange", _ => emit());

export const Link: Component = ({ href }: { href: string }, children) => {
  return (
    <a style={{ color: "inherit", textDecoration: "none" }} href={`#${href}`}>
      {children}
    </a>
  );
}
