import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchBar from '../components/search/SearchBar';
import SavedListTabs from '../components/search/SavedListTabs';
import SavedCafeList from '../components/search/SavedCafeList';
import RecentSearches from '../components/search/RecentSearches';
import SearchAutocomplete from '../components/search/SearchAutocomplete';

import {
  COLLECTIONS,
  SAVED_CAFES,
  RECENT_SEARCHES,
  AUTOCOMPLETE_KEYWORDS,
  POI_RESULTS,
} from '../constants/searchMockData';
import { RecentSearch, SavedCafe, AutocompleteResult } from '../types/search';

// 화면 상태
type SearchScreenState = 'saved'       // 검색바 비활성 → 저장 목록
                        | 'recent'     // 검색바 활성 + 빈 입력 → 최근 검색어
                        | 'autocomplete'; // 검색바 활성 + 입력값 → 자동완성

const MAX_RECENT = 10;

interface SearchPageProps {
  onClose?: () => void;
}

export default function SearchPage({ onClose }: SearchPageProps) {
  const insets = useSafeAreaInsets();

  // 검색바 상태
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 저장 목록 탭
  const [selectedTabId, setSelectedTabId] = useState('favorites');

  // 최근 검색어
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(RECENT_SEARCHES);

  // 위치 권한 (실제 구현 시 GPS 모듈에서 가져옴)
  const [hasLocationPermission] = useState(true);

  // 현재 화면 상태 계산
  const screenState: SearchScreenState = !isFocused
    ? 'saved'
    : searchText.length === 0
    ? 'recent'
    : 'autocomplete';

  // 현재 탭에 해당하는 카페 목록
  const filteredCafes = SAVED_CAFES.filter((cafe) =>
    cafe.collectionIds.includes(selectedTabId)
  );

  // 검색 실행
  const handleSearch = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    // 최근 검색어 업데이트 (동일 키워드 제거 후 최상단 추가)
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.keyword !== trimmed);
      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}.${String(
        today.getDate()
      ).padStart(2, '0')}`;
      const newItem: RecentSearch = {
        id: Date.now().toString(),
        keyword: trimmed,
        date: dateStr,
      };
      return [newItem, ...filtered].slice(0, MAX_RECENT);
    });

    // TODO: 실제 검색 결과 화면으로 이동
    console.log('검색 실행:', trimmed);
  }, []);

  // 자동완성 키워드 탭 → 검색 실행
  const handlePressKeyword = useCallback(
    (keyword: string) => {
      setSearchText(keyword);
      handleSearch(keyword);
    },
    [handleSearch]
  );

  // 화살표(↗) 탭 → 검색바에 자동 입력만
  const handleFillKeyword = useCallback((keyword: string) => {
    setSearchText(keyword);
  }, []);

  // 검색 결과 카페·장소 탭
  const handlePressResult = useCallback((result: AutocompleteResult) => {
    handleSearch(result.name);
    // TODO: 카페 상세 또는 지도 위치로 이동
    console.log('결과 탭:', result);
  }, [handleSearch]);

  // 검색바 ✕ 탭 → 입력 초기화 + 최근 검색어 화면 유지
  const handleClear = useCallback(() => {
    setSearchText('');
  }, []);

  // 최근 검색어 개별 삭제
  const handleDeleteRecent = useCallback((id: string) => {
    setRecentSearches((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // 최근 검색어 전체 삭제
  const handleDeleteAllRecent = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // 저장된 카페 탭
  const handlePressSavedCafe = useCallback((cafe: SavedCafe) => {
    // TODO: 카페 상세로 이동
    console.log('저장 카페 탭:', cafe.name);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>🐾</Text>
          </View>
          <Text style={styles.headerTitle}>취향맞춤 카페지도</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>⋯</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 검색바 ── */}
      <SearchBar
        value={searchText}
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onChange={setSearchText}
        onClear={handleClear}
        onSubmit={handleSearch}
      />

      {/* ── 본문 영역 ── */}
      <View style={styles.body}>

        {/* 상태 1: 저장 목록 (비활성) */}
        {screenState === 'saved' && (
          <>
            <SavedListTabs
              collections={COLLECTIONS}
              selectedId={selectedTabId}
              onSelect={setSelectedTabId}
            />
            <SavedCafeList
              cafes={filteredCafes}
              hasLocationPermission={hasLocationPermission}
              onPressCafe={handlePressSavedCafe}
            />
          </>
        )}

        {/* 상태 2: 최근 검색어 (활성 + 빈 입력) */}
        {screenState === 'recent' && (
          <>
            <SavedListTabs
              collections={COLLECTIONS}
              selectedId={selectedTabId}
              onSelect={setSelectedTabId}
            />
            <RecentSearches
              items={recentSearches}
              onPressItem={handlePressKeyword}
              onDeleteItem={handleDeleteRecent}
              onDeleteAll={handleDeleteAllRecent}
            />
          </>
        )}

        {/* 상태 3: 자동완성 (활성 + 입력값 있음) */}
        {screenState === 'autocomplete' && (
          <SearchAutocomplete
            query={searchText}
            keywords={AUTOCOMPLETE_KEYWORDS}
            results={POI_RESULTS.filter(
              (r) =>
                r.name.toLowerCase().includes(searchText.toLowerCase()) ||
                r.address.toLowerCase().includes(searchText.toLowerCase())
            )}
            onPressKeyword={handlePressKeyword}
            onFillKeyword={handleFillKeyword}
            onPressResult={handlePressResult}
          />
        )}
      </View>
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
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191919',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    color: '#191919',
  },

  // 본문
  body: {
    flex: 1,
  },
});
