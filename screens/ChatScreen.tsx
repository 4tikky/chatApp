import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary, Asset } from "react-native-image-picker";

import {
  auth,
  messagesCollection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  storage,
  ref,
  getDownloadURL,
  uploadString, 
} from "../firebase";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type MessageType = {
  id: string;
  text?: string;
  user: string;
  imageUrl?: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { name } = route.params;

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  // 1. Load history lokal saat awal buka chat
  useEffect(() => {
    const loadLocalHistory = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("chat_history");
        if (jsonValue) {
          const parsed: MessageType[] = JSON.parse(jsonValue);
          setMessages(parsed);
        }
      } catch (e) {
        console.log("Gagal load history lokal:", e);
      }
    };

    loadLocalHistory();
  }, []);

  // 2. Listener Firestore + simpan ke AsyncStorage
  useEffect(() => {
    const q = query(messagesCollection, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        const list: MessageType[] = [];
        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            ...(doc.data() as Omit<MessageType, "id">),
          });
        });

        setMessages(list);

        try {
          await AsyncStorage.setItem("chat_history", JSON.stringify(list));
        } catch (e) {
          console.log("Gagal simpan history lokal:", e);
        }
      },
      (error) => {
        console.log("Error snapshot Firestore:", error);
      }
    );

    return () => unsub();
  }, []);

  // Kirim pesan teks biasa
  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(messagesCollection, {
      text: message,
      user: name,
      imageUrl: null,
      createdAt: serverTimestamp(),
    });

    setMessage("");
  };

  // Pilih gambar dari galeri + upload ke Firebase Storage (base64 + uploadString)
  const sendImage = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.7,
        includeBase64: true, // WAJIB
      },
      async (response) => {
        try {
          if (response.didCancel) {
            return;
          }

          if (response.errorCode) {
            Alert.alert("Error", response.errorMessage || "Gagal memilih gambar");
            return;
          }

          const asset: Asset | undefined = response.assets?.[0];
          if (!asset || !asset.base64) {
            Alert.alert("Error", "Gagal mendapatkan data base64 dari gambar");
            return;
          }

          const extMatch = asset.fileName?.match(/\.(\w+)$/);
          const ext = extMatch ? extMatch[1] : "jpg";

          const fileName = `${
            auth.currentUser?.uid || name
          }_${Date.now()}.${ext}`;
          const imageRef = ref(storage, `chat-images/${fileName}`);

          // sekarang Blob sudah dipolyfill oleh react-native-blob-util,
          // jadi uploadString TIDAK akan error lagi
          await uploadString(imageRef, asset.base64, "base64");

          const url = await getDownloadURL(imageRef);

          await addDoc(messagesCollection, {
            text: "",
            imageUrl: url,
            user: name,
            createdAt: serverTimestamp(),
          });
        } catch (e: any) {
          console.log("UPLOAD_ERROR:", e);
          Alert.alert(
            "Error Gagal upload gambar",
            e?.message ? String(e.message) : String(e)
          );
        }
      }
    );
  };

  const renderItem = ({ item }: { item: MessageType }) => (
    <View
      style={[
        styles.msgBox,
        item.user === name ? styles.myMsg : styles.otherMsg,
      ]}
    >
      <Text style={styles.sender}>{item.user}</Text>

      {/* Tampilkan teks jika ada */}
      {item.text ? <Text>{item.text}</Text> : null}

      {/* Tampilkan gambar jika ada */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Kirim" onPress={sendMessage} />
      </View>

      {/* Tombol upload gambar */}
      <View style={styles.imageButtonRow}>
        <Button title="Kirim Gambar" onPress={sendImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  msgBox: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
    maxWidth: "80%",
  },
  myMsg: {
    backgroundColor: "#d1f0ff",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 12,
  },
  image: {
    marginTop: 6,
    width: 160,
    height: 160,
    borderRadius: 6,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    marginRight: 10,
    padding: 8,
    borderRadius: 6,
  },
  imageButtonRow: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  contentContainer: {
    padding: 10,
  },
});
