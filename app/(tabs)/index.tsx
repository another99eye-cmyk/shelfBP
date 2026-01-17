import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTheme from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

type Item = {
  id: string;           // we'll use timestamp or uuid
  name: string;
  quantity: number;
};

const STORAGE_KEY = '@shelf_items';

export default function ShelfScreen() {
  const { colors } = useTheme();

  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setItems(JSON.parse(json));
      }
    } catch (e) {
      console.error('Failed to load items', e);
    }
  };

  const saveItems = async (updatedItems: Item[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (e) {
      console.error('Failed to save items', e);
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    const newItem: Item = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: 1,
    };

    const updated = [...items, newItem];
    saveItems(updated);
    setNewItemName('');
    setModalVisible(false);
  };

  const openEditModal = (item: Item) => {
    setEditItem(item);
    setEditQuantity(item.quantity.toString());
    setModalVisible(true);
  };

  const saveEdit = () => {
    if (!editItem) return;
    const qty = parseInt(editQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Error', 'Please enter a valid number ≥ 0');
      return;
    }

    const updated = items.map((it) =>
      it.id === editItem.id ? { ...it, quantity: qty } : it
    );

    saveItems(updated);
    setEditItem(null);
    setModalVisible(false);
  };

  const deleteItem = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = items.filter((it) => it.id !== id);
          saveItems(updated);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.itemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.quantity, { color: colors.textMuted }]}>
          Qty: {item.quantity}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.primary + '30' }]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: colors.danger + '20' }]}
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header / Add Button */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Shelf</Text>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No items yet. Add some!
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal for Add / Edit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editItem ? 'Edit Quantity' : 'New Item'}
            </Text>

            {!editItem && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgrounds.input, color: colors.text, borderColor: colors.border }]}
                placeholder="Item name (e.g. Rice, Soap)"
                placeholderTextColor={colors.textMuted}
                value={newItemName}
                onChangeText={setNewItemName}
                autoFocus
              />
            )}

            <TextInput
              style={[styles.input, { backgroundColor: colors.backgrounds.input, color: colors.text, borderColor: colors.border }]}
              placeholder="Quantity"
              placeholderTextColor={colors.textMuted}
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="number-pad"
              autoFocus={!!editItem}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setEditItem(null);
                  setNewItemName('');
                }}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={editItem ? saveEdit : addItem}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {editItem ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    padding: 10,
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 10,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
});