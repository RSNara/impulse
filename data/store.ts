import * as React from 'react';
import { useContext } from 'react';
import storage from './storage';

export type Store = {
  currentWorkout: Workout;
  pastWorkouts: Workout[];
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
  previous?: {
    mass: number;
    reps: number;
  };
  mass: number | null;
  reps: number | null;
};

type RepsSetLog = {
  type: 'reps';
  warmup: boolean;
  done: boolean;
  previous?: {
    reps: number;
  };
  reps: number | null;
};

type TimeSetLog = {
  type: 'time';
  warmup: boolean;
  done: boolean;
  previous?: {
    time: number;
  };
  time: number | null;
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
  sets: ReadonlyArray<SetLog<'loaded'>>;
};

type RepsExerciseLog = {
  name: string;
  type: 'reps';
  sets: ReadonlyArray<SetLog<'reps'>>;
};

type TimeExerciseLog = {
  name: string;
  type: 'time';
  sets: ReadonlyArray<SetLog<'time'>>;
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

function defaultWorkoutName() {
  const today = new Date();
  const month = today.toLocaleString('en-US', { month: 'short' }); // "May"
  const day = today.getDate(); // 20
  const year = today.getFullYear(); // 2025
  return `${month} ${day}, ${year}`;
}

export function emptyWorkout() {
  return {
    name: defaultWorkoutName(),
    exerciseLogs: [],
    startedAt: new Date().getTime(),
  };
}

export function defaultStore(): Store {
  return {
    currentWorkout: emptyWorkout(),
    pastWorkouts: [],
  };
}

export const StoreContext = React.createContext<[Store, React.Dispatch<Store>]>(
  [defaultStore(), (value: Store) => {}]
);

export function useStore() {
  return useContext(StoreContext);
}

export function load(): Promise<Store> {
  return storage.load<Store>({ key: 'store' });
}

export function save(store: Store): Promise<void> {
  return storage.save({ key: 'store', data: store });
}
