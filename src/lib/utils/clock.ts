/** Server clock. Tests can override it to simulate timer expiry without waiting. */
let impl: () => number = () => Date.now();

export const clock = {
  now: () => impl(),
  date: () => new Date(impl()),
  set(fn: () => number) {
    impl = fn;
  },
  reset() {
    impl = () => Date.now();
  },
};
