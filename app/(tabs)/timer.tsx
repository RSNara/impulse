import IUIButton from '@/components/iui/IUIButton';
import IUIContainer from '@/components/iui/IUIContainer';
import type { Timer } from '@/data/store';
import { emptyTimer, useStore } from '@/data/store';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

let id = 0;

export default function ExercisesScreen() {
  const [store, setStore] = useStore();

  const { timer } = store;
  function updateTimer(partial: Partial<Timer>) {
    setStore({
      ...store,
      timer: {
        ...timer,
        ...partial,
      },
    });
  }

  const timeLeft = Math.max(timer.duration - timer.elapsed, 0);

  useInterval(
    () => {
      console.log(timeLeft);
      if (timeLeft <= 0) {
        updateTimer({
          elapsed: 0,
          ticking: false,
        });
      } else {
        updateTimer({
          elapsed: Math.min(timer.elapsed + 1000, timer.duration),
        });
      }
    },
    1000,
    timer.ticking
  );

  return (
    <IUIContainer>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ margin: 10 }}>
          <CircularProgress
            value={Math.floor((timeLeft / timer.duration) * 100)}
            radius={140}
            progressValueColor={'green'}
            titleFontSize={16}
            activeStrokeColor={'rgba(0, 127, 255, 1)'}
            inActiveStrokeColor={'rgba(0, 0, 0, 0.1)'}
            showProgressValue={false}
            subtitleFontSize={50}
          ></CircularProgress>

          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 50 }}>
              {formatMs(timeLeft)}
            </Text>
            <Text style={{ fontSize: 20 }}>{formatMs(timer.duration)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', margin: 10 }}>
          <View style={{ marginHorizontal: 5 }}>
            <IUIButton
              type="secondary"
              feeling="neutral"
              onPress={() => {
                updateTimer({
                  duration: Math.max(timer.duration - 30 * 1000, 0),
                });
              }}
            >
              -30s
            </IUIButton>
          </View>

          <View style={{ marginHorizontal: 5 }}>
            {timer.ticking == false ? (
              <IUIButton
                type="primary"
                feeling="positive"
                onPress={() => {
                  updateTimer({
                    ticking: true,
                  });
                }}
              >
                Start
              </IUIButton>
            ) : (
              <IUIButton
                type="secondary"
                feeling="negative"
                onPress={() => {
                  updateTimer(emptyTimer());
                }}
              >
                Reset
              </IUIButton>
            )}
          </View>

          <View style={{ marginHorizontal: 5 }}>
            <IUIButton
              type="secondary"
              feeling="neutral"
              onPress={() => {
                updateTimer({
                  duration: timer.duration + 30 * 1000,
                });
              }}
            >
              +30s
            </IUIButton>
          </View>
        </View>
      </View>
    </IUIContainer>
  );
}

function formatMs(ms: number) {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsInMinute = Math.floor(seconds - minutes * 60);
  return `${minutes}:${String(secondsInMinute).padStart(2, '0')}`;
}

function useInterval(fn: () => void, interval: number, isOn: boolean) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (isOn) {
      const id = setInterval(() => {
        fnRef.current();
      }, interval);

      return () => {
        clearInterval(id);
      };
    }
  }, [interval, isOn]);
}

const styles = StyleSheet.create({
  exercise: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
