// テスト専用のヘルパー。ビルド・npm 公開の対象からは外している。
import { afterEach, beforeEach, vi } from "vitest";

/**
 * 各テストの前に DOM を空にし、タイマーをフェイクにする。
 * store の変更による再描画は setTimeout で debounce されているので、flushRender で同期的に流す。
 */
export function setupDom() {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
}

/**
 * 待っている再描画を実行する。再描画中の例外はそのまま投げられる。
 */
export function flushRender() {
  vi.runAllTimers();
}

/**
 * 要素の直下の子ノードを並べた配列を返す。
 */
export function childNodesOf(selector: string): ChildNode[] {
  return [...document.querySelector(selector)!.childNodes];
}
