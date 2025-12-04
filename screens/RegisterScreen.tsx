import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validatePassword = (pwd: string) => {
    // Minimal 6 karakter, ada huruf dan angka (sederhana)
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    return pwd.length >= 6 && hasNumber.test(pwd) && hasLetter.test(pwd);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua kolom harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password dan Konfirmasi Password tidak sama");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Password Lemah",
        "Password harus minimal 6 karakter, mengandung huruf dan angka."
      );
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan data user ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Sukses", "Akun berhasil dibuat!", [
        { text: "OK", onPress: () => {} }, // App.tsx akan menangani navigasi via onAuthStateChanged
      ]);
    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = "Email sudah terdaftar.";
      } else if (error.code === 'auth/invalid-email') {
        msg = "Format email salah.";
      }
      Alert.alert("Registrasi Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerIcon}>🌸</Text>
          <Text style={styles.headerTitle}>Daftar Akun</Text>
          <Text style={styles.headerSubtitle}>Menghubungkan yang jauh menjadi dekat!</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Atika Cantik"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="atika@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimal 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            * Minimal 6 karakter, dengan kombinasi huruf & angka.
          </Text>

          <Text style={styles.label}>Konfirmasi Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Text>{showConfirmPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF1493" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Daftar Sekarang 💖</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F5", // Pink muda sebagai background utama
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF1493", // Pink gelap untuk judul
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FF69B4", // Pink sedang
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#FFB6C1", // Pink ringan untuk border
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF1493", // Pink gelap untuk label
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFF5EE", // Pink sangat muda untuk input
    borderWidth: 1,
    borderColor: "#FFB6C1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5EE",
    borderWidth: 1,
    borderColor: "#FFB6C1",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  hint: {
    fontSize: 12,
    color: "#FF69B4",
    marginTop: 4,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#FF1493", // Pink gelap untuk tombol
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#FF69B4",
  },
  linkText: {
    color: "#FF1493",
    fontWeight: "bold",
  },
});