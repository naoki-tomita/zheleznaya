import { wrap } from "./Settable";

type Element = VNode | (() => VNode);

export function h(element: Component | string, attributes: any | null, ...children: Array<VNode | string>): Element {
  return typeof element === "string"
    ? { name: element, attributes, children }
    : () => element(attributes, children);
}

let store: any;
export function getStore<T>(initialValue: T): T {
  if (store) {
    return store;
  }
  return store = wrap(initialValue);
}

function rerender(vNodes: () => VNode) {
  document.body.replaceChild(createElement(vNodes()), document.body.children.item(1)!);
}

export function render(vNodes: () => VNode) {
  document.body.appendChild(document.createElement("div"));
  rerender(vNodes);
  store.__on__(() => rerender(vNodes));
}

type Component = (props: any, children: Array<VNode | string>) => VNode;

interface VNode {
  name: string;
  attributes: {[key: string]: any} | null;
  children: Array<VNode | string>;
}

function expand(child: any) {
  switch(typeof child) {
    case "object":
      return createElement(child);
    case "function":
      return createElement(child());
    default:
      return child;
  }
}

function createElement({ name, attributes = {}, children }: VNode) {
  const el = Object.keys(attributes || {}).reduce((el, key) => {
    const attribute = attributes![key];
    if (key === "style") {
      Object.keys(attribute).forEach(key => el.style[key as any] = attribute[key])
    } else if (typeof attribute === "function") {
      el.addEventListener(key.replace("on", ""), attribute);
    } else if (typeof attribute === "boolean") {
      attribute === true && el.setAttribute(key, "");
    } else {
      el.setAttribute(key, attributes![key]);
    }
    return el;
  }, document.createElement(name));
  (children || []).forEach(it => el.append(expand(it)));
  return el;
}

interface AttributesOverwrite {
  children?: Array<VNode | string>;
  class?: string;
  style?: Partial<CSSStyleDeclaration> | string;
}

type Attributes<T extends HTMLElement> = {
  [U in keyof T]?: T[U];
} | AttributesOverwrite;

declare global {
  namespace JSX {
      interface IntrinsicElements {
        a: Attributes<HTMLAnchorElement>;
        button: Attributes<HTMLButtonElement>;
        br: Attributes<HTMLBRElement>;
        canvas: Attributes<HTMLCanvasElement>;
        div: Attributes<HTMLDivElement>;
        h1: Attributes<HTMLHeadElement>;
        h2: Attributes<HTMLHeadElement>;
        h3: Attributes<HTMLHeadElement>;
        h4: Attributes<HTMLHeadElement>;
        h5: Attributes<HTMLHeadElement>;
        h6: Attributes<HTMLHeadElement>;
        hr: Attributes<HTMLHRElement>;
        img: Attributes<HTMLImageElement>;
        input: Attributes<HTMLInputElement>;
        li: Attributes<HTMLLIElement>;
        p: Attributes<HTMLParagraphElement>;
        pre: Attributes<HTMLPreElement>;
        select: Attributes<HTMLSelectElement>;
        span: Attributes<HTMLSpanElement>;
        ul: Attributes<HTMLUListElement>;
      }
  }
}
