import { h, useStore, render } from "zheleznaya";


const App = () => {
  const store = useStore({ count: 100 });

  return (
    <div>
      <button onclick={() => store.count++}>+</button>
      <button onclick={() => store.count--}>-</button>
      <span>{store.count}</span>
    </div>
  )
}

render(<App />)