import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Collection } from '../../types/search';

interface SavedListTabsProps {
  collections: Collection[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function SavedListTabs({
  collections,
  selectedId,
  onSelect,
}: SavedListTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {collections.map((col) => {
          const isSelected = selectedId === col.id;
          return (
            <TouchableOpacity
              key={col.id}
              style={[styles.tab, isSelected && styles.tabSelected]}
              onPress={() => onSelect(col.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.heart, isSelected && styles.heartSelected]}>
                ♥
              </Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {col.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  tabSelected: {
    backgroundColor: '#191919',
    borderColor: '#191919',
  },
  heart: {
    fontSize: 12,
    color: '#888888',
  },
  heartSelected: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555555',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
