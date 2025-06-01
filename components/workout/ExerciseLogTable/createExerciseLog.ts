import { Exercise } from '@/data/exercises';
import { ExerciseLog, ExerciseType } from '@/data/store';
import assertNever from '@/utils/assertNever';
import uuid from 'react-native-uuid';
import createSetLog from './createSetLog';

export default function createExerciseLog<T extends ExerciseType>(
  exercise: Exercise<T>
): ExerciseLog<T> {
  if (exercise.type == 'loaded') {
    return {
      name: exercise.name,
      type: exercise.type,
      setLogs: [createSetLog<'loaded'>('loaded', false)],
      id: uuid.v4(),
    } as ExerciseLog<'loaded'> as ExerciseLog<T>;
  }

  if (exercise.type == 'reps') {
    return {
      name: exercise.name,
      type: exercise.type,
      setLogs: [createSetLog<'reps'>('reps', false)],
      id: uuid.v4(),
    } as ExerciseLog<'reps'> as ExerciseLog<T>;
  }

  if (exercise.type == 'time') {
    return {
      name: exercise.name,
      type: exercise.type,
      setLogs: [createSetLog<'time'>('time', false)],
      id: uuid.v4(),
    } as ExerciseLog<'time'> as ExerciseLog<T>;
  }

  assertNever(exercise);
}
