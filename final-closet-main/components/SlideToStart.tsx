import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, Animated, PanResponder, LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import HangerForSlider from '../assets/GetStarted/HangerForSlider.svg';
import ArrowForSlider from '../assets/GetStarted/ArrowForSlider.svg';

const SLIDER_HEIGHT = 60;
const CIRCLE_SIZE = 52;

interface SlideToStartProps {
  onComplete: () => void;
}

export default function SlideToStart({ onComplete }: SlideToStartProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  const lastValue = useRef(0);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTranslate = sliderWidth - CIRCLE_SIZE - 8;

  useEffect(() => {
    const listenerId = pan.addListener(({ value }: { value: number }) => {
      lastValue.current = value;
    });

    return () => {
      pan.removeListener(listenerId);
    };
  }, [pan]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [arrowOpacity]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Start continuous haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      hapticInterval.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 50);

      pan.stopAnimation();
      pan.setOffset(lastValue.current);
      pan.setValue(0);
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      // Stop continuous haptic feedback
      if (hapticInterval.current) {
        clearInterval(hapticInterval.current);
        hapticInterval.current = null;
      }

      pan.flattenOffset();
      const currentValue = lastValue.current;

      if (currentValue < 0) {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else if (currentValue > maxTranslate * 0.8) {
        Animated.spring(pan, {
          toValue: maxTranslate,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          onComplete();
        }, 100);
      } else {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  }), [pan, maxTranslate, onComplete]);

  const onLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      className="relative rounded-full overflow-hidden"
      style={{
        height: SLIDER_HEIGHT,
        backgroundColor: 'rgba(217, 217, 217, 0.52)'
      }}
      onLayout={onLayout}
    >
      {/* Slider text */}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-white font-jakarta-medium text-base">Slide to get started</Text>
      </View>

      {/* Arrow icon at the right end */}
      <Animated.View
        className="absolute right-4 top-0 bottom-0 items-center justify-center"
        style={{ opacity: arrowOpacity }}
      >
        <ArrowForSlider width={24} height={24} />
      </Animated.View>

      {/* Draggable circle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{
            translateX: pan.interpolate({
              inputRange: [-1000, 0, maxTranslate > 0 ? maxTranslate : 1000],
              outputRange: [0, 0, maxTranslate > 0 ? maxTranslate : 1000],
              extrapolate: 'clamp',
            })
          }],
          position: 'absolute',
          left: 4,
          top: 4,
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: CIRCLE_SIZE / 2,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <HangerForSlider width={28} height={28} />
      </Animated.View>
    </View>
  );
}
