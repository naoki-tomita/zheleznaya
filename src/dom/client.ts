import type { ArrayVNode, Element, HtmlVNode, VNode } from "../types.ts";
import { debounce } from "../utils/Debounce.ts";
import { isEquals } from "../utils/Equals.ts";
import { wrap } from "../utils/Settable.ts";
import { renderElement } from "../VNode.ts";
import { renderStyleToString } from "./server.ts";

function shouldRender(lastVNode: VNode | null, vnode: VNode): boolean {
  return !lastVNode || !isEquals(lastVNode, vnode);
}

type DiffResult = PatchOperation[];

type IndexPath = number[];
type PatchOperation =
  | { op: "mount"; vnode: VNode; path?: IndexPath }
  | { op: "unmount"; path: IndexPath }
  | { op: "replace"; path: IndexPath; vnode: VNode }
  | {
      op: "props";
      path: IndexPath;
      set: Record<string, unknown>;
      unset: string[];
    };

function diffNode(a: VNode, b: VNode, path: IndexPath): DiffResult {
  if (a.type !== b.type) {
    // タイプが違う
    return [{ op: "replace", path, vnode: b }];
  }
  if (a.type === "null" && b.type === "null") {
    // null
    return [];
  }
  if (a.type === "text" && b.type === "text") {
    // テキストノードでテキストが違う
    if (a.name !== b.name) {
      return [{ op: "replace", path, vnode: b }];
    }
  }
  if (a.type === "html" && b.type === "html") {
    // HTMLノード
    if (a.name !== b.name) {
      // タグが違う
      return [{ op: "replace", path, vnode: b }];
    }
    // attributesの比較
    const aKeys = Object.keys(a.attributes ?? {});
    const bKeys = Object.keys(b.attributes ?? {});
    const unset = aKeys.filter((it) => !bKeys.includes(it));
    const keys = [...new Set([...aKeys, ...bKeys])]
      .filter((it) => !it.startsWith("__"))
      .filter(it => !unset.includes(it))
    const set = bKeys
      .filter((it) => !aKeys.includes(it))
      .reduce((acc, k) => ({ ...acc, [k]: (b.attributes as any)[k] }), {} as Record<string, unknown>);

    for (const key of keys) {
      const aVal = a.attributes?.[key];
      const bVal = b.attributes?.[key];
      if (key === "style") {
        // スタイル系なら、オブジェクトを見る。
        if (!isEquals(aVal, bVal)) {
          set[key] = bVal;
        }
        continue;
      }
      if (aVal !== bVal) {
        set[key] = bVal;
      }
    }
    if (unset.length !== 0 || Object.keys(set).length !== 0) {
      return [{ op: "props", path, unset, set }];
    }
  }
  // arrayの場合は、子要素の差分だけを見ればいい
  return [];
}

export function diff(lastVNode: VNode | null, vnode: VNode | null, path: IndexPath = []): DiffResult {
  if (!vnode) {
    return [{ op: "unmount", path }];
  }
  if (!lastVNode) {
    return [{ op: "mount", vnode, path }];
  }
  const result: DiffResult = [];
  result.push(...diffNode(lastVNode, vnode, path));
  if (result[0]?.op === "replace") {
    // 置き換えなら、子要素作り直しなので、以降はチェックする必要なし
    return result;
  }
  if (lastVNode.type === "html" && vnode.type === "html") {
    for (let i = 0; i < Math.max(lastVNode.children.length, vnode.children.length); i++) {
      result.push(...diff(lastVNode.children[i], vnode.children[i], [...path, i]));
    }
  }

  return result;
}

function updateAttributes(target: HTMLElement, set: Record<string, unknown>) {
  for (const [key, value] of Object.entries(set ?? {})) {
    if (key === "style") {
      target.style = renderStyleToString(value as CSSStyleDeclaration);
    } else if (key.startsWith("on")) {
      if (typeof value === "function") {
        (target as any)[key.toLowerCase()] = value;
      }
    } else if (key === "ref") {
      continue; // refは後で処理する
    } else if ((key === "value" || key === "checked") && target.tagName === "INPUT") {
      if (key === "value") {
        target.setAttribute("value", value as string);
        (target as HTMLInputElement).value = value as string;
      } else if (key === "checked") {
        if (typeof value === "boolean") {
          value ? target.setAttribute(key, "") : target.removeAttribute(key);
        }
        (target as HTMLInputElement).checked = value as boolean;
      }
    } else {
      if (typeof value === "boolean") {
        value ? target.setAttribute(key, "") : target.removeAttribute(key);
      } else {
        target.setAttribute(key, value as string);
      }
    }
  }
}

