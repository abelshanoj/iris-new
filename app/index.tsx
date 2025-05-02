import React, { useState, useEffect } from "react";
import { StatusBar, ActivityIndicator, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AuthScreen from "@/screens/AuthScreen";

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const clearTokenAndCheck = async () => {
      // Remove the token on app start
      await AsyncStorage.removeItem("userToken");
      // Then, continue with your logic (token will be null)
      setLoading(false);
    };
    clearTokenAndCheck();
  }, []);

  // Check if a token is already stored
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setToken(storedToken);
          // Navigate to the main interface page (index.tsx) with the token
          router.replace(`/main?token=${storedToken}`);
        }
      } catch (error) {
        console.error("Error retrieving login state:", error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Handler to be called after successful sign-in in AuthScreen
  const handleSignIn = async () => {
    const storedToken = await AsyncStorage.getItem("userToken");
    if (storedToken) {
      setToken(storedToken);
      //console.log(storedToken);
      router.replace(`/main?token=${storedToken}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff724c" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* If no token, render the sign-in page */}
      {!token && <AuthScreen onSignIn={handleSignIn} />}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
