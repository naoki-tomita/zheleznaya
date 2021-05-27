(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // ../dist/index.js
  var require_dist = __commonJS({
    "../dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.render = exports.state = exports.h = void 0;
      function h2(name, attributes) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          children[_i - 2] = arguments[_i];
        }
        return typeof name === "string" ? { name, attributes: attributes !== null && attributes !== void 0 ? attributes : {}, children: children !== null && children !== void 0 ? children : [] } : name(attributes, children);
      }
      exports.h = h2;
      var State = function() {
        function State2() {
          this.cbs = [];
          this._state = {};
        }
        State2.prototype.setState = function(key, value) {
          this._state[key] = value;
          this.cbs.forEach(function(cb) {
            return cb();
          });
        };
        State2.prototype.getState = function(key) {
          return this._state[key];
        };
        State2.prototype.onUpdate = function(cb) {
          console.log(this._state);
          this.cbs.push(cb);
        };
        return State2;
      }();
      exports.state = new State();
      function createElement(node) {
        if (typeof node !== "object") {
          return document.createTextNode(node.toString());
        }
        var name = node.name, attributes = node.attributes, children = node.children;
        var el = Object.entries(attributes).reduce(function(el2, _a) {
          var key = _a[0], value = _a[1];
          if (key === "style") {
            Object.entries(value).forEach(function(_a2) {
              var key2 = _a2[0], value2 = _a2[1];
              return el2.style[key2] = value2;
            });
          } else if (key.startsWith("on")) {
            el2[key] = value;
          } else {
            el2.setAttribute(key, value);
          }
          return el2;
        }, document.createElement(name));
        var childEls = children.map(createElement);
        el.append.apply(el, childEls);
        return el;
      }
      function render2(vnode) {
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
      exports.render = render2;
    }
  });

  // sample.tsx
  var import_zheleznaya = __toModule(require_dist());
  function main() {
    function setCount(count) {
      import_zheleznaya.state.setState("count", count);
    }
    function getCount() {
      return import_zheleznaya.state.getState("count") ?? 0;
    }
    function incrementCount() {
      setCount(getCount() + 1);
    }
    (0, import_zheleznaya.render)(/* @__PURE__ */ (0, import_zheleznaya.h)("div", {
      className: "foo bar"
    }, /* @__PURE__ */ (0, import_zheleznaya.h)("ul", {
      style: { color: "blue", display: "flex", listStyle: "none", margin: "0", padding: "0" }
    }, /* @__PURE__ */ (0, import_zheleznaya.h)("li", {
      style: { display: "block" },
      id: "foo"
    }, "a"), /* @__PURE__ */ (0, import_zheleznaya.h)("li", {
      style: { display: "block" },
      id: "bar"
    }, "b"), /* @__PURE__ */ (0, import_zheleznaya.h)("li", {
      style: { display: "block" },
      id: "hoge"
    }, "c")), /* @__PURE__ */ (0, import_zheleznaya.h)("span", null, "hoge"), ":", /* @__PURE__ */ (0, import_zheleznaya.h)("span", null, getCount()), /* @__PURE__ */ (0, import_zheleznaya.h)("button", {
      onclick: incrementCount
    }, "click")));
  }
  main();
})();
