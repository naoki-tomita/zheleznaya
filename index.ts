// import { wrap } from "./Settable";
// import { isEquals } from "./Equals";
// import { toKebabCaseFromSnakeCase } from "./Utils";

interface Attribute {
  [key: string]: any;
}

interface RawVNode {
  name: string;
  attributes: Attribute;
  children: RawVNode[];
}

type Component = (attributes: Attribute, children: Array<RawVNode | string>) => any;

export function h(
  name: string | Component,
  attributes: Attribute,
  ...children: Array<RawVNode | string>
): RawVNode {
  return typeof name === "string"
    ? { name, attributes: attributes ?? {}, children: children ?? [] }
    : name(attributes, children);
}

export function render(vnode: RawVNode) {
  const elements = createElement(vnode);
  document.body.append(elements);
}

function createElement(node: RawVNode | string): HTMLElement | Text {
  if (typeof node === "string") {
    return document.createTextNode(node);
  }
  const { name, attributes, children } = node;
  const el = document.createElement(name);
  Object.entries(attributes).map(([key, value]) => {
    el.setAttribute(key, value);
  });
  const childEls = children.map(createElement);
  el.append(...childEls);
  return el;
}

type Attributes<T extends HTMLElement> = {
  [U in keyof T]?: T[U];
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      a: Attributes<HTMLAnchorElement>;
      abbr: Attributes<HTMLDivElement>;
      acronym: Attributes<HTMLDivElement>;
      address: Attributes<HTMLDivElement>;
      applet: Attributes<HTMLAppletElement>;
      area: Attributes<HTMLAreaElement>;
      article: Attributes<HTMLDivElement>;
      aside: Attributes<HTMLDivElement>;
      audio: Attributes<HTMLAudioElement>;
      b: Attributes<HTMLDivElement>;
      base: Attributes<HTMLBaseElement>;
      basefont: Attributes<HTMLBaseFontElement>;
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
  }
}
