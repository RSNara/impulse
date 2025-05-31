import { useRef } from 'react';

function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  n: number
) {
  let inCooldown = false;
  let scheduledEnd = false;
  let scheduleStart = true;

  const debounced = (...args: Args) => {
    if (!inCooldown) {
      inCooldown = true;
      if (scheduleStart) {
        setTimeout(() => {
          fn(...args);
        }, 0);
      }
      setTimeout(() => {
        inCooldown = false;
        if (scheduledEnd) {
          scheduledEnd = false;
          scheduleStart = false;
          try {
            fn(...args);
          } finally {
            scheduleStart = true;
          }
        }
      }, n);
    } else if (!scheduledEnd) {
      scheduledEnd = true;
    }
  };

  return debounced;
}

export default function useDebounced<Args extends unknown[]>(
  fn: (...args: Args) => void,
  n: number
): (...args: Args) => void {
  return useRef(debounce(fn, n)).current;
}
