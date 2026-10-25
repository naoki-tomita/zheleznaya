import type { VNode, Element } from "../types.ts";
import { renderElement } from "../VNode.ts";
import { toKebabCaseFromSnakeCase } from "../utils/string.ts";

export function renderStyleToString(style: Partial<CSSStyleDeclaration> | string): string {
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

function attributeToString(attributes: { [key: string]: any } | null): string {
  attributes = attributes ?? {};
  return Object.entries(attributes ?? {})
    .filter(([_, value]) => typeof value !== "function")
    .map(([key, value]) => (key === "style" ? renderStyleToString(value) : `${key}="${value}"`)).join(" ");
}

function renderVNodeToText(vnode: VNode): string {
  switch (vnode.type) {
    case "text":
      return vnode.name;
    case "html":
      const innerHTML = vnode.children.map(renderVNodeToText).join("");
      const el = { innerHTML };
      if ("ref" in (vnode.attributes ?? {})) {
        vnode.attributes!.ref(el);
      }
      return `<${vnode.name} ${attributeToString(vnode.attributes)}>${el.innerHTML}</${vnode.name}>`;
    case "array":
      return vnode.children.map((it) => renderVNodeToText(it)).join("");
  }
}

export function renderToText(root: Element): string {
  const vnode = renderElement(root)
  return renderVNodeToText(vnode);
}
