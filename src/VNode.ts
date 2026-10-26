import type { Child, ElementNode, LazyElement, VNode, Element } from "./types.ts";

function isLazyElement(node: Element | Child | Child[]): node is LazyElement {
  return typeof node === "function";
}

function renderChild(child: Child | Child[]): VNode | VNode[] {
  if (child == null) {
    return {
      name: "",
      type: "text",
    };
  } else if (isLazyElement(child)) {
    return renderElement(child);
  } else if (typeof child === "object") {
    if (Array.isArray(child)) {
      return child.map((item) => renderChild(item)).flat();
    }
    return renderElement(child);
  } else if (typeof child === "boolean") {
    return {
      name: "",
      type: "text",
    }
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
    children: node.children.map(renderChild).flat(),
  };
}
