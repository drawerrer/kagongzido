import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import BottomSheet from '../components/BottomSheet';
import PhotoReviewPage, { ReviewPhoto } from './PhotoReviewPage';
import WriteReviewPage from './WriteReviewPage';
import { useFavorites } from '../context/FavoritesContext';

// ── 편의시설 SVG 아이콘 ──────────────────────────────────────
function IcParking()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15v4q0 .825-.587 1.413T8 21t-1.412-.587T6 19V5q0-.825.588-1.412T8 3h5q2.5 0 4.25 1.75T19 9t-1.75 4.25T13 15zm0-4h3.2q.825 0 1.413-.587T15.2 9t-.587-1.412T13.2 7H10z"/></svg>; }
function IcPets()        { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89C6.5 4.77 7.17 3.19 8.35 3m7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38 1.41-1.41 2.41-4.06 4.42-4.06 2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88"/></svg>; }
function IcTimerOff()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22q-1.85 0-3.488-.712T5.65 19.35t-1.937-2.863T3 13q0-1.5.463-2.887T4.8 7.6L2.1 4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l17 17q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-1.7-1.7q-1.2.875-2.587 1.338T12 22M10 3q-.425 0-.712-.288T9 2t.288-.712T10 1h4q.425 0 .713.288T15 2t-.288.713T14 3zm8.7 12.9L13 10.2V9q0-.425-.288-.712T12 8q-.25 0-.462.1t-.338.3L9.075 6.275q-.45-.45-.325-1.075t.725-.825t1.238-.288T12 4q1.5 0 2.938.5t2.712 1.45l.7-.7q.275-.275.7-.275t.7.275t.275.7t-.275.7l-.7.7q.95 1.275 1.45 2.713T21 13q0 .65-.088 1.275t-.287 1.25q-.2.6-.825.725t-1.1-.35"/></svg>; }
function IcPublicToilet(){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M7 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm10 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 11a2 2 0 0 0-2 2v4h1.5v5h3V17H8v-4a2 2 0 0 0-2-2zm9 0c-1.1 0-2 .9-2 2l1.5 5H14v5h2v-5h1.5L19 13a2 2 0 0 0-2-2z"/></svg>; }
function IcToilet()     { return <svg width="18" height="18" viewBox="0 0 15 15" fill="currentColor"><path d="M11 4V1c0-1-1-1-1 0v3H5V1c0-1-1-1-1 0v3H2.5c-1 0-1 1.5-.5 2.5s1.5 3 1.5 5.5c0 0 0 2 1 2H6v1h3v-1h1.5c1 0 1-2 1-2c0-2.5 1-4.5 1.5-5.5s.5-2.5-.5-2.5M7.25 9.5H5.5l3-4l-.5 3h2l-3 4"/></svg>; }
function IcPeople()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89C6.5 4.77 7.17 3.19 8.35 3m7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38 1.41-1.41 2.41-4.06 4.42-4.06 2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88-.03 0-.06-.06-.11.05z"/></svg>; }
function IcCoffee()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h2v3H5zm4 0h2v3H9zm4 0h2v3h-2zm6 7h-2V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3h2c1.103 0 2-.897 2-2v-5c0-1.103-.897-2-2-2m-2 7v-5h2l.002 5z"/></svg>; }

// ────────── 타입 ────────────────────────────────────────────
type DayKey = '월' | '화' | '수' | '목' | '금' | '토' | '일';

interface BusinessHour {
  open: string;
  close: string;
}

interface ReviewItem {
  id: string;
  author: string;
  avatarColor: string;
  date: string;
  content: string;
  images?: string[];      // gradient 문자열 배열 (플레이스홀더)
  isReporter?: boolean;   // 카페 제보자 여부 → 항상 최상단
}

interface CafeDetailData {
  id: string;
  name: string;
  address: string;
  distance?: number;
  hours: Partial<Record<DayKey, BusinessHour | null>>;
  regularHoliday: DayKey[];
  seats?: string;
  outlets?: string;
  vibe?: string;
  priceRange?: string;
  phone?: string;
  snsUrl?: string;
  amenities: Partial<Record<
    'parking' | 'pets' | 'noTimeLimit' | 'separateRestroom' | 'indoorRestroom' | 'groupVisit' | 'decafFree',
    boolean
  >>;
  reviews: ReviewItem[];
}

// ────────── 상수 ────────────────────────────────────────────
const DAY_ORDER: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];
const JS_TO_KR: DayKey[] = ['일', '월', '화', '수', '목', '금', '토'];

/** 카페 분위기를 연상시키는 다크 그라디언트 플레이스홀더 */
const PHOTO_BG = [
  'linear-gradient(145deg,#1C1C1E 0%,#2C2C2E 100%)',
  'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)',
  'linear-gradient(145deg,#2d1b0e 0%,#4e3020 100%)',
  'linear-gradient(145deg,#0f2530 0%,#1a3d50 100%)',
  'linear-gradient(145deg,#1e1e1e 0%,#3a3a3a 100%)',
  'linear-gradient(145deg,#1a2a1a 0%,#2d4a2d 100%)',
  'linear-gradient(145deg,#2a1a2a 0%,#4a2a4a 100%)',
  'linear-gradient(145deg,#2d2200 0%,#4a3800 100%)',
];

const AMENITY_CONFIG: Record<string, { icon: ReactNode; label: string }> = {
  parking:          { icon: <IcParking />,      label: '주차' },
  pets:             { icon: <IcPets />,          label: '반려동물 동반' },
  noTimeLimit:      { icon: <IcTimerOff />,      label: '시간 제한 없음' },
  separateRestroom: { icon: <IcPublicToilet />,  label: '남/녀 화장실 구분' },
  indoorRestroom:   { icon: <IcToilet />,        label: '내부화장실' },
  groupVisit:       { icon: <IcPeople />,        label: '단체 방문 가능' },
  decafFree:        { icon: <IcCoffee />,        label: '디카페인 무료' },
};

// ────────── 목업 데이터 ──────────────────────────────────────
const MOCK_DETAILS: Record<string, CafeDetailData> = {
  default: {
    id: 'default',
    name: '무모아',
    address: '서울 강남구 논현로 508',
    distance: 20,
    hours: {
      월: { open: '09:00', close: '22:00' },
      화: { open: '09:00', close: '22:00' },
      수: { open: '09:00', close: '22:00' },
      목: { open: '09:00', close: '22:00' },
      금: { open: '09:00', close: '23:00' },
      토: { open: '10:00', close: '23:00' },
      일: null,
    },
    regularHoliday: ['일'],
    seats: '여유로워요',
    outlets: '적당해요',
    vibe: '조용한, 모던한',
    priceRange: '4,500원',
    phone: '0507-2881-1679',
    snsUrl: 'https://www.instagram.com/mumoa_cafe',
    amenities: {
      parking: true,
      noTimeLimit: true,
      separateRestroom: true,
      indoorRestroom: true,
      decafFree: true,
    },
    reviews: [
      {
        id: 'r_reporter',
        author: '카공러버',
        avatarColor: '#3182F6',
        date: '2024.11.20',
        content: '직접 제보한 카페예요! 서울 강남 최고의 카공 카페입니다. 콘센트가 모든 자리에 있고 조용한 편이에요. 커피도 맛있고 직원분들도 친절해서 자주 올 것 같아요. 2층 창가 자리 추천드려요 :)',
        images: [PHOTO_BG[0], PHOTO_BG[1], PHOTO_BG[2]],
        isReporter: true,
      },
      {
        id: 'r1',
        author: '조은유',
        avatarColor: '#A78BFA',
        date: '2024.12.15',
        content: '카페 분위기가 너무 좋아요. 조용하고 집중이 잘 되는 공간이에요. 커피도 맛있고 콘센트도 충분해서 자주 방문할 것 같아요!',
        images: [PHOTO_BG[3], PHOTO_BG[4]],
      },
      {
        id: 'r2',
        author: '이민준',
        avatarColor: '#34D399',
        date: '2024.12.10',
        content: '콘센트도 충분하고 자리도 넓어서 카공하기 딱 좋아요!',
        images: [PHOTO_BG[6], PHOTO_BG[7]],
      },
      {
        id: 'r3',
        author: '박서연',
        avatarColor: '#F59E0B',
        date: '2024.12.08',
        content: '분위기는 좋은데 주말에는 좀 붐벼요. 평일 오전에 오시면 정말 여유롭게 공부할 수 있어요. 아메리카노 맛도 기대 이상이에요.',
        images: [PHOTO_BG[5]],
      },
    ],
  },
};

// 이름·주소만 다르고 나머지는 default 템플릿을 공유하는 카페 목록
const CAFE_NAME_MAP: Record<string, { name: string; address: string }> = {
  // MyPage - MOCK_REPORTED
  r1:  { name: '우모에',          address: '서울 용산구 한강대로84길 21-17 1층' },
  r2:  { name: '본지르본 연희',   address: '서울 서대문구 연희로 93-10' },
  r3:  { name: '카페 온도',       address: '서울 마포구 와우산로 21' },
  r4:  { name: '모노 커피',       address: '서울 강남구 언주로 234' },
  // MyPage - MOCK_RECENT
  rc1: { name: '블루보틀 강남',   address: '서울 강남구 논현로 508' },
  rc2: { name: '스타벅스 역삼역점', address: '서울 강남구 역삼로 123' },
  rc3: { name: '우모에',          address: '서울 용산구 한강대로84길 21-17 1층' },
  rc4: { name: '더 로스터리',     address: '서울 강남구 도곡로 321' },
  rc5: { name: '카페 베이커리',   address: '서울 강남구 역삼동 567' },
  // MyPage - MOCK_REVIEWS (cafeId)
  '1': { name: '우모에',          address: '서울 용산구 한강대로84길 21-17 1층' },
  '2': { name: '본지르본 연희',   address: '서울 서대문구 연희로 93-10' },
  '3': { name: '카페 온도',       address: '서울 마포구 와우산로 21' },
  '4': { name: '모노 커피',       address: '서울 강남구 언주로 234' },
  '5': { name: '블루보틀 강남',   address: '서울 강남구 논현로 508' },
  // GuidebookPage - FEATURE_STORES
  gs1: { name: '도트커피',        address: '서울 영등포구' },
  gs2: { name: '프릳츠 커피',     address: '서울 마포구' },
  gs3: { name: '어니언',          address: '서울 성동구' },
  gs4: { name: '오르에르',        address: '서울 강남구' },
  gs5: { name: '스탠딩커피',      address: '경기 성남시' },
};

function getCafeDetail(cafeId: string): CafeDetailData {
  if (MOCK_DETAILS[cafeId]) return MOCK_DETAILS[cafeId];
  const meta = CAFE_NAME_MAP[cafeId];
  if (meta) return { ...MOCK_DETAILS['default'], id: cafeId, name: meta.name, address: meta.address };
  return { ...MOCK_DETAILS['default'], id: cafeId };
}

// ────────── 유틸 함수 ────────────────────────────────────────
function getTodayKey(): DayKey {
  return JS_TO_KR[new Date().getDay()];
}

function getStatusInfo(cafe: CafeDetailData): { label: string; color: string } {
  const today = getTodayKey();
  const h = cafe.hours[today];
  if (cafe.regularHoliday.includes(today) || h === null || h === undefined) {
    return { label: '휴무', color: '#8B95A1' };
  }
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(':').map(Number);
  const [ch, cm] = h.close.split(':').map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  if (cur < open - 30) return { label: '영업 종료', color: '#8B95A1' };
  if (cur < open) return { label: '준비 중', color: '#F59E0B' };
  if (cur >= close) return { label: '영업 종료', color: '#8B95A1' };
  return { label: '영업 중', color: '#00B493' };
}

// ────────── 아이콘 컴포넌트 ──────────────────────────────────
function BackIcon({ color = '#191F28' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function HeartIcon({ filled, color = '#6B7684' }: { filled: boolean; color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MoreIcon({ color = '#6B7684' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function CloseIcon({ color = '#6B7684' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ────────── 공통 스타일 ──────────────────────────────────────
const iconBtnStyle = (scrolled: boolean): React.CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  background: scrolled ? 'transparent' : 'rgba(0,0,0,0.28)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  border: 'none',
  cursor: 'pointer',
});

// ────────── 서브 컴포넌트 ────────────────────────────────────
function Divider() {
  return <div style={{ height: 8, background: '#F2F4F6' }} />;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, color: '#8B95A1', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>{value}</p>
    </div>
  );
}

function InfoRow({
  label, value, onCopy, isLink,
}: {
  label: string;
  value?: string;
  onCopy?: () => void;
  isLink?: boolean;
}) {
  const displayValue = value ?? '?';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #F9FAFB',
    }}>
      <span style={{ fontSize: 14, color: '#8B95A1', width: 60, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {isLink && value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 14, color: '#3182F6', textDecoration: 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}
          >
            {value}
          </a>
        ) : (
          <span style={{ fontSize: 14, color: value ? '#191F28' : '#B0B8C1',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            {displayValue}
          </span>
        )}
        {isLink && value && (
          <a href={value} target="_blank" rel="noreferrer"><LinkIcon /></a>
        )}
        {onCopy && value && (
          <button onClick={onCopy} style={{ flexShrink: 0, padding: 4 }}>
            <CopyIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function AmenityBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: '#F2F4F6',
      borderRadius: 8,
      padding: '8px 12px',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', color: '#4E5968' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#4E5968' }}>{label}</span>
    </div>
  );
}

// ── 포토 플레이스홀더 셀 ─────────────────────────────────────
function PhotoCell({
  bg, size = 80, radius = 8, label,
}: {
  bg: string; size?: number | string; radius?: number; label?: string;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: bg, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <span style={{ fontSize: typeof size === 'number' ? size * 0.28 : 22, opacity: 0.18 }}>☕</span>
      {label && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <span style={{ fontSize: 18, color: 'white', fontWeight: 700 }}>{label}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>더보기</span>
        </div>
      )}
    </div>
  );
}

// ── 포토 모아보기 (리뷰 섹션 상단) ──────────────────────────
function PhotoMosaic({
  allPhotos,
  maxVisible = 6,
  onMore,
}: {
  allPhotos: string[];
  maxVisible?: number;
  onMore?: () => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (allPhotos.length === 0) return null;

  const visible = allPhotos.slice(0, maxVisible);
  const remaining = allPhotos.length - maxVisible;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 확장 뷰 */}
      {expandedIdx !== null && (
        <div style={{
          width: '100%', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden',
          background: allPhotos[expandedIdx],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: 8,
        }}>
          <span style={{ fontSize: 60, opacity: 0.15 }}>☕</span>
          <button
            onClick={() => setExpandedIdx(null)}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 30, height: 30, borderRadius: 15,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 15,
            }}
          >✕</button>
        </div>
      )}

      {/* 썸네일 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {visible.map((bg, i) => {
          const isLastSlot = i === maxVisible - 1 && remaining > 0;
          return (
            <div
              key={i}
              onClick={() => isLastSlot ? onMore?.() : setExpandedIdx(i)}
              style={{
                aspectRatio: '1 / 1',
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.18 }}>☕</span>
              {/* 선택된 사진 하이라이트 */}
              {expandedIdx === i && !isLastSlot && (
                <div style={{
                  position: 'absolute', inset: 0,
                  boxShadow: 'inset 0 0 0 3px #3182F6',
                }} />
              )}
              {/* 마지막 슬롯 더보기 오버레이 */}
              {isLastSlot && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 20, color: 'white', fontWeight: 700, lineHeight: 1 }}>
                    +{remaining}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>더보기</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 리뷰 카드 (강화) ─────────────────────────────────────────
function ReviewCard({ review }: { review: ReviewItem }) {
  const [textExpanded, setTextExpanded] = useState(false);
  const [expandedImgIdx, setExpandedImgIdx] = useState<number | null>(null);
  const CONTENT_THRESHOLD = 50; // 띄어쓰기 포함 50자
  const isLong = review.content.length > CONTENT_THRESHOLD;

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #F2F4F6' }}>

      {/* 헤더: 아바타 + 닉네임 + 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 19,
          background: review.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
            {review.author[0]}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>
              {review.author}
            </span>
            {review.isReporter && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#3182F6',
                background: '#EBF3FE', borderRadius: 4, padding: '2px 6px',
                lineHeight: 1.4,
              }}>
                카페 제보자
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#B0B8C1' }}>{review.date}</span>
        </div>
      </div>

      {/* 첨부 이미지 – 확장 뷰 */}
      {expandedImgIdx !== null && review.images && (
        <div style={{
          width: 343, maxWidth: '100%', aspectRatio: '4/3',
          background: review.images[expandedImgIdx],
          borderRadius: 10, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: 10,
        }}>
          <span style={{ fontSize: 50, opacity: 0.15 }}>☕</span>
          <button
            onClick={() => setExpandedImgIdx(null)}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: 14,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13,
            }}
          >✕</button>
        </div>
      )}

      {/* 첨부 이미지 – 썸네일 가로 스크롤 */}
      {expandedImgIdx === null && review.images && review.images.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 10,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {review.images.map((bg, i) => (
            <div key={i} onClick={() => setExpandedImgIdx(i)} style={{ cursor: 'pointer' }}>
              <PhotoCell bg={bg} size={80} radius={8} />
            </div>
          ))}
        </div>
      )}

      {/* 리뷰 텍스트 (50자 말줄임 → 더보기 탭 시 전체 펼침) */}
      <div>
        <p style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.65, marginBottom: isLong ? 4 : 0 }}>
          {isLong && !textExpanded
            ? review.content.slice(0, 50) + '...'
            : review.content}
        </p>
        {isLong && (
          <button
            onClick={() => setTextExpanded(e => !e)}
            style={{ fontSize: 13, color: '#B0B8C1', fontWeight: 500 }}
          >
            {textExpanded ? '접기' : '더보기'}
          </button>
        )}
      </div>
    </div>
  );
}

