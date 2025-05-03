import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useAudio } from "@/context/AudioContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, router } from "expo-router";

export default function AppMain() {
  const { setPlaybackInstance } = useAudio();
  const [tokens, setTokens] = useState<{
    idToken: string;
    accessToken: string;
  } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("userTokens")
      .then((str) => {
        if (str) setTokens(JSON.parse(str));
        else console.warn("No tokens in storage");
      })
      .catch(console.error);
  }, []);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string>("");
  const playbackInstanceRef = useRef(new Audio.Sound());
  const lottieRef = useRef<LottieView | null>(null);

  const sendAudio = async (base64Audio: string) => {
    try {
      const response = await fetch("http://192.168.78.37:8000/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio_base64: base64Audio }),
      });

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.log("Error response:", errorText);
        return;
      }
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.audio_base64) {
          playAudioResponse(data.audio_base64);
        }

        if (data.agent_response) {
          console.log(data.agent_response);
          router.push(`/text-response?textResponse=${data.agent_response}`, {
            relativeToDirectory: true,
          });
        }
      } else {
        console.error("Unexpected response type:", contentType);
        const rawText = await response.text();
        console.log("Raw response:", rawText);
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  };

  const playAudioResponse = async (base64Audio: string) => {
    try {
      const audioUri = FileSystem.cacheDirectory + "responseAudio.mp3";

      await FileSystem.writeAsStringAsync(audioUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const playbackInstance = playbackInstanceRef.current;

      if (playbackInstance) {
        await playbackInstance.unloadAsync();
      }

      await playbackInstance.loadAsync({ uri: audioUri });

      //   playbackInstance.current.setOnPlaybackStatusUpdate((status) => {
      //     if (status.didJustFinish) {
      //       playbackInstance.current.setOnPlaybackStatusUpdate(null);
      //       navigation.navigate('Main');
      //     }
      //   });
      setPlaybackInstance(playbackInstance);
      await playbackInstance.playAsync();
    } catch (error) {
      console.error("Error playing audio response:", error);
    }
  };

  const toggleRecording = async () => {
    setIsRecording((prev) => !prev);

    if (!isRecording) {
      await startRecording();
    } else {
      await stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Error",
          "Permission to access the microphone is required!"
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);

      if (lottieRef.current) {
        lottieRef.current.play();
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          setAudioUri(uri);

          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await sendAudio(base64Audio);
        }
        setRecording(null);
      }

      if (lottieRef.current) {
        lottieRef.current.reset();
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const playLastRecordedAudio = async () => {
    try {
      if (!audioUri) {
        Alert.alert("No Audio", "No audio has been recorded yet!");
        return;
      }

      await playbackInstanceRef.current.unloadAsync();
      await playbackInstanceRef.current.loadAsync({ uri: audioUri });
      await playbackInstanceRef.current.playAsync();
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.whiteButton}
            onPress={toggleRecording}
          />
        ) : (
          <TouchableOpacity
            style={styles.lottieContainer}
            onPress={toggleRecording}
          >
            <LottieView
              ref={lottieRef}
              source={require("E:/iris/assets/new.json")} // Replace with the correct path
              autoPlay={false}
              loop
              style={styles.lottie}
            />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={playLastRecordedAudio}>
        <Text style={styles.playbackText}>Play the last recorded audio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  whiteButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieContainer: {
    width: 400,
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 400,
    height: 400,
  },
  playbackText: {
    textAlign: "center",
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
    marginBottom: 20,
  },
});
