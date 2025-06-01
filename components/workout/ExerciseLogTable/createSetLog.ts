import type { ExerciseType } from '@/data/store';
import { SetLog } from '@/data/store';
import assertNever from '@/utils/assertNever';
import uuid from 'react-native-uuid';

export default function createSetLog<T extends ExerciseType>(
  type: T,
  warmup: boolean
): SetLog<T> {
  if (type == 'time') {
    const setLog: SetLog<'time'> = {
      type: 'time',
      time: null,
      done: false,
      warmup,
      id: uuid.v4(),
    };
    return setLog as SetLog<T>;
  }

  if (type == 'loaded') {
    const setLog: SetLog<'loaded'> = {
      type: 'loaded',
      mass: null,
      reps: null,
      done: false,
      warmup,
      id: uuid.v4(),
    };

    return setLog as SetLog<T>;
  }

  if (type == 'reps') {
    const setLog: SetLog<'reps'> = {
      type: 'reps',
      reps: null,
      done: false,
      warmup,
      id: uuid.v4(),
    };

    return setLog as SetLog<T>;
  }

  assertNever(type);
}