// ────────── 바텀시트: 지도 선택 ──────────────────────────────
function DirectionsSheet({ cafe, onClose }: { cafe: CafeDetailData; onClose: () => void }) {
  const openMap = (type: 'kakao' | 'naver' | 'default') => {
    const addr = encodeURIComponent(cafe.address);
    if (type === 'kakao') window.open(`kakaomap://search?q=${addr}`, '_blank');
    else if (type === 'naver') window.open(`nmap://search?query=${addr}&appname=com.kagongzido`, '_blank');
    else window.open(`https://maps.google.com/maps?q=${addr}`, '_blank');
    onClose();
  };

  return (
    <BottomSheet isOpen onClose={onClose}>
      <div style={{ padding: '8px 20px 24px' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>길 안내 앱 선택</p>
        {[
          { key: 'kakao' as const, label: '카카오맵', emoji: '🗺️' },
          { key: 'naver' as const, label: '네이버 지도', emoji: '🧭' },
          { key: 'default' as const, label: '기본 지도', emoji: '📍' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => openMap(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '14px 4px',
              borderBottom: '1px solid #F2F4F6',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 24 }}>{item.emoji}</span>
            <span style={{ fontSize: 16, color: '#191F28' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

// ────────── 바텀시트: 더보기 액션 ────────────────────────────
function MoreActionSheet({
  onClose, onShare, onWriteReview,
}: {
  onClose: () => void;
  onShare: () => void;
  onWriteReview: () => void;
}) {
  const actions = [
    { label: '후기 남기기', icon: '✏️', onClick: () => { onWriteReview(); onClose(); } },
    { label: '공유하기', icon: '🔗', onClick: () => { onShare(); onClose(); } },
    { label: '정보 수정 제안하기', icon: '📝', onClick: onClose },
  ];

  return (
    <BottomSheet isOpen onClose={onClose}>
      <div style={{ padding: '8px 20px 24px' }}>
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '15px 4px',
              borderBottom: '1px solid #F2F4F6',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <span style={{ fontSize: 16, color: '#191F28' }}>{a.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

// ────────── 바텀시트: 로그인 유도 ────────────────────────────
function LoginPromptSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet isOpen onClose={onClose}>
      <div style={{ padding: '8px 20px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💙</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>로그인이 필요해요</p>
        <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24, lineHeight: 1.5 }}>
          즐겨찾기를 사용하려면<br />로그인이 필요해요
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%', height: 52, borderRadius: 12,
            background: '#3182F6', color: 'white',
            fontSize: 16, fontWeight: 700,
          }}
        >
          토스로 로그인
        </button>
        <button
          onClick={onClose}
          style={{ marginTop: 12, fontSize: 14, color: '#8B95A1' }}
        >
          다음에 할게요
        </button>
      </div>
    </BottomSheet>
  );
}

// ────────── 복사 완료 토스트 ─────────────────────────────────
function CopyToast({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s, transform 0.2s',
      background: '#191F28', color: 'white',
      borderRadius: 8, padding: '8px 16px',
      fontSize: 13, fontWeight: 500,
      zIndex: 200, pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      전화번호가 복사됐어요
    </div>
  );
}

// ────────── 탭바 아이콘 ──────────────────────────────────────
function NavHomeIcon()       { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>; }
function NavGuideIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>; }
function NavCollectionIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>; }
function NavMypageIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>; }

const DETAIL_TABS = [
  { id: 'home',       label: '홈',     icon: <NavHomeIcon /> },
  { id: 'guidebook',  label: '가이드북', icon: <NavGuideIcon /> },
  { id: 'collection', label: '모음집',  icon: <NavCollectionIcon /> },
  { id: 'mypage',     label: '마이',   icon: <NavMypageIcon /> },
] as const;

// ────────── 메인 컴포넌트 ────────────────────────────────────
interface DetailPageProps {
  cafeId: string;
  onBack: () => void;
  onClose: () => void;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  scrollToReview?: boolean;
}

export default function DetailPage({ cafeId, onBack, onClose, activeTab = 'home', onTabChange, scrollToReview }: DetailPageProps) {
  const cafe = getCafeDetail(cafeId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const { isFavorited, addFavorite, removeFavorite, addRecentlyViewed } = useFavorites();

  const [scrolled, setScrolled] = useState(false);

  // 상세 화면 진입 시 최근 본 카페에 추가
  useEffect(() => {
    addRecentlyViewed({
      id: cafe.id,
      name: cafe.name,
      photo: '', // 나중에 실제 사진 URL로 교체
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 리뷰 섹션으로 자동 스크롤
  useEffect(() => {
    if (scrollToReview && reviewSectionRef.current && scrollRef.current) {
      setTimeout(() => {
        reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [isLoggedIn] = useState(true); // mock: 로그인 상태 (Supabase 연동 전 임시)

  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showDirectionsSheet, setShowDirectionsSheet] = useState(false);
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [showPhotoReview, setShowPhotoReview] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);

  const isFavorite = isFavorited(cafeId);

  const { label: statusLabel, color: statusColor } = getStatusInfo(cafe);
  const todayKey = getTodayKey();

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrolled(scrollRef.current.scrollTop > 200);
    }
  };

  const handleFavorite = () => {
    if (!isLoggedIn) { setShowLoginSheet(true); return; }
    if (isFavorite) {
      removeFavorite(cafeId);
    } else {
      addFavorite({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        rating: 5,        // 나중에 Supabase 연동 시 실제 값으로 교체
        reviewCount: 0,   // 나중에 Supabase 연동 시 실제 값으로 교체
        badge: cafe.amenities.noTimeLimit ? '시간 제한 없음' : undefined,
        photos: [],       // 나중에 실제 사진으로 교체
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: cafe.name, text: cafe.address, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch { /* ignore */ }
  };

  const handleCopyPhone = async () => {
    if (!cafe.phone) return;
    try {
      await navigator.clipboard.writeText(cafe.phone);
      setCopyToastVisible(true);
      setTimeout(() => setCopyToastVisible(false), 2000);
    } catch { /* ignore */ }
  };

  // 편의시설 목록 (보유 시설만)
  const activeAmenities = Object.entries(AMENITY_CONFIG)
    .filter(([key]) => cafe.amenities[key as keyof typeof cafe.amenities] === true);
  const hasAmenities = activeAmenities.length > 0;

  // 리뷰 정렬: 카페 제보자 → 나머지 (최신순)
  const sortedReviews = [
    ...cafe.reviews.filter(r => r.isReporter),
    ...cafe.reviews.filter(r => !r.isReporter),
  ];

  // 포토 모아보기: 모든 리뷰 이미지 수집 (제보자 리뷰 사진 먼저)
  const allReviewPhotos = sortedReviews.flatMap(r => r.images ?? []);

  // PhotoReviewPage용 ReviewPhoto[] (각 사진에 리뷰 메타데이터 포함)
  const allReviewPhotosFull: ReviewPhoto[] = sortedReviews.flatMap(r =>
    (r.images ?? []).map(bg => ({
      bg,
      reviewId: r.id,
      reviewAuthor: r.author,
      reviewAvatarColor: r.avatarColor,
      reviewDate: r.date,
      reviewContent: r.content,
      isReporter: r.isReporter ?? false,
    }))
  );

  // 오늘 영업시간
  const todayHours = cafe.hours[todayKey];
  const hasHoursData = todayHours !== undefined;

  // 리뷰 남기기 페이지
  if (showWriteReview) {
    return (
      <WriteReviewPage
        cafe={{ name: cafe.name, address: cafe.address }}
        onBack={() => setShowWriteReview(false)}
        onClose={onClose}
      />
    );
  }

  // 포토리뷰 전체보기 페이지
  if (showPhotoReview) {
    return (
      <PhotoReviewPage
        photos={allReviewPhotosFull}
        cafeName={cafe.name}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavorite}
        onBack={() => setShowPhotoReview(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: 'white' }}>

      {/* ── 헤더 (스크롤 시 흰 배경으로 전환) ── */}
      <header
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 100,
          display: 'flex', alignItems: 'center',
          padding: '12px 16px',
          background: scrolled ? 'white' : 'transparent',
          borderBottom: scrolled ? '1px solid #F2F4F6' : 'none',
          transition: 'background 0.2s, border-bottom 0.2s',
        }}
      >
        {/* 뒤로가기 */}
        <button onClick={onBack} style={iconBtnStyle(scrolled)}>
          <BackIcon color={scrolled ? '#191F28' : 'white'} />
        </button>

        {/* 스크롤 시 카페명 노출 */}
        <div style={{ flex: 1, textAlign: 'center',
          opacity: scrolled ? 1 : 0, transition: 'opacity 0.2s' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#191F28' }}>
            {cafe.name}
          </span>
        </div>

        {/* 우측 버튼: 하트 / 더보기 / 닫기 */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleFavorite} style={iconBtnStyle(scrolled)}>
            <HeartIcon
              filled={isFavorite}
              color={
                scrolled
                  ? (isFavorite ? '#3182F6' : '#6B7684')
                  : (isFavorite ? '#3182F6' : 'white')
              }
            />
          </button>
          <button onClick={() => setShowMoreSheet(true)} style={iconBtnStyle(scrolled)}>
            <MoreIcon color={scrolled ? '#6B7684' : 'white'} />
          </button>
          <button onClick={onClose} style={iconBtnStyle(scrolled)}>
            <CloseIcon color={scrolled ? '#6B7684' : 'white'} />
          </button>
        </div>
      </header>

      {/* ── 스크롤 콘텐츠 영역 ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: '100%', overflowY: 'auto', paddingBottom: 60 }}
      >
        {/* 포토 히어로 */}
        <div style={{ height: 260, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(160deg, #6B7684 0%, #4E5968 40%, #3182F6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 72, opacity: 0.5 }}>☕</span>
          </div>
          {/* 상단 그라디언트 (헤더 아이콘 가독성 확보) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 120,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
          }} />
        </div>

        {/* ── 기본 정보 섹션 ── */}
        <div style={{ padding: '20px 20px 0' }}>
          {/* 카페명 */}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>
            {cafe.name}
          </h1>

          {/* 주소 + 길 안내 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: '#6B7684', flex: 1, lineHeight: 1.4 }}>
              {cafe.address}
            </p>
            <button
              onClick={() => setShowDirectionsSheet(true)}
              style={{
                flexShrink: 0, height: 34, padding: '0 14px', marginLeft: 10,
                borderRadius: 8, border: '1px solid #E5E8EB',
                fontSize: 13, fontWeight: 600, color: '#3182F6', background: 'white',
              }}
            >
              길 안내
            </button>
          </div>

          {/* 영업 상태 + 영업시간 (데이터 없을 시 미노출) */}
          {hasHoursData && (
            <button
              onClick={() => setHoursExpanded(e => !e)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left', padding: '4px 0 16px',
              }}
            >
              {/* 상태 배지 */}
              <span style={{
                fontSize: 13, fontWeight: 700, color: statusColor,
                background: `${statusColor}18`, borderRadius: 6, padding: '3px 8px',
              }}>
                {statusLabel}
              </span>
              {/* 오늘 영업시간 */}
              {todayHours && (
                <span style={{ fontSize: 13, color: '#6B7684' }}>
                  {todayHours.open} - {todayHours.close}
                </span>
              )}
              {statusLabel === '휴무' && (
                <span style={{ fontSize: 13, color: '#8B95A1' }}>오늘은 휴무예요</span>
              )}
              <span style={{ marginLeft: 'auto' }}>
                <ChevronIcon expanded={hoursExpanded} />
              </span>
            </button>
          )}

          {/* 영업시간 전체 펼침 */}
          {hoursExpanded && (
            <div style={{
              background: '#F9FAFB', borderRadius: 12,
              padding: '12px 16px', marginBottom: 16,
            }}>
              {DAY_ORDER.map(day => {
                const h = cafe.hours[day];
                const isToday = day === todayKey;
                const isHoliday = cafe.regularHoliday.includes(day) || h === null || h === undefined;
                return (
                  <div key={day} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '5px 0',
                    fontSize: 14,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? '#3182F6' : '#4E5968',
                  }}>
                    <span>{day}요일</span>
                    <span>{isHoliday ? '휴무' : `${(h as BusinessHour).open} - ${(h as BusinessHour).close}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Divider />

        {/* ── 카페 정보 섹션 ── */}
        <div style={{ padding: '20px 20px 4px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>카페 정보</h2>

          {/* 좌석 | 콘센트 (가로 배치) */}
          <div style={{
            display: 'flex', border: '1px solid #F2F4F6',
            borderRadius: 12, overflow: 'hidden', marginBottom: 4,
          }}>
            <InfoBox label="좌석" value={cafe.seats ?? '?'} />
            <div style={{ width: 1, background: '#F2F4F6' }} />
            <InfoBox label="콘센트" value={cafe.outlets ?? '?'} />
          </div>

          {/* 기타 정보 세로 나열 */}
          <InfoRow label="분위기" value={cafe.vibe} />
          <InfoRow label="가격대" value={cafe.priceRange} />
          <InfoRow label="연락처" value={cafe.phone} onCopy={handleCopyPhone} />
          <InfoRow label="사이트" value={cafe.snsUrl} isLink />
        </div>

        <Divider />

        {/* ── 편의시설 섹션 (데이터 없으면 미노출) ── */}
        {hasAmenities && (
          <>
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 14 }}>편의시설</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activeAmenities.map(([key, { icon, label }]) => (
                  <AmenityBadge key={key} icon={icon} label={label} />
                ))}
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* ── 리뷰 섹션 ── */}
        <div ref={reviewSectionRef} style={{ padding: '20px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>
            리뷰&nbsp;<span style={{ color: '#3182F6' }}>{cafe.reviews.length}</span>개
          </h2>

          {cafe.reviews.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 36 }}>💬</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#4E5968' }}>
                아직 리뷰가 없어요
              </p>
              <p style={{ fontSize: 13, color: '#B0B8C1' }}>첫 번째 리뷰를 남겨보세요!</p>
            </div>
          ) : (
            <>
              {/* 포토 모아보기 (기본 6장, 초과 시 +N 더보기) */}
              {allReviewPhotos.length > 0 && (
                <PhotoMosaic
                  allPhotos={allReviewPhotos}
                  maxVisible={6}
                  onMore={() => setShowPhotoReview(true)}
                />
              )}

              {/* 리뷰 카드 목록 (제보자 항상 최상단) */}
              {sortedReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </>
          )}
        </div>

        {/* 하단 여백 (플로팅 버튼 가려짐 방지) */}
        <div style={{ height: 88 }} />
      </div>

      {/* ── 플로팅 "리뷰 남기기" 버튼 ── */}
      <button
        onClick={() => setShowWriteReview(true)}
        style={{
          position: 'absolute', bottom: 80, right: 20,
          background: '#3182F6', color: 'white',
          borderRadius: 24, height: 48, padding: '0 20px',
          fontSize: 14, fontWeight: 700,
          boxShadow: '0 4px 16px rgba(49,130,246,0.40)',
          display: 'flex', alignItems: 'center', gap: 6,
          zIndex: 50,
        }}
      >
        <span style={{ fontSize: 16 }}>✏️</span>
        리뷰 남기기
      </button>

      {/* ── 복사 완료 토스트 ── */}
      <CopyToast visible={copyToastVisible} />

      {/* ── 하단 탭 네비바 ── */}
      <nav style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex',
        borderTop: '1px solid #F2F4F6',
        backgroundColor: 'white',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}>
        {DETAIL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange ? onTabChange(tab.id) : onClose()}
            style={{
              flex: 1,
              padding: '10px 0 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: activeTab === tab.id ? '#3182F6' : '#B0B8C1',
              fontSize: 11,
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'color 0.15s',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── 바텀시트들 ── */}
      {showMoreSheet && (
        <MoreActionSheet
          onClose={() => setShowMoreSheet(false)}
          onShare={handleShare}
          onWriteReview={() => setShowWriteReview(true)}
        />
      )}
      {showDirectionsSheet && (
        <DirectionsSheet
          cafe={cafe}
          onClose={() => setShowDirectionsSheet(false)}
        />
      )}
      {showLoginSheet && (
        <LoginPromptSheet onClose={() => setShowLoginSheet(false)} />
      )}
    </div>
  );
}
