import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(cred.user, {
        displayName: username.trim(),
      });

      Alert.alert("Berhasil", "Akun berhasil dibuat");

      // Langsung masuk ke chat
      navigation.navigate("Chat", { name: username.trim() });
      // atau kalau mau kembali ke login:
      // navigation.replace("Login");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Register gagal", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register ChatApp</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Register" onPress={handleRegister} />

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={styles.loginLink}
      >
        <Text style={styles.centerText}>
          Sudah punya akun?{" "}
          <Text style={styles.boldText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  loginLink: {
    marginTop: 16,
  },
  centerText: {
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold",
  },
});
