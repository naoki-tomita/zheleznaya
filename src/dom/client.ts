import type { ArrayVNode, Element, HtmlVNode, VNode } from "../types.ts";
import { debounce } from "../utils/Debounce.ts";
import { isEquals } from "../utils/Equals.ts";
import { wrap } from "../utils/Settable.ts";
import { renderElement } from "../VNode.ts";

function shouldRender(lastVNode: VNode | null, vnode: VNode): boolean {
  return !lastVNode || !isEquals(lastVNode, vnode);
}

type DiffResult = PatchOperation[];

type IndexPath = number[];
type PatchOperation =
| { op: "mount", vnode: VNode }
| { op: "unmount", path: IndexPath }
| { op: "replace", path: IndexPath, vnode: VNode }
| { op: "props", path: IndexPath, set: Record<string, unknown>, unset: string[] }

function diff(lastVNode: VNode | null, vnode: VNode): DiffResult {
  return [
    { op: "mount", vnode },
  ]
}

function createHtmlElement(vnode: HtmlVNode): HTMLElement {
  const target = document.createElement(vnode.name);
  target.append(...vnode.children.map(createElement).flat());

  for (const [key, value] of Object.entries(vnode.attributes ?? {})) {
    if (key === "style") {
      for (const [styleKey, styleValue] of Object.entries(value as Partial<CSSStyleDeclaration>)) {
        target.style[styleKey as any] = styleValue as string;
      }
    } else if (key.startsWith("on")) {
      if (typeof value === "function") {
        (target as any)[key.toLowerCase()] = value;
      }
    } else if (key === "ref") {
      continue; // refは後で処理する
    } else {
      target.setAttribute(key, value as string);
    }
  }

  if ("ref" in (vnode.attributes ?? {})) {
    vnode.attributes!.ref(target);
  }
  return target;
}

function createArrayElement(vnode: ArrayVNode) {
  const targets = vnode.children.map(createElement);
  return targets.flat();
}

function createElement(vnode: VNode): Array<HTMLElement | Text> {
  switch (vnode.type) {
    case "text":
      return [document.createTextNode(vnode.name)];
    case "html":
      return [createHtmlElement(vnode)];
    case "array":
      return createArrayElement(vnode);
  }
}

function patch(root: HTMLElement, patchOperations: PatchOperation[]) {
  for (const operation of patchOperations) {
    switch (operation.op) {
      case "mount":
        const el = createElement(operation.vnode);
        root.append(...el);
        break;
      case "unmount":
        break;
    }
  }
}

export function createRoot(rootElement?: HTMLElement) {
  let store: any = {};
  function createStore<T extends {}>(initialValue: T): T {
    return (store = wrap(initialValue) as unknown as T);
  }

  function getStore<T>(): T {
    return store;
  }

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

  let lastVNode: VNode | null = null;
  function render(nodeElement: Element) {
    const vnode = renderElement(nodeElement);
    if (!shouldRender(lastVNode, vnode)) {
      return;
    }
    const result = diff(lastVNode, vnode);
    patch(root, result);
    lastVNode = vnode;
  }

  return {
    render: runFirstRender,
    createStore,
    getStore,
  };
}
