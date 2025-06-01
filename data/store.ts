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
  name: string;
  type: 'weights';
  setLogs: ReadonlyArray<SetLog<'weights'>>;
  id: string;
}>;

type RepsExerciseLog = Readonly<{
  name: string;
  type: 'reps';
  setLogs: ReadonlyArray<SetLog<'reps'>>;
  id: string;
}>;

type TimeExerciseLog = Readonly<{
  name: string;
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
        name: exercise.name,
        type: exercise.type,
        setLogs: [createSetLog<'weights'>('weights', false)],
        id: uuid.v4(),
      } as ExerciseLog<'weights'> as ExerciseLog<T>;
    case 'reps':
      return {
        name: exercise.name,
        type: exercise.type,
        setLogs: [createSetLog<'reps'>('reps', false)],
        id: uuid.v4(),
      } as ExerciseLog<'reps'> as ExerciseLog<T>;
    case 'time':
      return {
        name: exercise.name,
        type: exercise.type,
        setLogs: [createSetLog<'time'>('time', false)],
        id: uuid.v4(),
      } as ExerciseLog<'time'> as ExerciseLog<T>;
    default:
      assertNever(exercise);
  }
}

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
  name: string;
  type: 'weights';
  group: ExerciseGroup;
}>;

type RepsExercise = Readonly<{
  name: string;
  type: 'reps';
  group: ExerciseGroup;
}>;

