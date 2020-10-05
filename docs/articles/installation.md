## installation

### getting started

#### 1. Create new project.

```bash
> mkdir zheleznaya-app
> cd zheleznaya-app
> yarn init
> yarn add zheleznaya typescript parcel
> touch index.html index.tsx
> yarn tsc --init
```

#### 2. Write `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>app</title>
</head>
<body>
  <script src="index.tsx"></script>
</body>
</html>
```

#### 3. Write `index.tsx`

```tsx
import { h, Component } from "zheleznaya";

const App: Component = () => {
  return (
    <h1>Hello zheleznaya!</h1>
  );
}

render(<App />)
```

#### 4. Edit `tsconfig.json`

Add this entry in `compilerOptions`.

```json
{
  "jsx": "react",
  "jsxFactory": "h"
}
```

#### 5. Run dev server

```bash
> yarn parcel index.html
```

You can see application on `http://localhost:1234`


#### [<- prev](#index) / [next ->](#api-references)