function createHtmlElement(vnode: HtmlVNode): HTMLElement {
  const target = document.createElement(vnode.name);
  target.append(...vnode.children.map(createElement).flat());

  updateAttributes(target, vnode.attributes ?? {});

  if ("ref" in (vnode.attributes ?? {})) {
    vnode.attributes!.ref(target);
  }
  return target;
}

function createElement(vnode: VNode): Array<HTMLElement | Text> {
  switch (vnode.type) {
    case "text":
      return [document.createTextNode(vnode.name)];
    case "html":
      return [createHtmlElement(vnode)];
    case "null":
      return [];
  }
}

function replace(root: globalThis.Element, vnode: VNode, path: IndexPath) {
  const el = createElement(vnode);
  const before = find(root, path);
  before.replaceWith(...el);
}

function mount(root: globalThis.Element, vnode: VNode, path?: IndexPath) {
  const el = createElement(vnode);
  if (!path) {
    root.append(...el);
  } else {
    // ややこしいのだが、root要素（mountするとこ）とトップの要素（一番上の要素）のどっちを取ればいいかが分かりづらく、こうなっています。
    const [parent, index] = path.length === 1
      ? [root.childNodes.item(0), path[0]]
      : (() => {
          const parentPath = path.slice(0, -1);
          const index = path.pop() ?? 0;
          return [find(root, parentPath), index];
        })();

    if (parent.childNodes.length === index) {
      el.forEach((it) => parent.appendChild(it));
    } else if (parent.childNodes.length >= index + 1) {
      parent.childNodes[index].before(...el);
    }
  }
}

function find(root: globalThis.Element, path: IndexPath) {
  // 空ならルートエレメント。
  if (path.length === 0) {
    return root;
  }
  // rootは管理外のdomノード。これの子要素が本当のルートノード。
  return path.reduce((acc, index) => acc.childNodes.item(index)!, root.childNodes.item(0)!);
}

function unmount(root: globalThis.Element, path: IndexPath) {
  const el = find(root, path);
  el.remove();
}

function updateProps(root: globalThis.Element, path: IndexPath, set: Record<string, unknown>, unset: string[]) {
  const el = find(root, path);
  unset.forEach(it => (el as HTMLElement).removeAttribute(it));
  updateAttributes(el as HTMLElement, set);
}

const Order = {
  mount: 0,
  unmount: 0,
  replace: 1,
  props: 2,
}

export function patchOperationSorter(a: PatchOperation, b: PatchOperation): number {
  const aOrder = Order[a.op];
  const bOrder = Order[b.op];
  if (aOrder !== bOrder) {
    return bOrder - aOrder;
  }
  if (a.path?.length !== b.path?.length) {
    return (b.path?.length ?? 0) - (a.path?.length ?? 0);
  }
  if (a.path && b.path) {
    for (let i = 0; i < a.path.length; i++) {
      if (a.path[i] !== b.path[i]) {
        return b.path[i] - a.path[i];
      }
    }
  }
  return 0;
}

function patch(root: globalThis.Element, patchOperations: PatchOperation[]) {
  const sortedOperations = patchOperations.toSorted(patchOperationSorter);

  for (const o of sortedOperations) {
    switch (o.op) {
      case "mount":
        mount(root, o.vnode, o.path);
        break;
      case "unmount":
        unmount(root, o.path);
        break;
      case "replace":
        replace(root, o.vnode, o.path);
        break;
      case "props":
        updateProps(root, o.path, o.set, o.unset);
        break;
    }
  }
}

export function createRoot(rootElement?: globalThis.Element) {
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
    root.dataset["z"] = "root";
    document.body.appendChild(root);
    return root;
  }

  let root: globalThis.Element;
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