type TimeExercise = Readonly<{
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

export function defaultExercises(): ReadonlyArray<AnyExercise> {
  return [
    // LOADED EXERCISES
    { name: 'Barbell Back Squat', type: 'weights', group: 'legs' },
    { name: 'Barbell Front Squat', type: 'weights', group: 'legs' },
    { name: 'Goblet Squat', type: 'weights', group: 'legs' },
    { name: 'Bulgarian Split Squat', type: 'weights', group: 'legs' },
    { name: 'Hack Squat', type: 'weights', group: 'legs' },
    { name: 'Barbell Romanian Deadlift', type: 'weights', group: 'legs' },
    { name: 'Conventional Deadlift', type: 'weights', group: 'legs' },
    { name: 'Sumo Deadlift', type: 'weights', group: 'legs' },
    { name: 'Trap Bar Deadlift', type: 'weights', group: 'legs' },
    { name: 'Deficit Deadlift', type: 'weights', group: 'legs' },
    { name: 'Stiff-Leg Deadlift', type: 'weights', group: 'legs' },
    { name: 'Barbell Bench Press', type: 'weights', group: 'chest' },
    { name: 'Dumbbell Bench Press', type: 'weights', group: 'chest' },
    { name: 'Incline Bench Press', type: 'weights', group: 'chest' },
    { name: 'Decline Bench Press', type: 'weights', group: 'chest' },
    { name: 'Overhead Press', type: 'weights', group: 'shoulders' },
    { name: 'Seated Shoulder Press', type: 'weights', group: 'shoulders' },
    { name: 'Push Press', type: 'weights', group: 'shoulders' },
    { name: 'Arnold Press', type: 'weights', group: 'shoulders' },
    { name: 'Barbell Bent Over Row', type: 'weights', group: 'back' },
    { name: 'Pendlay Row', type: 'weights', group: 'back' },
    { name: 'Dumbbell Row', type: 'weights', group: 'back' },
    { name: 'Chest Supported Row', type: 'weights', group: 'back' },
    { name: 'T-Bar Row', type: 'weights', group: 'back' },
    { name: 'Cable Row', type: 'weights', group: 'back' },
    { name: 'Weighted Pull-Up', type: 'weights', group: 'back' },
    { name: 'Weighted Chin-Up', type: 'weights', group: 'back' },
    { name: 'Weighted Dip', type: 'weights', group: 'chest' },
    { name: 'Hip Thrust', type: 'weights', group: 'legs' },
    { name: 'Barbell Lunge', type: 'weights', group: 'legs' },
    { name: 'Dumbbell Lunge', type: 'weights', group: 'legs' },
    { name: 'Leg Press', type: 'weights', group: 'legs' },
    { name: 'Leg Extension', type: 'weights', group: 'legs' },
    { name: 'Hamstring Curl', type: 'weights', group: 'legs' },
    { name: 'Barbell Curl', type: 'weights', group: 'arms' },
    { name: 'Dumbbell Curl', type: 'weights', group: 'arms' },
    { name: 'EZ Bar Curl', type: 'weights', group: 'arms' },
    { name: 'Skullcrusher', type: 'weights', group: 'arms' },
    { name: 'Triceps Pushdown', type: 'weights', group: 'arms' },
    { name: 'Upright Row', type: 'weights', group: 'shoulders' },
    { name: 'Shrugs', type: 'weights', group: 'shoulders' },
    { name: 'Power Clean', type: 'weights', group: 'fullbody' },
    { name: 'Hang Power Clean', type: 'weights', group: 'fullbody' },
    { name: 'Clean & Jerk', type: 'weights', group: 'fullbody' },
    { name: 'Snatch', type: 'weights', group: 'fullbody' },
    { name: 'Kettlebell Swing', type: 'weights', group: 'fullbody' },
    { name: 'Kettlebell Goblet Squat', type: 'weights', group: 'legs' },
    { name: 'Cable Fly', type: 'weights', group: 'chest' },
    { name: 'Lat Pulldown', type: 'weights', group: 'back' },
    { name: 'Seated Row', type: 'weights', group: 'back' },

    // REPS EXERCISES
    { name: 'Push-Up', type: 'reps', group: 'chest' },
    { name: 'Diamond Push-Up', type: 'reps', group: 'chest' },
    { name: 'Archer Push-Up', type: 'reps', group: 'chest' },
    { name: 'Decline Push-Up', type: 'reps', group: 'chest' },
    { name: 'Incline Push-Up', type: 'reps', group: 'chest' },
    { name: 'Wide Push-Up', type: 'reps', group: 'chest' },
    { name: 'Pull-Up', type: 'reps', group: 'back' },
    { name: 'Chin-Up', type: 'reps', group: 'back' },
    { name: 'Neutral Grip Pull-Up', type: 'reps', group: 'back' },
    { name: 'Australian Pull-Up', type: 'reps', group: 'back' },
    { name: 'Dip', type: 'reps', group: 'chest' },
    { name: 'Bodyweight Squat', type: 'reps', group: 'legs' },
    { name: 'Pistol Squat', type: 'reps', group: 'legs' },
    { name: 'Walking Lunge', type: 'reps', group: 'legs' },
    { name: 'Reverse Lunge', type: 'reps', group: 'legs' },
    { name: 'Step-Up', type: 'reps', group: 'legs' },
    { name: 'Box Jump', type: 'reps', group: 'legs' },
    { name: 'Jump Squat', type: 'reps', group: 'legs' },
    { name: 'Broad Jump', type: 'reps', group: 'legs' },
    { name: 'Burpee', type: 'reps', group: 'fullbody' },
    { name: 'Sit-Up', type: 'reps', group: 'core' },
    { name: 'Crunch', type: 'reps', group: 'core' },
    { name: 'Russian Twist', type: 'reps', group: 'core' },
    { name: 'Hanging Leg Raise', type: 'reps', group: 'core' },
    { name: 'Toes to Bar', type: 'reps', group: 'core' },
    { name: 'V-Up', type: 'reps', group: 'core' },
    { name: 'Knee Raise', type: 'reps', group: 'core' },
    { name: 'Mountain Climber', type: 'reps', group: 'core' },
    { name: 'Inverted Row', type: 'reps', group: 'back' },
    { name: 'Superman', type: 'reps', group: 'back' },
    { name: 'Lying Hip Thrust', type: 'reps', group: 'legs' },
    { name: 'Tuck Front Lever Pull', type: 'reps', group: 'back' },
    { name: 'Skin the Cat', type: 'reps', group: 'back' },
    { name: 'Lying Leg Raise', type: 'reps', group: 'core' },
    { name: 'Jumping Lunge', type: 'reps', group: 'legs' },

    // TIME EXERCISES
    { name: 'Plank', type: 'time', group: 'core' },
    { name: 'Side Plank', type: 'time', group: 'core' },
    { name: 'Reverse Plank', type: 'time', group: 'core' },
    { name: 'Hollow Hold', type: 'time', group: 'core' },
    { name: 'Arch Hold', type: 'time', group: 'back' },
    { name: 'L-Sit', type: 'time', group: 'core' },
    { name: 'Wall Sit', type: 'time', group: 'legs' },
    { name: 'Dead Hang', type: 'time', group: 'back' },
    { name: 'Flexed Arm Hang', type: 'time', group: 'back' },
    { name: 'Front Lever Hold', type: 'time', group: 'back' },
    { name: 'Tuck Front Lever Hold', type: 'time', group: 'back' },
    { name: 'Back Lever Hold', type: 'time', group: 'back' },
    { name: 'Planche Hold', type: 'time', group: 'shoulders' },
    { name: 'Tuck Planche Hold', type: 'time', group: 'shoulders' },
    { name: 'Straddle Planche Hold', type: 'time', group: 'shoulders' },
    { name: 'Human Flag Hold', type: 'time', group: 'fullbody' },
    { name: 'Iron Cross Hold', type: 'time', group: 'shoulders' },
    { name: 'Handstand Hold', type: 'time', group: 'shoulders' },
    { name: 'Elbow Lever Hold', type: 'time', group: 'core' },
    { name: 'Support Hold (Rings)', type: 'time', group: 'shoulders' },
    { name: 'Jump Rope', type: 'time', group: 'fullbody' },
    { name: 'Running (Interval/Time)', type: 'time', group: 'fullbody' },
    { name: 'Rowing Machine (Time)', type: 'time', group: 'fullbody' },
    { name: 'Assault Bike', type: 'time', group: 'fullbody' },
    { name: 'Battle Ropes', type: 'time', group: 'fullbody' },
    { name: 'Isometric Biceps Hold', type: 'time', group: 'arms' },
    { name: 'Isometric Push-Up Hold', type: 'time', group: 'chest' },
    { name: 'Isometric Lunge Hold', type: 'time', group: 'legs' },
  ];
}

export const ExercisesContext = React.createContext<
  [ReadonlyArray<AnyExercise>, React.Dispatch<ReadonlyArray<AnyExercise>>]
>([[], (value: ReadonlyArray<AnyExercise>) => {}]);

export function useExercises() {
  return useContext(ExercisesContext);
}
