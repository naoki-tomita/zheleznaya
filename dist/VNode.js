function isLazyElement(node) {
    return typeof node === "function";
}
function renderChild(child) {
    if (child == null) {
        return {
            name: "",
            type: "text",
        };
    }
    else if (isLazyElement(child)) {
        return renderElement(child);
    }
    else if (typeof child === "object") {
        if (Array.isArray(child)) {
            return {
                type: "array",
                children: child.map((item) => renderChild(item)),
            };
        }
        return renderElement(child);
    }
    else {
        return {
            name: child.toString(),
            type: "text",
        };
    }
}
function resolveToElementNode(node) {
    return isLazyElement(node) ? resolveToElementNode(node()) : node;
}
export function renderElement(node) {
    node = resolveToElementNode(node);
    return {
        ...node,
        children: node.children.map(renderChild),
    };
}
//# sourceMappingURL=VNode.js.map