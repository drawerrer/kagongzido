import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AutocompleteResult } from '../../types/search';

interface SearchAutocompleteProps {
  query: string;
  keywords: string[];
  results: AutocompleteResult[];
  onPressKeyword: (keyword: string) => void;
  onFillKeyword: (keyword: string) => void;
  onPressResult: (result: AutocompleteResult) => void;
}

// 입력값과 매칭되는 글자 파란색 강조 처리
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <Text style={styles.resultName}>{text}</Text>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <Text style={styles.resultName}>{text}</Text>;

  return (
    <Text style={styles.resultName}>
      {text.slice(0, index)}
      <Text style={styles.highlight}>{text.slice(index, index + query.length)}</Text>
      {text.slice(index + query.length)}
    </Text>
  );
}

export default function SearchAutocomplete({
  query,
  keywords,
  results,
  onPressKeyword,
  onFillKeyword,
  onPressResult,
}: SearchAutocompleteProps) {
  const filteredKeywords = keywords
    .filter((k) => k.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10); // 최대 10개

  const hasContent = filteredKeywords.length > 0 || results.length > 0;

  if (!hasContent) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>검색 결과가 없어요</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 자동완성 키워드 목록 */}
      {filteredKeywords.map((keyword) => (
        <View key={keyword} style={styles.row}>
          <Text style={styles.leftIcon}>🔍</Text>

          <TouchableOpacity
            style={styles.keywordContent}
            onPress={() => onPressKeyword(keyword)}
            activeOpacity={0.7}
          >
            <HighlightText text={keyword} query={query} />
          </TouchableOpacity>

          {/* 검색바에 자동 입력 화살표 */}
          <TouchableOpacity
            onPress={() => onFillKeyword(keyword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.fillArrow}>↗</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* 구분선 */}
      {filteredKeywords.length > 0 && results.length > 0 && (
        <View style={styles.divider} />
      )}

      {/* 카페·장소 검색 결과 */}
      {results.map((result) => (
        <TouchableOpacity
          key={result.id}
          style={styles.row}
          onPress={() => onPressResult(result)}
          activeOpacity={0.7}
        >
          {/* 아이콘: 즐겨찾기(💙) vs 일반 장소(📍) */}
          <Text style={styles.leftIcon}>
            {result.type === 'favorite' ? '💙' : '📍'}
          </Text>

          <View style={styles.resultContent}>
            <HighlightText text={result.name} query={query} />
            <Text style={styles.resultAddress} numberOfLines={1}>
              {result.address}
            </Text>
          </View>

          <Text style={styles.distance}>{result.distance}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
    paddingVertical: 13,
    gap: 12,
  },
  leftIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
  },
  keywordContent: {
    flex: 1,
  },
  resultContent: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: 15,
    color: '#191919',
    fontWeight: '400',
  },
  highlight: {
    color: '#3182F6',
    fontWeight: '600',
  },
  resultAddress: {
    fontSize: 12,
    color: '#888888',
  },
  fillArrow: {
    fontSize: 16,
    color: '#AAAAAA',
    fontWeight: '400',
  },
  distance: {
    fontSize: 13,
    color: '#888888',
    minWidth: 40,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
    marginVertical: 4,
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
