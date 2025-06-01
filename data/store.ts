import * as React from 'react';
import { useContext } from 'react';

export type Timer = {
  duration: number;
  elapsed: number;
  ticking: boolean;
};

export type Workout = {
  name: string;
  exerciseLogs: AnyExerciseLog[];
  startedAt: number;
};

export type AnySetLog = LoadedSetLog | RepsSetLog | TimeSetLog;

export type LoadedSetLog = {
  type: 'loaded';
  warmup: boolean;
  done: boolean;
  mass: number | null;
  reps: number | null;
  id: string;
};

type RepsSetLog = {
  type: 'reps';
  warmup: boolean;
  done: boolean;
  reps: number | null;
  id: string;
};

type TimeSetLog = {
  type: 'time';
  warmup: boolean;
  done: boolean;
  time: number | null;
  id: string;
};

export type SetLog<T extends ExerciseType> = {
  loaded: LoadedSetLog;
  reps: RepsSetLog;
  time: TimeSetLog;
}[T];

export type ExerciseType = 'loaded' | 'reps' | 'time';

type LoadedExerciseLog = {
  name: string;
  type: 'loaded';
  setLogs: ReadonlyArray<SetLog<'loaded'>>;
  id: string;
};

type RepsExerciseLog = {
  name: string;
  type: 'reps';
  setLogs: ReadonlyArray<SetLog<'reps'>>;
  id: string;
};

type TimeExerciseLog = {
  name: string;
  type: 'time';
  setLogs: ReadonlyArray<SetLog<'time'>>;
  id: string;
};

export type AnyExerciseLog =
  | ExerciseLog<'loaded'>
  | ExerciseLog<'reps'>
  | ExerciseLog<'time'>;

export type ExerciseLog<T extends ExerciseType> = {
  loaded: LoadedExerciseLog;
  reps: RepsExerciseLog;
  time: TimeExerciseLog;
}[T];

function getWorkoutName(date: Date) {
  const hours = date.getHours();
  const ampm = hours < 12 ? 'AM' : 'PM';

  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayName = weekdays[date.getDay()];

  // Day of month (1-31)
  const dayOfMonth = date.getDate();

  // Week of month (1-based, each 7 days is a week)
  const weekOfMonth = Math.floor((dayOfMonth - 1) / 7) + 1;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthName = months[date.getMonth()];

  return `${dayName}, Week ${weekOfMonth} (${ampm}, ${monthName})`;
}

export function emptyWorkout() {
  return {
    name: getWorkoutName(new Date()),
    exerciseLogs: [],
    startedAt: new Date().getTime(),
  };
}

export function emptyTimer(): Timer {
  return {
    duration: 210 * 1000,
    elapsed: 0,
    ticking: false,
  };
}

export const CurrentWorkoutContext = React.createContext<
  [Workout, React.Dispatch<Workout>]
>([emptyWorkout(), (value: Workout) => {}]);

export function useCurrentWorkout() {
  return useContext(CurrentWorkoutContext);
}

export const PastWorkoutsContext = React.createContext<
  [Workout[], React.Dispatch<Workout[]>]
>([[], (value: Workout[]) => {}]);

export function usePastWorkouts() {
  return useContext(PastWorkoutsContext);
}

export const TimerContext = React.createContext<[Timer, React.Dispatch<Timer>]>(
  [emptyTimer(), (value: Timer) => {}]
);

export function useTimer(): [Timer, React.Dispatch<Timer>] {
  return useContext(TimerContext);
}
