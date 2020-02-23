import { wrap } from "./Settable";

type Component = (props: any, children: Array<VNode | string>) => VNode;
type Element = VNode | (() => VNode);
interface VNode {
  name: string;
  type: "text" | "html"
  attributes: {[key: string]: any} | null;
  children: Array<Element | string | number | boolean>;
}

interface RenderedVNode extends VNode {
  children: Array<RenderedVNode>;
}

export function h(element: Component | string, attributes: any | null, ...children: Array<VNode | string>): Element {
  return typeof element === "string" ? { name: element, attributes, children, type: "html" } : () => element(attributes, children);
}

let store: any;
export function createStore<T>(initialValue: T): T {
  return store = wrap(initialValue) as unknown as T;
}

export function getStore<T>(): T {
  return store;
}

function renderElement(node: Element): RenderedVNode {
  if (typeof node === "function") node = node();
  return {...node, children: (node.children || []).map(it =>
    typeof it === "function" || typeof it === "object"
      ? renderElement(typeof it === "function" ? it() :it)
      : { name: it.toString(), attributes: {}, children: [], type: "text" })};
}

let root: HTMLElement;
export function render(nodeElement: Element) {
  document.body.appendChild(root = document.createElement("div"));
  rerender(nodeElement);
  store.__on__(() => rerender(nodeElement));
}

function rerender(nodeElement: Element) {
  const renderedNode = renderElement(nodeElement);
  const el = createElement(renderedNode);
  document.body.replaceChild(el, root);
  root = el;
}

function createElement(node: RenderedVNode): HTMLElement {
  const {name, attributes = {}, children} = node;
  const el = Object.keys(attributes || {}).reduce((el, key) => {
    const attribute = attributes![key];
    if (key === "style") Object.keys(attribute).forEach(key => el.style[key as any] = attribute[key])
    else if (typeof attribute === "function") (el as any)[key] = attribute;
    else if (typeof attribute === "boolean") attribute === true && el.setAttribute(key, "");
    else el.setAttribute(key, attributes![key])
    return el;
  }, document.createElement(name));
  (children || []).forEach(it => el.append(it.type === "text" ? it.name : createElement(it)));
  return el;
}

type Attributes<T extends HTMLElement> = {
  [U in keyof T]?: T[U];
} | AttributesOverwrite;

interface AttributesOverwrite {
  children?: Array<VNode | string>;
  class?: string;
  style?: Partial<CSSStyleDeclaration> | string;
}

declare global {
  namespace JSX {
      interface IntrinsicElements {
        a:      Attributes<HTMLAnchorElement>;
        button: Attributes<HTMLButtonElement>;
        br:     Attributes<HTMLBRElement>;
        canvas: Attributes<HTMLCanvasElement>;
        div:    Attributes<HTMLDivElement>;
        h1:     Attributes<HTMLHeadElement>;
        h2:     Attributes<HTMLHeadElement>;
        h3:     Attributes<HTMLHeadElement>;
        h4:     Attributes<HTMLHeadElement>;
        h5:     Attributes<HTMLHeadElement>;
        h6:     Attributes<HTMLHeadElement>;
        hr:     Attributes<HTMLHRElement>;
        img:    Attributes<HTMLImageElement>;
        input:  Attributes<HTMLInputElement>;
        li:     Attributes<HTMLLIElement>;
        p:      Attributes<HTMLParagraphElement>;
        pre:    Attributes<HTMLPreElement>;
        select: Attributes<HTMLSelectElement>;
        span:   Attributes<HTMLSpanElement>;
        ul:     Attributes<HTMLUListElement>;
      }
  }
}
