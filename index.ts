import { wrap } from "./Settable";
import { isEquals } from "./Equals";

export type Component = (props: any, children: Array<VNode | string>) => VNode;
type Element = VNode | (() => VNode);
type RendereableElement = Element | string | number | boolean;
interface VNode {
  name: string;
  type: "text" | "html" | "array";
  attributes: { [key: string]: any } | null;
  children: Array<RendereableElement | RendereableElement[]>;
}

interface RenderedVNode extends VNode {
  children: Array<RenderedVNode | RenderedVNode[]>;
}

type RenderedVNodeWithHTMLElement =
  | RenderedVNodeWithHTMLElementText
  | RenderedVNodeWithHTMLElementNode
  | RenderedVNodeWithHTMLElementArray;

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

interface RenderedVNodeWithHTMLElementArray extends RenderedVNode {
  type: "array";
  children: Array<RenderedVNodeWithHTMLElement>;
  element: HTMLElement[];
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

function renderChild(
  child: RendereableElement
): RenderedVNode | RenderedVNode[] {
  if (typeof child === "function") {
    return renderElement(child());
  } else if (typeof child === "object") {
    if (Array.isArray(child)) {
      return {
        name: "ArrayNode",
        type: "array",
        attributes: {},
        children: child.map(item => renderChild(item)) as RenderedVNode[]
      };
    }
    return renderElement(child);
  } else {
    return {
      name: child.toString(),
      attributes: {},
      children: [],
      type: "text"
    };
  }
}

function renderElement(node: Element): RenderedVNode {
  if (typeof node === "function") node = node();
  return {
    ...node,
    children: (node.children || []).map(it =>
      renderChild(it as RendereableElement)
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

function recycleTextElement(node: RenderedVNode): RenderedVNodeWithHTMLElement {
  return {
    name: node.name,
    attributes: {},
    children: [],
    type: "text",
    element: node.name
  };
}

function recycleArrayElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | undefined,
  parentElement: HTMLElement
): RenderedVNodeWithHTMLElement {
  const elements: HTMLElement[] = [];
  const renderedVNodes: RenderedVNodeWithHTMLElement[] = [];
  (oldNode?.element as HTMLElement[])?.forEach(it =>
    parentElement?.removeChild(it)
  );
  node.children.forEach(it => {
    const child = createElement(it as RenderedVNode, undefined, parentElement);
    elements.push(child.element as HTMLElement);
    renderedVNodes.push(child);
  });
  return {
    name: "ArrayNode",
    attributes: {},
    type: "array",
    children: renderedVNodes,
    element: elements
  };
}

function recycleNodeElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | undefined,
  parentElement: HTMLElement
): RenderedVNodeWithHTMLElement {
  // standard node.
  // element
  let element: HTMLElement;
  if (oldNode?.element != null) {
    element = (oldNode as RenderedVNodeWithHTMLElementNode).element;
    if (!isEquals(node.name, oldNode.name)) {
      const newElement = document.createElement(node.name);
      parentElement.replaceWith(newElement);
      element = newElement;
    }
  } else {
    element = document.createElement(node.name);
  }

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
    } else if (key === "value" && typeof (element as any).value === "string") {
      (element as any).value = attribute;
    } else {
      element.setAttribute(key, attribute);
    }
  });

  // children
  const children: RenderedVNodeWithHTMLElement[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i] as RenderedVNode;
    const oldChild = oldNode?.children[i];
    const childVNode = createElement(child, oldChild, element);

    // エレメントをdocumentに追加する
    if (childVNode.type === "array") {
      // arrayの場合は常に再生成する(めんどいので。いつかkey対応するのでしょう)
      element.append(
        ...childVNode.children.map(it => it.element as string | HTMLElement)
      );
    } else if (!oldChild?.element) {
      // arrayじゃない場合のエレメント追加処理
      element.append(childVNode.element);
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

function createElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | undefined,
  parentElement: HTMLElement
): RenderedVNodeWithHTMLElement {
  switch (node.type) {
    case "text":
      return recycleTextElement(node);
    case "array":
      return recycleArrayElement(node, oldNode, parentElement);
    default:
      return recycleNodeElement(node, oldNode, parentElement);
  }
}

function createRootElement(node: RenderedVNode): RenderedVNodeWithHTMLElement {
  return createElement(node, _oldNode, root);
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
      label: Attributes<HTMLLabelElement>;
      li: Attributes<HTMLLIElement>;
      p: Attributes<HTMLParagraphElement>;
      pre: Attributes<HTMLPreElement>;
      select: Attributes<HTMLSelectElement>;
      span: Attributes<HTMLSpanElement>;
      textarea: Attributes<HTMLTextAreaElement>;
      ul: Attributes<HTMLUListElement>;
    }
  }
}
