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
});

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   const init = async () => {
  //     await AsyncStorage.removeItem("idToken"); // optional: clear token
  //     await checkLoginStatus();
  //   };
  //   init();
  // }, []);

  // const checkLoginStatus = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("idToken");
  //     if (token) {
  //       setIsLoggedIn(true);
  //       router.replace(`/main?token=${token}`);
  //     }
  //   } catch (error) {
  //     console.error("Error checking login status:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onGoogleButtonPress = async () => {
    // setLoading(true);
    try {
      await GoogleSignin.signOut(); // optional: to ensure fresh login
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      await AsyncStorage.setItem("userTokens", JSON.stringify(tokens));
      setIsLoggedIn(true);
      router.replace("/details");
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
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#ff724c" />
  //     </View>
  //   );
  // }

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
