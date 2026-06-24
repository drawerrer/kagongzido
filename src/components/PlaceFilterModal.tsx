/**
 * PlaceFilterModal — 도서관 / 공유공간 전용 필터 모달
 */

import { useState } from 'react';
import SheetCTA from './SheetCTA';

// ── 아이콘 ────────────────────────────────────────────────────
function IcWifi() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.5018 18.8602C10.5016 18.4611 10.6597 18.0793 10.9411 17.7977C11.2225 17.5161 11.6042 17.3579 12.0023 17.3577C12.4004 17.3576 12.7822 17.5156 13.0638 17.797C13.3454 18.0784 13.5036 18.4601 13.5038 18.8582C13.5039 19.2563 13.3457 19.638 13.0641 19.9194C12.7825 20.2007 12.4007 20.3586 12.0026 20.3584C11.6044 20.3583 11.2228 20.2001 10.9414 19.9185C10.66 19.637 10.5021 19.2551 10.5022 18.857L10.5018 18.8602ZM1.02778 7.84322C3.98132 5.01683 7.91377 3.44263 12.0018 3.45022C16.1078 3.45022 20.0058 5.01022 22.9748 7.84322C23.3256 8.17592 23.3346 8.73412 23.0028 9.08502C22.6709 9.43582 22.1127 9.44442 21.7619 9.11252C19.1725 6.65492 15.6582 5.25132 12.0018 5.25022C8.34558 5.24342 4.83148 6.64672 2.24208 9.10202C1.89128 9.43392 1.33308 9.42452 0.993282 9.07362C0.661382 8.72262 0.670882 8.16522 1.02778 7.84322ZM4.40606 11.2C6.46662 9.27506 9.18228 8.2061 12.0021 8.20997C14.8311 8.20997 17.5291 9.27297 19.5981 11.2C19.9489 11.5327 19.9579 12.0909 19.6261 12.4418C19.2942 12.7926 18.7361 12.8016 18.3852 12.4688C16.7871 10.9757 14.6806 10.1463 12.4933 10.1488C10.306 10.1513 8.20156 10.9857 6.60318 12.4828C6.25238 12.8156 5.69418 12.8066 5.36138 12.4558C5.02858 12.1049 5.03758 11.5468 5.38838 11.214L4.40606 11.2ZM7.74668 14.4843C8.92504 13.4525 10.438 12.8838 12.0042 12.8838C13.5704 12.8838 15.0833 13.4525 16.2617 14.4843C16.6126 14.817 16.6216 15.3752 16.2897 15.7261C15.9578 16.0769 15.3996 16.0859 15.0488 15.7531C14.2052 14.9811 13.1223 14.5538 12.0 14.5538C10.8777 14.5538 9.79478 14.9811 8.95118 15.7531C8.60038 16.0859 8.04218 16.0769 7.71028 15.7261C7.37838 15.3752 7.38748 14.817 7.73828 14.4843H7.74668Z" fill="currentColor"/>
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
      <path fillRule="evenodd" clipRule="evenodd" d="M7.5 11.6475C8.99 11.6475 10.418 11.0541 11.4749 10.0123C12.5317 8.97055 13.125 7.56302 13.125 6.09648C13.125 4.62994 12.5317 3.22241 11.4749 2.18065C10.418 1.13889 8.99 0.545471 7.5 0.545471C6.01 0.545471 4.58196 1.13889 3.52513 2.18065C2.4683 3.22241 1.875 4.62994 1.875 6.09648C1.875 7.56302 2.4683 8.97055 3.52513 10.0123C4.58196 11.0541 6.01 11.6475 7.5 11.6475ZM8 17.8285C8 16.5645 8.771 14.6935 10.48 13.2765C9.637 12.9795 8.652 12.7935 7.5 12.7935C2.46 12.7935 0.5 16.2315 0.5 17.8285C0.5 19.4285 4.673 19.8525 7.5 19.8525C7.971 19.8525 8.48 19.8395 9.001 19.8125C8.34 19.2855 8 18.6255 8 17.8285Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.5 12.7945C11.46 12.7945 9.5 16.2315 9.5 17.8295C9.5 19.4275 13.673 19.8535 16.5 19.8535C19.327 19.8535 23.5 19.4275 23.5 17.8295C23.5 16.2315 21.54 12.7945 16.5 12.7945ZM16.5 11.6475C18.0 11.6475 19.428 11.0541 20.4849 10.0123C21.5417 8.97055 22.135 7.56302 22.135 6.09648C22.135 4.62994 21.5417 3.22241 20.4849 2.18065C19.428 1.13889 18.0 0.545471 16.5 0.545471C15.0 0.545471 13.572 1.13889 12.5151 2.18065C11.4583 3.22241 10.865 4.62994 10.865 6.09648C10.865 7.56302 11.4583 8.97055 12.5151 10.0123C13.572 11.0541 15.0 11.6475 16.5 11.6475Z" fill="currentColor"/>
    </svg>
  );
}
function IcRestroom() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M17.1016 2.09961H6.90156C4.2506 2.09961 2.10156 4.24864 2.10156 6.89961V17.0996C2.10156 19.7506 4.2506 21.8996 6.90156 21.8996H17.1016C19.7525 21.8996 21.9016 19.7506 21.9016 17.0996V6.89961C21.9016 4.24864 19.7525 2.09961 17.1016 2.09961Z" fill="currentColor"/>
      <path d="M10.1164 16.5447L11.824 11.7063C11.8974 11.3762 11.8507 11.0412 11.6899 10.7437C11.5922 10.6057 11.4629 10.4931 11.3127 10.4153C11.1625 10.3376 10.9959 10.2969 10.8268 10.2969H7.41281C7.0771 10.3376 6.77676 10.4931 6.54975 10.7437C6.45208 10.8817 6.38893 11.0412 6.36559 11.2087C6.34225 11.3762 6.35941 11.5468 6.41561 11.7063L8.12261 16.5447C8.33039 16.9295 8.68748 17.1821 9.11951 17.2499C9.55154 17.1821 9.90863 16.9295 10.1164 16.5447Z" fill="#F9FAFB"/>
      <path d="M13.885 10.8088L12.1774 15.6478C12.104 15.9778 12.1273 16.1453C12.1506 16.3127 12.2138 16.4722 12.3115 16.6102C12.5385 16.8607 12.8389 17.0161 13.1746 17.0566H16.5886C16.9243 17.0161 17.2246 16.8607 17.4517 16.6102C17.6592 15.9778 17.642 15.8072 17.5858 15.6478L15.8788 10.8088C15.671 10.424 15.3139 10.1713 14.8819 10.1035C14.4498 10.1713 14.0928 10.424 13.885 10.8088Z" fill="#F9FAFB"/>
      <path d="M9.11812 9.33098C9.83057 9.33098 10.4081 8.75342 10.4081 8.04098C10.4081 7.32853 9.83057 6.75098 9.11812 6.75098C8.40568 6.75098 7.82812 7.32853 7.82812 8.04098C7.82812 8.75342 8.40568 9.33098 9.11812 9.33098Z" fill="#F9FAFB"/>
      <path d="M14.8798 9.33098C15.5923 9.33098 16.1698 8.75342 16.1698 8.04098C16.1698 7.32853 15.5923 6.75098 14.8798 6.75098C14.1674 6.75098 13.5898 7.32853 13.5898 8.04098C13.5898 8.75342 14.1674 9.33098 14.8798 9.33098Z" fill="#F9FAFB"/>
    </svg>
  );
}
function IcToilet() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M21.9994 21.4283V10.2633C21.9994 6.01529 20.2774 2.57129 18.1534 2.57129H8.44141C9.93141 4.08229 10.8924 6.89329 10.8924 10.2633V21.4283H21.9994Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M5.846 12.3153C5.28 12.3153 4.821 11.3973 4.821 10.2643C4.821 9.13029 5.28 8.21229 5.846 8.21229C6.412 8.21229 6.872 9.13029 6.872 10.2643C6.872 11.3973 6.412 12.3153 5.846 12.3153ZM5.846 2.57129C3.722 2.57129 2 6.01529 2 10.2643C2 14.5123 3.722 17.9563 5.846 17.9563C7.971 17.9563 9.693 14.5123 9.693 10.2643C9.693 6.01529 7.971 2.57129 5.846 2.57129Z" fill="currentColor"/>
    </svg>
  );
}
function IcWheelchair() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M14.811 17.4999C14.145 20.0879 11.796 21.9999 9 21.9999C5.6865 21.9999 3 19.3134 3 15.9999C3 13.5784 4.4345 11.4919 6.5 10.5439" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 6L10 15L17.5 14.5L19 20H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4C11 5.10457 10.1046 6 9 6C7.89543 6 7 5.10457 7 4C7 2.89543 7.89543 2 9 2C10.1046 2 11 2.89543 11 4Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
function IcPets() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_pets_pf)">
        <path d="M18.8552 14.1678L18.6752 13.7358C17.6122 10.9538 14.9772 9.08779 12.0002 9.00879C8.96722 9.09379 6.29622 11.0268 5.26722 13.8808L5.11022 14.2748C3.51522 18.2728 6.14522 21.1238 10.0752 21.1238H13.9332C17.9092 21.1238 20.5382 18.1758 18.8552 14.1678Z" fill="currentColor"/>
        <path d="M20.2254 11.72C21.463 11.72 22.4664 10.6446 22.4664 9.31802C22.4664 7.99143 21.463 6.91602 20.2254 6.91602C18.9877 6.91602 17.9844 7.99143 17.9844 9.31802C17.9844 10.6446 18.9877 11.72 20.2254 11.72Z" fill="currentColor"/>
        <path d="M3.77225 11.72C5.00992 11.72 6.01325 10.6446 6.01325 9.31802C6.01325 7.99143 5.00992 6.91602 3.77225 6.91602C2.53458 6.91602 1.53125 7.99143 1.53125 9.31802C1.53125 10.6446 2.53458 11.72 3.77225 11.72Z" fill="currentColor"/>
        <path d="M8.81378 8.05198C10.1326 8.05198 11.2018 6.89329 11.2018 5.46398C11.2018 4.03466 10.1326 2.87598 8.81378 2.87598C7.49492 2.87598 6.42578 4.03466 6.42578 5.46398C6.42578 6.89329 7.49492 8.05198 8.81378 8.05198Z" fill="currentColor"/>
        <path d="M15.1849 8.05198C16.5037 8.05198 17.5729 6.89329 17.5729 5.46398C17.5729 4.03466 16.5037 2.87598 15.1849 2.87598C13.866 2.87598 12.7969 4.03466 12.7969 5.46398C12.7969 6.89329 13.866 8.05198 15.1849 8.05198Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_pets_pf"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcCoffee() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.62531 22.087C5.64707 22.3362 5.76142 22.5681 5.9458 22.7372C6.13017 22.9062 6.37119 22.9999 6.62131 23H17.5843C17.8344 22.9999 18.0755 22.9062 18.2598 22.7372C18.4442 22.5681 18.5586 22.3362 18.5803 22.087L18.8323 19.193L19.5493 10.969L19.6653 9.631H4.54031L5.62531 22.087ZM20.8023 4.53H19.2053L18.1163 1.666C18.0417 1.47019 17.9094 1.30165 17.7369 1.18271C17.5644 1.06378 17.3598 1.00006 17.1503 1H7.05631C6.62631 1 6.24231 1.265 6.08931 1.666L5.00031 4.53H3.19531C3.0627 4.53 2.93553 4.58268 2.84176 4.67645C2.74799 4.77021 2.69531 4.89739 2.69531 5.03V7.131C2.69531 7.26361 2.74799 7.39079 2.84176 7.48455C2.93553 7.57832 3.0627 7.631 3.19531 7.631H20.8023C20.9349 7.631 21.0621 7.57832 21.1559 7.48455C21.2496 7.39079 21.3023 7.26361 21.3023 7.131V5.03C21.3023 4.89739 21.2496 4.77021 21.1559 4.67645C21.0621 4.58268 20.9349 4.53 20.8023 4.53Z" fill="currentColor"/>
    </svg>
  );
}

