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
  actionsPos = 'start',
  actions,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  actionsPos?: 'end' | 'start';
  actions: React.ReactNode;
}) {
  const translateX = useAnimatedValue(0);
  const actionsPosRef = useRef(actionsPos);

  useEffect(() => {
    actionsPosRef.current = actionsPos;
  }, [actionsPos]);

  const [actionsWidth, setActionsWidth] = useState(100);
  const actionsWidthRef = useRef(actionsWidth);

  useEffect(() => {
    if (actionsWidth > 0) {
      actionsWidthRef.current = actionsWidth;
    }
  }, [actionsWidth]);

  const hiddenRef = useRef(true);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const panDx = actionsWidthRef.current * 0.1;
        if (hiddenRef.current) {
          return actionsPosRef.current == 'start'
            ? gestureState.dx > panDx
            : gestureState.dx < -panDx;
        }
        return actionsPosRef.current == 'start'
          ? gestureState.dx < -panDx
          : gestureState.dx > panDx;
      },
      onPanResponderMove: (_, gestureState) => {
        if (hiddenRef.current) {
          translateX.setValue(gestureState.dx);
        } else {
          if (actionsPosRef.current === 'start') {
            translateX.setValue(actionsWidthRef.current + gestureState.dx);
          } else {
            translateX.setValue(-actionsWidthRef.current + gestureState.dx);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const revealDx = actionsWidthRef.current * 0.2;
        if (hiddenRef.current) {
          const shouldReveal =
            actionsPosRef.current == 'start'
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
          actionsPosRef.current == 'start'
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
            actionsPosRef.current == 'start'
              ? actionsWidthRef.current
              : -actionsWidthRef.current;

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
            actionsPosRef.current == 'start'
              ? actionsWidthRef.current
              : -actionsWidthRef.current;

          hiddenRef.current = false;
          Animated.spring(translateX, {
            toValue: toValue,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const [rowWidth, setRowWidth] = useState(-1);

  const actionStylesHidden = {
    top: 0,
    bottom: 0,
    start: -100,
    width: 0,
  };

  const translateXNeg = Animated.multiply(translateX, -0.75);

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
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          ...(rowWidth == -1
            ? actionStylesHidden
            : actionsPos == 'start'
            ? {
                top: 0,
                bottom: 0,
                start: -rowWidth,
                width: rowWidth,
                flexDirection: 'row-reverse',
              }
            : {
                top: 0,
                bottom: 0,
                start: rowWidth,
                width: rowWidth,
                flexDirection: 'row',
              }),
          alignItems: 'stretch',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setActionsWidth(width);
          }}
        >
          {actions}
        </View>
      </Animated.View>
      <Animated.View
        style={
          actionsPos == 'end'
            ? { paddingStart: translateXNeg }
            : { paddingEnd: translateXNeg }
        }
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}
