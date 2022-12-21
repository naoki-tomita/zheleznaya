import { wrap } from "./Settable";
import { isEquals } from "./Equals";
import { toKebabCaseFromSnakeCase } from "./Utils";
import { debounce } from "./Debounce";

export type Component<P = any> = (
  props: P,
  children: Array<VNode | string>
) => VNode;
type Element = VNode | (() => VNode);
type RendereableElement = Element | string | number | boolean;
interface VNode {
  name: string;
  type: "text" | "html" | "array";
  attributes: { [key: string]: any } | null;
  children: Array<RendereableElement | RendereableElement[]>;
}

interface RenderedVNode extends VNode {
  children: Array<RenderedVNode | RenderedVNode[]>;
}

type RenderedVNodeWithHTMLElement =
  | RenderedVNodeWithHTMLElementText
  | RenderedVNodeWithHTMLElementNode
  | RenderedVNodeWithHTMLElementArray;

interface RenderedVNodeWithHTMLElementText extends RenderedVNode {
  type: "text";
  children: Array<RenderedVNodeWithHTMLElement>;
  element: Text;
}

interface RenderedVNodeWithHTMLElementNode extends RenderedVNode {
  type: "html";
  children: Array<RenderedVNodeWithHTMLElement>;
  element: HTMLElement;
}

interface RenderedVNodeWithHTMLElementArray extends RenderedVNode {
  type: "array";
  children: Array<RenderedVNodeWithHTMLElement>;
  element: HTMLElement[];
}

export function h(
  name: Component | string,
  attributes: any | null,
  ...children: Array<VNode | string>
): Element {
  return typeof name === "string"
    ? { name, attributes, children, type: "html" }
    : () => name(attributes, children);
}

let store: any = {};
export function createStore<T extends {}>(initialValue: T): T {
  return (store = (wrap(initialValue) as unknown) as T);
}

export function getStore<T>(): T {
  return store;
}

export function useStore<T extends {}>(initialValue: T): T {
  // already initialized
  if (store.__on__) {
    return store;
  }
  return createStore(initialValue);
}

function renderChild(child: RendereableElement): RenderedVNode {
  if (typeof child === "function") {
      return renderElement(child());
  } else if (typeof child === "object") {
    if (Array.isArray(child)) {
      return {
        name: "ArrayNode",
        type: "array",
        attributes: {},
        children: child.map((item) => renderChild(item)) as RenderedVNode[],
      };
    }
    return renderElement(child);
  } else {
    return {
      name: child?.toString() ?? "",
      attributes: {},
      children: [],
      type: "text",
    };
  }
}

function renderElement(node: Element): RenderedVNode {
  if (typeof node === "function") node = node();
  return {
    ...node,
    children: (node.children || []).map((it) =>
      renderChild(it as RendereableElement)
    ),
  };
}

let root: HTMLElement;
export function render(nodeElement: Element, rootElement?: HTMLElement) {
  rootElement && (root = rootElement);
  rerender(nodeElement);
  store.__on__?.(() => rerenderWrapper(nodeElement));
}

const rerenderWrapper = debounce(rerender, 0);

export function renderToText(nodeElement: Element): string {
  const nodes = renderElement(nodeElement);
  return renderVNodeToText(nodes);
}

