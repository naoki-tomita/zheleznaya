"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderToText = exports.render = exports.useStore = exports.getStore = exports.createStore = exports.h = void 0;
const Settable_1 = require("./Settable");
const Equals_1 = require("./Equals");
const Utils_1 = require("./Utils");
const Debounce_1 = require("./Debounce");
function h(name, attributes, ...children) {
    return typeof name === "string"
        ? { name, attributes, children, type: "html" }
        : () => name(attributes, children);
}
exports.h = h;
let store = {};
function createStore(initialValue) {
    return (store = (0, Settable_1.wrap)(initialValue));
}
exports.createStore = createStore;
function getStore() {
    return store;
}
exports.getStore = getStore;
function useStore(initialValue) {
    // already initialized
    if (store.__on__) {
        return store;
    }
    return createStore(initialValue);
}
exports.useStore = useStore;
function renderChild(child) {
    if (typeof child === "function") {
        return renderElement(child());
    }
    else if (typeof child === "object") {
        if (Array.isArray(child)) {
            return {
                name: "ArrayNode",
                type: "array",
                attributes: {},
                children: child.map((item) => renderChild(item)),
            };
        }
        return renderElement(child);
    }
    else {
        return {
            name: child?.toString() ?? "",
            attributes: {},
            children: [],
            type: "text",
        };
    }
}
function renderElement(node) {
    if (typeof node === "function")
        node = node();
    return {
        ...node,
        children: (node.children || []).map((it) => renderChild(it)),
    };
}
let root;
function render(nodeElement, rootElement) {
    rootElement && (root = rootElement);
    rerender(nodeElement);
    store.__on__?.(() => rerenderWrapper(nodeElement));
}
exports.render = render;
const rerenderWrapper = (0, Debounce_1.debounce)(rerender, 0);
function renderToText(nodeElement) {
    const nodes = renderElement(nodeElement);
    return renderVNodeToText(nodes);
}
exports.renderToText = renderToText;
function renderVNodeToText(vNode) {
    if (Array.isArray(vNode)) {
        return vNode.map(renderVNodeToText).join("");
    }
    switch (vNode.type) {
        case "text":
            return vNode.name;
        case "html":
            return renderHtmlVNodeToText(vNode);
        case "array":
            return vNode.children.map(renderVNodeToText).join("");
    }
}
function attributeToString(attr) {
    if (typeof attr == "string") {
        return attr;
    }
    else if (typeof attr === "function") {
        return "";
    }
    // style
    return Object.keys(attr)
        .map((key) => `${(0, Utils_1.toKebabCaseFromSnakeCase)(key)}: ${attr[key]};`)
        .join("");
}
function renderHtmlVNodeToText(vNode) {
    let ref = null;
    if (typeof vNode.attributes?.ref === "function") {
        const el = {};
        Object.defineProperty(el, "innerHTML", {
            set(value) {
                ref = value;
            },
        });
        vNode.attributes.ref(el);
    }
    return `<${vNode.name} ${Object.keys(vNode.attributes || {})
        .map((key) => `${key}="${attributeToString(vNode.attributes[key])}"`)
        .join(" ")}>${ref ?? vNode.children.map(renderVNodeToText).join("")}</${vNode.name}>`;
}
let firstRender = true;
let _oldNode;
function rerender(nodeElement) {
    const renderedNode = renderElement(nodeElement);
    const completedVNode = createRootElement(renderedNode);
    _oldNode = completedVNode;
    if (firstRender) {
        if (!root) {
            root = document.createElement("div");
            document.body.appendChild(root);
        }
        root.innerHTML = "";
        root.appendChild(completedVNode.element);
        firstRender = false;
    }
}
function recycleTextElement(node) {
    return {
        name: node.name,
        attributes: {},
        children: [],
        type: "text",
        element: document.createTextNode(node.name),
    };
}
function recycleArrayElement(node, oldNode, parentElement) {
    const elements = [];
    const renderedVNodes = [];
    // replace or remove child elements.
    if (oldNode?.type === "array") {
        oldNode?.element?.forEach((it) => {
            parentElement?.removeChild(it);
        });
    }
    else {
        oldNode?.element &&
            parentElement?.removeChild(oldNode?.element);
    }
    oldNode && (oldNode.children = []);
    node.children.forEach((it) => {
        const child = createElement(it, undefined, parentElement);
        elements.push(child.element);
        renderedVNodes.push(child);
    });
    return {
        name: "ArrayNode",
        attributes: {},
        type: "array",
        children: renderedVNodes,
        element: elements,
    };
}
function recycleNodeElement(node, oldNode, parentElement) {
    // standard node.
    // element
    let element;
    if (oldNode?.element != null) {
        element = oldNode.element;
        // replace or remove child elements.
        if (!(0, Equals_1.isEquals)(node.name, oldNode.name)) {
            const newElement = document.createElement(node.name);
            if (oldNode.type === "array") {
                oldNode?.element?.forEach((it) => parentElement?.removeChild(it));
                parentElement?.append(newElement);
            }
            else {
                parentElement?.replaceChild(newElement, oldNode.element);
            }
            oldNode.children = [];
            element = newElement;
        }
    }
    else {
        element = document.createElement(node.name);
    }
    // attributes
    const { attributes } = node;
    Object.keys(attributes || {}).forEach((key) => {
        const attribute = attributes[key];
        if (key === "style") {
            Object.keys(attribute).forEach((key) => (element.style[key] = attribute[key]));
        }
        else if (key.startsWith("on")) {
            element[key] = attribute;
        }
        else if (typeof attribute === "boolean") {
            attribute ? element.setAttribute(key, "") : element.removeAttribute(key);
        }
        else if (key === "value" && typeof element.value === "string") {
            element.value = attribute;
        }
        else if (key === "ref" && typeof attribute === "function") {
            attribute(element);
        }
        else {
            element.setAttribute(key, attribute);
        }
    });
    // children
    const children = [];
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const oldChild = oldNode?.children[i];
        const childVNode = createElement(child, oldChild, element);
        // エレメントをdocumentに追加する
        if (childVNode.type === "array") {
            // arrayの場合は常に再生成する(めんどいので。いつかkey対応するのでしょう)
            element.append(...childVNode.children.map((it) => it.element));
        }
        else if (!oldChild?.element) {
            // arrayじゃない場合のエレメント追加処理
            element.append(childVNode.element);
        }
        if (oldChild?.type === "text") {
            // テキストノードの更新処理
            // テキストノード以外は、createElementの中でやっているからいらない
            element.replaceChild(childVNode.element, element.childNodes.item(i));
        }
        children.push(childVNode);
    }
    return { ...node, type: "html", element, children };
}
function createElement(node, oldNode, parentElement) {
    switch (node.type) {
        case "text":
            return recycleTextElement(node);
        case "array":
            return recycleArrayElement(node, oldNode, parentElement);
        default:
            return recycleNodeElement(node, oldNode, parentElement);
    }
}
function createRootElement(node) {
    return createElement(node, _oldNode, root);
}
//# sourceMappingURL=index.js.map