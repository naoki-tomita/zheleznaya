"use strict";
// import { wrap } from "./Settable";
// import { isEquals } from "./Equals";
// import { toKebabCaseFromSnakeCase } from "./Utils";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.state = exports.h = void 0;
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
var State = /** @class */ (function () {
    function State() {
        this.cbs = [];
        this._state = {};
    }
    State.prototype.setState = function (key, value) {
        this._state[key] = value;
        this.cbs.forEach(function (cb) { return cb(); });
    };
    State.prototype.getState = function (key) {
        return this._state[key];
    };
    State.prototype.onUpdate = function (cb) {
        console.log(this._state);
        this.cbs.push(cb);
    };
    return State;
}());
exports.state = new State();
function createElement(node) {
    if (typeof node !== "object") {
        return document.createTextNode(node.toString());
    }
    var name = node.name, attributes = node.attributes, children = node.children;
    var el = Object.entries(attributes).reduce(function (el, _a) {
        var key = _a[0], value = _a[1];
        if (key === "style") {
            Object.entries(value).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                return (el.style[key] = value);
            });
        }
        else if (key.startsWith("on")) {
            el[key] = value;
        }
        else {
            el.setAttribute(key, value);
        }
        return el;
    }, document.createElement(name));
    var childEls = children.map(createElement);
    el.append.apply(el, childEls);
    return el;
}
function render(vnode) {
    var root = document.createElement("div");
    var holder = document.body;
    holder.append(root);
    function rerender() {
        var newRoot = createElement(vnode);
        holder.replaceChild(newRoot, root);
        root = newRoot;
    }
    exports.state.onUpdate(rerender);
    rerender();
}
exports.render = render;
//# sourceMappingURL=index.js.map