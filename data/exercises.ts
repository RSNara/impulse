export type ExerciseType = 'loaded' | 'reps' | 'time';

type LoadedExercise = {
  name: string;
  type: 'loaded';
};

type RepsExercise = {
  name: string;
  type: 'reps';
};

type TimeExercise = {
  name: string;
  type: 'time';
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

const Exercises: AnyExercise[] = [
  // LOADED EXERCISES
  { name: 'Barbell Back Squat', type: 'loaded' },
  { name: 'Barbell Front Squat', type: 'loaded' },
  { name: 'Goblet Squat', type: 'loaded' },
  { name: 'Bulgarian Split Squat', type: 'loaded' },
  { name: 'Hack Squat', type: 'loaded' },
  { name: 'Barbell Romanian Deadlift', type: 'loaded' },
  { name: 'Conventional Deadlift', type: 'loaded' },
  { name: 'Sumo Deadlift', type: 'loaded' },
  { name: 'Trap Bar Deadlift', type: 'loaded' },
  { name: 'Deficit Deadlift', type: 'loaded' },
  { name: 'Stiff-Leg Deadlift', type: 'loaded' },
  { name: 'Barbell Bench Press', type: 'loaded' },
  { name: 'Dumbbell Bench Press', type: 'loaded' },
  { name: 'Incline Bench Press', type: 'loaded' },
  { name: 'Decline Bench Press', type: 'loaded' },
  { name: 'Overhead Press', type: 'loaded' },
  { name: 'Seated Shoulder Press', type: 'loaded' },
  { name: 'Push Press', type: 'loaded' },
  { name: 'Arnold Press', type: 'loaded' },
  { name: 'Barbell Bent Over Row', type: 'loaded' },
  { name: 'Pendlay Row', type: 'loaded' },
  { name: 'Dumbbell Row', type: 'loaded' },
  { name: 'Chest Supported Row', type: 'loaded' },
  { name: 'T-Bar Row', type: 'loaded' },
  { name: 'Cable Row', type: 'loaded' },
  { name: 'Weighted Pull-Up', type: 'loaded' },
  { name: 'Weighted Chin-Up', type: 'loaded' },
  { name: 'Weighted Dip', type: 'loaded' },
  { name: 'Hip Thrust', type: 'loaded' },
  { name: 'Barbell Lunge', type: 'loaded' },
  { name: 'Dumbbell Lunge', type: 'loaded' },
  { name: 'Leg Press', type: 'loaded' },
  { name: 'Leg Extension', type: 'loaded' },
  { name: 'Hamstring Curl', type: 'loaded' },
  { name: 'Barbell Curl', type: 'loaded' },
  { name: 'Dumbbell Curl', type: 'loaded' },
  { name: 'EZ Bar Curl', type: 'loaded' },
  { name: 'Skullcrusher', type: 'loaded' },
  { name: 'Triceps Pushdown', type: 'loaded' },
  { name: 'Upright Row', type: 'loaded' },
  { name: 'Shrugs', type: 'loaded' },
  { name: 'Power Clean', type: 'loaded' },
  { name: 'Hang Power Clean', type: 'loaded' },
  { name: 'Clean & Jerk', type: 'loaded' },
  { name: 'Snatch', type: 'loaded' },
  { name: 'Kettlebell Swing', type: 'loaded' },
  { name: 'Kettlebell Goblet Squat', type: 'loaded' },
  { name: 'Cable Fly', type: 'loaded' },
  { name: 'Lat Pulldown', type: 'loaded' },
  { name: 'Seated Row', type: 'loaded' },

  // REPS EXERCISES
  { name: 'Push-Up', type: 'reps' },
  { name: 'Diamond Push-Up', type: 'reps' },
  { name: 'Archer Push-Up', type: 'reps' },
  { name: 'Decline Push-Up', type: 'reps' },
  { name: 'Incline Push-Up', type: 'reps' },
  { name: 'Wide Push-Up', type: 'reps' },
  { name: 'Pull-Up', type: 'reps' },
  { name: 'Chin-Up', type: 'reps' },
  { name: 'Neutral Grip Pull-Up', type: 'reps' },
  { name: 'Australian Pull-Up', type: 'reps' },
  { name: 'Dip', type: 'reps' },
  { name: 'Bodyweight Squat', type: 'reps' },
  { name: 'Pistol Squat', type: 'reps' },
  { name: 'Walking Lunge', type: 'reps' },
  { name: 'Reverse Lunge', type: 'reps' },
  { name: 'Step-Up', type: 'reps' },
  { name: 'Box Jump', type: 'reps' },
  { name: 'Jump Squat', type: 'reps' },
  { name: 'Broad Jump', type: 'reps' },
  { name: 'Burpee', type: 'reps' },
  { name: 'Sit-Up', type: 'reps' },
  { name: 'Crunch', type: 'reps' },
  { name: 'Russian Twist', type: 'reps' },
  { name: 'Hanging Leg Raise', type: 'reps' },
  { name: 'Toes to Bar', type: 'reps' },
  { name: 'V-Up', type: 'reps' },
  { name: 'Knee Raise', type: 'reps' },
  { name: 'Mountain Climber', type: 'reps' },
  { name: 'Inverted Row', type: 'reps' },
  { name: 'Superman', type: 'reps' },
  { name: 'Lying Hip Thrust', type: 'reps' },
  { name: 'Tuck Front Lever Pull', type: 'reps' },
  { name: 'Skin the Cat', type: 'reps' },
  { name: 'Lying Leg Raise', type: 'reps' },
  { name: 'Jumping Lunge', type: 'reps' },

  // TIME EXERCISES
  { name: 'Plank', type: 'time' },
  { name: 'Side Plank', type: 'time' },
  { name: 'Reverse Plank', type: 'time' },
  { name: 'Hollow Hold', type: 'time' },
  { name: 'Arch Hold', type: 'time' },
  { name: 'L-Sit', type: 'time' },
  { name: 'Wall Sit', type: 'time' },
  { name: 'Dead Hang', type: 'time' },
  { name: 'Flexed Arm Hang', type: 'time' },
  { name: 'Front Lever Hold', type: 'time' },
  { name: 'Tuck Front Lever Hold', type: 'time' },
  { name: 'Back Lever Hold', type: 'time' },
  { name: 'Planche Hold', type: 'time' },
  { name: 'Tuck Planche Hold', type: 'time' },
  { name: 'Straddle Planche Hold', type: 'time' },
  { name: 'Human Flag Hold', type: 'time' },
  { name: 'Iron Cross Hold', type: 'time' },
  { name: 'Handstand Hold', type: 'time' },
  { name: 'Elbow Lever Hold', type: 'time' },
  { name: 'Support Hold (Rings)', type: 'time' },
  { name: 'Jump Rope', type: 'time' },
  { name: 'Running (Interval/Time)', type: 'time' },
  { name: 'Rowing Machine (Time)', type: 'time' },
  { name: 'Assault Bike', type: 'time' },
  { name: 'Battle Ropes', type: 'time' },
  { name: 'Isometric Biceps Hold', type: 'time' },
  { name: 'Isometric Push-Up Hold', type: 'time' },
  { name: 'Isometric Lunge Hold', type: 'time' },
];

export default Exercises;
