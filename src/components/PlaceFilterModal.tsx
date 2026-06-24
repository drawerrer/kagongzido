/**
 * PlaceFilterModal — 도서관 / 공유공간 전용 필터 모달
 *
 * 필터 항목:
 *   - 지금 영업 중 toggle
 *   - 노트북 사용 (ltSeatStatus 기반): 가능 / 불가
 *   - 입장 조건 (entCondition / entPrice 기반): 무료 / 유료
 *   - 편의시설 (amenities 배열 기반): 와이파이·주차·시간제한없음·단체방문·화장실·휠체어
 */

import { useState } from 'react';
import SheetCTA from './SheetCTA';

// ── 아이콘 ────────────────────────────────────────────────────
function IcWifi() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.5018 18.8602C10.5016 18.4611 10.6597 18.0793 10.9411 17.7977C11.2225 17.5161 11.6042 17.3579 12.0023 17.3577C12.4004 17.3576 12.7822 17.5156 13.0638 17.797C13.3454 18.0784 13.5036 18.4601 13.5038 18.8582C13.5039 19.0553 13.4652 19.2505 13.3899 19.4327C13.3146 19.6149 13.2041 19.7804 13.0649 19.9199C12.9256 20.0594 12.7602 20.17 12.5781 20.2456C12.3961 20.3211 12.2009 20.3601 12.0038 20.3602C11.8067 20.3604 11.6115 20.3217 11.4293 20.2463C11.2471 20.171 11.0816 20.0606 10.9421 19.9213C10.8026 19.782 10.692 19.6166 10.6164 19.4346C10.5409 19.2525 10.5019 19.0573 10.5018 18.8602ZM22.1138 9.99822C22.3636 9.99817 22.6066 9.92329 22.8134 9.78324C23.0202 9.64318 23.1804 9.44438 23.2731 9.21246C23.3659 8.98055 23.3871 8.72616 23.3339 8.4821C23.2807 8.23805 23.1556 8.01552 22.9748 7.84322C20.0058 5.01022 16.1078 3.45022 12.0018 3.45022C7.91377 3.44263 3.98132 5.01683 1.02778 7.84322C0.787893 8.0721 0.648753 8.38691 0.64097 8.71838C0.633187 9.04985 0.757399 9.37083 0.986281 9.61072C1.21516 9.85061 1.52997 9.98975 1.86144 9.99753C2.19291 10.0053 2.51389 9.8811 2.75378 9.65222C5.2429 7.27055 8.55678 5.94399 12.0018 5.95022C15.4471 5.94373 18.7614 7.27031 21.2508 9.65222C21.4928 9.88322 21.8028 9.99822 22.1138 9.99822Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M18.7461 13.366C18.9972 13.366 19.2415 13.2903 19.4491 13.149C19.6567 13.0076 19.8169 12.807 19.909 12.5734C20.001 12.3397 20.0205 12.0837 19.9651 11.8388C19.9096 11.5938 19.7818 11.3712 19.5981 11.2C17.5291 9.27297 14.8311 8.20997 12.0021 8.20997C9.18228 8.2061 6.46662 9.27506 4.40606 11.2C4.16339 11.4259 4.02042 11.739 4.00861 12.0704C3.99679 12.4018 4.1171 12.7243 4.34307 12.967C4.56903 13.2096 4.88214 13.3526 5.21352 13.3644C5.54489 13.3762 5.86739 13.2559 6.11006 13.03C7.70844 11.5369 9.8148 10.7075 12.0021 10.71C14.1894 10.7072 16.2959 11.5366 17.8941 13.03C18.1351 13.255 18.4411 13.366 18.7461 13.366Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.4377 16.6753C15.6919 16.6753 15.9401 16.5968 16.1491 16.4521C16.3582 16.3074 16.5181 16.1024 16.6077 15.8645C16.6972 15.6265 16.712 15.3669 16.6502 15.1203C16.5884 14.8737 16.4529 14.6519 16.2617 14.4843C15.0833 13.4525 13.5704 12.8838 12.0042 12.8838C10.438 12.8838 8.92504 13.4525 7.74668 14.4843C7.61938 14.5912 7.5147 14.7225 7.43877 14.8704C7.36283 15.0183 7.31716 15.1799 7.30444 15.3457C7.29172 15.5115 7.31221 15.6781 7.36469 15.8359C7.41717 15.9936 7.5006 16.1394 7.61009 16.2645C7.71958 16.3896 7.85294 16.4916 8.00234 16.5646C8.15175 16.6375 8.31421 16.6799 8.48021 16.6893C8.64621 16.6987 8.81242 16.6749 8.9691 16.6192C9.12578 16.5636 9.26978 16.4773 9.39268 16.3653C10.8377 15.1013 13.1697 15.1013 14.6157 16.3653C14.8527 16.5733 15.1457 16.6753 15.4377 16.6753Z" fill="currentColor"/>
    </svg>
  );
}
function IcParking() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M19.9816 8.95217H4.01563C2.91063 8.95217 2.01562 9.84717 2.01562 10.9522V20.4992C2.01562 21.0512 2.46363 21.4992 3.01562 21.4992H5.45963C6.01163 21.4992 6.45963 21.0512 6.45963 20.4992V19.1352H17.5376V20.4992C17.5376 21.0512 17.9856 21.4992 18.5376 21.4992H20.9816C21.5336 21.4992 21.9816 21.0512 21.9816 20.4992V10.9512C21.9816 9.84617 21.0876 8.95217 19.9816 8.95217ZM18.0176 13.7152H5.97962C5.59063 13.7152 5.20263 13.3262 5.20263 12.9382C5.20263 12.5502 5.49362 12.1612 5.97962 12.1612H18.1146C18.5036 12.1612 18.8916 12.5502 18.8916 12.9382C18.8916 13.3282 18.5036 13.7152 18.0176 13.7152Z" fill="currentColor"/>
      <path d="M18.3083 4.52434C18.0173 3.45634 17.0463 2.77734 15.8813 2.77734H8.11425C7.04625 2.77734 6.07625 3.45634 5.68725 4.52434L4.78125 7.45334H19.2132L18.3072 4.52434H18.3083Z" fill="currentColor"/>
    </svg>
  );
}
function IcTimerOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18.7787 18.211C18.7787 16.4248 17.7588 14.7958 16.152 14.0158L13.2168 12.5908C12.8904 12.4324 12.7542 12.0394 12.9126 11.713C12.9768 11.5804 13.0842 11.4736 13.2168 11.4088L16.1525 9.9838C17.7593 9.2038 18.7787 7.5742 18.7787 5.7886V2.5498H5.21875V5.7886C5.21875 7.5748 6.23875 9.2038 7.84555 9.9838L10.7814 11.4088C11.1078 11.5672 11.244 11.9602 11.0856 12.2866C11.0214 12.4192 10.914 12.526 10.7814 12.5908L7.84495 14.0158C6.23815 14.7958 5.21875 16.4254 5.21875 18.211V21.4498H18.7787V18.211Z" fill="currentColor"/>
      <path d="M18.78 21.4502H5.21875C4.80475 21.4502 4.46875 21.7862 4.46875 22.2002C4.46875 22.6142 4.80475 22.9502 5.21875 22.9502H18.78C19.1939 22.9502 19.5299 22.6142 19.5299 22.2002C19.5299 21.7862 19.1939 21.4502 18.78 21.4502Z" fill="currentColor"/>
      <path d="M18.78 2.5498C19.1939 2.5498 19.5299 2.2138 19.5299 1.7998C19.5299 1.3858 19.1939 1.0498 18.78 1.0498H5.21875C4.80475 1.0498 4.46875 1.3858 4.46875 1.7998C4.46875 2.2138 4.80475 2.5498 5.21875 2.5498H18.78Z" fill="currentColor"/>
    </svg>
  );
}
function IcPeople() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.5 11.6475C7.99246 11.6475 8.48009 11.5505 8.93506 11.362C9.39003 11.1736 9.80343 10.8973 10.1517 10.5491C10.4999 10.2009 10.7761 9.78749 10.9645 9.33252C11.153 8.87755 11.25 8.38992 11.25 7.89746C11.25 7.405 11.153 6.91737 10.9645 6.4624C10.7761 6.00743 10.4999 5.59403 10.1517 5.24581C9.80343 4.89759 9.39003 4.62137 8.93506 4.43291C8.48009 4.24446 7.99246 4.14746 7.5 4.14746C6.50544 4.14746 5.55161 4.54255 4.84835 5.24581C4.14509 5.94907 3.75 6.9029 3.75 7.89746C3.75 8.89202 4.14509 9.84585 4.84835 10.5491C5.55161 11.2524 6.50544 11.6475 7.5 11.6475ZM8 17.8285C8 16.5645 8.771 14.6935 10.48 13.2765C9.637 12.9795 8.652 12.7935 7.5 12.7935C2.46 12.7935 0.5 16.2315 0.5 17.8285C0.5 19.4285 4.673 19.8525 7.5 19.8525C7.971 19.8525 8.48 19.8395 9.001 19.8125C8.34 19.2855 8 18.6255 8 17.8285Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.5 12.7945C11.46 12.7945 9.5 16.2315 9.5 17.8295C9.5 19.4275 13.673 19.8535 16.5 19.8535C19.327 19.8535 23.5 19.4275 23.5 17.8295C23.5 16.2315 21.54 12.7945 16.5 12.7945ZM16.5 11.6475C16.9925 11.6475 17.4801 11.5505 17.9351 11.362C18.39 11.1736 18.8034 10.8973 19.1517 10.5491C19.4999 10.2009 19.7761 9.78749 19.9645 9.33252C20.153 8.87755 20.25 8.38992 20.25 7.89746C20.25 7.405 20.153 6.91737 19.9645 6.4624C19.7761 6.00743 19.4999 5.59403 19.1517 5.24581C18.8034 4.89759 18.39 4.62137 17.9351 4.43291C17.4801 4.24446 16.9925 4.14746 16.5 4.14746C15.5054 4.14746 14.5516 4.54255 13.8483 5.24581C13.1451 5.94907 12.75 6.9029 12.75 7.89746C12.75 8.89202 13.1451 9.84585 13.8483 10.5491C14.5516 11.2524 15.5054 11.6475 16.5 11.6475Z" fill="currentColor"/>
    </svg>
  );
}
function IcRestroom() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M17.1016 2.09961H6.90156C4.2506 2.09961 2.10156 4.24864 2.10156 6.89961V17.0996C2.10156 19.7506 4.2506 21.8996 6.90156 21.8996H17.1016C19.7525 21.8996 21.9016 19.7506 21.9016 17.0996V6.89961C21.9016 4.24864 19.7525 2.09961 17.1016 2.09961Z" fill="currentColor"/>
      <path d="M10.1164 16.5447L11.824 11.7063C11.8802 11.5468 11.8974 11.3762 11.874 11.2087C11.8507 11.0412 11.7875 10.8817 11.6899 10.7437C11.5922 10.6057 11.4629 10.4931 11.3127 10.4153C11.1625 10.3376 10.9959 10.2969 10.8268 10.2969H7.41281C7.24371 10.2969 7.0771 10.3376 6.92693 10.4153C6.77676 10.4931 6.64742 10.6057 6.54975 10.7437C6.45208 10.8817 6.38893 11.0412 6.36559 11.2087C6.34225 11.3762 6.35941 11.5468 6.41561 11.7063L8.12261 16.5447C8.19542 16.7509 8.33039 16.9295 8.50894 17.0558C8.68748 17.1821 8.90081 17.2499 9.11951 17.2499C9.33822 17.2499 9.55154 17.1821 9.73009 17.0558C9.90863 16.9295 10.0436 16.7509 10.1164 16.5447Z" fill="#F9FAFB"/>
      <path d="M13.885 10.8088L12.1774 15.6478C12.1211 15.8072 12.104 15.9778 12.1273 16.1453C12.1506 16.3127 12.2138 16.4722 12.3115 16.6102C12.4092 16.7482 12.5385 16.8607 12.6887 16.9384C12.8389 17.0161 13.0055 17.0566 13.1746 17.0566H16.5886C16.7576 17.0566 16.9243 17.0161 17.0744 16.9384C17.2246 16.8607 17.354 16.7482 17.4517 16.6102C17.5493 16.4722 17.6125 16.3127 17.6358 16.1453C17.6592 15.9778 17.642 15.8072 17.5858 15.6478L15.8788 10.8088C15.806 10.6025 15.671 10.424 15.4924 10.2977C15.3139 10.1713 15.1006 10.1035 14.8819 10.1035C14.6632 10.1035 14.4498 10.1713 14.2713 10.2977C14.0928 10.424 13.9578 10.6025 13.885 10.8088Z" fill="#F9FAFB"/>
      <path d="M9.11812 9.33098C9.83057 9.33098 10.4081 8.75342 10.4081 8.04098C10.4081 7.32853 9.83057 6.75098 9.11812 6.75098C8.40568 6.75098 7.82812 7.32853 7.82812 8.04098C7.82812 8.75342 8.40568 9.33098 9.11812 9.33098Z" fill="#F9FAFB"/>
      <path d="M14.8798 9.33098C15.5923 9.33098 16.1698 8.75342 16.1698 8.04098C16.1698 7.32853 15.5923 6.75098 14.8798 6.75098C14.1674 6.75098 13.5898 7.32853 13.5898 8.04098C13.5898 8.75342 14.1674 9.33098 14.8798 9.33098Z" fill="#F9FAFB"/>
    </svg>
  );
}
function IcWheelchair() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M14.811 17.4999C14.145 20.0879 11.796 21.9999 9 21.9999C5.6865 21.9999 3 19.3134 3 15.9999C3 13.5784 4.4345 11.4919 6.5 10.5439" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 6L10 15L17.5 14.5L19 20H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4C11 4.53043 10.7893 5.03914 10.4142 5.41421C10.0391 5.78929 9.53043 6 9 6C8.46957 6 7.96086 5.78929 7.58579 5.41421C7.21071 5.03914 7 4.53043 7 4C7 3.46957 7.21071 2.96086 7.58579 2.58579C7.96086 2.21071 8.46957 2 9 2C9.53043 2 10.0391 2.21071 10.4142 2.58579C10.7893 2.96086 11 3.46957 11 4Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 10H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcLaptop() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M21.5 2.59863H2.5C1.948 2.59863 1.5 3.04663 1.5 3.59863V17.5986C1.5 18.1506 1.948 18.5986 2.5 18.5986L9.061 18.5996L7.627 21.6906C7.473 22.0216 7.715 22.4006 8.081 22.4006H15.921C16.286 22.4006 16.528 22.0216 16.375 21.6906L14.939 18.5996L21.5 18.5986C22.052 18.5986 22.5 18.1506 22.5 17.5986V3.59863C22.5 3.04563 22.052 2.59863 21.5 2.59863ZM20.5 16.5986H3.5V4.59863H20.5V16.5986Z" fill="currentColor"/>
      <path d="M4.5 5.59863H19.5V15.5986H4.5V5.59863Z" fill="currentColor"/>
    </svg>
  );
}

