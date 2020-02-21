import { wrap } from "./Settable";
import { isEquals } from "./Equals";

type Element = VNode | (() => VNode);

export function h(element: Component | string, attributes: any | null, ...children: Array<VNode | string>): Element {
  return typeof element === "string"
    ? { name: element, attributes, children }
    : () => element(attributes, children);
}

export function createStore<T>(initialValue: T): T {
  return store = wrap(initialValue) as unknown as T;
}

let store: any;
export function getStore<T>(): T {
  return store;
}

function renderElement(node: Element): RenderedVNode {
  if (typeof node === "function") node = node();
  return {...node, children: (node.children || []).map(it =>
    typeof it === "function" || typeof it === "object"
      ? renderElement(typeof it === "function" ? it() :it)
      : it)}
}

let old: HTMLElement = document.createElement("div");
document.body.appendChild(old);
let oldVNode: RenderedVNode;
function rerender(nodeElement: Element) {
  const renderedNode = renderElement(nodeElement);
  const el = createElement(renderedNode);
  document.body.replaceChild(el, old);
  old = el;
  oldVNode = renderedNode;
}

export function render(nodeElement: Element) {
  rerender(nodeElement);
  store.__on__(() => rerender(nodeElement));
}

type Component = (props: any, children: Array<VNode | string>) => VNode;

interface VNode {
  name: string;
  attributes: {[key: string]: any} | null;
  children: Array<Element | string | number | boolean>;
}

interface RenderedVNode extends VNode {
  children: Array<HTMLElementConvertable>;
}

type HTMLElementConvertable = RenderedVNode | string | number | boolean;

function expand(child: HTMLElementConvertable) {
  switch(typeof child) {
    case "object":
      return createElement(child);
    default:
      return child.toString();
  }
}

function createId(parentId: string, node: RenderedVNode) {
  return `${parentId}_${node.name}`;
}

const cache: { [key: string]: HTMLElement } = {};
function createElementCached(node: RenderedVNode): HTMLElement {
  const {name, attributes = {}, children} = node;
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
  (children || []).forEach((it, i) => {
    const renderable = typeof it === "object"
      ? createElementCached(it)
      : it.toString();
    el.append(renderable)
  });
  return el;
}

function createElement(node: RenderedVNode): HTMLElement {
  return createElementCached(node);
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
