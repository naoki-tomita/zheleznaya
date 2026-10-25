import type { Child, ElementNode, LazyElement, VNode, Element } from "./types.ts";

function isLazyElement(node: Element | Child | Child[]): node is LazyElement {
  return typeof node === "function";
}

function renderChild(child: Child | Child[]): VNode {
  if (child == null) {
    return {
      name: "",
      type: "text",
    };
  } else if (isLazyElement(child)) {
    return renderElement(child);
  } else if (typeof child === "object") {
    if (Array.isArray(child)) {
      return {
        type: "array",
        children: child.map((item) => renderChild(item)),
      };
    }
    return renderElement(child);
  } else {
    return {
      name: child.toString(),
      type: "text",
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
