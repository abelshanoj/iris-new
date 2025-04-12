import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  GestureHandlerRootView,
  TapGestureHandler,
  PanGestureHandler,
  LongPressGestureHandler,
  State,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { ScrollView } from "react-native-gesture-handler";
import { useAudio } from "@/context/AudioContext";

export default function TextResponseScreen() {
  const translationY = useRef(0);
  const { playbackInstance } = useAudio();
  const { textResponse } = useLocalSearchParams<{ textResponse?: string }>();
  const [isPlaying, setIsPlaying] = useState(true);
  const screenWidth = Dimensions.get("window").width; // Get screen width dynamically

  // Double-tap handler for fast-forward/rewind
  const handleDoubleTap = (
    event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>
  ) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const { x } = event.nativeEvent;
      if (x < screenWidth / 2) {
        console.log("Double tap detected on the left side");
        seekAudio("backward");
      } else {
        console.log("Double tap detected on the right side");
        seekAudio("forward");
      }
    }
  };

  const seekAudio = async (direction: "forward" | "backward") => {
    if (playbackInstance) {
      const status = await playbackInstance.getStatusAsync();
      if (status.isLoaded) {
        if (status.durationMillis !== undefined) {
          const newPosition =
            direction === "forward"
              ? Math.min(status.positionMillis + 4000, status.durationMillis)
              : Math.max(status.positionMillis - 4000, 0);
          console.log(
            `Seeking ${direction}: moving from ${status.positionMillis} to ${newPosition}`
          );
          await playbackInstance.setPositionAsync(newPosition);
        } else {
          console.log(
            "Error loading the playback instance: durationMillis is undefined"
          );
        }
      }
    }
  };

  // Swipe up handler for navigation
  const handleSwipeUp = (event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.END) {
      if (translationY.current < -50) {
        console.log("Swipe up detected, navigating back to main screen");
        playbackInstance?.stopAsync();
        router.replace("/main", { relativeToDirectory: true });
      }
      translationY.current = 0;
    }
  };

  // Long press handler for pause/resume toggle with additional debugging logs
  const handleLongPress = async (event: HandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (playbackInstance) {
        try {
          const status = await playbackInstance.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await playbackInstance.pauseAsync();
              setIsPlaying(false);
              console.log("Audio paused successfully.");
            } else {
              await playbackInstance.playAsync();
              setIsPlaying(true);
              console.log("Audio resumed successfully.");
            }
          } else {
            console.warn("Playback instance is not loaded.");
          }
        } catch (error) {
          console.error("Error toggling audio on long press:", error);
        }
      } else {
        console.warn("Playback instance is null.");
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Long press gesture for toggling pause/resume */}
      <LongPressGestureHandler
        minDurationMs={1000}
        onHandlerStateChange={handleLongPress}
      >
        {/* Pan gesture for swipe up navigation */}
        <PanGestureHandler
          onGestureEvent={(event) => {
            translationY.current = event.nativeEvent.translationY;
          }}
          onHandlerStateChange={handleSwipeUp}
        >
          <View style={styles.container}>
            {/* Double tap gesture for fast-forward/rewind */}
            <TapGestureHandler
              onHandlerStateChange={handleDoubleTap}
              numberOfTaps={2}
            >
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.responseText}>{textResponse}</Text>
              </ScrollView>
            </TapGestureHandler>
          </View>
        </PanGestureHandler>
      </LongPressGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  scrollContentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  responseText: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
  },
});
