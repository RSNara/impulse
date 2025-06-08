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

export type ExerciseGroup =
  | 'legs'
  | 'arms'
  | 'shoulders'
  | 'core'
  | 'back'
  | 'chest'
  | 'fullbody'
  | 'aerial';

type WeightsExercise = Readonly<{
  id: string;
  archived: boolean;
  name: string;
  type: 'weights';
  group: ExerciseGroup;
}>;

type RepsExercise = Readonly<{
  id: string;
  archived: boolean;
  name: string;
  type: 'reps';
  group: ExerciseGroup;
}>;

type TimeExercise = Readonly<{
  id: string;
  archived: boolean;
  name: string;
  type: 'time';
  group: ExerciseGroup;
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
  group: ExerciseGroup
) {
  return { name, type, group, id: uuid.v4(), archived: false };
}

export function defaultExercises(): ReadonlyArray<AnyExercise> {
  return [
    // LOADED EXERCISES
    {
      name: 'Barbell Back Squat',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Barbell Front Squat',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Goblet Squat',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Bulgarian Split Squat',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Hack Squat',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Barbell Romanian Deadlift',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Conventional Deadlift',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Sumo Deadlift',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Trap Bar Deadlift',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Deficit Deadlift',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Stiff-Leg Deadlift',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Barbell Bench Press',
      type: 'weights',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Dumbbell Bench Press',
      type: 'weights',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Incline Bench Press',
      type: 'weights',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Decline Bench Press',
      type: 'weights',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Overhead Press',
      type: 'weights',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Seated Shoulder Press',
      type: 'weights',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Push Press',
      type: 'weights',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Arnold Press',
      type: 'weights',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Barbell Bent Over Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Pendlay Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Dumbbell Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Chest Supported Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'T-Bar Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Cable Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Weighted Pull-Up',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Weighted Chin-Up',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Weighted Dip',
      type: 'weights',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Hip Thrust',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Barbell Lunge',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Dumbbell Lunge',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Leg Press',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Leg Extension',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Hamstring Curl',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Barbell Curl',
      type: 'weights',
      group: 'arms',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Dumbbell Curl',
      type: 'weights',
      group: 'arms',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'EZ Bar Curl',
      type: 'weights',
      group: 'arms',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Skullcrusher',
      type: 'weights',
      group: 'arms',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Triceps Pushdown',
      type: 'weights',
      group: 'arms',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Upright Row',
      type: 'weights',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Shrugs',
      type: 'weights',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Power Clean',
      type: 'weights',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Hang Power Clean',
      type: 'weights',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Clean & Jerk',
      type: 'weights',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Snatch',
      type: 'weights',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Kettlebell Swing',
      type: 'weights',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Kettlebell Goblet Squat',
      type: 'weights',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Cable Fly',
      type: 'weights',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Lat Pulldown',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Seated Row',
      type: 'weights',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },

    // REPS EXERCISES
    {
      name: 'Push-Up',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Diamond Push-Up',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Archer Push-Up',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Decline Push-Up',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Incline Push-Up',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Wide Push-Up',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Pull-Up',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Chin-Up',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Neutral Grip Pull-Up',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Australian Pull-Up',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Dip',
      type: 'reps',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Bodyweight Squat',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Pistol Squat',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Walking Lunge',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Reverse Lunge',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Step-Up',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Box Jump',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Jump Squat',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Broad Jump',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Burpee',
      type: 'reps',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Sit-Up',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Crunch',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Russian Twist',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Hanging Leg Raise',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Toes to Bar',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'V-Up',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Knee Raise',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Mountain Climber',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Inverted Row',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Superman',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Lying Hip Thrust',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Tuck Front Lever Pull',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Skin the Cat',
      type: 'reps',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Lying Leg Raise',
      type: 'reps',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Jumping Lunge',
      type: 'reps',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },

    // TIME EXERCISES
    {
      name: 'Plank',
      type: 'time',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Side Plank',
      type: 'time',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Reverse Plank',
      type: 'time',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Hollow Hold',
      type: 'time',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Arch Hold',
      type: 'time',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'L-Sit',
      type: 'time',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Wall Sit',
      type: 'time',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Dead Hang',
      type: 'time',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Flexed Arm Hang',
      type: 'time',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Front Lever Hold',
      type: 'time',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Tuck Front Lever Hold',
      type: 'time',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Back Lever Hold',
      type: 'time',
      group: 'back',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Planche Hold',
      type: 'time',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Tuck Planche Hold',
      type: 'time',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Straddle Planche Hold',
      type: 'time',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Human Flag Hold',
      type: 'time',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Iron Cross Hold',
      type: 'time',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Handstand Hold',
      type: 'time',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Elbow Lever Hold',
      type: 'time',
      group: 'core',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Support Hold (Rings)',
      type: 'time',
      group: 'shoulders',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Jump Rope',
      type: 'time',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Running (Interval/Time)',
      type: 'time',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Rowing Machine (Time)',
      type: 'time',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Assault Bike',
      type: 'time',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Battle Ropes',
      type: 'time',
      group: 'fullbody',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Isometric Biceps Hold',
      type: 'time',
      group: 'arms',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Isometric Push-Up Hold',
      type: 'time',
      group: 'chest',
      id: uuid.v4(),
      archived: false,
    },
    {
      name: 'Isometric Lunge Hold',
      type: 'time',
      group: 'legs',
      id: uuid.v4(),
      archived: false,
    },
  ];
}

export const ExercisesContext = React.createContext<
  [ReadonlyArray<AnyExercise>, React.Dispatch<ReadonlyArray<AnyExercise>>]
>([[], (value: ReadonlyArray<AnyExercise>) => {}]);

export function useExercises() {
  return useContext(ExercisesContext);
}
