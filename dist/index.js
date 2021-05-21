"use strict";
// import { wrap } from "./Settable";
// import { isEquals } from "./Equals";
// import { toKebabCaseFromSnakeCase } from "./Utils";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.h = void 0;
function h(name, attributes) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return typeof name === "string"
        ? { name: name, attributes: attributes !== null && attributes !== void 0 ? attributes : {}, children: children !== null && children !== void 0 ? children : [] }
        : name(attributes, children);
}
exports.h = h;
function render(vnode) {
    var elements = createElement(vnode);
    document.body.append(elements);
}
exports.render = render;
function createElement(node) {
    if (typeof node === "string") {
        return document.createTextNode(node);
    }
    var name = node.name, attributes = node.attributes, children = node.children;
    var el = document.createElement(name);
    Object.entries(attributes).map(function (_a) {
        var key = _a[0], value = _a[1];
        el.setAttribute(key, value);
    });
    var childEls = children.map(createElement);
    el.append.apply(el, childEls);
    return el;
}
//# sourceMappingURL=index.js.map