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
      exports.render = exports.h = void 0;
      function h2(name, attributes) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          children[_i - 2] = arguments[_i];
        }
        return typeof name === "string" ? { name, attributes: attributes !== null && attributes !== void 0 ? attributes : {}, children: children !== null && children !== void 0 ? children : [] } : name(attributes, children);
      }
      exports.h = h2;
      function render2(vnode) {
        var elements = createElement(vnode);
        document.body.append(elements);
      }
      exports.render = render2;
      function createElement(node) {
        if (typeof node === "string") {
          return document.createTextNode(node);
        }
        var name = node.name, attributes = node.attributes, children = node.children;
        var el = document.createElement(name);
        Object.entries(attributes).map(function(_a) {
          var key = _a[0], value = _a[1];
          el.setAttribute(key, value);
        });
        var childEls = children.map(createElement);
        el.append.apply(el, childEls);
        return el;
      }
    }
  });

  // sample.tsx
  var import_zheleznaya = __toModule(require_dist());
  (0, import_zheleznaya.render)(/* @__PURE__ */ (0, import_zheleznaya.h)("div", null, /* @__PURE__ */ (0, import_zheleznaya.h)("ul", null, /* @__PURE__ */ (0, import_zheleznaya.h)("li", null, "a"), /* @__PURE__ */ (0, import_zheleznaya.h)("li", null, "b"), /* @__PURE__ */ (0, import_zheleznaya.h)("li", null, "c")), /* @__PURE__ */ (0, import_zheleznaya.h)("span", null, "hoge"), ":", /* @__PURE__ */ (0, import_zheleznaya.h)("span", null, "fuga")));
})();
