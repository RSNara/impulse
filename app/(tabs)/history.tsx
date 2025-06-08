import IUIContainer from '@/components/iui/IUIContainer';
import type { AnyExercise, AnySetLog, Workout } from '@/data/store';
import { useExercises, usePastWorkouts } from '@/data/store';

import { FlatList, Text, View } from 'react-native';

export default function HistoryScreen() {
  const [pastWorkouts] = usePastWorkouts();

  return (
    <IUIContainer>
      <FlatList
        data={pastWorkouts}
        keyExtractor={(workout) => String(workout.startedAt)}
        renderItem={(info) => {
          const workout = info.item;
          return <WorkoutCard key={workout.startedAt} workout={workout} />;
        }}
      />
    </IUIContainer>
  );
}

function stringifyDate(date: Date) {
  const month = date.toLocaleString('en-US', { month: 'short' }); // "May"
  const day = date.getDate(); // 20
  const year = date.getFullYear(); // 2025
  return `${month} ${day}, ${year}`;
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const exerciseLogs = workout.exerciseLogs;
  const [exercises] = useExercises();
  const exercisesMap: { [name: string]: AnyExercise } = exercises.reduce(
    (map, exercise) => {
      return {
        ...map,
        [exercise.id]: exercise,
      };
    },
    {}
  );
  return (
    <View
      style={{
        flex: 1,
        margin: 10,
        borderRadius: 5,
        padding: 10,
        borderStartWidth: 5,
        borderWidth: 1,
        borderColor: 'rgba(0, 128, 255, 0.25)',
      }}
    >
      <View
        style={{
          marginBottom: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontWeight: 'bold', color: 'rgba(0, 128, 255, 1)' }}>
          {workout.name}
        </Text>
        <Text style={{ color: 'rgba(0, 128, 255, 1)' }}>
          {stringifyDate(new Date(workout.startedAt))}
        </Text>
      </View>
      <View
        style={{
          marginBottom: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>Exercises</Text>
        <Text style={{ fontWeight: 'bold' }}>Sets</Text>
      </View>
      <View
        style={{
          marginBottom: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'flex-end' }}>
            {exerciseLogs.map((exerciseLog) => {
              return (
                <Text key={exerciseLog.id}>{exerciseLog.setLogs.length} x</Text>
              );
            })}
          </View>
          <View style={{ marginLeft: 5 }}>
            {exerciseLogs.map((exerciseLog) => {
              return (
                <Text key={exerciseLog.id} numberOfLines={1}>
                  {exercisesMap[exerciseLog.exerciseId].name}
                </Text>
              );
            })}
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'flex-end' }}>
            {exerciseLogs.map((exerciseLog, i) => {
              const nonWarmupSets = exerciseLog.setLogs.filter(
                (setLog) => !setLog.warmup
              );
              const firstLog = nonWarmupSets[0];
              return firstLog ? <SetLog setLog={firstLog} key={i} /> : null;
            })}
          </View>
          <View style={{ marginLeft: 5, alignItems: 'flex-end' }}>
            {exerciseLogs.map((exerciseLog, i) => {
              const nonWarmupSets = exerciseLog.setLogs.filter(
                (setLog) => !setLog.warmup
              );
              const secondLog = nonWarmupSets[0];
              return secondLog ? <SetLog setLog={secondLog} key={i} /> : null;
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function SetLog({ setLog }: { setLog: AnySetLog }) {
  if (setLog.type === 'weights') {
    return (
      <Text style={{ marginStart: 10 }}>
        {setLog.mass} x {setLog.reps}
      </Text>
    );
  }
  if (setLog.type === 'time') {
    return <Text style={{ marginStart: 10 }}>{setLog.time}</Text>;
  }

  return <Text style={{ marginStart: 10 }}>{setLog.reps}</Text>;
}
