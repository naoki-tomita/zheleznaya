"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var zheleznaya_exports = {};
__export(zheleznaya_exports, {
  createStore: () => createStore,
  getStore: () => getStore,
  h: () => h,
  render: () => render,
  renderToText: () => renderToText,
  useStore: () => useStore
});
module.exports = __toCommonJS(zheleznaya_exports);
var import_Settable = require("./Settable");
var import_Equals = require("./Equals");
var import_Utils = require("./Utils");
function h(name, attributes, ...children) {
  return typeof name === "string" ? { name, attributes, children, type: "html" } : () => name(attributes, children);
}
let store = {};
function createStore(initialValue) {
  return store = (0, import_Settable.wrap)(initialValue);
}
function getStore() {
  return store;
}
function useStore(initialValue) {
  if (store.__on__) {
    return store;
  }
  return createStore(initialValue);
}
function renderChild(child) {
  if (typeof child === "function")
    child = child();
  if (typeof child === "object") {
    if (Array.isArray(child)) {
      return {
        name: "ArrayNode",
        type: "array",
        attributes: {},
        children: child.map((item) => renderChild(item))
      };
    }
    return renderElement(child);
  } else {
    return {
      name: child?.toString() ?? "",
      attributes: {},
      children: [],
      type: "text"
    };
  }
}
function renderElement(node) {
  if (typeof node === "function")
    node = node();
  return {
    ...node,
    children: (node.children || []).map(
      (it) => renderChild(it)
    )
  };
}
let root;
function render(nodeElement, rootElement) {
  rootElement && (root = rootElement);
  rerender(nodeElement);
  store.__on__?.(() => rerender(nodeElement));
}
function renderToText(nodeElement) {
  const nodes = renderElement(nodeElement);
  return renderVNodeToText(nodes);
}
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
  } else if (typeof attr === "function") {
    return "";
  }
  return Object.keys(attr).map((key) => `${(0, import_Utils.toKebabCaseFromSnakeCase)(key)}: ${attr[key]};`).join("");
}
function renderHtmlVNodeToText(vNode) {
  let ref = null;
  if (typeof vNode.attributes?.ref === "function") {
    const el = {};
    Object.defineProperty(el, "innerHTML", {
      set(value) {
        ref = value;
      }
    });
    vNode.attributes.ref(el);
  }
  return `<${vNode.name} ${Object.keys(vNode.attributes || {}).map((key) => `${key}="${attributeToString(vNode.attributes[key])}"`).join(" ")}>${ref ?? vNode.children.map(renderVNodeToText).join("")}</${vNode.name}>`;
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
    element: document.createTextNode(node.name)
  };
}
function recycleArrayElement(node, oldNode, parentElement) {
  const elements = [];
  const renderedVNodes = [];
  if (oldNode?.type === "array") {
    oldNode?.element?.forEach((it) => {
      parentElement?.removeChild(it);
    });
  } else {
    oldNode?.element && parentElement?.removeChild(oldNode?.element);
  }
  oldNode && (oldNode.children = []);
  node.children.forEach((it) => {
    const child = createElement(it, void 0, parentElement);
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
  let element;
  if (oldNode?.element != null) {
    element = oldNode.element;
    if (!(0, import_Equals.isEquals)(node.name, oldNode.name)) {
      const newElement = document.createElement(node.name);
      if (oldNode.type === "array") {
        oldNode?.element?.forEach((it) => parentElement?.removeChild(it));
        parentElement?.append(newElement);
      } else {
        parentElement?.replaceChild(newElement, oldNode.element);
      }
      oldNode.children = [];
      element = newElement;
    }
  } else {
    element = document.createElement(node.name);
  }
  const { attributes } = node;
  Object.keys(attributes || {}).forEach((key) => {
    const attribute = attributes[key];
    if (key === "style") {
      Object.keys(attribute).forEach(
        (key2) => element.style[key2] = attribute[key2]
      );
    } else if (key.startsWith("on")) {
      element[key] = attribute;
    } else if (typeof attribute === "boolean") {
      attribute ? element.setAttribute(key, "") : element.removeAttribute(key);
    } else if (key === "value" && typeof element.value === "string") {
      element.value = attribute;
    } else if (key === "ref" && typeof attribute === "function") {
      attribute(element);
    } else {
      element.setAttribute(key, attribute);
    }
  });
  const children = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const oldChild = oldNode?.children[i];
    const childVNode = createElement(child, oldChild, element);
    if (childVNode.type === "array") {
      element.append(
        ...childVNode.children.map((it) => it.element)
      );
    } else if (!oldChild?.element) {
      element.append(childVNode.element);
    }
    if (oldChild?.type === "text") {
      element.replaceChild(
        childVNode.element,
        element.childNodes.item(i)
      );
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
