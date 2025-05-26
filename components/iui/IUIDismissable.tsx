import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  useAnimatedValue,
  Vibration,
  ViewStyle,
} from 'react-native';

export default function IUIDismissable({
  onDismiss,
  children,
  style,
}: {
  onDismiss: () => void;
  children: React.ReactNode;
  style: ViewStyle;
}) {
  const translateX = useAnimatedValue(0);
  const triggerPanDxRef = useRef(15);
  const triggerDismissDxRef = useRef(30);
  const finalTranslateXRef = useRef(500);
  const onDismissRef = useRef(onDismiss);

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
        return gestureState.dx > triggerPanDxRef.current;
      },
      onPanResponderMove: Animated.event([null, { dx: translateX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > triggerDismissDxRef.current) {
          // Dismiss the item
          Vibration.vibrate();
          Animated.timing(translateX, {
            toValue: finalTranslateXRef.current,
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

  const swipeColor = translateX.interpolate({
    inputRange: [0, triggerPanDxRef.current, triggerDismissDxRef.current],
    outputRange: [
      'rgba(255, 0, 0, 0)',
      'rgba(255, 0, 0, 0.1)',
      'rgba(255, 0, 0, 0.75)',
    ], // More red left and right, neutral in center
    extrapolate: 'clamp',
  });

  const deleteColor = translateX.interpolate({
    inputRange: [0, triggerPanDxRef.current],
    outputRange: ['transparent', 'rgba(255, 255, 255, 1)'],
  });

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
          left: -rowWidth,
          top: 0,
          width: rowWidth,
          bottom: 0,
          backgroundColor: swipeColor,
          flexDirection: 'row-reverse',
          alignItems: 'center',
          paddingRight: 15,
        }}
      >
        <Animated.Text style={{ fontWeight: 'bold', color: deleteColor }}>
          Delete
        </Animated.Text>
      </Animated.View>
      {children}
    </Animated.View>
  );
}
