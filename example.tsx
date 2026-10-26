import { createEffect, createRoot, h, renderToText } from "./src/index.ts";
import type { Component } from "./src/types.ts";

const { render, createStore, getStore } = createRoot();

type Todo = { id: number; title: string; done: boolean };

type State = {
  count: number;
  unused: number;
  disabled: boolean;
  disabledClicks: number;
  which: "first" | "second";
  lastHandler: string;
  nodeCheck: string;

  attrsOn: boolean;
  bold: boolean;
  styleAsObject: boolean;

  text: string;
  checked: boolean;

  show: boolean;
  showMiddle: boolean;
  n: number;

  items: string[];
  seq: number;
  replaced: string;

  mixedItems: string[];
  mixedSeq: number;
  mixedText: string;

  blocks: string[];

  boldTag: boolean;
  asText: boolean;
  main: boolean;

  topClass: string;
  probe: string;

  refCount: number;
  refTag: string;
  refAsSection: boolean;

  user: { name: string; score: number };
  todos: Todo[];
  nextId: number;
};

function fresh(): State {
  return {
    count: 0,
    unused: 0,
    disabled: true,
    disabledClicks: 0,
    which: "first",
    lastHandler: "まだ",
    nodeCheck: "まだ",

    attrsOn: true,
    bold: true,
    styleAsObject: true,

    text: "hello",
    checked: false,

    show: true,
    showMiddle: true,
    n: 3,

    items: ["a", "b", "c"],
    seq: 3,
    replaced: "",

    mixedItems: ["a", "b", "c"],
    mixedSeq: 3,
    mixedText: "x",

    blocks: ["A", "B", "X", "Y", "Z"],

    boldTag: false,
    asText: false,
    main: false,

    topClass: "alpha",
    probe: "まだ読んでいない",

    refCount: 0,
    refTag: "",
    refAsSection: false,

    user: { name: "鉄", score: 0 },
    todos: [
      { id: 1, title: "属性", done: false },
      { id: 2, title: "配列", done: true },
    ],
    nextId: 3,
  };
}

const state = createStore(fresh());
const effect = createEffect();
const effectLog: string[] = [];
let countEl: HTMLElement | null = null;

const alphabet = "abcdefghijklmnopqrstuvwxyz";

function copyTodo(todo: Todo): Todo {
  // 既に wrap 済みのオブジェクトを配列へ入れ直すと、wrap が Proxy を再帰的に包んで落ちる。
  return { id: todo.id, title: todo.title, done: todo.done };
}

function takeToken(kind: "seq" | "mixedSeq") {
  const token = alphabet[state[kind]] ?? String(state[kind]);
  state[kind] += 1;
  return token;
}

function readRoot() {
  const app = document.getElementById("app");
  const root = document.querySelector("[data-z=root]");
  const appClass = app?.getAttribute("class") ?? "なし";
  const rootClass = root?.getAttribute("class") ?? "なし";
  state.probe = `#app=${appClass} / [data-z=root]=${rootClass}`;
}

function reset() {
  const next = fresh();
  effectLog.length = 0;
  (Object.keys(next) as (keyof State)[]).forEach((key) => {
    if (key === "refCount" || key === "refTag" || key === "refAsSection") return;
    state[key] = next[key] as never;
  });
  setTimeout(readRoot, 0);
}

function rememberCount(el: HTMLParagraphElement) {
  countEl = el;
}

function touch(el: HTMLElement) {
  state.refCount += 1;
  state.refTag = el.tagName;
  el.dataset.refCount = String(state.refCount);
  // 初回 mount は store の購読より先に ref が走るので、描画後にもう一度知らせる。
  setTimeout(() => {
    state.refCount = state.refCount;
  }, 0);
}

const nav = [
  { id: "text", label: "テキスト" },
  { id: "attrs", label: "属性" },
  { id: "style", label: "style" },
  { id: "form", label: "フォーム" },
  { id: "condition", label: "条件" },
  { id: "list", label: "配列" },
  { id: "siblings", label: "弟要素" },
  { id: "component", label: "コンポーネント" },
  { id: "replace", label: "置き換え" },
  { id: "ref", label: "ref" },
  { id: "effect", label: "effect" },
  { id: "ssr", label: "文字列化" },
  { id: "store", label: "store" },
  { id: "toplevel", label: "ルート" },
] as const;

const Panel: Component<{ id: string; title: string; note: string }> = ({ id, title, note }, children) => (
  <section id={id}>
    <h2>{title}</h2>
    <p class="note">{note}</p>
    {children}
  </section>
);

