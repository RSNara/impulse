import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  useAnimatedValue,
  Vibration,
  ViewStyle,
} from 'react-native';

let i = 0;

export default function IUIDismissable({
  onDismiss,
  children,
  style,
  towards = 'right',
}: {
  onDismiss: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  towards?: 'left' | 'right';
}) {
  const translateX = useAnimatedValue(0);
  const triggerPanDxRef = useRef(15);
  const triggerDismissDxRef = useRef(30);
  const finalTranslateXRef = useRef(500);
  const onDismissRef = useRef(onDismiss);
  const towardsRef = useRef(towards);

  useEffect(() => {
    towardsRef.current = towards;
  }, [towards]);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const [rowWidth, setRowWidth] = useState(0);
  useEffect(() => {
    if (rowWidth > 0) {
      triggerDismissDxRef.current = rowWidth * 0.4;
      finalTranslateXRef.current = rowWidth;
    }
  }, [rowWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return towardsRef.current == 'right'
          ? gestureState.dx > triggerPanDxRef.current
          : gestureState.dx < -triggerPanDxRef.current;
      },
      onPanResponderMove: Animated.event([null, { dx: translateX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const shouldDismiss =
          towardsRef.current == 'right'
            ? gestureState.dx > triggerDismissDxRef.current
            : gestureState.dx < -triggerDismissDxRef.current;

        if (shouldDismiss) {
          // Dismiss the item
          Vibration.vibrate();
          const toValue =
            towardsRef.current == 'right'
              ? finalTranslateXRef.current
              : -finalTranslateXRef.current;

          Animated.timing(translateX, {
            toValue: toValue,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onDismissRef.current();
          });
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // SAME reset logic as above
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const deleteBarBGColor = translateX.interpolate({
    ...(towards == 'right'
      ? {
          inputRange: [0, triggerPanDxRef.current, triggerDismissDxRef.current],
          outputRange: [
            'rgba(255, 0, 0, 0)',
            'rgba(255, 0, 0, 0.1)',
            'rgba(255, 0, 0, 0.75)',
          ],
        }
      : {
          inputRange: [
            -triggerDismissDxRef.current,
            -triggerPanDxRef.current,
            0,
          ],
          outputRange: [
            'rgba(255, 0, 0, 0.75)',
            'rgba(255, 0, 0, 0.1)',
            'rgba(255, 0, 0, 0)',
          ],
        }),
    extrapolate: 'clamp',
  });

  const deleteBarColor = translateX.interpolate(
    towards == 'right'
      ? {
          inputRange: [0, triggerPanDxRef.current],
          outputRange: ['transparent', 'rgba(255, 255, 255, 1)'],
        }
      : {
          inputRange: [-triggerPanDxRef.current, 0],
          outputRange: ['rgba(255, 255, 255, 1)', 'transparent'],
        }
  );

  return (
    <Animated.View
      style={[{ transform: [{ translateX }] }, style]}
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
                paddingRight: 15,
              }
            : {
                top: 0,
                bottom: 0,
                left: rowWidth,
                width: rowWidth,
                flexDirection: 'row',
                paddingLeft: 15,
              }),
          backgroundColor: deleteBarBGColor,
          alignItems: 'center',
        }}
      >
        <Animated.Text style={{ fontWeight: 'bold', color: deleteBarColor }}>
          Delete
        </Animated.Text>
      </Animated.View>
      {children}
    </Animated.View>
  );
}
