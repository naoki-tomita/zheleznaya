import { wrap } from "./Settable.ts";
import { isEquals } from "./Equals.ts";
import { toKebabCaseFromSnakeCase } from "./Utils.ts";
import { debounce } from "./Debounce.ts";

function isFunctionNode(node: RenderableElement): node is Component {}

function renderChild(child: RenderableElement): VNode {
  if (typeof child === "function") {
    return renderElement(child);
  } else if (typeof child === "object") {
    if (Array.isArray(child)) {
      return {
        name: "ArrayNode",
        type: "array",
        attributes: {},
        children: child.map((item) => renderChild(item)) as RenderedVNode[],
      };
    }
    return renderElement(child);
  } else {
    return {
      name: child?.toString() ?? "",
      attributes: {},
      children: [],
      type: "text",
    };
  }
}

function renderElement(node: Element): VNode {
  if (typeof node === "function") node = node();
  return {
    ...node,
    children: node.children.map((it) =>
      renderChild(it as Element),
    ),
  };
}

export function createRoot(rootElement?: HTMLElement) {
  const rerenderWrapper = debounce(render, 0);

  function createRootHtmlElement() {
    const root = document.createElement("div");
    document.body.appendChild(root);
    return root;
  }

  let root: HTMLElement;
  function runFirstRender(nodeElement: Element) {
    root = rootElement ?? createRootHtmlElement();
    root.innerHTML = "";
    render(nodeElement);
    store.__on__?.(() => rerenderWrapper(nodeElement));
  }

  function render(nodeElement: Element) {
    const renderedNode = renderElement(nodeElement);
    const completedVNode = createRootElement(renderedNode);
  }

  function createRootElement(
    node: RenderedVNode,
  ): RenderedVNodeWithHTMLElement {
    return createElement(node, _oldNode, root);
  }

  return {
    render: runFirstRender,
  };
}


export type Component<P = any> = (
  props: P,
  children: Array<RenderableVNode | string>,
) => RenderableVNode;
type Element = RenderableVNode | (() => RenderableVNode);
type RenderableElement = Element | string | number | boolean;
type RenderableVNode = {
  name: string;
  type: "text" | "element" | "array";
  attributes: { [key: string]: any } | null;
  children: Array<RenderableElement>;
}
type VNode = {
  name: string;
  type: "text" | "element" | "array";
  attributes: { [key: string]: any } | null;
  children: Array<VNode>;
}

export function h(
  name: Component | string,
  attributes: any | null,
  ...children: Array<RenderableVNode | string>
): Element {
  return typeof name === "string"
    ? { name, attributes, children, type: "element" }
    : () => name(attributes, children);
}

let store: any = {};
export function createStore<T extends {}>(initialValue: T): T {
  return (store = wrap(initialValue) as unknown as T);
}

export function getStore<T>(): T {
  return store;
}

export function useStore<T extends {}>(initialValue: T): T {
  // already initialized
  if (store.__on__) {
    return store;
  }
  return createStore(initialValue);
}

export { createEffect } from "./Effect.ts";
