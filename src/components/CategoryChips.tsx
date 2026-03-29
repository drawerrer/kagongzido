import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

interface CategoryChipsProps {
  chips: string[];
  selectedChip: string | null;
  onSelectChip: (chip: string) => void;
}

export default function CategoryChips({
  chips,
  selectedChip,
  onSelectChip,
}: CategoryChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip) => {
          const isSelected = selectedChip === chip;
          return (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelectChip(chip)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {chip}
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#191919',
    borderColor: '#191919',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555555',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
