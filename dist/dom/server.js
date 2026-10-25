import { renderElement } from "../VNode.js";
import { toKebabCaseFromSnakeCase } from "../utils/string.js";
export function renderStyleToString(style) {
    if (typeof style === "string") {
        return style;
    }
    const result = Object.entries(style)
        .map(([key, value]) => `${toKebabCaseFromSnakeCase(key)}: ${value}`)
        .join(";");
    if (result.length > 0) {
        return `style="${result};"`;
    }
    return "";
}
function attributeToString(attributes) {
    attributes = attributes ?? {};
    return Object.entries(attributes ?? {})
        .filter(([_, value]) => typeof value !== "function")
        .map(([key, value]) => key === "style" ? renderStyleToString(value) : `${key}="${value}"`)
        .join(" ");
}
function renderVNodeToText(vnode) {
    switch (vnode.type) {
        case "null":
            return "";
        case "text":
            return vnode.name;
        case "html":
            const innerHTML = vnode.children.map(renderVNodeToText).join("");
            const el = { innerHTML };
            if ("ref" in (vnode.attributes ?? {})) {
                vnode.attributes.ref(el);
            }
            return `<${vnode.name} ${attributeToString(vnode.attributes)}>${el.innerHTML}</${vnode.name}>`;
        case "array":
            return vnode.children.map((it) => renderVNodeToText(it)).join("");
    }
}
export function renderToText(root) {
    const vnode = renderElement(root);
    return renderVNodeToText(vnode);
}
//# sourceMappingURL=server.js.map