// ── 칩 버튼 ──────────────────────────────────────────────────
function Chip({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  const bg = selected ? 'rgba(0,12,30,0.80)' : 'rgba(7,25,76,0.05)';
  const color = selected ? '#ffffff' : 'rgba(3,18,40,0.70)';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: 32, padding: '0 12px',
        borderRadius: 999, border: selected ? 'none' : '1px solid rgba(0,23,51,0.02)',
        background: bg, color,
        fontSize: 12, fontWeight: 590, whiteSpace: 'nowrap',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── 섹션 헤더 ────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
      {children}
    </p>
  );
}

// ── 타입 ─────────────────────────────────────────────────────
export interface PlaceFilterState {
  openNow: boolean;
  laptopOk: boolean | null;   // true=가능만, false=불가만, null=무관
  freeOnly: boolean | null;   // true=무료만, false=유료만, null=무관
  amenities: string[];        // 'wifi' | 'parking' | 'noTimeLimit' | 'groupVisit' | 'separateRestroom' | 'wheelchair'
}

export const DEFAULT_PLACE_FILTERS: PlaceFilterState = {
  openNow: false,
  laptopOk: null,
  freeOnly: null,
  amenities: [],
};

export function isPlaceFilterActive(f: PlaceFilterState): boolean {
  return f.openNow || f.laptopOk !== null || f.freeOnly !== null || f.amenities.length > 0;
}