// ── 체크박스 ─────────────────────────────────────────────────
function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 20, height: 20, borderRadius: 5,
        border: checked ? 'none' : '1.5px solid #D1D6DB',
        background: checked ? '#252525' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'pointer',
      }}
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
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
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: icon ? 4 : 0,
        height: 32, padding: icon ? '0 12px' : '0 14px',
        borderRadius: 8,
        border: 'none',
        background: selected ? '#252525' : 'rgba(46,46,46,0.08)',
        color: selected ? '#ffffff' : 'rgba(0,0,0,0.7)',
        fontSize: 13, fontWeight: 590, whiteSpace: 'nowrap',
        cursor: 'pointer', transition: 'background 0.15s',
        flexShrink: 0,
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>{icon}</span>}
      {label}
    </button>
  );
}

// ── 구분선 ────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: '#F2F4F6', margin: '0 -20px' }} />;
}

// ── 타입 ─────────────────────────────────────────────────────
export interface PlaceFilterState {
  openNow: boolean;
  laptopStatus: string[];    // '가능' | '지정 좌석에서만 가능' | '불가'  (도서관 전용)
  entConditions: string[];   // '조건 없음' | '유료' | '이용권' | '회원제'
  amenities: string[];       // amenity keys
}

export const DEFAULT_PLACE_FILTERS: PlaceFilterState = {
  openNow: false,
  laptopStatus: [],
  entConditions: [],
  amenities: [],
};

