import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface FormTextFieldProps extends TextInputProps {
  label?: string;
  errors?: string[]; // tambahkan tipe errors sebagai array string opsional
}

export default function FormTextField({
  label,
  errors = [],
  ...rest
}: FormTextFieldProps) {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={styles.textInput} autoCapitalize="none" {...rest} />
      {errors.map((err, idx) => (
        <Text key={idx} style={styles.error}>
          {err}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: "500",
    color: "#334155",
  },
  textInput: {
    height: 40,
    marginTop: 4,
    borderColor: "#cbd5e1",
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  error: {
    color: "red",
    marginTop: 2,
  },
});
