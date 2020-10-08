import marked from "marked";
import { createStore } from "zheleznaya";
import { onRouteChange } from "./Router";

export const store = createStore<{
  path: string;
  html: string;
}>({
  path: location.href.replace("#", ""),
  html: "",
});
onRouteChange((path) => {
  href(path);
  scrollTop();
});
fetchMarkdown(`${store.path}.md`);
export function href(path: string) {
  store.path = path;
  fetchMarkdown(`${path}.md`);
}

function scrollTop() {
  setTimeout(() => window.scrollTo({ behavior: "auto", left: 0, top: 0 }), 100);
}

async function markedAsync(md: string): Promise<string> {
  return new Promise((ok) => marked(md, (_, d) => ok(d)));
}

export async function fetchMarkdown(path: string): Promise<void> {
  const markdown = await fetch(`../articles/${path}`).then((it) =>
    it.ok ? it.text() : ""
  );
  if (!markdown) {
    return fetchMarkdown("index.md");
  }
  store.html = await markedAsync(markdown);
  setTimeout(() => (window as any).Prism.highlightAll(), 50);
}