export function isPlaceFilterActive(f: PlaceFilterState): boolean {
  return f.openNow || f.laptopStatus.length > 0 || f.entConditions.length > 0 || f.amenities.length > 0;
}

// ── 노트북 칩 (도서관 전용) ───────────────────────────────────
const LAPTOP_CHIPS = ['가능', '지정 좌석에서만 가능', '불가'];

// ── 입장 조건 칩 ─────────────────────────────────────────────
const ENT_CONDITION_CHIPS = ['조건 없음', '유료', '이용권', '회원제'];

// ── 편의시설 칩 ──────────────────────────────────────────────
const AMENITY_OPTIONS: { key: string; icon: React.ReactNode; label: string }[] = [
  { key: 'wifi',             icon: <IcWifi />,       label: '무선 인터넷' },
  { key: 'parking',          icon: <IcParking />,    label: '주차 가능' },
  { key: 'noTimeLimit',      icon: <IcTimerOff />,   label: '시간 제한 없음' },
  { key: 'groupVisit',       icon: <IcPeople />,     label: '단체 방문 가능' },
  { key: 'separateRestroom', icon: <IcRestroom />,   label: '남/녀 화장실 구분' },
  { key: 'indoorRestroom',   icon: <IcToilet />,     label: '내부 화장실' },
  { key: 'coffeeMachine',    icon: <IcCoffee />,     label: '커피머신' },
  { key: 'pets',             icon: <IcPets />,       label: '반려동물 동반' },
  { key: 'wheelchair',       icon: <IcWheelchair />, label: '휠체어 이용' },
];

