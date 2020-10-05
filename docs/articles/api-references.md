## api references
T.B.D

### `render`

Rendering component.

```ts
function render(element: Element, rootElement: HTMLElement): void;
```

> * element: Zheleznaya component element.
> * rootElement: HTMLElement for deploying zheleznaya app. If not specified then zheleznaya creates `body > div` element and deploy app.


### `h`

Hyperscript function for jsx. Like `React.createElement` function.

You don't need to write hyperscript if you are using jsx.

```ts
function h(name: Component | string, attributes: any | null, ...children: Array<Node, string>): Element
```

See: [`React.createElement`](https://github.com/hyperhype/hyperscript)

### `createState`, `getState`

Create store instance or get store instance.

The instance is only one. You cannot have more than one instance.

Store instance is wrapped by reactive object. But you can use like standard js object. When reactive object's property have been changed, Zheleznaya perform rerendering.

```ts
function createStore<T>(obj: T): T
function getStore<T>(): T
```


#### [<- prev](#installation) / [next ->](#component-api)
