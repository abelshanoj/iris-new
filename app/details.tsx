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
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

const DetailsScreen: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grade, setGrade] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!fullName || !dateOfBirth || !grade || !syllabus) {
      Alert.alert("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http:localhost:8000/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          dateOfBirth: dateOfBirth.toISOString(),
          grade,
          syllabus,
        }),
      });

      // console.log(res);
      if (!res.ok) {
        // reads error text from server, shows alert, and stops
        const text = await res.text();
        Alert.alert("Error", `Server responded: ${res.status} ${text}`);
        return;
      }

      // only here, on success, do we navigate
      router.replace("/main");
    } catch (err: any) {
      Alert.alert("Network error", err.message);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.heading}>
        Hi, I’m Iris! Tell me a bit about yourself
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        placeholderTextColor="#aaa"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {dateOfBirth ? dateOfBirth.toDateString() : "Select Date"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDateOfBirth(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Grade</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1st Grade"
        placeholderTextColor="#aaa"
        value={grade}
        onChangeText={setGrade}
      />

      <Text style={styles.label}>Syllabus</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Syllabus A"
        placeholderTextColor="#aaa"
        value={syllabus}
        onChangeText={setSyllabus}
      />

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            loading && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#fff",
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: "#222",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 10,
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#ff724c",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  continueButtonDisabled: {
    backgroundColor: "#888",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DetailsScreen;