// ── Props ────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  initialFilters: PlaceFilterState;
  placeType: '도서관' | '공유공간';
  onClose: () => void;
  onApply: (filters: PlaceFilterState) => void;
}

export default function PlaceFilterModal({ isOpen, initialFilters, placeType, onClose, onApply }: Props) {
  const [f, setF] = useState<PlaceFilterState>(initialFilters);

  if (!isOpen) return null;

  const isLibrary = placeType === '도서관';

  const toggleArr = (key: string, arr: string[]): string[] =>
    arr.includes(key) ? arr.filter(a => a !== key) : [...arr, key];

  const reset = () => setF(DEFAULT_PLACE_FILTERS);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.20)' }}
      />

      {/* 시트 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 10, right: 10,
        background: '#f3f3f3',
        borderRadius: 28,
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        animation: 'filterSlideUp 0.25s ease',
      }}>
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 20 }}>
          <div style={{ width: 48, height: 4, borderRadius: 40, background: '#e5e8eb' }} />
        </div>

        {/* 타이틀 */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,12,30,0.80)', lineHeight: '27px' }}>
            {placeType} 필터
          </h2>
        </div>

        {/* 스크롤 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

          {/* 지금 영업 중 */}
          <div
            onClick={() => setF(prev => ({ ...prev, openNow: !prev.openNow }))}
            style={{ display: 'flex', alignItems: 'center', gap: 10, height: 39, cursor: 'pointer' }}
          >
            <Checkbox checked={f.openNow} onToggle={() => setF(prev => ({ ...prev, openNow: !prev.openNow }))} />
            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: '#777777', userSelect: 'none' }}>
              지금 영업 중
            </span>
          </div>

          {/* 노트북 사용 — 도서관만 */}
          {isLibrary && (
            <>
              <div>
                <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IcLaptop />
                  <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                    노트북 사용
                  </h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
                  {LAPTOP_CHIPS.map(chip => (
                    <Chip
                      key={chip}
                      label={chip}
                      selected={f.laptopStatus.includes(chip)}
                      onClick={() => setF(prev => ({ ...prev, laptopStatus: toggleArr(chip, prev.laptopStatus) }))}
                    />
                  ))}
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* 입장 조건 */}
          <div>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                입장 조건
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
              {ENT_CONDITION_CHIPS.map(chip => (
                <Chip
                  key={chip}
                  label={chip}
                  selected={f.entConditions.includes(chip)}
                  onClick={() => setF(prev => ({ ...prev, entConditions: toggleArr(chip, prev.entConditions) }))}
                />
              ))}
            </div>
          </div>

          <Divider />

          {/* 편의시설 */}
          <div style={{ paddingBottom: 12 }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                편의시설
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITY_OPTIONS.map(opt => (
                <Chip
                  key={opt.key}
                  icon={opt.icon}
                  label={opt.label}
                  selected={f.amenities.includes(opt.key)}
                  onClick={() => setF(prev => ({ ...prev, amenities: toggleArr(opt.key, prev.amenities) }))}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>

        {/* CTA */}
        <div style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)` }}>
          <SheetCTA.Double
            leftLabel="초기화"
            leftOnClick={reset}
            leftWidth={88}
            rightLabel="적용하기"
            rightOnClick={() => onApply(f)}
            background="#f3f3f3"
          />
        </div>
      </div>

      <style>{`
        @keyframes filterSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
