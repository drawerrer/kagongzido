import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { RecentSearch } from '../../types/search';

interface RecentSearchesProps {
  items: RecentSearch[];
  onPressItem: (keyword: string) => void;
  onDeleteItem: (id: string) => void;
  onDeleteAll: () => void;
}

export default function RecentSearches({
  items,
  onPressItem,
  onDeleteItem,
  onDeleteAll,
}: RecentSearchesProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>최근 검색어가 없어요</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => onPressItem(item.keyword)}
            activeOpacity={0.7}
          >
            {/* 좌측: 돋보기 아이콘 */}
            <Text style={styles.searchIcon}>🔍</Text>

            {/* 중앙: 검색어 */}
            <Text style={styles.keyword} numberOfLines={1}>
              {item.keyword}
            </Text>

            {/* 우측: 날짜 + 삭제 버튼 */}
            <View style={styles.right}>
              <Text style={styles.date}>{item.date}</Text>
              <TouchableOpacity
                onPress={() => onDeleteItem(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          <TouchableOpacity style={styles.deleteAllButton} onPress={onDeleteAll}>
            <Text style={styles.deleteAllText}>전체 삭제</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
  },
  keyword: {
    flex: 1,
    fontSize: 15,
    color: '#191919',
    fontWeight: '400',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  deleteIcon: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 48,
  },
  deleteAllButton: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteAllText: {
    fontSize: 13,
    color: '#AAAAAA',
    textDecorationLine: 'underline',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
});
