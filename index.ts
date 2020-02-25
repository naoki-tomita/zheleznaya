import { wrap } from "./Settable";
import { isEquals } from "./Equals";

export type Component = (props: any, children: Array<VNode | string>) => VNode;
type Element = VNode | (() => VNode);
interface VNode {
  name: string;
  // type: "text" | "html" | "array";
  type: "text" | "html";
  attributes: { [key: string]: any } | null;
  children: Array<Element | string | number | boolean>;
}

interface RenderedVNode extends VNode {
  children: Array<RenderedVNode>;
}

type RenderedVNodeWithHTMLElement =
  | RenderedVNodeWithHTMLElementText
  | RenderedVNodeWithHTMLElementNode;
// | RenderedVNodeWithHTMLElementArray;

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

// interface RenderedVNodeWithHTMLElementArray extends RenderedVNode {
//   type: "array";
//   children: Array<RenderedVNodeWithHTMLElement>;
//   element: HTMLElement[];
// }

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

let _oldNode: RenderedVNodeWithHTMLElement;
function rerender(nodeElement: Element) {
  const renderedNode = renderElement(nodeElement);
  const completedVNode = createRootElement(renderedNode);
  _oldNode = completedVNode;
  if (!root) {
    document.body.appendChild((root = completedVNode.element as HTMLElement));
  }
}

function createElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | null
): RenderedVNodeWithHTMLElement {
  if (node.type === "text") {
    return {
      name: node.name,
      attributes: {},
      children: [],
      type: "text",
      element: node.name
    };
  }
  // element
  let element: HTMLElement;
  if (isEquals(node.name, oldNode?.name) && oldNode?.element != null)
    element = (oldNode as RenderedVNodeWithHTMLElementNode).element;
  else element = document.createElement(node.name);

  // attributes
  const { attributes } = node;
  Object.keys(attributes || {}).forEach(key => {
    const attribute = attributes![key];
    if (key === "style") {
      Object.keys(attribute).forEach(
        key => ((element.style as any)[key] = attribute[key])
      );
    } else if (key.startsWith("on")) {
      (element as any)[key] = attribute;
    } else if (typeof attribute === "boolean") {
      attribute ? element.setAttribute(key, "") : element.removeAttribute(key);
    } else {
      element.setAttribute(key, attribute);
    }
  });

  // children
  const children: RenderedVNodeWithHTMLElement[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const oldChild = oldNode?.children[i] || null;
    const childVNode = createElement(child, oldChild);

    // エレメントをdocumentに追加する(初回だけ)
    if (!oldChild?.element) {
      // if (childVNode.type === "array") {

      // } else {
      // arrayじゃない場合のエレメント追加処理
      element.append(childVNode.element);
      // }
    }

    if (
      oldChild?.type === "text" &&
      !isEquals(childVNode.element, oldChild.element)
    ) {
      // テキストノードの更新処理
      // テキストノード以外は、createElementの中でやっているからいらない
      (element.childNodes[i] as Text).data = childVNode.element as string;
    }
    children.push(childVNode);
  }
  return { ...node, type: "html", element, children };
}

function createRootElement(node: RenderedVNode): RenderedVNodeWithHTMLElement {
  return createElement(node, _oldNode);
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
