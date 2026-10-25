export type Component<P = any> = (props: P, children: Array<Child | Child[]>) => Element;
/**
 * h関数が生成する、VNodeになる前の木構造。これをレンダリングするとVNodeになる。
 */
export interface ElementNode {
    name: string;
    type: "html";
    attributes: {
        [key: string]: any;
    } | null;
    children: Array<Child | Child[]>;
}
/**
 * ユーザーが書いたコンポーネントをラップしたもの。この関数を実行すると、Elementが生成される。
 */
export type LazyElement = () => Element;
/**
 * ElementNode, LazyElementをまとめたもの。
 */
export type Element = ElementNode | LazyElement;
export type Child = Element | string | number | boolean | null | undefined;
export type VNode = NullNode | TextVNode | HtmlVNode | ArrayVNode;
export type NullNode = {
    type: "null";
};
export type TextVNode = {
    type: "text";
    /**
     * テキストの文字列
     */
    name: string;
};
export type HtmlVNode = {
    type: "html";
    /**
     * 要素のタグ名
     */
    name: string;
    attributes: {
        [key: string]: any;
    } | null;
    children: VNode[];
};
export type ArrayVNode = {
    type: "array";
    children: VNode[];
};
type Attributes<T extends HTMLElement> = {
    [U in keyof T]?: T[U];
} | AttributesOverwrite<T>;
interface AttributesOverwrite<T extends HTMLElement> {
    children?: Array<Element | Element[]> | Element;
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
        type Element = ElementNode | LazyElement;
    }
}
export {};
//# sourceMappingURL=types.d.ts.map