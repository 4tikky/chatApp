import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';

import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db, messagesCollection } from "../firebase";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type MessageType = {
  id: string;
  text: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  imageBase64?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route, navigation }: Props) {
  const [userName, setUserName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageBase64Input, setImageBase64Input] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya", onPress: () => signOut(auth).catch(console.error) },
      ]
    );
  };

  // Fetch user name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().name);
          } else {
            setUserName(auth.currentUser.email || "User");
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          setUserName(auth.currentUser.email || "User");
        }
      }
    };
    fetchUserName();
  }, [auth.currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>🚪 Keluar</Text>
        </TouchableOpacity>
      ),
      title: userName ? `Login sebagai ${userName}` : "Chat App",
      headerStyle: {
        backgroundColor: "#FF1493", // Pink gelap untuk header
      },
      headerTintColor: "#fff",
    });
  }, [navigation, userName]);

  useEffect(() => {
    const q = query(messagesCollection, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });

      setMessages(list);
    });

    return () => unsub();
  }, []);

  const pickImageFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Gagal memilih gambar');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.base64) {
            const base64Image = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
            setSelectedImage(base64Image);
            setImageBase64Input(base64Image);
            
            setModalVisible(true); // Langsung buka modal setelah pilih gambar
          }
        }
      }
    );
  };

  const sendImageMessage = async () => {
    const imageToSend = selectedImage || imageBase64Input.trim();
    
    if (!imageToSend) {
      Alert.alert("Error", "Pilih gambar terlebih dahulu");
      return;
    }

    try {
      // Validate base64 format
      let base64Data = imageToSend;
      if (!base64Data.startsWith('data:image')) {
        base64Data = `data:image/png;base64,${base64Data}`;
      }

      await addDoc(messagesCollection, {
        text: "",
        user: userName || auth.currentUser?.email || "Anonymous",
        createdAt: serverTimestamp(),
        imageBase64: base64Data,
      });

      setModalVisible(false);
      setImageBase64Input("");
      setSelectedImage(null);
      Alert.alert("Sukses", "Gambar berhasil dikirim! 🌸");
    } catch (error) {
      console.error("Error sending image: ", error);
      Alert.alert("Error", "Gagal mengirim gambar");
    }
  };

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const textToSend = message;
    setMessage(""); // Clear input immediately for better UX

    try {
      await addDoc(messagesCollection, {
        text: textToSend,
        user: userName || auth.currentUser?.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === userName || item.user === auth.currentUser?.email;
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageUser}>{item.user}</Text>
        {item.imageBase64 ? (
          <Image
            source={{ uri: item.imageBase64 }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        {item.createdAt && (
          <Text style={styles.messageTime}>
            {new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImageFromGallery} // Langsung buka galeri
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Kirim 💌</Text>
        </TouchableOpacity>
      </View>

      {/* Modal untuk preview gambar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedImage(null);
          setImageBase64Input("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kirim Gambar 🌸</Text>
                                    
            {(selectedImage || imageBase64Input.length > 0) && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>Preview:</Text>
                <Image
                  source={{ uri: selectedImage || (imageBase64Input.startsWith('data:') ? imageBase64Input : `data:image/png;base64,${imageBase64Input}`) }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setImageBase64Input("");
                  setSelectedImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={sendImageMessage}
              >
                <Text style={styles.confirmButtonText}>Kirim 💖</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F5", // Pink muda sebagai background utama
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "80%",
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFB6C1", // Pink sedang untuk pesan sendiri
    borderTopRightRadius: 0,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "#FFB6C1", // Pink ringan untuk border
  },
  messageUser: {
    fontSize: 12,
    color: "#FF1493", // Pink gelap untuk nama user
    marginBottom: 2,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageTime: {
    fontSize: 10,
    color: "#FF69B4", // Pink sedang untuk waktu
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#FFB6C1", // Pink ringan untuk border top
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFB6C1",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#FFF5EE", // Pink sangat muda untuk input
  },
  sendButton: {
    backgroundColor: "#FF1493", // Pink gelap untuk tombol kirim
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FFB6C1", // Pink sedang untuk background tombol
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  imageButton: {
    backgroundColor: "#FFB6C1", // Pink sedang untuk tombol gambar
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  imageButtonText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 20, 147, 0.3)", // Pink transparan untuk overlay
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#FFB6C1",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#FF1493", // Pink gelap untuk judul modal
  },
  previewContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  previewText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF1493",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFB6C1",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#FF1493", // Pink gelap untuk tombol konfirmasi
  },
  cancelButtonText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
