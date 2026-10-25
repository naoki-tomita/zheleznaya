import { wrap } from "./Settable.ts";
import { isEquals } from "./Equals.ts";
import { toKebabCaseFromSnakeCase } from "./Utils.ts";
import type { Child, Component, Element, ElementNode, LazyElement, VNode } from "./types.ts";
import { debounce } from "./Debounce.ts";

function renderStyleToString(style: Partial<CSSStyleDeclaration> | string): string {
  if (typeof style === "string") {
    return style;
  }
  const result =Object.entries(style)
    .map(([key, value]) => `${toKebabCaseFromSnakeCase(key)}: ${value}`)
    .join(";");
  if (result.length > 0) {
    return `style="${result};"`;
  }
  return "";
}

function attributeToString(vnode: VNode, attributes: { [key: string]: any } | null): string {
  attributes = attributes ?? {};
  if ("ref" in attributes) {
    attributes.ref(vnode);
  }
  return Object.entries(attributes ?? {})
    .filter(([_, value]) => typeof value !== "function")
    .map(([key, value]) => (key === "style" ? renderStyleToString(value) : `${key}="${value}"`)).join(" ");
}

function renderVNodeToText(vnode: VNode): string {
  switch (vnode.type) {
    case "text":
      return vnode.name;
    case "html":
      return `<${vnode.name} ${attributeToString(vnode, vnode.attributes)}>${vnode.children.map(renderVNodeToText).join("")}</${vnode.name}>`;
    case "array":
      return vnode.children.map((it) => renderVNodeToText(it)).join("");
  }
}

export function renderToText(root: Element): string {
  const vnode = renderElement(root)
  return renderVNodeToText(vnode);
}

function isLazyElement(node: Element | Child | Child[]): node is LazyElement {
  return typeof node === "function";
}

function renderChild(child: Child | Child[]): VNode {
  if (child == null) {
    return {
      name: "",
      type: "text",
      attributes: {},
      children: [],
    }
  } else if (isLazyElement(child)) {
    return renderElement(child);
  } else if (typeof child === "object") {
    if (Array.isArray(child)) {
      return {
        name: "",
        type: "array",
        attributes: {},
        children: child.map((item) => renderChild(item))
      };
    }
    return renderElement(child);
  } else {
    return {
      name: child.toString(),
      type: "text",
      attributes: {},
      children: [],
    };
  }
}

function resolveToElementNode(node: Element): ElementNode {
  return isLazyElement(node) ? resolveToElementNode(node()) : node;
}

export function renderElement(node: Element): VNode {
  node = resolveToElementNode(node);
  return {
    ...node,
    children: node.children.map(renderChild),
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

export function h(
  name: Component | string,
  attributes: any | null,
  ...children: Array<Child | Child[]>
): Element {
  return typeof name === "string"
    ? { name, attributes, children, type: "html" }
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
