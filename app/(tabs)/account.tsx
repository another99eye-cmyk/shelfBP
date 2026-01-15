import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, 
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/useTheme';

// --- NOTIFICATION CONFIGURATION ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Add these two lines:
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function AccountScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  
  // Shop Data State
  const [stats, setStats] = useState({ totalItems: 0, totalStock: 0 });
  const [profile, setProfile] = useState({
    shopName: "",
    phoneNumber: "",
  });
  
  // Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // 1. Initial Setup & Permissions
  useEffect(() => {
    checkNotificationPermissions();
    loadProfile();
  }, []);

  // 2. Reload Stats when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadShopStats();
    }, [])
  );

  // --- LOGIC: Load Data ---
  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem("user-profile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        // If profile exists, we ensure reminders are cancelled
        if (parsed.shopName && parsed.phoneNumber) {
          cancelDailyReminder();
        }
      } else {
        // If no profile, schedule the nag
        scheduleDailyReminder();
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  const loadShopStats = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("shelf-items");
      if (storedItems) {
        const items = JSON.parse(storedItems);
        const totalStock = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setStats({ totalItems: items.length, totalStock });
      }
    } catch (e) { console.error(e); }
  };

  // --- LOGIC: Notifications ---
  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  };

  const scheduleDailyReminder = async () => {
    // Check if we already have this notification to avoid duplicates
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hasReminder = scheduled.some(n => n.content.title === "Setup your shop!");
    
    if (!hasReminder && notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Setup your shop!",
          body: "Add your shop name and phone number to start selling efficiently.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY, // or use the string 'daily'
          hour: 9,
          minute: 0,
        } as Notifications.DailyTriggerInput, // Explicitly casting helps TS resolve the type
      });
      console.log("Daily reminder scheduled");
    }
  };

  const cancelDailyReminder = async () => {
    // Cancel all notifications for simplicity (or filter by ID in a complex app)
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Reminders cancelled - Profile is complete");
  };

  // --- LOGIC: Saving Profile ---
  const handleEditPress = () => {
    setEditName(profile.shopName);
    setEditPhone(profile.phoneNumber);
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert("Required", "Please fill in both Shop Name and Phone Number.");
      return;
    }

    const newProfile = { shopName: editName, phoneNumber: editPhone };
    setProfile(newProfile);
    
    try {
      await AsyncStorage.setItem("user-profile", JSON.stringify(newProfile));
      await cancelDailyReminder(); // Stop nagging
      setModalVisible(false);
      Alert.alert("Success", "Profile updated!");
    } catch (e) {
      Alert.alert("Error", "Failed to save profile.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.headerSection}>
          <TouchableOpacity 
            style={[styles.avatarContainer, { borderColor: colors.primary }]}
            onPress={handleEditPress}
          >
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
              <Ionicons name="storefront" size={40} color={colors.primary} />
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
               <Ionicons name="pencil" size={14} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.shopName, { color: colors.text }]}>
            {profile.shopName || "Set Shop Name"}
          </Text>
          <Text style={[styles.phoneNumber, { color: colors.textMuted }]}>
            {profile.phoneNumber || "No phone number set"}
          </Text>

          {(!profile.shopName || !profile.phoneNumber) && (
            <TouchableOpacity onPress={handleEditPress} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.danger, fontWeight: "bold" }}>Tap here to complete setup!</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* STATS CARD */}
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Inventory Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalItems}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Items</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{stats.totalStock}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Units</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>App Settings</Text>
        <View style={[styles.settingsContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} style={{marginRight: 10}}/>
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.textMuted, true: colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.text} style={{marginRight: 10}}/>
              <Text style={[styles.settingText, { color: colors.text }]}>{isDarkMode ? "Dark Mode" : "Light Mode"}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.textMuted, true: colors.primary }}
            />
          </View>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Shop Details</Text>
            
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Shop Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgrounds.input, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. My Corner Shop"
              placeholderTextColor={colors.textMuted}
              value={editName}
              onChangeText={setEditName}
            />
            
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgrounds.input, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. +233 55 123 4567"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={editPhone}
              onChangeText={setEditPhone}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "white", fontWeight: "bold" }}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  headerSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3,
    padding: 3, marginBottom: 15, position: 'relative',
  },
  avatarPlaceholder: { flex: 1, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  shopName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  phoneNumber: { fontSize: 16, marginBottom: 5 },
  card: {
    borderRadius: 16, padding: 20, marginBottom: 30,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 14, marginTop: 4 },
  divider: { width: 1, height: 40 },
  sectionHeader: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  settingsContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 30 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 16, fontWeight: '500' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "85%", padding: 24, borderRadius: 16, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  inputLabel: { fontSize: 12, marginBottom: 5, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  modalSaveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }
});