import assertNever from '@/utils/assertNever';
import * as React from 'react';
import { useContext } from 'react';
import uuid from 'react-native-uuid';

export type Timer = Readonly<{
  duration: number;
  elapsed: number;
  ticking: boolean;
}>;

export function emptyTimer(): Timer {
  return {
    duration: 210 * 1000,
    elapsed: 0,
    ticking: false,
  };
}

export const TimerContext = React.createContext<[Timer, React.Dispatch<Timer>]>(
  [emptyTimer(), (value: Timer) => {}]
);

export function useTimer(): [Timer, React.Dispatch<Timer>] {
  return useContext(TimerContext);
}

export type Workout = Readonly<{
  name: string;
  exerciseLogs: AnyExerciseLog[];
  startedAt: number;
}>;

export type AnySetLog = LoadedSetLog | RepsSetLog | TimeSetLog;

type LoadedSetLog = Readonly<{
  type: 'weights';
  warmup: boolean;
  done: boolean;
  mass: number | null;
  reps: number | null;
  id: string;
}>;

type RepsSetLog = Readonly<{
  type: 'reps';
  warmup: boolean;
  done: boolean;
  reps: number | null;
  id: string;
}>;

type TimeSetLog = Readonly<{
  type: 'time';
  warmup: boolean;
  done: boolean;
  time: number | null;
  id: string;
}>;

export type SetLog<T extends ExerciseType> = {
  weights: LoadedSetLog;
  reps: RepsSetLog;
  time: TimeSetLog;
}[T];

export function createSetLog<T extends ExerciseType>(
  type: T,
  warmup: boolean
): SetLog<T> {
  switch (type) {
    case 'time':
      return {
        type: 'time',
        time: null,
        done: false,
        warmup,
        id: uuid.v4(),
      } as SetLog<T>;
    case 'weights':
      return {
        type: 'weights',
        mass: null,
        reps: null,
        done: false,
        warmup,
        id: uuid.v4(),
      } as SetLog<T>;
    case 'reps':
      return {
        type: 'reps',
        reps: null,
        done: false,
        warmup,
        id: uuid.v4(),
      } as SetLog<T>;
  }

  assertNever(type);
}

export type ExerciseType = 'weights' | 'reps' | 'time';

type WeightsExerciseLog = Readonly<{
  exerciseId: string;
  type: 'weights';
  setLogs: ReadonlyArray<SetLog<'weights'>>;
  id: string;
}>;

type RepsExerciseLog = Readonly<{
  exerciseId: string;
  type: 'reps';
  setLogs: ReadonlyArray<SetLog<'reps'>>;
  id: string;
}>;

type TimeExerciseLog = Readonly<{
  exerciseId: string;
  type: 'time';
  setLogs: ReadonlyArray<SetLog<'time'>>;
  id: string;
}>;

export type AnyExerciseLog =
  | ExerciseLog<'weights'>
  | ExerciseLog<'reps'>
  | ExerciseLog<'time'>;

export type ExerciseLog<T extends ExerciseType> = {
  weights: WeightsExerciseLog;
  reps: RepsExerciseLog;
  time: TimeExerciseLog;
}[T];

export function createExerciseLog<T extends ExerciseType>(
  exercise: Exercise<T>
): ExerciseLog<T> {
  switch (exercise.type) {
    case 'weights':
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        setLogs: [createSetLog<'weights'>('weights', false)],
        id: uuid.v4(),
      } as ExerciseLog<'weights'> as ExerciseLog<T>;
    case 'reps':
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        setLogs: [createSetLog<'reps'>('reps', false)],
        id: uuid.v4(),
      } as ExerciseLog<'reps'> as ExerciseLog<T>;
    case 'time':
      return {
        exerciseId: exercise.id,
        type: exercise.type,
        setLogs: [createSetLog<'time'>('time', false)],
        id: uuid.v4(),
      } as ExerciseLog<'time'> as ExerciseLog<T>;
    default:
      assertNever(exercise);
  }
}

function getWorkoutName(date: Date) {
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
  return `${dayName}`;
}

export function emptyWorkout(): Workout {
  return {
    name: getWorkoutName(new Date()),
    exerciseLogs: [],
    startedAt: new Date().getTime(),
  };
}

export const CurrentWorkoutContext = React.createContext<
  [Workout, React.Dispatch<Workout>]
>([emptyWorkout(), (value: Workout) => {}]);

export function useCurrentWorkout() {
  return useContext(CurrentWorkoutContext);
}

export const PastWorkoutsContext = React.createContext<
  [ReadonlyArray<Workout>, React.Dispatch<ReadonlyArray<Workout>>]
>([[], (value: ReadonlyArray<Workout>) => {}]);

export function usePastWorkouts() {
  return useContext(PastWorkoutsContext);
}

export const AllMuscleGroups: ReadonlyArray<MuscleGroup> = [
  'push',
  'shoulders',
  'arms',
  'core',
  'pull',
  'lower',
  'full',
];

export type MuscleGroup =
  | 'push'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'pull'
  | 'lower'
  | 'full';

