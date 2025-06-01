import type { Store, Timer } from '@/data/store';
import { emptyStore, StoreContext } from '@/data/store';

import useSyncedState from '@/hooks/useSyncedState';
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function RootLayout() {
  const [store, setStore] = useSyncedState<Store>('store', emptyStore());
  const { timer } = store;

  function setTimer(partial: Timer) {
    setStore({
      ...store,
      timer: {
        ...partial,
      },
    });
  }

  useInterval(
    () => {
      const timeLeft = Math.max(timer.duration - timer.elapsed, 0);
      const isTimerFinished = timeLeft <= 0;
      if (isTimerFinished) {
        setTimer({
          ...timer,
          elapsed: 0,
          ticking: false,
        });
      } else {
        setTimer({
          ...timer,
          elapsed: Math.min(timer.elapsed + 1000, timer.duration),
        });
      }
    },
    1000,
    timer.ticking
  );

  return (
    <StoreContext.Provider value={[store, setStore]}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StoreContext.Provider>
  );
}

function useInterval(fn: () => void, interval: number, isOn: boolean) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (isOn) {
      const id = setInterval(() => {
        fnRef.current();
      }, interval);

      return () => {
        clearInterval(id);
      };
    }
  }, [interval, isOn]);
}
