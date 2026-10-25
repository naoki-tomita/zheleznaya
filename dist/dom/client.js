import { debounce } from "../utils/Debounce.js";
import { isEquals } from "../utils/Equals.js";
import { wrap } from "../utils/Settable.js";
import { renderElement } from "../VNode.js";
function shouldRender(lastVNode, vnode) {
    return !lastVNode || !isEquals(lastVNode, vnode);
}
function diffNode(a, b, path) {
    if (a.type !== b.type) {
        // タイプが違う
        return [{ op: "replace", path, vnode: b }];
    }
    if (a.type === "null" && b.type === "null") {
        // null
        return [];
    }
    if (a.type === "text" && b.type === "text") {
        // テキストノードでテキストが違う
        if (a.name !== b.name) {
            return [{ op: "replace", path, vnode: b }];
        }
    }
    if (a.type === "html" && b.type === "html") {
        // HTMLノード
        if (a.name !== b.name) {
            // タグが違う
            return [{ op: "replace", path, vnode: b }];
        }
        // attributesの比較
        const aKeys = Object.keys(a.attributes ?? {});
        const bKeys = Object.keys(b.attributes ?? {});
        const keys = [...new Set([...aKeys, ...bKeys])].filter((it) => !it.startsWith("__"));
        const unset = aKeys.filter((it) => !bKeys.includes(it));
        const set = bKeys
            .filter((it) => !aKeys.includes(it))
            .reduce((acc, k) => ({ ...acc, [k]: b.attributes[k] }), {});
        for (const key of keys) {
            const aVal = a.attributes?.[key];
            const bVal = b.attributes?.[key];
            if (key === "style") {
                // スタイル系なら、オブジェクトを見る。
                if (!isEquals(aVal, bVal)) {
                    set[key] = bVal;
                }
                continue;
            }
            if (aVal !== bVal) {
                set[key] = bVal;
            }
        }
        if (unset.length !== 0 || Object.keys(set).length !== 0) {
            return [{ op: "props", path, unset, set }];
        }
    }
    // arrayの場合は、子要素の差分だけを見ればいい
    return [];
}
function diffArray(lastVNode, vnode, path) {
    const result = [];
    const hasLastChildrenKey = lastVNode.children.every((it) => it.attributes?.key);
    const hasCurrentChildrenKey = vnode.children.every((it) => it.attributes?.key);
    if (hasLastChildrenKey && hasCurrentChildrenKey && false) {
        // keyはWIP
        const lastObjectByKey = lastVNode.children.reduce((acc, it) => ({ ...acc, [it.attributes.key]: it }), {});
        const currentObjectByKey = lastVNode.children.reduce((acc, it) => ({ ...acc, [it.attributes.key]: it }), {});
        const lastKeys = Object.keys(lastObjectByKey);
        const currentKeys = Object.keys(currentObjectByKey);
        const diffTargets = [...new Set([...currentKeys, ...lastKeys])].filter((it) => lastKeys.includes(it) && currentKeys.includes(it));
        diffTargets.reduce((acc, key) => [
            ...acc,
            ...diff(lastObjectByKey[key], currentObjectByKey[key], path),
        ], []);
    }
    else {
        console.warn("ArrayNode should have key.");
        const newPath = [...path];
        const currentIndex = newPath.pop() ?? 0;
        for (let i = 0; i < Math.max(lastVNode.children.length, vnode.children.length); i++) {
            result.push(...diff(lastVNode.children[i], vnode.children[i], [
                ...newPath,
                currentIndex + i,
            ]));
        }
    }
    return result;
}
export function diff(lastVNode, vnode, path = []) {
    if (!vnode) {
        return [{ op: "unmount", path }];
    }
    if (!lastVNode) {
        return [{ op: "mount", vnode, path }];
    }
    const result = [];
    result.push(...diffNode(lastVNode, vnode, path));
    if (lastVNode.type !== vnode.type) {
        // typeが違うなら、子要素全部作り直しなので、diffはここでおしまいでよい
        return result;
    }
    if (lastVNode.type === "array" && vnode.type === "array") {
        result.push(...diffArray(lastVNode, vnode, path));
    }
    else if (lastVNode.type === "html" && vnode.type === "html") {
        for (let i = 0; i < Math.max(lastVNode.children.length, vnode.children.length); i++) {
            result.push(...diff(lastVNode.children[i], vnode.children[i], [...path, i]));
        }
    }
    return result;
}
function updateAttributes(target, set) {
    for (const [key, value] of Object.entries(set ?? {})) {
        if (key === "style") {
            for (const [styleKey, styleValue] of Object.entries(value)) {
                target.style[styleKey] = styleValue;
            }
        }
        else if (key.startsWith("on")) {
            if (typeof value === "function") {
                target[key.toLowerCase()] = value;
            }
        }
        else if (key === "ref") {
            continue; // refは後で処理する
        }
        else if ((key === "value" || key === "checked") &&
            target.tagName === "INPUT") {
            if (key === "value") {
                target.setAttribute("value", value);
                target.value = value;
            }
            else if (key === "checked") {
                if (typeof value === "boolean") {
                    value ? target.setAttribute(key, "") : target.removeAttribute(key);
                }
                target.checked = value;
            }
        }
        else {
            if (typeof value === "boolean") {
                value ? target.setAttribute(key, "") : target.removeAttribute(key);
            }
            else {
                target.setAttribute(key, value);
            }
        }
    }
}
function createHtmlElement(vnode) {
    const target = document.createElement(vnode.name);
    target.append(...vnode.children.map(createElement).flat());
    updateAttributes(target, vnode.attributes ?? {});
    if ("ref" in (vnode.attributes ?? {})) {
        vnode.attributes.ref(target);
    }
    return target;
}
function createArrayElement(vnode) {
    const targets = vnode.children.map(createElement);
    return targets.flat();
}
function createElement(vnode) {
    switch (vnode.type) {
        case "text":
            return [document.createTextNode(vnode.name)];
        case "html":
            return [createHtmlElement(vnode)];
        case "array":
            return createArrayElement(vnode);
        case "null":
            return [];
    }
}
function replace(root, vnode, path) {
    const el = createElement(vnode);
    const before = find(root, path);
    before.replaceWith(...el);
}
function mount(root, vnode, path) {
    const el = createElement(vnode);
    if (!path) {
        root.append(...el);
    }
    else {
        const parentPath = path.slice(0, -1);
        const index = path.pop() ?? 0;
        const parent = find(root, parentPath);
        if (parent.childNodes.length === index) {
            el.forEach((it) => parent.appendChild(it));
        }
        else if (parent.childNodes.length > index + 1) {
            parent.childNodes[index].before(...el);
        }
    }
}
function find(root, path) {
    // 空ならルートエレメント。
    if (path.length === 0) {
        return root;
    }
    // rootは管理外のdomノード。これの子要素が本当のルートノード。
    return path.reduce((acc, index) => acc.childNodes.item(index), root.childNodes.item(0));
}
function unmount(root, path) {
    const el = find(root, path);
    el.remove();
}
function updateProps(root, path, set, _unset) {
    const el = find(root, path);
    updateAttributes(el, set);
}
function patch(root, patchOperations) {
    for (const o of patchOperations) {
        switch (o.op) {
            case "mount":
                mount(root, o.vnode, o.path);
                break;
            case "unmount":
                unmount(root, o.path);
                break;
            case "replace":
                replace(root, o.vnode, o.path);
                break;
            case "props":
                updateProps(root, o.path, o.set, o.unset);
                break;
        }
    }
}
export function createRoot(rootElement) {
    let store = {};
    function createStore(initialValue) {
        return (store = wrap(initialValue));
    }
    function getStore() {
        return store;
    }
    const rerenderWrapper = debounce(render, 0);
    function createRootHtmlElement() {
        const root = document.createElement("div");
        root.dataset["z"] = "root";
        document.body.appendChild(root);
        return root;
    }
    let root;
    function runFirstRender(nodeElement) {
        root = rootElement ?? createRootHtmlElement();
        root.innerHTML = "";
        render(nodeElement);
        store.__on__?.(() => rerenderWrapper(nodeElement));
    }
    let lastVNode = null;
    function render(nodeElement) {
        const vnode = renderElement(nodeElement);
        if (!shouldRender(lastVNode, vnode)) {
            return;
        }
        const result = diff(lastVNode, vnode);
        patch(root, result);
        lastVNode = vnode;
    }
    return {
        render: runFirstRender,
        createStore,
        getStore,
    };
}
//# sourceMappingURL=client.js.map