import IUIContainer from '@/components/iui/IUIContainer';
import storage from '@/data/storage';
import type { Workout } from './index';

import { Fragment, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);

  useEffect(() => {
    storage.getAllDataForKey<Workout>('workouts').then((loadedWorkouts) => {
      setWorkouts(loadedWorkouts);
    });
  }, []);

  return (
    <IUIContainer>
      <FlatList
        data={workouts || []}
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
      {workout.exerciseLogs.map((exerciseLog) => {
        let $content = <Fragment />;
        if (exerciseLog.type == 'reps') {
          const displaySets = exerciseLog.sets.slice(0, 2);
          $content = (
            <Fragment>
              <Text>
                {exerciseLog.sets.length} x {exerciseLog.name}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {displaySets.map((set, i) => {
                  return (
                    <Text key={i} style={{ marginStart: 10 }}>
                      {set.reps}
                    </Text>
                  );
                })}
              </View>
            </Fragment>
          );
        } else if (exerciseLog.type === 'loaded') {
          const displaySets = exerciseLog.sets.slice(0, 2);
          $content = (
            <Fragment>
              <Text>
                {exerciseLog.sets.length} x {exerciseLog.name}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {displaySets.map((set, i) => {
                  return (
                    <Text key={i} style={{ marginStart: 10 }}>
                      {set.mass} x {set.reps}
                    </Text>
                  );
                })}
              </View>
            </Fragment>
          );
        } else if (exerciseLog.type === 'time') {
          const displaySets = exerciseLog.sets.slice(0, 2);
          $content = (
            <Fragment>
              <Text>
                {exerciseLog.sets.length} x {exerciseLog.name}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {displaySets.map((set, i) => {
                  return (
                    <Text key={i} style={{ marginStart: 10 }}>
                      {set.time}
                    </Text>
                  );
                })}
              </View>
            </Fragment>
          );
        }

        return (
          <View
            key={exerciseLog.name}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {$content}
          </View>
        );
      })}
    </View>
  );
}
