import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import CLIENT_IDS from "../keys";

GoogleSignin.configure({
  webClientId: CLIENT_IDS.web,
  scopes: [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
    "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
    "https://www.googleapis.com/auth/classroom.announcements.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.signOut(); // optional: to ensure fresh login
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      await AsyncStorage.setItem("userTokens", JSON.stringify(tokens));

      const serverAuthCode = userInfo.data?.serverAuthCode;

      if (!serverAuthCode) {
        alert("Failed to retrieve serverAuthCode.");
        return;
      }

      const response = await fetch("http://localhost:8000/oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverAuthCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to send auth code to backend");
      }

      const result = await response.json();
      console.log("Backend response:", result);

      if (result.userPresent) {
        setIsLoggedIn(true);
        router.replace("/main");
      } else {
        router.replace("/details");
      }
    } catch (error: unknown) {
      console.error("Error during sign-in process:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {isLoggedIn ? (
        <Text style={styles.loggedInText}>You are logged in!</Text>
      ) : (
        <>
          <Text style={styles.title}>Welcome to Iris App</Text>
          <Text style={styles.subtitle}>Sign in to explore our features</Text>
          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={onGoogleButtonPress}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f8",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2a3c41",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#2a3c41",
    marginBottom: 20,
    textAlign: "center",
  },
  googleButton: {
    width: 200,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 4,
  },
  loggedInText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2a3c41",
    textAlign: "center",
  },
});

export default LoginScreen;
