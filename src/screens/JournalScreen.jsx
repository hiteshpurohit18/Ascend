import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { CustomCalendar } from '../components/CustomCalendar';
import * as ImagePicker from 'expo-image-picker';

import { useJournal } from "../features/journal/journal.context";
import { styles as globalStyles } from "../styles/styles";
import { useTheme } from "../features/theme/theme.context";
import { useAuth } from "../features/auth/auth.context";
import { useNavigation } from "../features/navigation/navigation.context";


export default function JournalScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getLocalStyles(theme);
  const { entries, addEntry, deleteEntry, updateEntry, deleteAllEntries } = useJournal();
  
  
  const [viewMode, setViewMode] = useState("list");
  
  const [selectedDate, setSelectedDate] = useState(null);

  

  
  const markedDates = useMemo(() => {
    const marks = {};
    entries.forEach(e => {
        const dateStr = e.date.split('T')[0]; 
        marks[dateStr] = { marked: true, dotColor: theme.primary };
    });
    
    if (selectedDate) {
        marks[selectedDate] = { 
            ...(marks[selectedDate] || {}), 
            selected: true, 
            selectedColor: theme.primary 
        };
    }
    return marks;
  }, [entries, selectedDate, theme]);

  
  const displayEntries = useMemo(() => {
      if (viewMode === 'calendar' && selectedDate) {
          return entries.filter(e => e.date.startsWith(selectedDate));
      }
      return entries;
  }, [entries, viewMode, selectedDate]);
  const [inputs, setInputs] = useState(["", "", ""]);
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  const { user } = useAuth();
  const { navigate } = useNavigation();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const addTag = () => {
    if (tagInput.trim().length > 0) {
        if (!tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
        }
        setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  
  const handleSave = () => {
    
    const validItems = inputs.filter(text => text.trim().length > 0);
    
    
    let finalTags = [...tags];
    if (tagInput.trim().length > 0 && !tags.includes(tagInput.trim())) {
        finalTags.push(tagInput.trim());
    }
    
    if (validItems.length > 0 || photos.length > 0) {
      if (editingId) {
        updateEntry(editingId, validItems, photos, finalTags);
        Toast.show({
          type: 'success',
          text1: 'Entry Updated',
          text2: 'Your gratitude entry has been updated! ✨'
        });
      } else {
        
        const entryDate = selectedDate ? new Date(selectedDate).toISOString() : null;
        addEntry(validItems, photos, finalTags, entryDate);
        Toast.show({
          type: 'success',
          text1: 'Entry Saved',
          text2: 'Your gratitude entry has been saved successfully! 🌟'
        });
      }
      setInputs(["", "", ""]);
      setPhotos([]);
      setTags([]);
      setTagInput("");
      setModalVisible(false);
      setEditingId(null); 
    }
  };

  const openDetail = (entry) => {
    setSelectedEntry(entry);
    setDetailModalVisible(true);
  };

  const startEdit = () => {
    if (selectedEntry) {
      
      const currentItems = [...selectedEntry.items];
      while (currentItems.length < 3) currentItems.push("");
      
      setInputs(currentItems);
      setPhotos(selectedEntry.photos || []);
      setTags(selectedEntry.tags || []);
      setEditingId(selectedEntry.id);
      setDetailModalVisible(false); 
      setModalVisible(true); 
    }
  };

  const confirmDelete = (id) => {
    
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => { deleteEntry(id); setDetailModalVisible(false); } }
      ]
    );
  };

  const updateInput = (text, index) => {
    const newInputs = [...inputs];
    newInputs[index] = text;
    setInputs(newInputs);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => openDetail(item)}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.list}>
          {item.items.map((line, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText} numberOfLines={2}>{line}</Text>
            </View>
          ))}
        </View>

        {}
        {item.tags && item.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {item.tags.slice(0, 3).map((tag, i) => (
              <View key={i} style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '600' }}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <View style={{ backgroundColor: theme.surfaceHighlight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>+{item.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {}
        {item.photos && item.photos.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={{ marginTop: 12 }}
            contentContainerStyle={{ gap: 10 }}
          >
            {item.photos.slice(0, 3).map((uri, i) => (
              <Image 
                key={i} 
                source={{ uri }} 
                style={{ width: 80, height: 80, borderRadius: 12 }} 
              />
            ))}
            {item.photos.length > 3 && (
              <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: theme.surfaceHighlight, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: theme.textSecondary, fontWeight: 'bold' }}>+{item.photos.length - 3}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </TouchableOpacity>
  ); 

  return (
    <View style={globalStyles.screenContainer}>
      {}
      <View style={[globalStyles.exploreHeader, { backgroundColor: 'transparent' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
              <Text style={[globalStyles.screenTitle, { color: theme.text }]}>Gratitude Journal</Text>
              <Text style={[globalStyles.subTitle, { color: theme.textSecondary }]}>Reflect on the good things.</Text>
          </View>
          
          {}
          <TouchableOpacity 
            onPress={() => setCalendarModalVisible(true)}
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: theme.surface, 
              justifyContent: 'center', 
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Ionicons name="calendar-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <TouchableOpacity 
          style={styles.topAddBtn}
          onPress={() => {
            setEditingId(null);
            setInputs(["","",""]);
            setPhotos([]);
            setTags([]);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{ marginRight: 8 }}/>
          <Text style={styles.topAddBtnText}>Add Gratitude Entry</Text>
        </TouchableOpacity>

        {}
        {entries.length > 2 && (
          <TouchableOpacity 
            style={styles.deleteAllBtn}
            onPress={() => {
              Alert.alert(
                "Delete All Entries",
                "Are you sure you want to delete ALL journal entries? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Delete All", 
                    style: "destructive", 
                    onPress: () => {
                      deleteAllEntries();
                      Toast.show({
                        type: 'success',
                        text1: 'All Entries Deleted',
                        text2: 'Your journal has been cleared.'
                      });
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" style={{ marginRight: 8 }}/>
            <Text style={styles.deleteAllBtnText}>Delete All Entries</Text>
          </TouchableOpacity>
        )}
      </View>

      {}
      <FlatList
        data={displayEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <View style={styles.emptyBg}>
              <Ionicons name="book-outline" size={50} color={theme.primary} />
            </View>
            <Text style={[globalStyles.emptyStateText, { color: theme.text }]}>
                {viewMode === 'calendar' && selectedDate ? "No entries this day" : "Start Your Journal"}
            </Text>
            <Text style={globalStyles.emptyStateSub}>
              "Gratitude turns what we have into enough."
            </Text>
            <TouchableOpacity 
              style={styles.ctaBtn}
              onPress={() => {
                setEditingId(null);
                setInputs(["","",""]);
                setModalVisible(true);
              }}
            >
              <Text style={styles.ctaText}>Write First Entry</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
          <View style={styles.detailOverlay}>
          <TouchableOpacity 
             style={StyleSheet.absoluteFill} 
             activeOpacity={1} 
             onPress={() => setDetailModalVisible(false)}
          />
          <View style={styles.detailCard}>
             <View style={styles.detailHeader}>
                <Ionicons name="journal" size={24} color={theme.primary} />
                <Text style={styles.detailDate}>{selectedEntry ? formatDate(selectedEntry.date) : ""}</Text>
                
                <View style={{ flexDirection: 'row', gap: 10 }}>
                   <TouchableOpacity onPress={() => confirmDelete(selectedEntry.id)} style={styles.headerActionBtn}>
                     <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.headerActionBtn}>
                     <Ionicons name="close" size={20} color={theme.textSecondary} />
                   </TouchableOpacity>
                </View>
             </View>

             <Text style={styles.detailPrefix}>I am grateful for...</Text>

             <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
               {(selectedEntry?.items || []).map((line, i) => (
                 <View key={i} style={styles.detailItem}>
                   <Ionicons name="heart" size={14} color="#FF8A80" style={{ marginTop: 4 }} />
                   <Text style={styles.detailText}>{line}</Text>
                 </View>
               ))}

               {}
               {selectedEntry?.tags && selectedEntry.tags.length > 0 && (
                   <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                       {selectedEntry.tags.map((tag, i) => (
                           <View key={i} style={{ backgroundColor: theme.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                               <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>#{tag}</Text>
                           </View>
                       ))}
                   </View>
               )}

               {}
               {selectedEntry?.photos && selectedEntry.photos.length > 0 && (
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }} contentContainerStyle={{ gap: 12 }}>
                       {selectedEntry.photos.map((uri, i) => (
                           <Image key={i} source={{ uri }} style={{ width: 120, height: 120, borderRadius: 16 }} />
                       ))}
                   </ScrollView>
               )}
             </ScrollView>

             <View style={styles.detailFooter}>
               <Text style={styles.detailFooterText}>Recorded with mindfulness.</Text>
             </View>

             <TouchableOpacity style={styles.editBtn} onPress={startEdit}>
                <Ionicons name="pencil" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.editBtnText}>Edit Entry</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          />
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Entry" : "What are you grateful for?"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 15 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                     <Text style={styles.inputNum}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={i === 0 ? "Something that made me smile..." : i === 1 ? "A person I appreciate..." : "A small win today..."}
                    placeholderTextColor={theme.placeholder}
                    value={inputs[i]}
                    onChangeText={(text) => updateInput(text, i)}
                    autoCapitalize="sentences"
                  />
                </View>
              ))}

              {}
              <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.textSecondary, marginBottom: 8 }}>Tags</Text>
                  <View style={[styles.inputWrapper, { height: 50 }]}>
                    <Ionicons name="pricetag-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Add a tag..." 
                        placeholderTextColor={theme.placeholder}
                        value={tagInput}
                        onChangeText={setTagInput}
                        onSubmitEditing={addTag}
                    />
                    <TouchableOpacity onPress={addTag}>
                        <Ionicons name="add-circle" size={24} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                       {tags.map((tag, i) => (
                           <TouchableOpacity key={i} onPress={() => removeTag(tag)} style={{ backgroundColor: theme.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                               <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600', marginRight: 4 }}>#{tag}</Text>
                               <Ionicons name="close" size={12} color={theme.primary} />
                           </TouchableOpacity>
                       ))}
                   </View>
              </View>

              {}
              <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.textSecondary }}>Photos</Text>
                    <TouchableOpacity onPress={pickImage}>
                        <Text style={{ color: theme.primary, fontWeight: '600' }}>+ Add Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                       {photos.map((uri, i) => (
                           <View key={i} style={{ marginRight: 10, position: 'relative' }}>
                               <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 12 }} />
                               <TouchableOpacity 
                                onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                                style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 10 }}
                               >
                                   <Ionicons name="close-circle" size={20} color="red" />
                               </TouchableOpacity>
                           </View>
                       ))}
                   </ScrollView>
              </View>

            </ScrollView>

            <TouchableOpacity 
              style={styles.saveBtn}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>{editingId ? "Update Gratitude" : "Save Gratitude"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarModalVisible}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setCalendarModalVisible(false)}
          />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>Select a Date</Text>
              <TouchableOpacity onPress={() => setCalendarModalVisible(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surfaceHighlight, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <CustomCalendar
              markedDates={markedDates}
              activeColor={theme.primary}
              onDayPress={day => {
                setSelectedDate(day.dateString);
                setCalendarModalVisible(false);
              }}
            />

            {selectedDate && (
              <TouchableOpacity 
                onPress={() => { setSelectedDate(null); setCalendarModalVisible(false); }}
                style={{ marginTop: 20, backgroundColor: theme.surfaceHighlight, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Clear Selection</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getLocalStyles = (theme) => StyleSheet.create({
  
  guestCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  guestIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  guestBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  guestBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  
  card: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : "#FFF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateBadge: {
    backgroundColor: theme.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B6B15",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.divider, 
    marginTop: 8,
  },
  listText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
    flex: 1,
    fontWeight: "500",
  },

  emptyBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.mode === 'dark' ? 'rgba(63, 136, 197, 0.2)' : "#E0F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  ctaBtn: {
    marginTop: 20,
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  ctaText: {
    color: "#FFF",
    fontWeight: "600",
  },
  
  
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)", 
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surfaceHighlight, 
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
    paddingHorizontal: 16,
    paddingVertical: 4, 
    height: 60,
  },
  inputIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  inputNum: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    height: "100%",
  },
  saveBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  topAddBtn: {
    flexDirection: "row",
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  topAddBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteAllBtn: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B15",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FF6B6B30",
  },
  deleteAllBtnText: {
    color: "#FF6B6B",
    fontSize: 15,
    fontWeight: "600",
  },
  
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  detailCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
    paddingBottom: 16,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.textSecondary, 
    textTransform: "uppercase",
  },
  headerActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.surfaceHighlight, 
    alignItems: "center",
    justifyContent: "center",
  },
  detailPrefix: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.primary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  detailItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: theme.text, 
    lineHeight: 24,
    flex: 1,
  },
  detailFooter: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  detailFooterText: {
    fontSize: 12,
    color: theme.textLight, 
    fontStyle: 'italic',
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
