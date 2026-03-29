import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  StatusBar,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { getCurrentLocation, GetCurrentLocationPermissionError } from '@apps-in-toss/framework';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CategoryChips from '../components/CategoryChips';
import SortDropdown from '../components/SortDropdown';
import CafeCard from '../components/CafeCard';

import { Cafe, SortType } from '../types/cafe';
import { CATEGORY_CHIPS, MOCK_CAFES, DEFAULT_REGION } from '../constants/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 바텀시트 높이 기준
const BOTTOM_SHEET_CLOSED = 257;     // 기본 노출 높이
const BOTTOM_SHEET_DRAG_THRESHOLD = 50;

export default function HomePage() {
  const insets = useSafeAreaInsets();

  // 지도 상태
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 카페 목록 상태
  const [cafes] = useState<Cafe[]>(MOCK_CAFES);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortType>('조회순');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 바텀시트 애니메이션
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_CLOSED)).current;
  const isExpanded = useRef(false);
  const lastGestureDy = useRef(0);

  // 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        const location = await getCurrentLocation({ accuracy: 'balanced' as any });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
        if (e instanceof GetCurrentLocationPermissionError) {
          // 위치 권한 없음 → 기본 위치(서울) 유지
        }
      }
    })();
  }, []);

  // 바텀시트 드래그
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        lastGestureDy.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        const delta = lastGestureDy.current - gestureState.dy;
        lastGestureDy.current = gestureState.dy;

        bottomSheetHeight.setValue(
          Math.max(
            BOTTOM_SHEET_CLOSED,
            Math.min(
              SCREEN_HEIGHT - insets.top - 60,
              // @ts-ignore
              (bottomSheetHeight._value as number) + delta
            )
          )
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const expanded = SCREEN_HEIGHT - insets.top - 60;

        if (gestureState.dy < -BOTTOM_SHEET_DRAG_THRESHOLD) {
          // 위로 드래그 → 펼치기
          Animated.spring(bottomSheetHeight, {
            toValue: expanded,
            useNativeDriver: false,
            tension: 60,
            friction: 10,
          }).start();
          isExpanded.current = true;
        } else if (gestureState.dy > BOTTOM_SHEET_DRAG_THRESHOLD) {
          // 아래로 드래그 → 닫기
          Animated.spring(bottomSheetHeight, {
            toValue: BOTTOM_SHEET_CLOSED,
            useNativeDriver: false,
            tension: 60,
            friction: 10,
          }).start();
          isExpanded.current = false;
        } else {
          // 임계값 미달 → 원래 상태 복귀
          Animated.spring(bottomSheetHeight, {
            toValue: isExpanded.current ? expanded : BOTTOM_SHEET_CLOSED,
            useNativeDriver: false,
            tension: 60,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // 칩 필터링된 카페 목록
  const filteredCafes = useCallback(() => {
    let result = [...cafes];
    if (selectedChip) {
      result = result.filter((c) => c.tags.includes(selectedChip));
    }
    if (selectedSort === '거리순') {
      result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (selectedSort === '평점순') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [cafes, selectedChip, selectedSort]);

  const displayedCafes = filteredCafes();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── 헤더 ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>취향맞춤 카페지도</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>⋯</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 검색바 ── */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>입력하세요</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⊟</Text>
        </TouchableOpacity>
      </View>

      {/* ── 지도 ── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={userLocation !== null}
        showsMyLocationButton={false}
      >
        {displayedCafes.map((cafe) => (
          <Marker
            key={cafe.id}
            coordinate={{
              latitude: cafe.latitude,
              longitude: cafe.longitude,
            }}
            pinColor="#F5A623"
          />
        ))}
      </MapView>

      {/* ── 바텀시트 ── */}
      <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
        {/* 드래그 핸들 */}
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={styles.dragBar} />
        </View>

        {/* 카테고리 칩 */}
        <CategoryChips
          chips={CATEGORY_CHIPS}
          selectedChip={selectedChip}
          onSelectChip={(chip) =>
            setSelectedChip((prev) => (prev === chip ? null : chip))
          }
        />

        {/* 정렬 */}
        <SortDropdown
          cafeCount={displayedCafes.length}
          selectedSort={selectedSort}
          isOpen={isSortOpen}
          onToggle={() => setIsSortOpen((prev) => !prev)}
          onSelectSort={(sort) => {
            setSelectedSort(sort);
            setIsSortOpen(false);
          }}
        />

        {/* 카페 리스트 */}
        <ScrollView
          style={styles.cafeList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {displayedCafes.length > 0 ? (
            displayedCafes.map((cafe) => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                onPress={(selected) => {
                  mapRef.current?.animateToRegion({
                    latitude: selected.latitude,
                    longitude: selected.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>주변에 카페가 없어요</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* 정렬 드롭다운 외부 클릭 시 닫기 */}
      {isSortOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={() => setIsSortOpen(false)}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191919',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    color: '#191919',
  },

  // 검색바
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: '#555555',
  },

  // 지도
  map: {
    flex: 1,
  },

  // 바텀시트
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  cafeList: {
    flex: 1,
  },

  // 빈 상태
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
});