type WeightsExercise = Readonly<{
  id: string;
  archived: boolean;
  name: string;
  type: 'weights';
  group: MuscleGroup;
}>;

type RepsExercise = Readonly<{
  id: string;
  archived: boolean;
  name: string;
  type: 'reps';
  group: MuscleGroup;
}>;

type TimeExercise = Readonly<{
  id: string;
  archived: boolean;
  name: string;
  type: 'time';
  group: MuscleGroup;
}>;

export type Exercise<T extends ExerciseType> = {
  weights: WeightsExercise;
  reps: RepsExercise;
  time: TimeExercise;
}[T];

export type AnyExercise =
  | Exercise<'weights'>
  | Exercise<'reps'>
  | Exercise<'time'>;

export function createExercise(
  name: string,
  type: ExerciseType,
  group: MuscleGroup
) {
  return { name, type, group, id: uuid.v4(), archived: false };
}

export function defaultExercises(): ReadonlyArray<AnyExercise> {
  return [
    // PUSH
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bench Press (Barbell)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bench Press (Dumbbell)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Bench Press (Dumbell)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Bench Press (Barbell)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Push Up',
      type: 'reps',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dip',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chest Press (Machine)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chest Fly (Cable)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Close-Grip Bench Press (Barbell)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Close-Grip Bench Press (Dumbbell)',
      type: 'weights',
      group: 'push',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chest Fly (Dumbbell)',
      type: 'weights',
      group: 'push',
    },

    // SHOULDERS
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Overhead Press (Barbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Overhead Press (Barbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Overhead Press (Dumbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Arnold Press (Dumbbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Lateral Raise (Dumbbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Front Raise (Dumbbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Rear Delt Raise (Dumbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lying Rear Delt Raise (Dumbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Face Pull (Cable)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Upright Row (Barbell)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Upright Row (EZ Bar)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Lateral Raise (Cable)',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Lateral Raise (Dumbbell)',
      type: 'weights',
      group: 'shoulders',
    },

    // ARMS
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bicep Curl (Barbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bicep Curl (EZ Bar)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bicep Curl (Dumbbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hammer Curl (Dumbbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Preacher Bicep Curl (Barbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Preacher Bicep Curl (EZ Bar)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Concentration Bicep Curl (Dumbbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Tricep Extension (Machine)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Tricep Extension (Cable)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Skull Crusher (EZ Bar)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Skull Crusher (Barbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Tricep Pushdown (Cable)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Rope Tricep Extension (Cable)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Bicep Curl (Dumbbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Bicep Curl (Dumbbell)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Bicep Curl (Cable)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bicep Curl (Cable)',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Close-Grip Push Up',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dead Hang',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Wrist Curl (Barbell)',
      type: 'weights',
      group: 'arms',
    },

    // CORE
    {
      id: uuid.v4(),
      archived: false,
      name: 'Crunch',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sit Up',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hanging Leg Raise',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Toes to Bar',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Crunch (Cable)',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Russian Twist',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Ab Wheel Rollout',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Plank',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Side Plank',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Mountain Climber',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Crunch',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Decline Sit Up (Barbell)',
      type: 'weights',
      group: 'core',
    },

    // PULL
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chin Up',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pull Up',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Neutral Grip Pull Up',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lat Pulldown',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lat Prayer (Cable)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Lat Prayer (Cable)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Row (Barbell)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Row (Dumbbell)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Inverted Row',
      type: 'reps',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Face Pull (Cable)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Row (T-Bar)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Row (Cable)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pullover (Dumbbell)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Row (Machine)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'One Arm Row (Dumbbell)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Band Pull Apart',
      type: 'reps',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Ball Rocker (Silk)',
      type: 'reps',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Skin the Cat (Silk)',
      type: 'weights',
      group: 'pull',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Skin the Dog (Silk)',
      type: 'weights',
      group: 'pull',
    },

    // LOWER
    {
      id: uuid.v4(),
      archived: false,
      name: 'Back Squat (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Front Squat (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hack Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Leg Press',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bulgarian Split Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Goblet Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Walking Lunge',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Deadlift (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Deadlift (Dumbbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Romanian Deadlift (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Deficit Deadlift (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sumo Deadlift (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Deadlift (Trap Bar)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Leg Extension',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Leg Curl',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lying Leg Curl',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Calf Raise (Barbell)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Calf Raise (Machine)',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Calf Raise',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Glute Bridge',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hip Thrust',
      type: 'weights',
      group: 'lower',
    },

    // FULL BODY
    {
      id: uuid.v4(),
      archived: false,
      name: 'Clean and Press',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Back Lever (Silk)',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Snatch',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: "Farmer's Walk",
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bear Crawl',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Burpee',
      type: 'reps',
      group: 'full',
    },
  ];
}

export const ExercisesContext = React.createContext<
  [ReadonlyArray<AnyExercise>, React.Dispatch<ReadonlyArray<AnyExercise>>]
>([[], (value: ReadonlyArray<AnyExercise>) => {}]);

export function useExercises() {
  return useContext(ExercisesContext);
}