interface Props {
  isOpen: boolean;
  initialFilters: PlaceFilterState;
  placeType: '도서관' | '공유공간' | '전체';
  onClose: () => void;
  onApply: (filters: PlaceFilterState) => void;
}

const AMENITY_OPTIONS: { key: string; icon: React.ReactNode; label: string }[] = [
  { key: 'wifi',            icon: <IcWifi />,       label: '무선 인터넷' },
  { key: 'parking',         icon: <IcParking />,    label: '주차 가능' },
  { key: 'noTimeLimit',     icon: <IcTimerOff />,   label: '시간 제한 없음' },
  { key: 'groupVisit',      icon: <IcPeople />,     label: '단체 방문 가능' },
  { key: 'separateRestroom',icon: <IcRestroom />,   label: '남/녀 화장실 구분' },
  { key: 'wheelchair',      icon: <IcWheelchair />, label: '휠체어 이용' },
];

export default function PlaceFilterModal({ isOpen, initialFilters, placeType, onClose, onApply }: Props) {
  const [f, setF] = useState<PlaceFilterState>(initialFilters);

  if (!isOpen) return null;

  const toggleAmenity = (key: string) =>
    setF(prev => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...prev.amenities, key],
    }));

  const reset = () => setF(DEFAULT_PLACE_FILTERS);
  const label = placeType === '전체' ? '공간' : placeType;

  return (
    <>
      {/* 백드롭 */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.4)' }}
      />

      {/* 모달 시트 */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 200,
        background: '#ffffff',
        borderRadius: '20px 20px 0 0',
        maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid #F2F4F6',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#191F28' }}>{label} 필터</p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M13.8151 11.9991L19.4661 6.34814C19.6776 6.13664 19.818 5.86014 19.818 5.4995C19.818 4.77814 19.2391 4.19824 18.5178 4.19824C18.1572 4.19824 17.8807 4.33864 17.6692 4.55014L12.1181 10.1011L6.46605 4.55014C6.23841 4.33752 5.93706 4.22166 5.62561 4.22701C5.31416 4.23237 5.01698 4.45853 4.79678 4.67885C4.57658 4.89918 4.4506 5.19644 4.44543 5.50789C4.44026 5.81934 4.5563 6.12062 4.76905 6.34814L10.4211 11.9991L4.76905 17.6501C4.5563 17.8777 4.44026 18.1789 4.44543 18.4904C4.4506 18.8018 4.57658 19.0991 4.79678 19.3194C5.01698 19.5398 5.31416 19.6659 5.62561 19.6713C5.93706 19.6766 6.23841 19.5608 6.46605 19.3481L12.1181 13.6971L17.6692 19.3481C17.8807 19.5596 18.1572 19.6999 18.5178 19.6999C19.2391 19.6999 19.818 19.1201 19.818 18.3987C19.818 18.0381 19.6776 17.7616 19.4661 17.6501L13.8151 11.9991Z" fill="#B0B8C1"/>
            </svg>
          </button>
        </div>

        {/* 스크롤 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

          {/* 지금 영업 중 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: 20, borderBottom: '1px solid #F2F4F6', marginBottom: 20,
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>지금 영업 중</p>
            <button
              onClick={() => setF(prev => ({ ...prev, openNow: !prev.openNow }))}
              style={{
                width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: f.openNow ? '#252525' : '#E5E8EB',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 4,
                left: f.openNow ? 24 : 4,
                width: 20, height: 20, borderRadius: '50%', background: '#ffffff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* 노트북 사용 */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IcLaptop />노트북 사용
              </span>
            </SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Chip label="가능" selected={f.laptopOk === true}
                onClick={() => setF(prev => ({ ...prev, laptopOk: prev.laptopOk === true ? null : true }))} />
              <Chip label="불가" selected={f.laptopOk === false}
                onClick={() => setF(prev => ({ ...prev, laptopOk: prev.laptopOk === false ? null : false }))} />
            </div>
          </div>

          {/* 입장료 */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>입장료</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Chip label="무료" selected={f.freeOnly === true}
                onClick={() => setF(prev => ({ ...prev, freeOnly: prev.freeOnly === true ? null : true }))} />
              <Chip label="유료" selected={f.freeOnly === false}
                onClick={() => setF(prev => ({ ...prev, freeOnly: prev.freeOnly === false ? null : false }))} />
            </div>
          </div>

          {/* 편의시설 */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>편의시설</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITY_OPTIONS.map(opt => (
                <Chip
                  key={opt.key}
                  icon={opt.icon}
                  label={opt.label}
                  selected={f.amenities.includes(opt.key)}
                  onClick={() => toggleAmenity(opt.key)}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 8 }} />
        </div>

        {/* CTA */}
        <SheetCTA.Double
          leftLabel="초기화"
          leftOnClick={reset}
          leftWidth={88}
          rightLabel="적용하기"
          rightOnClick={() => onApply(f)}
          background="#ffffff"
        />
        <div style={{ height: 'max(env(safe-area-inset-bottom, 0px), 16px)' }} />
      </div>
    </>
  );
}
