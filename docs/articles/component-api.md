## component api

T.B.D

### create component

```tsx
import { h } from "zheleznaya";
export const App = () => {
  return (
    <div>Hello zheleznaya!</div>
  );
}
```

### render component

```tsx
import { render, h } from "zheleznaya";
import { App } from "./App";

render(<App />);
```

#### [<- prev](#api-references)
