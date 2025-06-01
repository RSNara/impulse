import * as React from 'react';
import { useContext } from 'react';

export type Timer = {
  duration: number;
  elapsed: number;
  ticking: boolean;
};

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

export type Workout = {
  name: string;
  exerciseLogs: AnyExerciseLog[];
  startedAt: number;
};

export type AnySetLog = LoadedSetLog | RepsSetLog | TimeSetLog;

type LoadedSetLog = {
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
  [Workout[], React.Dispatch<Workout[]>]
>([[], (value: Workout[]) => {}]);

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

type LoadedExercise = {
  name: string;
  type: 'loaded';
  group: ExerciseGroup;
};

type RepsExercise = {
  name: string;
  type: 'reps';
  group: ExerciseGroup;
};

type TimeExercise = {
  name: string;
  type: 'time';
  group: ExerciseGroup;
};

export type Exercise<T extends ExerciseType> = {
  loaded: LoadedExercise;
  reps: RepsExercise;
  time: TimeExercise;
}[T];

export type AnyExercise =
  | Exercise<'loaded'>
  | Exercise<'reps'>
  | Exercise<'time'>;

export function defaultExercises(): ReadonlyArray<AnyExercise> {
  return [
    // LOADED EXERCISES
    { name: 'Barbell Back Squat', type: 'loaded', group: 'legs' },
    { name: 'Barbell Front Squat', type: 'loaded', group: 'legs' },
    { name: 'Goblet Squat', type: 'loaded', group: 'legs' },
    { name: 'Bulgarian Split Squat', type: 'loaded', group: 'legs' },
    { name: 'Hack Squat', type: 'loaded', group: 'legs' },
    { name: 'Barbell Romanian Deadlift', type: 'loaded', group: 'legs' },
    { name: 'Conventional Deadlift', type: 'loaded', group: 'legs' },
    { name: 'Sumo Deadlift', type: 'loaded', group: 'legs' },
    { name: 'Trap Bar Deadlift', type: 'loaded', group: 'legs' },
    { name: 'Deficit Deadlift', type: 'loaded', group: 'legs' },
    { name: 'Stiff-Leg Deadlift', type: 'loaded', group: 'legs' },
    { name: 'Barbell Bench Press', type: 'loaded', group: 'chest' },
    { name: 'Dumbbell Bench Press', type: 'loaded', group: 'chest' },
    { name: 'Incline Bench Press', type: 'loaded', group: 'chest' },
    { name: 'Decline Bench Press', type: 'loaded', group: 'chest' },
    { name: 'Overhead Press', type: 'loaded', group: 'shoulders' },
    { name: 'Seated Shoulder Press', type: 'loaded', group: 'shoulders' },
    { name: 'Push Press', type: 'loaded', group: 'shoulders' },
    { name: 'Arnold Press', type: 'loaded', group: 'shoulders' },
    { name: 'Barbell Bent Over Row', type: 'loaded', group: 'back' },
    { name: 'Pendlay Row', type: 'loaded', group: 'back' },
    { name: 'Dumbbell Row', type: 'loaded', group: 'back' },
    { name: 'Chest Supported Row', type: 'loaded', group: 'back' },
    { name: 'T-Bar Row', type: 'loaded', group: 'back' },
    { name: 'Cable Row', type: 'loaded', group: 'back' },
    { name: 'Weighted Pull-Up', type: 'loaded', group: 'back' },
    { name: 'Weighted Chin-Up', type: 'loaded', group: 'back' },
    { name: 'Weighted Dip', type: 'loaded', group: 'chest' },
    { name: 'Hip Thrust', type: 'loaded', group: 'legs' },
    { name: 'Barbell Lunge', type: 'loaded', group: 'legs' },
    { name: 'Dumbbell Lunge', type: 'loaded', group: 'legs' },
    { name: 'Leg Press', type: 'loaded', group: 'legs' },
    { name: 'Leg Extension', type: 'loaded', group: 'legs' },
    { name: 'Hamstring Curl', type: 'loaded', group: 'legs' },
    { name: 'Barbell Curl', type: 'loaded', group: 'arms' },
    { name: 'Dumbbell Curl', type: 'loaded', group: 'arms' },
    { name: 'EZ Bar Curl', type: 'loaded', group: 'arms' },
    { name: 'Skullcrusher', type: 'loaded', group: 'arms' },
    { name: 'Triceps Pushdown', type: 'loaded', group: 'arms' },
    { name: 'Upright Row', type: 'loaded', group: 'shoulders' },
    { name: 'Shrugs', type: 'loaded', group: 'shoulders' },
    { name: 'Power Clean', type: 'loaded', group: 'fullbody' },
    { name: 'Hang Power Clean', type: 'loaded', group: 'fullbody' },
    { name: 'Clean & Jerk', type: 'loaded', group: 'fullbody' },
    { name: 'Snatch', type: 'loaded', group: 'fullbody' },
    { name: 'Kettlebell Swing', type: 'loaded', group: 'fullbody' },
    { name: 'Kettlebell Goblet Squat', type: 'loaded', group: 'legs' },
    { name: 'Cable Fly', type: 'loaded', group: 'chest' },
    { name: 'Lat Pulldown', type: 'loaded', group: 'back' },
    { name: 'Seated Row', type: 'loaded', group: 'back' },

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
