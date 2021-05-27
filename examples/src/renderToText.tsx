import { renderToText, h } from "zheleznaya"

const App = () => {
  const items = ["foo", "bar", "hoge"];
  return (
    <div>
      <h1>Hello world.</h1>
      <ul>
        {items.map(it => <li>{it}</li>)}
      </ul>
    </div>
  );
}

console.log(renderToText(<App/>));
