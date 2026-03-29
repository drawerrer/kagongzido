import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SavedCafe } from '../../types/search';

interface SavedCafeListProps {
  cafes: SavedCafe[];
  hasLocationPermission: boolean;
  onPressCafe: (cafe: SavedCafe) => void;
}

export default function SavedCafeList({
  cafes,
  hasLocationPermission,
  onPressCafe,
}: SavedCafeListProps) {
  if (cafes.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>저장된 카페가 없어요</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cafes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => onPressCafe(item)}
          activeOpacity={0.7}
        >
          {/* 좌측: 하트 아이콘 */}
          <View style={styles.heartWrapper}>
            <Text style={styles.heartIcon}>♥</Text>
          </View>

          {/* 중앙: 카페명 + 주소 */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {item.address}
            </Text>
          </View>

          {/* 우측: 거리 (위치 권한 허용 시만 표시) */}
          {hasLocationPermission && (
            <Text style={styles.distance}>{item.distance}</Text>
          )}
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  heartWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 14,
    color: '#3182F6',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191919',
  },
  address: {
    fontSize: 12,
    color: '#888888',
  },
  distance: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 56,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
});
