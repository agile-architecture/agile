import "mocha";
import { expect } from "chai";
import { Agile } from "../../../src";

describe("OnInaugurated Function Tests", () => {
  let calledWatcherCount = 0;
  let watcherValue = 1;

  // Define Agile
  const App = new Agile();

  // Create State
  const MY_STATE = App.State<number>(1);

  // Create Watcher
  MY_STATE.onInaugurated((value) => {
    watcherValue = value;
    calledWatcherCount++;
  });

  it("Has correct initial values", () => {
    expect(MY_STATE.value).to.eq(1, "MY_STATE has correct value");
    expect(MY_STATE.watchers.InauguratedWatcher !== undefined).to.eq(
      true,
      "MY_STATE has Inaugurated in watchers"
    );
  });

  it("Can Watch State once", async () => {
    // Update State
    MY_STATE.set(2);

    // Needs some time to call watcher
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(MY_STATE.value).to.eq(2, "MY_STATE has correct value");
    expect(calledWatcherCount).to.eq(
      1,
      "calledWatcherCount has been increased by 1"
    );
    expect(watcherValue).to.eq(2, "watcherValue has correct value");
    expect(MY_STATE.watchers.InauguratedWatcher !== undefined).to.eq(
      false,
      "Inaugurated Watcher got removed/destroyed"
    );
  });
});