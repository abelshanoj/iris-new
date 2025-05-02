import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import CLIENT_IDS from "../keys";

GoogleSignin.configure({
  webClientId: CLIENT_IDS.web,
});

interface AuthScreenProps {
  onSignIn: () => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn }) => {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) setIsLoggedIn(true);
  };

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();

      const { idToken } = await GoogleSignin.getTokens();
      if (idToken) {
        await AsyncStorage.setItem("userToken", idToken);
        setIsLoggedIn(true);
        await onSignIn();
      } else {
        console.error("idToken is undefined.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
        if ("code" in error) {
          const errorCode = (error as any).code;

          if (errorCode === statusCodes.SIGN_IN_CANCELLED) {
            console.log("User cancelled the login flow");
          } else if (errorCode === statusCodes.IN_PROGRESS) {
            console.log("Signing in");
          } else if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log("Play services not available or outdated");
          } else {
            console.error("Unhandled error code:", errorCode);
          }
        }
      } else {
        console.error("An unknown error occurred", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <Text style={styles.loggedInText}>You are logged in!</Text>
      ) : (
        <>
          <Text style={styles.title}>Welcome to Iris App</Text>
          <Text style={styles.subtitle}>Sign in to explore our features</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#ff724c" />
          ) : (
            <GoogleSigninButton
              style={styles.googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={onGoogleButtonPress}
            />
          )}
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

export default AuthScreen;
