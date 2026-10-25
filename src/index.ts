import type { Child, Component, Element } from "./types.ts";

export function h(name: Component | string, attributes: any | null, ...children: Array<Child | Child[]>): Element {
  return typeof name === "string" ? { name, attributes, children, type: "html" } : () => name(attributes, children);
}

export { createRoot } from "./dom/client.ts";
export { renderToText } from "./dom/server.ts";
export { createEffect } from "./utils/Effect.ts";
