export function h(name, attributes, ...children) {
    return typeof name === "string"
        ? { name, attributes, children, type: "html" }
        : () => name(attributes, children);
}
export { createRoot } from "./dom/client.js";
export { renderToText } from "./dom/server.js";
export { createEffect } from "./utils/Effect.js";
//# sourceMappingURL=index.js.map