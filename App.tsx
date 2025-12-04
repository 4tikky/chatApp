import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ChatScreen from "./screens/ChatScreen";

import { auth } from "./firebase";

import { onAuthStateChanged, User } from "firebase/auth";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Chat: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Listener perubahan status login
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        // Ambil nama dari displayName atau dari email
        const name =
          u.displayName || u.email?.split("@")[0] || "Pengguna";
        setUserName(name);
      } else {
        setUserName(null);
      }

      setInitializing(false);
    });

    return () => unsub();
  }, []);

  // Saat masih cek auth pertama kali, tampilkan loading
  if (initializing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user && userName ? (
          // Kalau SUDAH login -> langsung ke Chat (AUTO-LOGIN)
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            initialParams={{ name: userName }}
          />
        ) : (
          // Kalau BELUM login -> tampilkan Login + Register
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
