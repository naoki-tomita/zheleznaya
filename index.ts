
export function createApp() {
  return {}
}

type Component = (props: any, children: Array<VNode | string>) => VNode;

export function h(element: Component | string, attributes: any | null, ...children: Array<VNode | string>): VNode {
  return typeof element === "string"
    ? { name: element, attributes: attributes || {}, children }
    : element(attributes, children);
}

export function createStore() {

}

interface VNode {
  name: string;
  attributes: {[key: string]: any} | null;
  children: Array<VNode | string>;
}

interface Style {
  [key: string]: number | string;
}

function toStyleString(styles: Style) {
  return Object.keys(styles).map(key => `${key}=${styles[key]}`).join("; ")
}

function createElement({ name, attributes, children }: VNode) {
  const el = Object.keys(attributes || {}).reduce((el, key) => {
    const attribute = attributes[key];
    if (key === "style") {
      el.setAttribute(key, toStyleString(attributes[key]))
    } else if (typeof attribute === "function") {
      el.addEventListener(key.replace("on", ""), attribute);
    } else {
      el.setAttribute(key, attributes[key]);
    }
    return el;
  }, document.createElement(name));
  (children || []).forEach(it => el.append(typeof it === "string" ? it: createElement(it)));
  return el;
}

export function render(el: Component) {
  const vNodes = el({}, []);
  document.body.appendChild(createElement(vNodes));
}

interface AttributesOverwrite {
  children?: Array<VNode | string>;
  class?: string;
}

type Attributes<T extends HTMLElement> = {
  [U in keyof T]?: T[U];
} & AttributesOverwrite;

declare global {
  namespace JSX {
      interface IntrinsicElements {
        a: Attributes<HTMLAnchorElement>;
        button: Attributes<HTMLButtonElement>;
        br: Attributes<HTMLBRElement>;
        canvas: Attributes<HTMLCanvasElement>;
        div: Attributes<HTMLDivElement>;
        h1: Attributes<HTMLHeadElement>;
        h2: Attributes<HTMLHeadElement>;
        h3: Attributes<HTMLHeadElement>;
        h4: Attributes<HTMLHeadElement>;
        h5: Attributes<HTMLHeadElement>;
        h6: Attributes<HTMLHeadElement>;
        hr: Attributes<HTMLHRElement>;
        img: Attributes<HTMLImageElement>;
        input: Attributes<HTMLInputElement>;
        li: Attributes<HTMLLIElement>;
        p: Attributes<HTMLParagraphElement>;
        pre: Attributes<HTMLPreElement>;
        select: Attributes<HTMLSelectElement>;
        span: Attributes<HTMLSpanElement>;
        ul: Attributes<HTMLUListElement>;
      }
  }
}
