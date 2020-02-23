import { wrap } from "./Settable";
import { isEquals } from "./Equals";

type Component = (props: any, children: Array<VNode | string>) => VNode;
type Element = VNode | (() => VNode);
interface VNode {
  name: string;
  type: "text" | "html";
  attributes: { [key: string]: any } | null;
  children: Array<Element | string | number | boolean>;
}

interface RenderedVNode extends VNode {
  children: Array<RenderedVNode>;
}

type RenderedVNodeWithHTMLElement = RenderedVNodeWithHTMLElementText | RenderedVNodeWithHTMLElementNode;

interface RenderedVNodeWithHTMLElementText extends RenderedVNode {
  type: "text";
  children: Array<RenderedVNodeWithHTMLElement>;
  element: string;
}

interface RenderedVNodeWithHTMLElementNode extends RenderedVNode {
  type: "html";
  children: Array<RenderedVNodeWithHTMLElement>;
  element: HTMLElement;
}

export function h(
  name: Component | string,
  attributes: any | null,
  ...children: Array<VNode | string>
): Element {
  return typeof name === "string"
    ? { name, attributes, children, type: "html" }
    : () => name(attributes, children);
}

let store: any;
export function createStore<T>(initialValue: T): T {
  return (store = (wrap(initialValue) as unknown) as T);
}

export function getStore<T>(): T {
  return store;
}

function renderElement(node: Element): RenderedVNode {
  if (typeof node === "function") node = node();
  return {
    ...node,
    children: (node.children || []).map(it =>
      typeof it === "function" || typeof it === "object"
        ? renderElement(typeof it === "function" ? it() : it)
        : { name: it.toString(), attributes: {}, children: [], type: "text" }
    )
  };
}

let root: HTMLElement;
export function render(nodeElement: Element) {
  rerender(nodeElement);
  store.__on__(() => rerender(nodeElement));
}

let oldNode: RenderedVNode;
function _rerender(nodeElement: Element) {
  const renderedNode = renderElement(nodeElement);
  const el = _createElement(renderedNode);
  oldNode = renderedNode;
  document.body.replaceChild(el, root);
  root = el;
}

function removeChildren(node: HTMLElement) {
  while (node.hasChildNodes()) node.removeChild(node.firstChild!);
}

let _oldNode: RenderedVNodeWithHTMLElement;
function rerender(nodeElement: Element) {
  const renderedNode = renderElement(nodeElement);
  const completedVNode = createRootElement(renderedNode);
  _oldNode = completedVNode;
  if (!root) {
    document.body.appendChild(root = completedVNode.element as HTMLElement);
  }
}

function createElement(node: RenderedVNode, oldNode: RenderedVNodeWithHTMLElement | null, oldElement?: HTMLElement): RenderedVNodeWithHTMLElement {
  if (node.type === "text") {
    return {name: node.name, attributes: {}, children: [], type: "text", element: node.name}
  }
  // element
  let element: HTMLElement;
  if (isEquals(node.name, oldNode?.name) && oldElement != null) element = oldElement;
  else element = document.createElement(node.name);

  // attributes
  const { attributes } = node;
  Object.keys(attributes || {}).forEach(key => {
    const attribute = attributes![key];
    if (key === "style") {
      Object.keys(attribute).forEach(key => (element.style as any)[key] = attribute[key]);
    } else if (key.startsWith("on")) {
      (element as any)[key] = attribute;
    } else if (typeof attribute === "boolean") {
      attribute ? element.setAttribute(key, "") : element.removeAttribute(key);
    } else {
      element.setAttribute(key, attribute);
    }
  });

  // children
  // removeChildren(element);
  const children: RenderedVNodeWithHTMLElement[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const oldChild = oldNode?.children[i] || null;
    const childVNode = createElement(child, oldChild, element.childNodes[i] as HTMLElement | undefined);
    if (!oldElement) element.append(childVNode.element);
    else if (oldChild?.type === "text" && !isEquals(childVNode.element, oldChild.element)) (element.childNodes[i] as Text).data = childVNode.element as string;
    children.push(childVNode);
  }
  return {...node, type: "html", element, children};
}

function createRootElement(node: RenderedVNode): RenderedVNodeWithHTMLElement {
  return createElement(node, _oldNode, root);
}

function _createElement(node: RenderedVNode): HTMLElement {
  const { name, attributes = {}, children } = node;
  const el = Object.keys(attributes || {}).reduce((el, key) => {
    const attribute = attributes![key];
    if (key === "style")
      Object.keys(attribute).forEach(
        key => (el.style[key as any] = attribute[key])
      );
    else if (typeof attribute === "function") (el as any)[key] = attribute;
    else if (typeof attribute === "boolean")
      attribute === true && el.setAttribute(key, "");
    else el.setAttribute(key, attributes![key]);
    return el;
  }, document.createElement(name));
  (children || []).forEach(it =>
    el.append(it.type === "text" ? it.name : _createElement(it))
  );
  return el;
}

type Attributes<T extends HTMLElement> =
  | {
      [U in keyof T]?: T[U];
    }
  | AttributesOverwrite;

interface AttributesOverwrite {
  children?: Array<VNode | string>;
  class?: string;
  style?: Partial<CSSStyleDeclaration> | string;
}

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