const Btn: Component<{ label: string; onclick: () => void; disabled?: boolean }> = ({
  label,
  onclick,
  disabled,
}) => (
  <button type="button" onclick={onclick} disabled={disabled ?? false}>
    {label}
  </button>
);

const Frame: Component<{ name: string }> = ({ name }, children) => (
  <div class="frame">
    <div>child component {name}</div>
    <div>{children}</div>
    <div>child component end</div>
  </div>
);

const Block: Component<{ n: string }> = ({ n }) => (
  <article>
    <h3>{n}</h3>
    {n === "X" ? [<p>1</p>, <p>2</p>] : []}
  </article>
);

const css = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eceae4; color: #1e1c19; font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; }
  #app { max-width: 920px; margin: 0 auto; padding: 8px 20px 72px; }
  #app.alpha { box-shadow: inset 0 0 0 3px #a33b24; }
  #app.beta { box-shadow: inset 0 0 0 3px #2f6f4e; }
  [data-z="root"].alpha { outline: 3px solid #a33b24; }
  [data-z="root"].beta { outline: 3px solid #2f6f4e; }
  header { position: sticky; top: 0; z-index: 1; background: rgba(236, 234, 228, 0.94); padding: 12px 0 10px; }
  h1 { margin: 0; font-size: 28px; letter-spacing: -0.03em; }
  h2 { margin: 0 0 4px; font-size: 15px; }
  section { scroll-margin-top: 132px; background: #fbfaf7; border: 1px solid #ddd6cc; border-radius: 12px; padding: 14px 16px 16px; margin: 12px 0; }
  .note { margin: 0 0 10px; color: #6b645c; font-size: 13px; }
  .row, nav, .meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .meta, nav { margin-top: 10px; }
  nav a { color: inherit; font-size: 13px; }
  button, input[type="text"] { font: inherit; border-radius: 6px; }
  button { background: #243044; color: #f4f1ea; border: 0; padding: 6px 10px; cursor: pointer; }
  button:disabled { opacity: 0.45; cursor: default; }
  button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid #a33b24; outline-offset: 2px; }
  input[type="text"] { padding: 6px 8px; border: 1px solid #cfc4b0; background: white; }
  .pill { background: #efe7d2; border-radius: 999px; padding: 4px 10px; }
  #swatch, #attr-box, #extra-attrs, .frame, article, aside, pre, dd { border: 1px solid #ddd6cc; }
  #swatch, #attr-box, #extra-attrs { display: inline-block; padding: 8px 12px; background: white; }
  .frame { border-left: 3px solid #3f4a3c; padding: 8px 10px; margin: 8px 0; }
  ul.flat, .blocks, .line, #mixed, #mixed-em { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  ul.flat { list-style: none; padding: 0; margin: 8px 0; }
  ul.flat li, .line span, .line strong, .line b, #mixed span, #mixed-em span, #shrink i {
    background: white; border: 1px solid #ddd6cc; border-radius: 4px; padding: 2px 8px;
  }
  #shrink i { font-style: normal; }
  em { background: #f3d6cf; padding: 2px 6px; }
  article, aside { background: white; border-radius: 8px; padding: 6px 8px; }
  article h3, article p { margin: 0; font-size: 14px; }
  dl.grid { display: grid; grid-template-columns: 140px 1fr; gap: 4px 12px; margin: 0; }
  dt { color: #6b645c; }
  dd { margin: 0; min-height: 1.5em; background: white; border-style: dashed; padding: 0 8px; }
  pre { background: #1c1915; color: #f4f1ea; border-radius: 8px; padding: 10px 12px; overflow: auto; white-space: pre-wrap; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  ul.todos { list-style: none; padding: 0; margin: 8px 0; }
  ul.todos li { display: flex; gap: 8px; align-items: center; margin: 4px 0; }
  #replace-main main, #replace-main > div { padding: 8px; background: white; border: 1px solid #ddd6cc; }
`;

const App: Component = () => {
  effect(() => {
    document.title = `zheleznaya (${state.count})`;
    effectLog.push(`count → ${state.count}`);
  }, [state.count]);

  const ssr = renderToText(
    <div id="ssr-root" class={state.bold ? "bold" : "plain"} style={{ color: state.bold ? "tomato" : "steelblue" }}>
      <span>{state.count}</span>
      {state.show && <b>{state.text}</b>}
      {false}
      {true}
      <div ref={(el) => { el.innerHTML = "<i>ref</i>"; }}>gone</div>
    </div>,
  );

  return (
    <div id="app" class={state.topClass}>
      <style>{css}</style>
      <header>
        <h1>zheleznaya</h1>
        <p class="note">
          操作するか、コンソールの state を書き換えて確認する。getStore() は{" "}
          {getStore() === state ? "同じオブジェクト" : "別のオブジェクト"}。
        </p>
        <div class="meta">
          <span>count <b>{state.count}</b></span>
          <span>text <b>{state.text}</b></span>
          <span>items <b>{state.items.join(" ")}</b></span>
          <Btn label="リセット" onclick={reset} />
        </div>
        <nav>
          {nav.map((it) => h("a", { href: `#${it.id}` }, it.label))}
        </nav>
      </header>

      <Panel id="text" title="テキストとイベント" note="count も unused も、この p の文字だけが変わる。">
        <p id="count" ref={rememberCount}>
          count は {state.count} / unused は {state.unused}
        </p>
        <div class="row">
          <Btn label="count + 1" onclick={() => { state.count += 1; }} />
          <Btn label="count - 1" onclick={() => { state.count -= 1; }} />
          <Btn label="unused + 1" onclick={() => { state.unused += 1; }} />
          <Btn
            label="p が同じノードか"
            onclick={() => {
              state.nodeCheck = document.getElementById("count") === countEl ? "同じノード" : "別のノード";
            }}
          />
          <span>{state.nodeCheck}</span>
        </div>
        <div class="row">
          <Btn
            label="今のハンドラを呼ぶ"
            onclick={state.which === "second"
              ? () => { state.lastHandler = "second"; }
              : () => { state.lastHandler = "first"; }}
          />
          <Btn
            label="ハンドラを入れ替える"
            onclick={() => { state.which = state.which === "first" ? "second" : "first"; }}
          />
        </div>
        <p>最後に呼ばれたハンドラは {state.lastHandler}。選択中は {state.which}。</p>
      </Panel>

      <Panel id="attrs" title="属性" note="class と title の付け外し、boolean の disabled、aria と data 属性。">
        <div id="attr-box" {...(state.attrsOn ? { class: "pill", title: "付いている" } : {})}>
          title / class
        </div>
        {h(
          "div",
          {
            id: "extra-attrs",
            ...(state.attrsOn
              ? { class: "pill", "aria-label": "x", "data-count": String(state.count) }
              : {}),
          },
          "aria / data",
        )}
        <div class="row">
          <Btn label={state.attrsOn ? "属性を外す" : "属性を付ける"} onclick={() => { state.attrsOn = !state.attrsOn; }} />
          <span>class は {state.attrsOn ? "pill" : "なし"}、data-count は {state.count}</span>
        </div>
        <div class="row">
          <Btn
            label={`クリック (${state.disabledClicks})`}
            disabled={state.disabled}
            onclick={() => { state.disabledClicks += 1; }}
          />
          <Btn
            label={state.disabled ? "disabled を外す" : "disabled を付ける"}
            onclick={() => { state.disabled = !state.disabled; }}
          />
        </div>
      </Panel>

      <Panel id="style" title="style" note="オブジェクトと文字列。太字をやめると font-weight の指定が消える。">
        <div
          id="swatch"
          style={state.styleAsObject
            ? state.bold
              ? { color: "tomato", fontWeight: "bold" }
              : { color: "tomato" }
            : "color: steelblue; font-weight: 400;"}
        >
          style の見本
        </div>
        <div class="row">
          <Btn label={state.bold ? "太字をやめる" : "太字にする"} onclick={() => { state.bold = !state.bold; }} />
          <Btn
            label={state.styleAsObject ? "文字列にする" : "オブジェクトにする"}
            onclick={() => { state.styleAsObject = !state.styleAsObject; }}
          />
        </div>
      </Panel>

      <Panel id="form" title="フォーム" note="value と checked は属性とプロパティの両方に書き戻す。">
        <div class="row">
          <input
            type="text"
            value={state.text}
            oninput={(e) => { state.text = (e.target as HTMLInputElement).value; }}
          />
          <Btn label="末尾に !" onclick={() => { state.text += "!"; }} />
        </div>
        <label class="row">
          <input
            type="checkbox"
            checked={state.checked}
            onchange={(e) => { state.checked = (e.target as HTMLInputElement).checked; }}
          />
          <span>checked は {state.checked ? "true" : "false"}</span>
        </label>
      </Panel>

      <Panel id="condition" title="条件" note="0 は表示する。false / true / null / undefined は空。空文字に切り替えると要素が消える。">
        <dl class="grid">
          <dt>0</dt>
          <dd id="show-zero">{0}</dd>
          <dt>false</dt>
          <dd id="show-false">{false}</dd>
          <dt>true</dt>
          <dd id="show-true">{true}</dd>
          <dt>null</dt>
          <dd id="show-null">{null}</dd>
          <dt>undefined</dt>
          <dd id="show-undefined">{undefined}</dd>
          <dt>show && b</dt>
          <dd id="show-and">{state.show && <b>shown</b>}</dd>
        </dl>
        <div class="row">
          <Btn label={state.show ? "shown を隠す" : "shown を出す"} onclick={() => { state.show = !state.show; }} />
        </div>
        <div id="shrink">
          {state.n >= 1 ? <i>1</i> : ""}
          {state.n >= 2 ? <i>2</i> : ""}
          {state.n >= 3 ? <i>3</i> : ""}
        </div>
        <div class="row">
          <Btn label="n = 1" onclick={() => { state.n = 1; }} />
          <Btn label="n = 2" onclick={() => { state.n = 2; }} />
          <Btn label="n = 3" onclick={() => { state.n = 3; }} />
          <span>n は {state.n}</span>
        </div>
        <div id="middle" class="line">
          <span>before</span>
          {state.showMiddle ? <span>target</span> : []}
          <span>after</span>
        </div>
        <Btn
          label={state.showMiddle ? "真ん中を外す" : "真ん中を戻す"}
          onclick={() => { state.showMiddle = !state.showMiddle; }}
        />
      </Panel>

      <Panel id="list" title="配列" note="push / pop / shift / unshift / splice と、複数件の削除、子の数が違う要素の削除。">
        <ul id="items" class="flat">
          {state.items.map((k) => <li>{k}</li>)}
        </ul>
        <p class="note">state 上は {state.items.join("")}</p>
        <div class="row">
          <Btn label="末尾に足す" onclick={() => { state.items.push(takeToken("seq")); }} />
          <Btn label="先頭に足す" onclick={() => { state.items.unshift(takeToken("seq")); }} />
          <Btn label="末尾を消す" disabled={state.items.length === 0} onclick={() => { state.items.pop(); }} />
          <Btn label="先頭を消す" disabled={state.items.length === 0} onclick={() => { state.items.shift(); }} />
          <Btn label="2番目を消す" disabled={state.items.length < 2} onclick={() => { state.items.splice(1, 1); }} />
          <Btn label="先頭だけ残す" onclick={() => { state.items = state.items.slice(0, 1); }} />
          <Btn label="a c d にする" onclick={() => { state.items = ["a", "c", "d"]; }} />
        </div>
        <p class="note">key 付き。差分は並び順で見ている。</p>
        <ul id="keyed" class="flat">
          {state.items.map((k) => h("li", { key: k }, k))}
        </ul>
        <div id="blocks" class="blocks">
          {[...state.blocks.map((n) => <Block n={n} />), <aside>add</aside>]}
        </div>
        <div class="row">
          <Btn label="X を外す" onclick={() => { state.blocks = state.blocks.filter((n) => n !== "X"); }} />
          <Btn label="ブロックを戻す" onclick={() => { state.blocks = ["A", "B", "X", "Y", "Z"]; }} />
        </div>
      </Panel>

      <Panel id="siblings" title="配列と弟要素" note="配列の後ろにテキストと em がある。両方とも state の並びに揃う。">
        <div id="mixed">
          {state.mixedItems.map((it) => <span>{it}</span>)}
          {state.mixedText}
        </div>
        <div id="mixed-em">
          {state.mixedItems.map((it) => <span>{it}</span>)}
          <em>{state.mixedText}</em>
        </div>
        <p class="note">state 上は {state.mixedItems.join("")}{state.mixedText}</p>
        <div class="row">
          <Btn label="末尾に足す" onclick={() => { state.mixedItems.push(takeToken("mixedSeq")); }} />
          <Btn label="末尾を消す" disabled={state.mixedItems.length === 0} onclick={() => { state.mixedItems.pop(); }} />
          <Btn label="a c d にする" onclick={() => { state.mixedItems = ["a", "c", "d"]; }} />
          <Btn label="文字を y にする" onclick={() => { state.mixedText = "y"; }} />
          <Btn label="文字を x に戻す" onclick={() => { state.mixedText = "x"; }} />
        </div>
      </Panel>

      <Panel id="component" title="コンポーネント" note="props と children。配列を children に渡しても展開される。">
        <Frame name="props.name">
          Hello <div>world</div>
        </Frame>
        <Frame name="array children">
          <ul class="flat">
            {["foo", "bar", "hoge"].map((key) => <li>{key}</li>)}
          </ul>
        </Frame>
      </Panel>

      <Panel id="replace" title="置き換え" note="タグが変わる、テキストになる、子の数も一緒に変わる。兄弟は残る。">
        <div id="replace-tag" class="line">
          <span>before</span>
          {state.boldTag ? <strong>target</strong> : <span>target</span>}
          <span>after</span>
        </div>
        <Btn
          label={state.boldTag ? "span に戻す" : "strong にする"}
          onclick={() => { state.boldTag = !state.boldTag; }}
        />
        <div id="replace-text" class="line">
          <span>before</span>
          {state.asText ? "plain" : <span>target</span>}
          <span>after</span>
        </div>
        <Btn
          label={state.asText ? "要素に戻す" : "テキストにする"}
          onclick={() => { state.asText = !state.asText; }}
        />
        <div id="replace-main">
          {state.main ? (
            <main>
              <p>a</p>
            </main>
          ) : (
            <div>
              <p>a</p>
              <p>b</p>
            </div>
          )}
        </div>
        <Btn
          label={state.main ? "div に戻す" : "main にする"}
          onclick={() => { state.main = !state.main; }}
        />
        <div id="replace-item" class="line">
          <span>before</span>
          {state.items.map((k) => (state.replaced === k ? <b>{k}</b> : <span>{k}</span>))}
          <span>after</span>
        </div>
        <div class="row">
          {state.items.map((k) => (
            <Btn
              label={state.replaced === k ? `${k} を span に` : `${k} を b に`}
              onclick={() => { state.replaced = state.replaced === k ? "" : k; }}
            />
          ))}
        </div>
      </Panel>

      <Panel id="ref" title="ref" note="要素を作ったときだけ呼ばれる。属性の更新では増えない。">
        <div class="row">
          {state.refAsSection
            ? <section id="ref-target" ref={touch}>section</section>
            : <div id="ref-target" ref={touch}>div</div>}
          <span>{state.refTag} / {state.refCount} 回</span>
          <Btn
            label="要素を作り直す"
            onclick={() => { state.refAsSection = !state.refAsSection; }}
          />
          <Btn label="count + 1" onclick={() => { state.count += 1; }} />
        </div>
      </Panel>

      <Panel id="effect" title="createEffect" note="count が変わったときだけ走る。unused ではログもタイトルも変わらない。">
        <pre>{effectLog.length === 0 ? "（まだ無い）" : effectLog.slice(-8).join("\n")}</pre>
        <p class="note">document.title は zheleznaya ({state.count})</p>
      </Panel>

      <Panel id="ssr" title="renderToText" note="関数の属性は落ちる。ref には innerHTML を持つオブジェクトが渡り、中身を書き換える。">
        <pre>{ssr}</pre>
      </Panel>

      <Panel id="store" title="ネストした store" note="オブジェクトのプロパティ更新と、配列を代入し直す追加・削除。">
        <div class="row">
          <input
            type="text"
            value={state.user.name}
            oninput={(e) => { state.user.name = (e.target as HTMLInputElement).value; }}
          />
          <Btn label="score + 1" onclick={() => { state.user.score += 1; }} />
          <span>{state.user.name} / {state.user.score}</span>
        </div>
        <ul class="todos">
          {state.todos.map((todo) => (
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onchange={(e) => { todo.done = (e.target as HTMLInputElement).checked; }}
                />
                <span>{todo.title}</span>
              </label>
              <Btn
                label="消す"
                onclick={() => {
                  state.todos = state.todos.filter((it) => it.id !== todo.id).map(copyTodo);
                }}
              />
            </li>
          ))}
        </ul>
        <Btn
          label="足す"
          onclick={() => {
            const id = state.nextId;
            state.nextId = id + 1;
            state.todos = [...state.todos.map(copyTodo), { id, title: `項目 ${id}`, done: false }];
          }}
        />
      </Panel>

      <Panel id="toplevel" title="一番外側の属性" note="内側の枠が #app、外側の線が data-z=root。class を切り替えて、どちらに付いたかを読む。">
        <p>state.topClass は {state.topClass}</p>
        <div class="row">
          <Btn
            label="class を切り替える"
            onclick={() => {
              state.topClass = state.topClass === "alpha" ? "beta" : "alpha";
              setTimeout(readRoot, 0);
            }}
          />
          <Btn label="今の class を読む" onclick={readRoot} />
        </div>
        <p><code>{state.probe}</code></p>
      </Panel>
    </div>
  );
};

render(<App />);
(globalThis as unknown as { state: State }).state = state;
