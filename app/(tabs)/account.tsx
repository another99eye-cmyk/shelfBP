import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/useTheme';

export default function AccountScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  
  // State for shop stats
  const [stats, setStats] = useState({ totalItems: 0, totalStock: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load stats whenever the screen comes into focus (tab switch)
  useFocusEffect(
    useCallback(() => {
      loadShopStats();
    }, [])
  );

  const loadShopStats = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("shelf-items");
      if (storedItems) {
        const items = JSON.parse(storedItems);
        // Calculate total types of items and total physical quantity
        const totalStock = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setStats({
          totalItems: items.length,
          totalStock: totalStock
        });
      }
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. PROFILE HEADER */}
        <View style={styles.headerSection}>
          <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
            {/* Using an Icon as a placeholder for User Picture */}
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
              <Ionicons name="person" size={50} color={colors.textMuted} />
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
               <Ionicons name="pencil" size={12} color="white" />
            </View>
          </View>
          
          <Text style={[styles.shopName, { color: colors.text }]}>My Corner Shop</Text>
          <Text style={[styles.phoneNumber, { color: colors.textMuted }]}>+233 55 123 4567</Text>
        </View>

        {/* 2. SHOP SUMMARY CARD */}
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Inventory Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalItems}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Item Types</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{stats.totalStock}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Units</Text>
            </View>
          </View>
        </View>

        {/* 3. SETTINGS SECTION */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>App Settings</Text>
        
        <View style={[styles.settingsContainer, { backgroundColor: colors.surface }]}>
          
          {/* Notification Toggle */}
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.gradients.empty[0] }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.text} />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.textMuted, true: colors.primary }}
              thumbColor={"white"}
            />
          </View>

          {/* Dark Mode Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? colors.primary : colors.warning }]}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="white" />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.textMuted, true: colors.primary }}
              thumbColor={"white"}
            />
          </View>

        </View>

        {/* 4. LOGOUT / DANGER ZONE */}
        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.danger }]}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  // Profile Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    marginBottom: 15,
    position: 'relative',
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
  },
  // Stats Card
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
  },
  // Settings
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Footer
  logoutButton: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
  }
});