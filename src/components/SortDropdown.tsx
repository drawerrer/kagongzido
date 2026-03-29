import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SortType } from '../types/cafe';

interface SortDropdownProps {
  cafeCount: number;
  selectedSort: SortType;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSort: (sort: SortType) => void;
}

const SORT_OPTIONS: SortType[] = ['조회순', '거리순', '평점순'];

export default function SortDropdown({
  cafeCount,
  selectedSort,
  isOpen,
  onToggle,
  onSelectSort,
}: SortDropdownProps) {
  return (
    <View style={styles.container}>
      {/* 좌측: 카페 수 */}
      <Text style={styles.cafeCount}>
        카페 <Text style={styles.cafeCountBold}>{cafeCount}개</Text>
      </Text>

      {/* 우측: 정렬 버튼 */}
      <View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.sortText}>{selectedSort}</Text>
          <Text style={[styles.chevron, isOpen && styles.chevronUp]}>
            ›
          </Text>
        </TouchableOpacity>

        {/* 정렬 팝업 */}
        {isOpen && (
          <View style={styles.dropdownMenu}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelectSort(option);
                  onToggle();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedSort === option && styles.dropdownItemTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cafeCount: {
    fontSize: 13,
    color: '#888888',
  },
  cafeCountBold: {
    fontWeight: '700',
    color: '#191919',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#191919',
  },
  chevron: {
    fontSize: 16,
    color: '#191919',
    transform: [{ rotate: '90deg' }],
    lineHeight: 18,
  },
  chevronUp: {
    transform: [{ rotate: '-90deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 100,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#555555',
    fontWeight: '400',
  },
  dropdownItemTextSelected: {
    color: '#191919',
    fontWeight: '700',
  },
});
