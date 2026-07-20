import { useFavorites, fmtWalkMinutes } from '../../context/FavoritesContext';
import CafePlaceholder from '../CafePlaceholder';
import IcArrow from '../../assets/icons/icon_arrow.svg?react';
import { IcOutletMini, IcSeatMini, IcLaptopMini, IcTicketMini } from './icons';
import type { PlaceKind } from '../../services/db';

export interface HomeCafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl?: string;
  badges: string[];
  /** 콘센트 상태 — '부족' | '적당' | '넉넉' (카페 전용) */
  outletStatus?: string;
  /** 좌석 규모 — '소형' | '중형' | '대형' (카페 전용) */
  seatStatus?: string;
  /** 노트북 지참 가능 여부 (도서관/공유공간 전용) */
  ltSeatStatus?: string;
  /** 입장 조건 (도서관/공유공간 전용) */
  entCondition?: string;
  /** 카페 / 도서관 / 공유공간 — 미지정 시 카페로 취급 */
  placeType?: PlaceKind;
}

interface StoreCardHomeProps {
  cafe: HomeCafe;
  onTap: () => void;
  onFavoriteChange?: (type: 'added' | 'removed', cafe: HomeCafe) => void;
  /**
   * 'home' (기본) — 홈 화면 리스트: 우측 하트(찜) + 뱃지 칩
   * 'nearby'      — "지금 내 주변 노트북 펴기 좋은 카페" 등: 우측 화살표(이동 안내) + 콘센트·좌석 아이콘 열
   */
  variant?: 'home' | 'nearby';
}

// 뱃지 칩 — 15자(공백 포함) 초과 시 말줄임
function truncateBadge(text: string): string {
  return text.length > 15 ? `${text.slice(0, 15)}...` : text;
}

// 카드에서는 원문 대신 축약 라벨로 표시 (상세페이지 등에는 원문 그대로 노출, 기존 필터 분류 정규식과 동일 기준 사용)
function fmtLtSeatStatus(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (/지정|일부/.test(raw)) return '일부가능';
  if (/가능/.test(raw)) return '가능';
  if (/불가/.test(raw)) return '불가';
  return raw;
}

function fmtEntCondition(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (/조건\s*없|무료/.test(raw)) return '없음';
  if (/예약/.test(raw)) return '예약';
  if (/입장료|유료/.test(raw)) return '입장료';
  if (/회원/.test(raw)) return '회원가입';
  if (/열람증/.test(raw)) return '열람증';
  if (/연령|나이|제한/.test(raw)) return '연령제한';
  return raw;
}

export default function StoreCardHome({ cafe, onTap, onFavoriteChange, variant = 'home' }: StoreCardHomeProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorited(cafe.id);

  // 도서관/공유공간은 좌석·콘센트 대신 노트북·입장조건을 2행에 노출
  const isPlace = cafe.placeType === 'library' || cafe.placeType === 'shared_space';
  const stat1 = isPlace
    ? { icon: <IcLaptopMini />, label: '노트북', value: fmtLtSeatStatus(cafe.ltSeatStatus) }
    : { icon: <IcSeatMini />, label: '좌석', value: cafe.seatStatus };
  const stat2 = isPlace
    ? { icon: <IcTicketMini />, label: '입장조건', value: fmtEntCondition(cafe.entCondition) }
    : { icon: <IcOutletMini />, label: '콘센트', value: cafe.outletStatus };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorited) {
      removeFavorite(cafe.id);
      onFavoriteChange?.('removed', cafe);
    } else {
      addFavorite({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        rating: cafe.rating,
        reviewCount: cafe.reviewCount,
        photos: cafe.thumbnailUrl ? [cafe.thumbnailUrl] : [],
        distance: cafe.distance,
        placeType: cafe.placeType ?? 'cafe',
      });
      onFavoriteChange?.('added', cafe);
    }
  };

  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderBottom: variant === 'nearby' ? 'none' : '1px solid #F2F4F6',
        cursor: 'pointer',
      }}
    >
      {/* 이미지 썸네일 */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 4,
          flexShrink: 0,
          background: '#F2F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {cafe.thumbnailUrl ? (
          <img
            src={cafe.thumbnailUrl}
            alt={cafe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <CafePlaceholder size="45%" />
        )}
      </div>

      {/* 카페 정보 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 600, color: '#191F28',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 1,
          }}>
            {cafe.name}
          </p>
          <div style={{ fontSize: 12, color: '#4E5968', marginTop: 0 }}>
            도보 {fmtWalkMinutes(cafe.distance)}
          </div>
          {(stat1.value || stat2.value) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1, fontSize: 12, color: '#4E5968' }}>
              {stat1.value && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {stat1.icon} {stat1.label} {stat1.value}
                </span>
              )}
              {stat1.value && stat2.value && <span>·</span>}
              {stat2.value && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {stat2.icon} {stat2.label} {stat2.value}
                </span>
              )}
            </div>
          )}
          {cafe.badges.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
              {cafe.badges.map((badge, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '0px 8px',
                    background: '#D1D6DB',
                    borderRadius: 20,
                    fontSize: 11,
                    color: '#4E5968',
                  }}
                >
                  {truncateBadge(badge)}
                </span>
              ))}
            </div>
          )}
        </div>

        {variant === 'nearby' ? (
          /* 화살표 — 탭하면 상세로 이동함을 안내하는 장식 아이콘 (찜 토글 아님) */
          <div
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              flexShrink: 0, marginLeft: 4, alignSelf: 'center',
              color: '#D1D6DB',
            }}
          >
            <IcArrow width={14} height={14} />
          </div>
        ) : (
          /* 하트 */
          <button
            onClick={handleHeartClick}
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              flexShrink: 0, marginLeft: 4, marginTop: -11,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd" clipRule="evenodd"
                d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z"
                fill={favorited ? '#252525' : '#D1D6DB'}
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
