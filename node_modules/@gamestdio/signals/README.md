# @gamestdio/signals

Light-weight, strongly-typed messaging system.

## Usage

```typescript
import { Signal } from "@gamestdio/signals";

let signal = new Signal();

signal.add((data) => {
    console.log(data.message);
});

signal.dispatch({ message: "hello signal!" });
```

## License

[MIT](LICENSE)
