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
var store;
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
function render(nodeElement) {
    rerender(nodeElement);
    store.__on__(function () { return rerender(nodeElement); });
}
exports.render = render;
var _oldNode;
function rerender(nodeElement) {
    var renderedNode = renderElement(nodeElement);
    var completedVNode = createRootElement(renderedNode);
    _oldNode = completedVNode;
    if (!root) {
        document.body.appendChild((root = completedVNode.element));
    }
}
function recycleTextElement(node) {
    return {
        name: node.name,
        attributes: {},
        children: [],
        type: "text",
        element: node.name
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
        if ((oldChild === null || oldChild === void 0 ? void 0 : oldChild.type) === "text" &&
            !Equals_1.isEquals(childVNode.element, oldChild.element)) {
            // テキストノードの更新処理
            // テキストノード以外は、createElementの中でやっているからいらない
            element.childNodes[i].data = childVNode.element;
        }
        children.push(childVNode);
    }
    return __assign(__assign({}, node), { type: "html", element: element, children: children });
}
function createElement(node, oldNode, parentElement) {
    console.log(node.type, node.name, oldNode === null || oldNode === void 0 ? void 0 : oldNode.name, oldNode === null || oldNode === void 0 ? void 0 : oldNode.type);
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