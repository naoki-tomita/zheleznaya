export declare type Component<P = any> = (props: P, children: Array<VNode | string>) => VNode;
declare type Element = VNode | (() => VNode);
declare type RendereableElement = Element | string | number | boolean;
interface VNode {
    name: string;
    type: "text" | "html" | "array";
    attributes: {
        [key: string]: any;
    } | null;
    children: Array<RendereableElement | RendereableElement[]>;
}
export declare function h(name: Component | string, attributes: any | null, ...children: Array<VNode | string>): Element;
export declare function createStore<T>(initialValue: T): T;
export declare function getStore<T>(): T;
export declare function render(nodeElement: Element, rootElement?: HTMLElement): void;
export declare function renderToText(nodeElement: Element): string;
declare type Attributes<T extends HTMLElement> = {
    [U in keyof T]?: T[U];
} | AttributesOverwrite;
interface AttributesOverwrite {
    children?: Array<VNode | string>;
    class?: string;
    style?: Partial<CSSStyleDeclaration> | string;
}
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
            label: Attributes<HTMLLabelElement>;
            li: Attributes<HTMLLIElement>;
            p: Attributes<HTMLParagraphElement>;
            pre: Attributes<HTMLPreElement>;
            select: Attributes<HTMLSelectElement>;
            span: Attributes<HTMLSpanElement>;
            textarea: Attributes<HTMLTextAreaElement>;
            ul: Attributes<HTMLUListElement>;
        }
    }
}
export {};
//# sourceMappingURL=index.d.ts.map