function renderVNodeToText(vNode: RenderedVNode | RenderedVNode[]): string {
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

function attributeToString(attr: string | { [key: string]: string }): string {
  if (typeof attr == "string") {
    return attr;
  } else if (typeof attr === "function") {
    return "";
  }
  // style
  return Object.keys(attr)
    .map((key) => `${toKebabCaseFromSnakeCase(key)}: ${attr[key]};`)
    .join("");
}

function renderHtmlVNodeToText(vNode: RenderedVNode): string {
  let ref: string | null = null;
  if (typeof vNode.attributes?.ref === "function") {
    const el = {};
    Object.defineProperty(el, "innerHTML", {
      set(value: string) {
        ref = value;
      },
    });
    vNode.attributes.ref(el);
  }
  return `<${vNode.name} ${Object.keys(vNode.attributes || {})
    .map((key) => `${key}="${attributeToString(vNode.attributes![key])}"`)
    .join(" ")}>${ref ?? vNode.children.map(renderVNodeToText).join("")}</${
    vNode.name
  }>`;
}

let firstRender = true;
let _oldNode: RenderedVNodeWithHTMLElement;
function rerender(nodeElement: Element) {
  const renderedNode = renderElement(nodeElement);
  const completedVNode = createRootElement(renderedNode);
  _oldNode = completedVNode;
  if (firstRender) {
    if (!root) {
      root = document.createElement("div");
      document.body.appendChild(root);
    }
    root.innerHTML = "";
    root.appendChild(completedVNode.element as HTMLElement);
    firstRender = false;
  }
}

function recycleTextElement(node: RenderedVNode): RenderedVNodeWithHTMLElement {
  return {
    name: node.name,
    attributes: {},
    children: [],
    type: "text",
    element: document.createTextNode(node.name),
  };
}

function recycleArrayElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | undefined,
  parentElement?: HTMLElement
): RenderedVNodeWithHTMLElement {
  const elements: HTMLElement[] = [];
  const renderedVNodes: RenderedVNodeWithHTMLElement[] = [];
  // replace or remove child elements.
  if (oldNode?.type === "array") {
    (oldNode?.element as HTMLElement[])?.forEach((it) => {
      parentElement?.removeChild(it);
    });
  } else {
    oldNode?.element &&
      parentElement?.removeChild(oldNode?.element as HTMLElement);
  }
  oldNode && (oldNode.children = []);
  node.children.forEach((it) => {
    const child = createElement(it as RenderedVNode, undefined, parentElement);
    elements.push(child.element as HTMLElement);
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

function recycleNodeElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | undefined,
  parentElement?: HTMLElement
): RenderedVNodeWithHTMLElement {
  // standard node.
  // element
  let element: HTMLElement;
  if (oldNode?.element != null) {
    element = (oldNode as RenderedVNodeWithHTMLElementNode).element;
    // replace or remove child elements.
    if (!isEquals(node.name, oldNode.name)) {
      const newElement = document.createElement(node.name);
      if (oldNode.type === "array") {
        oldNode?.element?.forEach((it) => parentElement?.removeChild(it));
        parentElement?.append(newElement);
      } else {
        parentElement?.replaceChild(newElement, oldNode.element as HTMLElement);
      }
      oldNode.children = [];
      element = newElement;
    }
  } else {
    element = document.createElement(node.name);
  }

  // attributes
  const { attributes } = node;
  Object.keys(attributes || {}).forEach((key) => {
    const attribute = attributes![key];
    if (key === "style") {
      Object.keys(attribute).forEach(
        (key) => ((element.style as any)[key] = attribute[key])
      );
    } else if (key.startsWith("on")) {
      (element as any)[key] = attribute;
    } else if (typeof attribute === "boolean") {
      attribute ? element.setAttribute(key, "") : element.removeAttribute(key);
    } else if (key === "value" && typeof (element as any).value === "string") {
      (element as any).value = attribute;
    } else if (key === "ref" && typeof attribute === "function") {
      attribute(element);
    } else {
      element.setAttribute(key, attribute);
    }
  });

  // children
  const children: RenderedVNodeWithHTMLElement[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i] as RenderedVNode;
    const oldChild = oldNode?.children[i];
    const childVNode = createElement(child, oldChild, element);

    // エレメントをdocumentに追加する
    if (childVNode.type === "array") {
      // arrayの場合は常に再生成する(めんどいので。いつかkey対応するのでしょう)
      element.append(
        ...childVNode.children.map((it) => it.element as string | HTMLElement)
      );
    } else if (!oldChild?.element) {
      // arrayじゃない場合のエレメント追加処理
      element.append(childVNode.element);
    }

    if (oldChild?.type === "text") {
      // テキストノードの更新処理
      // テキストノード以外は、createElementの中でやっているからいらない
      element.replaceChild(
        childVNode.element as Text,
        element.childNodes.item(i)
      );
    }
    children.push(childVNode);
  }
  return { ...node, type: "html", element, children };
}

function createElement(
  node: RenderedVNode,
  oldNode: RenderedVNodeWithHTMLElement | undefined,
  parentElement?: HTMLElement
): RenderedVNodeWithHTMLElement {
  switch (node.type) {
    case "text":
      return recycleTextElement(node);
    case "array":
      return recycleArrayElement(node, oldNode, parentElement);
    default:
      return recycleNodeElement(node, oldNode, parentElement);
  }
}

function createRootElement(node: RenderedVNode): RenderedVNodeWithHTMLElement {
  return createElement(node, _oldNode, root);
}

type Attributes<T extends HTMLElement> =
  | {
      [U in keyof T]?: T[U];
    }
  | AttributesOverwrite<T>;

interface AttributesOverwrite<T extends HTMLElement> {
  children?: Array<RendereableElement | RendereableElement[]> | RendereableElement;
  class?: string;
  style?: Partial<CSSStyleDeclaration> | string;
  ref?: (el: T) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      a: Attributes<HTMLAnchorElement>;
      abbr: Attributes<HTMLDivElement>;
      acronym: Attributes<HTMLDivElement>;
      address: Attributes<HTMLDivElement>;
      area: Attributes<HTMLAreaElement>;
      article: Attributes<HTMLDivElement>;
      aside: Attributes<HTMLDivElement>;
      audio: Attributes<HTMLAudioElement>;
      b: Attributes<HTMLDivElement>;
      base: Attributes<HTMLBaseElement>;
      // basefont: Attributes<HTMLBaseFontElement>;
      bdi: Attributes<HTMLDivElement>;
      bdo: Attributes<HTMLDivElement>;
      big: Attributes<HTMLDivElement>;
      blockquote: Attributes<HTMLDivElement>;
      body: Attributes<HTMLBodyElement>;
      br: Attributes<HTMLBRElement>;
      button: Attributes<HTMLButtonElement>;
      canvas: Attributes<HTMLCanvasElement>;
      caption: Attributes<HTMLDivElement>;
      center: Attributes<HTMLDivElement>;
      cite: Attributes<HTMLDivElement>;
      code: Attributes<HTMLDivElement>;
      col: Attributes<HTMLDivElement>;
      colgroup: Attributes<HTMLDivElement>;
      data: Attributes<HTMLDataElement>;
      datalist: Attributes<HTMLDataListElement>;
      dd: Attributes<HTMLDivElement>;
      del: Attributes<HTMLDivElement>;
      details: Attributes<HTMLDivElement>;
      dfn: Attributes<HTMLDivElement>;
      dialog: Attributes<HTMLDialogElement>;
      dir: Attributes<HTMLDirectoryElement>;
      div: Attributes<HTMLDivElement>;
      dl: Attributes<HTMLDListElement>;
      dt: Attributes<HTMLDetailsElement>;
      em: Attributes<HTMLDivElement>;
      embed: Attributes<HTMLEmbedElement>;
      fieldset: Attributes<HTMLFieldSetElement>;
      figcaption: Attributes<HTMLDivElement>;
      figure: Attributes<HTMLDivElement>;
      font: Attributes<HTMLFontElement>;
      footer: Attributes<HTMLDivElement>;
      form: Attributes<HTMLFormElement>;
      frame: Attributes<HTMLFrameElement>;
      frameset: Attributes<HTMLFrameSetElement>;
      h1: Attributes<HTMLHeadingElement>;
      h2: Attributes<HTMLHeadingElement>;
      h3: Attributes<HTMLHeadingElement>;
      h4: Attributes<HTMLHeadingElement>;
      h5: Attributes<HTMLHeadingElement>;
      h6: Attributes<HTMLHeadingElement>;
      head: Attributes<HTMLHeadElement>;
      header: Attributes<HTMLDivElement>;
      hr: Attributes<HTMLHRElement>;
      html: Attributes<HTMLHtmlElement>;
      i: Attributes<HTMLDivElement>;
      iframe: Attributes<HTMLIFrameElement>;
      img: Attributes<HTMLImageElement>;
      input: Attributes<HTMLInputElement>;
      ins: Attributes<HTMLDivElement>;
      kbd: Attributes<HTMLDivElement>;
      label: Attributes<HTMLLabelElement>;
      legend: Attributes<HTMLLegendElement>;
      li: Attributes<HTMLLIElement>;
      link: Attributes<HTMLLinkElement>;
      main: Attributes<HTMLDivElement>;
      map: Attributes<HTMLMapElement>;
      mark: Attributes<HTMLDivElement>;
      meta: Attributes<HTMLMetaElement>;
      meter: Attributes<HTMLMeterElement>;
      nav: Attributes<HTMLDivElement>;
      noframes: Attributes<HTMLDivElement>;
      noscript: Attributes<HTMLDivElement>;
      object: Attributes<HTMLObjectElement>;
      ol: Attributes<HTMLOListElement>;
      optgroup: Attributes<HTMLOptGroupElement>;
      option: Attributes<HTMLOptionElement>;
      output: Attributes<HTMLOutputElement>;
      p: Attributes<HTMLParagraphElement>;
      param: Attributes<HTMLParamElement>;
      picture: Attributes<HTMLPictureElement>;
      pre: Attributes<HTMLPreElement>;
      progress: Attributes<HTMLProgressElement>;
      q: Attributes<HTMLQuoteElement>;
      rp: Attributes<HTMLDivElement>;
      rt: Attributes<HTMLDivElement>;
      ruby: Attributes<HTMLDivElement>;
      s: Attributes<HTMLDivElement>;
      samp: Attributes<HTMLDivElement>;
      script: Attributes<HTMLScriptElement>;
      section: Attributes<HTMLDivElement>;
      select: Attributes<HTMLSelectElement>;
      small: Attributes<HTMLDivElement>;
      source: Attributes<HTMLSourceElement>;
      span: Attributes<HTMLSpanElement>;
      strike: Attributes<HTMLDivElement>;
      strong: Attributes<HTMLDivElement>;
      style: Attributes<HTMLStyleElement>;
      sub: Attributes<HTMLDivElement>;
      summary: Attributes<HTMLDivElement>;
      sup: Attributes<HTMLDivElement>;
      svg: Attributes<SVGAElement & HTMLElement>;
      table: Attributes<HTMLTableElement>;
      tbody: Attributes<HTMLDivElement>;
      td: Attributes<HTMLTableDataCellElement>;
      template: Attributes<HTMLTemplateElement>;
      textarea: Attributes<HTMLTextAreaElement>;
      tfoot: Attributes<HTMLDivElement>;
      th: Attributes<HTMLTableHeaderCellElement>;
      thead: Attributes<HTMLTableHeaderCellElement>;
      time: Attributes<HTMLTimeElement>;
      title: Attributes<HTMLTitleElement>;
      tr: Attributes<HTMLTableRowElement>;
      track: Attributes<HTMLTrackElement>;
      tt: Attributes<HTMLDivElement>;
      u: Attributes<HTMLDivElement>;
      ul: Attributes<HTMLUListElement>;
      var: Attributes<HTMLDivElement>;
      video: Attributes<HTMLVideoElement>;
      wbr: Attributes<HTMLDivElement>;
    }
    type Element = VNode;
  }
}
