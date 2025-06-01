import type { Timer, Workout } from '@/data/store';
import {
  CurrentWorkoutContext,
  emptyTimer,
  emptyWorkout,
  PastWorkoutsContext,
  TimerContext,
} from '@/data/store';
import useInterval from '@/hooks/useInterval';
import useSyncedState from '@/hooks/useSyncedState';

import { Stack, useRouter } from 'expo-router';

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
  const router = useRouter();

  useInterval(
    () => {
      const timeLeft = Math.max(timer.duration - timer.elapsed, 0);
      const isTimerFinished = timeLeft <= 0;
      if (isTimerFinished) {
        updateTimer({
          elapsed: 0,
          ticking: false,
        });
        router.navigate('/(tabs)');
      } else {
        updateTimer({
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

  function updateTimer(update: Partial<Timer>) {
    setTimer({
      ...timer,
      ...update,
    });
  }
}
