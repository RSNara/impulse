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
  'chest',
  'shoulders',
  'arms',
  'core',
  'back',
  'lower',
  'full',
];

export type MuscleGroup =
  | 'chest'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'back'
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
    // -------- WEIGHTS (type: 'weights') --------
    {
      id: uuid.v4(),
      archived: false,
      name: 'Barbell Bench Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dumbbell Bench Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Bench Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Decline Bench Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chest Fly',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Crossover',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Push Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Military Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Arnold Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lateral Raise',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Front Raise',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Rear Delt Fly',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Barbell Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dumbbell Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hammer Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Preacher Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Triceps Pushdown',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Overhead Triceps Extension',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Skullcrusher',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Close-Grip Bench Press',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lat Pulldown',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'T-Bar Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bent Over Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Single Arm Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pull-Over',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Deadlift',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sumo Deadlift',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Trap Bar Deadlift',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Romanian Deadlift',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Barbell Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Front Squat',
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
      name: 'Walking Lunge',
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
      name: 'Seated Calf Raise',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Calf Raise',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Crunch',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Sit-Up',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Crunch',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Russian Twist',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Plank',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Landmine Twist',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: "Farmer's Walk",
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Clean and Jerk',
      type: 'weights',
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
      name: 'Thruster',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Turkish Get Up',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Kettlebell Swing',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Pull-Up',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Dip',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Zercher Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Smith Machine Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Lunge',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Barbell Hip Thrust',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Face Pull',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Dumbbell Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Chest Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Dumbbell Fly',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Decline Dumbbell Fly',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hammer Strength Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Rear Delt Fly',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'EZ Bar Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Concentration Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Triceps Extension',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dip Machine',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Preacher Curl',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Leg Adduction',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Leg Abduction',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Step Up',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Good Morning',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Sit-Up',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Woodchopper',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Hanging Leg Raise',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Power Clean',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Overhead Squat',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Mountain Climber',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Burpee',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dumbbell Snatch',
      type: 'weights',
      group: 'full',
    },

    // -------- REPS (type: 'reps') --------
    {
      id: uuid.v4(),
      archived: false,
      name: 'Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Wide Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Diamond Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Decline Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dips',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bench Dips',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Triceps Push-Up',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chin-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Close-Grip Push-Up',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pike Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Handstand Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Pike Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Fly Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Wide Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Commando Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Inverted Row',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Australian Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bodyweight Row',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sit-Up',
      type: 'reps',
      group: 'core',
    },
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
      name: 'Reverse Crunch',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'V-Up',
      type: 'reps',
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
      name: 'Bicycle Crunch',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Leg Raise',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hanging Knee Raise',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Mountain Climber',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Flutter Kick',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Air Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Split Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bulgarian Split Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lunge',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Lunge',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Step Up',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Calf Raise',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Jump Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Box Jump',
      type: 'reps',
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
      name: 'Wall Sit (reps)',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Broad Jump',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Burpee',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Jumping Jack',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bear Crawl',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Crab Walk',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sprawl',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Star Jump',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Clapping Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Archer Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'One Arm Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Plank to Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Decline Pike Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dive Bomber Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Planche Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pseudo Planche Push-Up',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Typewriter Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'L-Sit Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Behind the Neck Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Negative Pull-Up',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Muscle Up',
      type: 'reps',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Superman',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Snow Angel',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Tuck Jump',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Curtsy Lunge',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Pistol Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cossack Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Knee Tuck',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lying Leg Raise',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Plank Up Down',
      type: 'reps',
      group: 'core',
    },

    // -------- TIME (type: 'time') --------
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
      name: 'Reverse Plank',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hollow Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'V-Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Boat Pose',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dead Hang',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Active Hang',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Front Lever Hold',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Back Lever Hold',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Superman Hold',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Wall Sit',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Single Leg Wall Sit',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Glute Bridge Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lunge Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Split Squat Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Handstand Hold',
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Crow Pose',
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Headstand Hold',
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'L-Sit Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Support Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dip Support Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Plank Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Isometric Curl Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Isometric Push-Up Hold',
      type: 'time',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Low Push-Up Hold',
      type: 'time',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Plank Hold',
      type: 'time',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Decline Plank Hold',
      type: 'time',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Star Plank',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bird Dog Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Side Lying Clam Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Glute Bridge Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hip Thrust Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Split Stance Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Lunge Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Squat Hold',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Shoulder Bridge Hold',
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Tabletop Hold',
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dead Bug Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hollow Body Rock Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Arch Hold',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Plank Reach Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bridge Hold',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bear Plank Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Superman Plank Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Hollow Rock Hold',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Boat Hold',
      type: 'time',
      group: 'core',
    },

    // --------- MORE FILLERS (to hit 200, mix types and groups) ---------
    // You can continue adding similar, or copy and modify above for variety
    {
      id: uuid.v4(),
      archived: false,
      name: 'Knee Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Scapular Push-Up',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sphinx Push-Up',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Triceps Dip',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dragon Flag',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Windshield Wiper',
      type: 'reps',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Nordic Curl',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sissy Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Jump Lunge',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Broad Jump',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Bear Crawl Hold',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Body Saw Plank',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Ring Support Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Ring L-Sit',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Hyper Hold',
      type: 'time',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Shoulder Tap Plank',
      type: 'time',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Superman',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Kettlebell Turkish Get Up',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable External Rotation',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Hip Abduction',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Hip Adduction',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Smith Machine Calf Raise',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Lateral Raise',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Smith Machine Bench Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Seated Machine Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Standing Overhead Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Landmine Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Reverse Lunge to Curl',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Thruster with Dumbbell',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Lateral Lunge',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Front Rack Reverse Lunge',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Barbell Rollout',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Upright Row',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Lateral Step Up',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Single Leg Romanian Deadlift',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Superman Hold',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Pike Push-Up',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Single Arm Chest Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Pull Over',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Push Up',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Kettlebell Clean',
      type: 'weights',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Dumbbell Step Up',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Plank to Push-Up',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Flutter Kick',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Hanging Knee Raise',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted L-Sit',
      type: 'weights',
      group: 'core',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Weighted Dip Support Hold',
      type: 'weights',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Kettlebell Goblet Squat',
      type: 'weights',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Machine Shrug',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Cable Chest Press',
      type: 'weights',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Band Pull Apart',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Kettlebell Push Press',
      type: 'weights',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Single Arm Dumbbell Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Chest Supported Row',
      type: 'weights',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Incline Treadmill Walk',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Step Mill',
      type: 'time',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Treadmill Run',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Assault Bike',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Rowing Machine',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Battle Rope Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: "Farmer's Carry",
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Overhead Carry',
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Suitcase Carry',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: "Waiter's Carry",
      type: 'time',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Sandbag Hold',
      type: 'time',
      group: 'full',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Plate Pinch Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Static Barbell Hold',
      type: 'time',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Face Pull',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Triceps Extension',
      type: 'reps',
      group: 'arms',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Good Morning',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Leg Curl',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Hip Abduction',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Pull Apart',
      type: 'reps',
      group: 'shoulders',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Row',
      type: 'reps',
      group: 'back',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Deadlift',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Chest Press',
      type: 'reps',
      group: 'chest',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Lateral Walk',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Squat',
      type: 'reps',
      group: 'lower',
    },
    {
      id: uuid.v4(),
      archived: false,
      name: 'Banded Step Up',
      type: 'reps',
      group: 'lower',
    },
  ];
}

export const ExercisesContext = React.createContext<
  [ReadonlyArray<AnyExercise>, React.Dispatch<ReadonlyArray<AnyExercise>>]
>([[], (value: ReadonlyArray<AnyExercise>) => {}]);

export function useExercises() {
  return useContext(ExercisesContext);
}
