"use strict";

export function debounce(fn, interval) {
  let timerId;
  return () => {
    clearTimeout(timerId);
    const context = this;
    const args = arguments;
    timerId = setTimeout(() => {
      fn.apply(context, args);
    }, interval);
  };
}
