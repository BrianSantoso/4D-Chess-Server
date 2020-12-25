# strong-events

Lightweight Strong Typed Event Signaling for TypeScript / JavaScript.

## What is a Signal?

TODO
> https://github.com/millermedeiros/js-signals/wiki/Comparison-between-different-Observer-Pattern-implementations

## Installation

```
npm install strong-events
```

## Usage

```typescript
import { createSignal } from "strong-events";

const onSomeEvent = createSignal<(string) => void>();

// register a callback
onSomeEvent(function(value) {
  console.log("event emitted with:", value);
});

// registering a callback to run just once
onSomeEvent.once(function(value) {
  console.log("event emitted once, with:", value);
});

// invoke the event
onSomeEvent.invoke("triggering the event!");
```


## LICENSE

MIT.
