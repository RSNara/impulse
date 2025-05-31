import IUIContainer from '@/components/iui/IUIContainer';
import type { AnySetLog, Workout } from '@/data/store';
import { useStore } from '@/data/store';

import { FlatList, Text, View } from 'react-native';

export default function HistoryScreen() {
  const [store] = useStore();

  return (
    <IUIContainer>
      <FlatList
        data={store.pastWorkouts}
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
  return (
    <View
      style={{
        flex: 1,
        margin: 10,
        borderRadius: 10,
        padding: 10,
        backgroundColor: 'rgba(0, 128, 255, 0.1)',
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
        <Text>📆 {stringifyDate(new Date(workout.startedAt))}</Text>
      </View>
      <View
        style={{
          marginBottom: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>Exercise</Text>
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
                <Text key={exerciseLog.name}>
                  {exerciseLog.setLogs.length} x
                </Text>
              );
            })}
          </View>
          <View style={{ marginLeft: 5 }}>
            {exerciseLogs.map((exerciseLog) => {
              return (
                <Text key={exerciseLog.name} numberOfLines={1}>
                  {exerciseLog.name}
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
  if (setLog.type === 'loaded') {
    return (
      <Text style={{ marginStart: 10 }}>
        {setLog.mass} lb x {setLog.reps}
      </Text>
    );
  }
  if (setLog.type === 'time') {
    return <Text style={{ marginStart: 10 }}>{setLog.time}</Text>;
  }

  return <Text style={{ marginStart: 10 }}>{setLog.reps}</Text>;
}
