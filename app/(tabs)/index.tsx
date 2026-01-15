import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 1. Define the shape of a Shelf Item
interface ShelfItem {
  id: string;
  name: string;
  quantity: number;
}

export default function ShelfScreen() {
  const { colors, isDarkMode } = useTheme();
  
  // State
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State (For adding new items)
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  // 2. Load Items on Startup
  useEffect(() => {
    loadItems();
  }, []);

  // 3. Save Items whenever the list changes
  useEffect(() => {
    const performSave = async () => {
      // Only save if we aren't in the initial boot-up phase
      if (!loading) {
        await AsyncStorage.setItem("shelf-items", JSON.stringify(items));
      }
    };
    performSave();
  }, [items, loading]); // Added loading to dependencies

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("shelf-items");
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (e) {
      console.error("Failed to load items", e);
    } finally {
      setLoading(false);
    }
  };

  const saveItems = async (currentItems: ShelfItem[]) => {
    try {
      await AsyncStorage.setItem("shelf-items", JSON.stringify(currentItems));
    } catch (e) {
      console.error("Failed to save items", e);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert("Error", "Please enter an item name");
      return;
    }

    const newItem: ShelfItem = {
      id: Date.now().toString(), // Simple ID generation
      name: newItemName,
      quantity: parseInt(newItemQty) || 0,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName("");
    setNewItemQty("");
    setModalVisible(false);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          // Use the functional update pattern (prevItems) => ...
          setItems((prevItems) => {
            const updatedItems = prevItems.filter((i) => i.id !== id);
            
            // Save the filtered list to storage immediately inside the update
            AsyncStorage.setItem("shelf-items", JSON.stringify(updatedItems))
              .catch(err => console.error("Storage error:", err));
              
            return updatedItems;
          });
        } 
      }
    ]);
  };

  const handleUpdateQuantity = (id: string, newQty: string) => {
    const qty = parseInt(newQty);
    if (isNaN(qty)) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const incrementQty = (id: string, amount: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item))
    );
  };

  // 4. Render Individual Item Component
  const renderItem = ({ item }: { item: ShelfItem }) => {
    return (
      <ExpandableListItem 
        item={item} 
        colors={colors} 
        onDelete={() => handleDeleteItem(item.id)}
        onUpdateQty={(val: string) => handleUpdateQuantity(item.id, val)}
        onIncrement={(amount: number) => incrementQty(item.id, amount)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* HEADER / ADD BUTTON */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Shop Storage</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF ITEMS */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50, color: colors.textMuted }}>
            No items in shelf. Add one!
          </Text>
        }
      />

      {/* ADD ITEM MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Item</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgrounds.input, color: colors.text, borderColor: colors.border }]}
              placeholder="Item Name (e.g. Milk)"
              placeholderTextColor={colors.textMuted}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgrounds.input, color: colors.text, borderColor: colors.border }]}
              placeholder="Initial Quantity (e.g. 10)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={newItemQty}
              onChangeText={setNewItemQty}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: colors.danger }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddItem} 
                style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Save Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Sub-component for the "Dropdown" / Expandable functionality
const ExpandableListItem = ({ item, colors, onDelete, onUpdateQty, onIncrement }: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      
      {/* Top Row: Visible always */}
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>ID: {item.id.slice(-4)}</Text>
        </View>
        
        <View style={styles.cardHeaderRight}>
          <Text style={[styles.itemQty, { color: colors.primary }]}>x{item.quantity}</Text>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textMuted} 
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Row: The "Dropdown" to edit */}
      {expanded && (
        <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Edit Amount:</Text>
          
          <View style={styles.editControls}>
            <TouchableOpacity onPress={() => onIncrement(-1)} style={[styles.qtyBtn, { backgroundColor: colors.gradients.empty[1] }]}>
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>

            <TextInput 
              style={[styles.qtyInput, { color: colors.text, borderColor: colors.border }]}
              keyboardType="numeric"
              value={String(item.quantity)}
              onChangeText={onUpdateQty}
            />

            <TouchableOpacity onPress={() => onIncrement(1)} style={[styles.qtyBtn, { backgroundColor: colors.gradients.empty[1] }]}>
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, marginLeft: 5 }}>Remove Item</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60, // for status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  // Card Styles
  card: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
  },
  itemQty: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Expanded Body
  cardBody: {
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: "rgba(0,0,0,0.02)", // slight dim
  },
  editControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    gap: 15,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    borderBottomWidth: 2,
    padding: 5,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  modalSaveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  }
});