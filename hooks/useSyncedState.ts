import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import Storage from 'react-native-storage';

const storage = new Storage({
  // maximum capacity, default 1000 key-ids
  size: 5000,

  // Use AsyncStorage for RN apps, or window.localStorage for web apps.
  // If storageBackend is not set, data will be lost after reload.
  storageBackend: AsyncStorage, // for web: window.localStorage

  // expire time, default: 1 day (1000 * 3600 * 24 milliseconds).
  // can be null, which means never expire.
  defaultExpires: null,

  // cache data in the memory. default is true.
  enableCache: true,

  // if data was not found in storage or expired data was found,
  // the corresponding sync method will be invoked returning
  // the latest data.
  sync: {
    // we'll talk about the details later.
  },
});

export default function useSyncedState<State>(
  key: string,
  defaultValue: State
): [State, React.Dispatch<State>] {
  const [shouldSync, setShouldSync] = useState(false);
  const [state, setState] = useState<State>(defaultValue);

  const saveState = useDebounced((val: State) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    console.log(`Syncing ${key}: ${hh}:${mm}:${ss}`);
    storage.save({ key, data: val });
  }, 1000);

  useEffect(() => {
    if (shouldSync) {
      saveState(state);
    }
  }, [state, shouldSync]);

  useEffect(() => {
    storage
      .load<State>({ key })
      .then((savedState) => {
        setState(savedState);
        setShouldSync(true);
      })
      .catch((ex) => {
        console.warn(ex);
      });
  }, []);

  return [state, setState];
}

function useDebounced<Args extends unknown[]>(
  fn: (...args: Args) => void,
  n: number
): (...args: Args) => void {
  return useRef(debounce(fn, n)).current;
}

function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  n: number
) {
  let inCooldown = false;
  let scheduleEnd: Args | null = null;
  let isExecutingEnd = false;

  const debounced = (...args: Args) => {
    if (!inCooldown) {
      inCooldown = true;
      if (isExecutingEnd) {
        scheduleEnd = args;
      } else {
        setTimeout(() => {
          fn(...args);
        }, 0);
      }

      setTimeout(() => {
        inCooldown = false;
        if (scheduleEnd) {
          const actualArgs = scheduleEnd;
          scheduleEnd = null;
          try {
            isExecutingEnd = true;
            fn(...actualArgs);
          } finally {
            isExecutingEnd = false;
          }
        }
      }, n);
    } else if (!scheduleEnd) {
      scheduleEnd = args;
    }
  };

  return debounced;
}
