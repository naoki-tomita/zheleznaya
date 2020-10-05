"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Settable_1 = require("./Settable");
var Equals_1 = require("./Equals");
function h(name, attributes) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return typeof name === "string"
        ? { name: name, attributes: attributes, children: children, type: "html" }
        : function () { return name(attributes, children); };
}
exports.h = h;
var store = {};
function createStore(initialValue) {
    return (store = Settable_1.wrap(initialValue));
}
exports.createStore = createStore;
function getStore() {
    return store;
}
exports.getStore = getStore;
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
                children: child.map(function (item) { return renderChild(item); })
            };
        }
        return renderElement(child);
    }
    else {
        return {
            name: child.toString(),
            attributes: {},
            children: [],
            type: "text"
        };
    }
}
function renderElement(node) {
    if (typeof node === "function")
        node = node();
    return __assign(__assign({}, node), { children: (node.children || []).map(function (it) {
            return renderChild(it);
        }) });
}
var root;
function render(nodeElement, rootElement) {
    var _a;
    rootElement && (root = rootElement);
    rerender(nodeElement);
    (_a = store.__on__) === null || _a === void 0 ? void 0 : _a.call(store, function () { return rerender(nodeElement); });
}
exports.render = render;
function renderToText(nodeElement) {
    var nodes = renderElement(nodeElement);
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
    return Object.keys(attr).map(function (key) { return key + "=" + attr[key] + ";"; }).join("");
}
function renderHtmlVNodeToText(vNode) {
    var _a;
    var ref = null;
    if (typeof ((_a = vNode.attributes) === null || _a === void 0 ? void 0 : _a.ref) === "function") {
        var el = {};
        Object.defineProperty(el, "innerHTML", { set: function (value) { ref = value; } });
        vNode.attributes.ref(el);
    }
    return ("<" + vNode.name + " " + Object.keys(vNode.attributes || {})
        .map(function (key) { return key + "=\"" + attributeToString(vNode.attributes[key]) + "\""; }).join(" ") + ">" + (ref !== null && ref !== void 0 ? ref : vNode.children.map(renderVNodeToText).join("")) + "</" + vNode.name + ">");
}
var firstRender = true;
var _oldNode;
function rerender(nodeElement) {
    var renderedNode = renderElement(nodeElement);
    var completedVNode = createRootElement(renderedNode);
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
    var _a;
    var elements = [];
    var renderedVNodes = [];
    // replace or remove child elements.
    if ((oldNode === null || oldNode === void 0 ? void 0 : oldNode.type) === "array") {
        (_a = oldNode === null || oldNode === void 0 ? void 0 : oldNode.element) === null || _a === void 0 ? void 0 : _a.forEach(function (it) {
            parentElement === null || parentElement === void 0 ? void 0 : parentElement.removeChild(it);
        });
    }
    else {
        (oldNode === null || oldNode === void 0 ? void 0 : oldNode.element) && (parentElement === null || parentElement === void 0 ? void 0 : parentElement.removeChild(oldNode === null || oldNode === void 0 ? void 0 : oldNode.element));
    }
    oldNode && (oldNode.children = []);
    node.children.forEach(function (it) {
        var child = createElement(it, undefined, parentElement);
        elements.push(child.element);
        renderedVNodes.push(child);
    });
    return {
        name: "ArrayNode",
        attributes: {},
        type: "array",
        children: renderedVNodes,
        element: elements
    };
}
function recycleNodeElement(node, oldNode, parentElement) {
    var _a;
    // standard node.
    // element
    var element;
    if ((oldNode === null || oldNode === void 0 ? void 0 : oldNode.element) != null) {
        element = oldNode.element;
        // replace or remove child elements.
        if (!Equals_1.isEquals(node.name, oldNode.name)) {
            var newElement = document.createElement(node.name);
            if (oldNode.type === "array") {
                (_a = oldNode === null || oldNode === void 0 ? void 0 : oldNode.element) === null || _a === void 0 ? void 0 : _a.forEach(function (it) { return parentElement === null || parentElement === void 0 ? void 0 : parentElement.removeChild(it); });
                parentElement === null || parentElement === void 0 ? void 0 : parentElement.append(newElement);
            }
            else {
                parentElement === null || parentElement === void 0 ? void 0 : parentElement.replaceChild(newElement, oldNode.element);
            }
            oldNode.children = [];
            element = newElement;
        }
    }
    else {
        element = document.createElement(node.name);
    }
    // attributes
    var attributes = node.attributes;
    Object.keys(attributes || {}).forEach(function (key) {
        var attribute = attributes[key];
        if (key === "style") {
            Object.keys(attribute).forEach(function (key) { return (element.style[key] = attribute[key]); });
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
    var children = [];
    for (var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        var oldChild = oldNode === null || oldNode === void 0 ? void 0 : oldNode.children[i];
        var childVNode = createElement(child, oldChild, element);
        // エレメントをdocumentに追加する
        if (childVNode.type === "array") {
            // arrayの場合は常に再生成する(めんどいので。いつかkey対応するのでしょう)
            element.append.apply(element, childVNode.children.map(function (it) { return it.element; }));
        }
        else if (!(oldChild === null || oldChild === void 0 ? void 0 : oldChild.element)) {
            // arrayじゃない場合のエレメント追加処理
            element.append(childVNode.element);
        }
        if ((oldChild === null || oldChild === void 0 ? void 0 : oldChild.type) === "text") {
            // テキストノードの更新処理
            // テキストノード以外は、createElementの中でやっているからいらない
            element.replaceChild(childVNode.element, element.childNodes.item(i));
        }
        children.push(childVNode);
    }
    return __assign(__assign({}, node), { type: "html", element: element, children: children });
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