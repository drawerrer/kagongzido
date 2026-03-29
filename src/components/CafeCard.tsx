import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Cafe } from '../types/cafe';

interface CafeCardProps {
  cafe: Cafe;
  onPress: (cafe: Cafe) => void;
}

export default function CafeCard({ cafe, onPress }: CafeCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(cafe)}
      activeOpacity={0.7}
    >
      {/* 좌측: 카페 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {cafe.name}
        </Text>

        {/* 태그 */}
        <View style={styles.tagsRow}>
          {cafe.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 별점 + 리뷰수 + 거리 */}
        <View style={styles.metaRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{cafe.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({cafe.reviewCount})</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.distance}>{cafe.distance}</Text>
        </View>
      </View>

      {/* 우측: 썸네일 */}
      <Image
        source={{ uri: cafe.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191919',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  tagText: {
    fontSize: 11,
    color: '#555555',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    fontSize: 12,
    color: '#F5A623',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191919',
  },
  reviewCount: {
    fontSize: 12,
    color: '#888888',
  },
  dot: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  distance: {
    fontSize: 12,
    color: '#888888',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
});
