import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  useAnimatedValue,
  View,
  ViewStyle,
} from 'react-native';

export default function IUISwipeToReveal({
  children,
  style,
  towards = 'right',
  revealables,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  towards?: 'left' | 'right';
  revealables: React.ReactNode;
}) {
  const translateX = useAnimatedValue(0);
  const towardsRef = useRef(towards);

  useEffect(() => {
    towardsRef.current = towards;
  }, [towards]);

  const [revealablesWidth, setRevealablesWidth] = useState(0);
  const revealablesWidthRef = useRef(revealablesWidth);

  useEffect(() => {
    if (revealablesWidth > 0) {
      revealablesWidthRef.current = revealablesWidth;
    }
  }, [revealablesWidth]);

  const hiddenRef = useRef(true);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const panDx = revealablesWidthRef.current * 0.1;
        if (hiddenRef.current) {
          return towardsRef.current == 'right'
            ? gestureState.dx > panDx
            : gestureState.dx < -panDx;
        }
        return towardsRef.current == 'right'
          ? gestureState.dx < -panDx
          : gestureState.dx > panDx;
      },
      onPanResponderMove: (_, gestureState) => {
        if (hiddenRef.current) {
          translateX.setValue(gestureState.dx);
        } else {
          if (towardsRef.current === 'right') {
            translateX.setValue(revealablesWidthRef.current + gestureState.dx);
          } else {
            translateX.setValue(-revealablesWidthRef.current + gestureState.dx);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const revealDx = revealablesWidthRef.current * 0.2;
        if (hiddenRef.current) {
          const shouldReveal =
            towardsRef.current == 'right'
              ? gestureState.dx > revealDx
              : gestureState.dx < -revealDx;
          if (shouldReveal) {
            // hidden and should reveal
            reveal();
          } else {
            // hidden and !should reveal
            hide();
          }
          return;
        }

        const shouldHide =
          towardsRef.current == 'right'
            ? gestureState.dx < -revealDx
            : gestureState.dx > revealDx;

        if (shouldHide) {
          // not hidden && should hide
          hide();
        } else {
          // not hidden && not hide
          reveal();
        }

        function reveal() {
          const toValue =
            towardsRef.current == 'right'
              ? revealablesWidthRef.current
              : -revealablesWidthRef.current;

          hiddenRef.current = false;
          Animated.spring(translateX, {
            toValue: toValue,
            useNativeDriver: false,
          }).start();
        }

        function hide() {
          hiddenRef.current = true;
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: (_, gestureState) => {
        if (hiddenRef.current) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else {
          const toValue =
            towardsRef.current == 'right'
              ? revealablesWidthRef.current
              : -revealablesWidthRef.current;

          hiddenRef.current = false;
          Animated.spring(translateX, {
            toValue: toValue,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const [rowWidth, setRowWidth] = useState(0);

  return (
    <Animated.View
      style={[{ transform: [{ translateX: translateX }] }, style]}
      {...panResponder.panHandlers}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setRowWidth(width);
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          ...(towards == 'right'
            ? {
                top: 0,
                bottom: 0,
                left: -rowWidth,
                width: rowWidth,
                flexDirection: 'row-reverse',
              }
            : {
                top: 0,
                bottom: 0,
                left: rowWidth,
                width: rowWidth,
                flexDirection: 'row',
              }),
          alignItems: 'stretch',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setRevealablesWidth(width);
          }}
        >
          {revealables}
        </View>
      </Animated.View>
      {children}
    </Animated.View>
  );
}
