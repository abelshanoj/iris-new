import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

const DetailsScreen: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [grade, setGrade] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setDateOfBirth(selectedDate || dateOfBirth);
  };

  const handleContinue = async () => {
    if (!fullName || !dateOfBirth || !grade || !syllabus) {
      Alert.alert("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://your-backend.com/api/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          dateOfBirth: dateOfBirth.toISOString(),
          grade,
          syllabus,
        }),
      });

      if (res.ok) {
        router.replace("/main");
      } else {
        const text = await res.text();
        Alert.alert("Error", `Server responded: ${res.status} ${text}`);
      }
    } catch (err: any) {
      Alert.alert("Network error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <Text style={styles.heading}>
        Hi, I’m Iris! Tell me a bit about yourself
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        placeholderTextColor="gray"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <Button
        title={dateOfBirth ? dateOfBirth.toDateString() : "Select Date"}
        onPress={() => setDateOfBirth(new Date())}
        color="#444"
      />
      {dateOfBirth && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Grade</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1st Grade"
        placeholderTextColor="gray"
        value={grade}
        onChangeText={setGrade}
      />

      <Text style={styles.label}>Syllabus</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Syllabus A"
        placeholderTextColor="gray"
        value={syllabus}
        onChangeText={setSyllabus}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Continue" onPress={handleContinue} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: "white",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default DetailsScreen;
