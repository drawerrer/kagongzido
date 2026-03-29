import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

// 최대 입력 글자 수 규칙
const MAX_LENGTH_KO = 16;   // 한글(띄어쓰기 포함)
const MAX_LENGTH_EN = 25;   // 영문

function isKorean(text: string): boolean {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text);
}

function getMaxLength(text: string): number {
  return isKorean(text) ? MAX_LENGTH_KO : MAX_LENGTH_EN;
}

interface SearchBarProps {
  value: string;
  isFocused: boolean;
  onFocus: () => void;
  onChange: (text: string) => void;
  onClear: () => void;
  onSubmit: (text: string) => void;
}

export default function SearchBar({
  value,
  isFocused,
  onFocus,
  onChange,
  onClear,
  onSubmit,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  const handleChangeText = (text: string) => {
    const maxLen = getMaxLength(text);
    if (text.length > maxLen) return;
    onChange(text);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return; // 공백만 입력 시 검색 실행 안 함
    onSubmit(trimmed);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="장소, 주소 검색"
          placeholderTextColor="#AAAAAA"
          value={value}
          onFocus={onFocus}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          selectionColor="#3182F6"
          cursorColor="#3182F6"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {/* 활성 상태에서만 ✕ 버튼 표시 */}
        {isFocused && value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: '#3182F6',
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#191919',
    padding: 0,
    margin: 0,
  },
  clearButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
