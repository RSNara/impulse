import type { Timer, Workout } from '@/data/store';
import {
  CurrentWorkoutContext,
  emptyTimer,
  emptyWorkout,
  PastWorkoutsContext,
  TimerContext,
} from '@/data/store';

import useSyncedState from '@/hooks/useSyncedState';
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function RootLayout() {
  const [currentWorkout, setCurrentWorkout] = useSyncedState<Workout>(
    'currentWorkout',
    emptyWorkout()
  );
  const [pastWorkouts, setPastWorkouts] = useSyncedState<Workout[]>(
    'pastWorkouts',
    []
  );
  const [timer, setTimer] = useSyncedState<Timer>('timer', emptyTimer());

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
    <CurrentWorkoutContext.Provider value={[currentWorkout, setCurrentWorkout]}>
      <PastWorkoutsContext.Provider value={[pastWorkouts, setPastWorkouts]}>
        <TimerContext.Provider value={[timer, setTimer]}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </TimerContext.Provider>
      </PastWorkoutsContext.Provider>
    </CurrentWorkoutContext.Provider>
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
