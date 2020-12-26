import assert from "assert";
import { createSignal } from "../src";

describe("strong-events", () => {
  it("should declare callback", () => {
    const onCallback = createSignal<(arg0: string) => void>();

    let values: string[] = [];

    onCallback(function(value) {
      values.push(value);
    });

    onCallback.once(function(value){
      values.push(`once: ${value}`);;
    });

    onCallback.invoke("hey");
    onCallback.invoke("hey again");

    assert.deepEqual(['hey', 'once: hey', 'hey again'], values);
  });

  it("should allow to remove a callback", () => {
    let invokeCount: number = 0;
    var cb = function() { invokeCount++; };

    const onSignal = createSignal();
    onSignal(cb);

    onSignal.invoke();

    onSignal.remove(cb);
    onSignal.invoke();

    assert.equal(1, invokeCount);
  });

  it("declare different callback types", () => {
    const onNumber = createSignal<(num: number) => void>();

    onNumber(function(num) {
      // correct type inferred.
    });

    const onTwoArgs = createSignal<(str: string, num: number) => void>();
    onTwoArgs(function(str, num) {
      // you get correct "string" auto-completion for "str"
    });

  })

  it("should allow async callbacks", async () => {
    let invokeCount: number = 0;
    const asyncSignal = createSignal<(_: string) => void>();
    asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      invokeCount++;
    });

    asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      invokeCount++;
    });

    asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      invokeCount++;
    });

    asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      invokeCount++;
    });

    let time = Date.now();
    await asyncSignal.invokeAsync("hello!");

    const elapsedTime = Date.now() - time;
    assert.ok(elapsedTime >= 400 && elapsedTime <= 420);

    assert.equal(4, invokeCount);
  });

});
