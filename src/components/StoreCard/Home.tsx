import { useFavorites, fmtDist } from '../../context/FavoritesContext';
import CafePlaceholder from '../CafePlaceholder';
import IcArrow from '../../assets/icons/icon_arrow.svg?react';
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
  /** 콘센트 상태 — '부족' | '적당' | '넉넉' (variant='nearby' 전용 하단 열) */
  outletStatus?: string;
  /** 좌석 규모 — '소형' | '중형' | '대형' (variant='nearby' 전용 하단 열) */
  seatStatus?: string;
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

// ── 콘센트/좌석 아이콘 (DetailPage.tsx IcOutlet/IcSeat 와 동일 — 표준 톤 #333D4B) ──
function IcOutletMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_plug_mini)">
        <path d="M8.72512 8.01953L7.91992 8.01953L7.91992 2.79113C7.91992 2.68452 7.96228 2.58226 8.03767 2.50688C8.11306 2.43149 8.21531 2.38913 8.32192 2.38913C8.42854 2.38913 8.53079 2.43149 8.60618 2.50688C8.68157 2.58226 8.72392 2.68452 8.72392 2.79113L8.72512 8.01953Z" fill="#333D4B"/>
        <path d="M6.99463 2.79051L6.99463 8.94531L9.65143 8.94531L9.65143 2.79051C9.65143 2.4382 9.51147 2.10032 9.26235 1.85119C9.01323 1.60207 8.67534 1.46211 8.32303 1.46211C7.97072 1.46211 7.63283 1.60207 7.38371 1.85119C7.13459 2.10032 6.99463 2.4382 6.99463 2.79051Z" fill="#333D4B"/>
        <path d="M16.1532 8.01953L15.3486 8.01953L15.3486 2.79113C15.3527 2.68712 15.3968 2.58871 15.4718 2.51655C15.5468 2.44438 15.6468 2.40407 15.7509 2.40407C15.855 2.40407 15.9551 2.44438 16.0301 2.51655C16.1051 2.58871 16.1492 2.68712 16.1532 2.79113L16.1532 8.01953Z" fill="#333D4B"/>
        <path d="M14.4224 2.79051L14.4224 8.94531L17.0798 8.94531L17.0798 2.79051C17.0724 2.44301 16.9291 2.11223 16.6808 1.86907C16.4324 1.62592 16.0986 1.48975 15.7511 1.48975C15.4035 1.48975 15.0697 1.62592 14.8214 1.86907C14.573 2.11223 14.4297 2.44301 14.4224 2.79051Z" fill="#333D4B"/>
        <path d="M19.6537 7.56985L4.42089 7.56985C4.25735 7.56978 4.09539 7.60192 3.94427 7.66445C3.79315 7.72698 3.65583 7.81868 3.54016 7.93429C3.42449 8.04991 3.33273 8.18719 3.27012 8.33828C3.20752 8.48936 3.17529 8.65131 3.17529 8.81485L3.17529 10.9395L20.8987 10.9395L20.8987 8.81485C20.8987 8.65136 20.8665 8.48946 20.8039 8.33841C20.7414 8.18736 20.6496 8.05011 20.534 7.93451C20.4184 7.8189 20.2812 7.72719 20.1301 7.66462C19.9791 7.60206 19.8172 7.56985 19.6537 7.56985Z" fill="#333D4B"/>
        <path d="M15.1051 22.4629L8.96949 22.4629C8.72866 22.463 8.49304 22.3928 8.29157 22.2608C8.09011 22.1289 7.93159 21.9409 7.83549 21.7201L3.17529 10.9399L20.8987 10.9399L16.2385 21.7201C16.1425 21.9409 15.9841 22.1288 15.7827 22.2608C15.5814 22.3927 15.3458 22.463 15.1051 22.4629Z" fill="#333D4B"/>
      </g>
      <defs>
        <clipPath id="clip_plug_mini">
          <rect width="24" height="24" fill="white" transform="translate(1.04907e-06 24) rotate(-90)"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function IcSeatMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.69094 9.81278V13.0568H16.3139V9.81278C16.3153 8.90112 16.6782 8.02722 17.3231 7.38286C17.9681 6.7385 18.8423 6.37631 19.7539 6.37578H20.0449V6.28478C20.0447 5.19491 19.6115 4.14978 18.8408 3.37922C18.07 2.60866 17.0248 2.17578 15.9349 2.17578H8.07094C6.98107 2.17578 5.93583 2.60866 5.16508 3.37922C4.39434 4.14978 3.9612 5.19491 3.96094 6.28478V6.37578H4.25394C5.16516 6.37684 6.03876 6.73929 6.68309 7.38362C7.32743 8.02796 7.68988 8.90156 7.69094 9.81278Z" fill="#333D4B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23.3642 9.46095C23.2122 8.52495 22.5682 7.87695 21.6182 7.87695H20.0482C19.9962 7.87695 19.9492 7.88695 19.8992 7.89195C19.8502 7.88795 19.8012 7.87695 19.7532 7.87695C19.4987 7.87682 19.2466 7.92682 19.0114 8.02409C18.7763 8.12136 18.5625 8.26401 18.3825 8.44387C18.2024 8.62374 18.0596 8.83731 17.9621 9.07239C17.8645 9.30747 17.8143 9.55945 17.8142 9.81395V14.1C17.8143 14.16 17.8026 14.2195 17.7796 14.275C17.7567 14.3305 17.7231 14.3809 17.6806 14.4234C17.6381 14.4659 17.5877 14.4995 17.5322 14.5224C17.4767 14.5454 17.4172 14.5571 17.3572 14.557H6.64816C6.58811 14.5571 6.52862 14.5454 6.47312 14.5224C6.41761 14.4995 6.36718 14.4659 6.32472 14.4234C6.28225 14.3809 6.2486 14.3305 6.22568 14.275C6.20276 14.2195 6.19103 14.16 6.19116 14.1V9.81395C6.19116 8.74395 5.32416 7.87695 4.25516 7.87695C4.20316 7.87695 4.15616 7.88695 4.10616 7.89195C4.05616 7.88795 4.01016 7.87695 3.95916 7.87695H2.38716C1.43716 7.87695 0.788158 8.52495 0.635158 9.46195C0.465158 10.509 0.919158 11.432 1.87116 11.642C1.98968 11.6687 2.0956 11.7349 2.17155 11.8298C2.2475 11.9246 2.28897 12.0424 2.28916 12.164L2.31616 14V18.407C2.31616 18.992 2.79116 19.467 3.37716 19.467H3.96116V20.826C3.96116 21.0912 4.06652 21.3455 4.25405 21.5331C4.44159 21.7206 4.69594 21.826 4.96116 21.826H6.93116C7.19637 21.826 7.45073 21.7206 7.63827 21.5331C7.8258 21.3455 7.93116 21.0912 7.93116 20.826V19.466H16.0762V20.826C16.0762 21.0912 16.1815 21.3455 16.3691 21.5331C16.5566 21.7206 16.8109 21.826 17.0762 21.826H19.0462C19.5972 21.826 20.0462 21.378 20.0462 20.826V19.466H20.6292C20.9103 19.466 21.1799 19.3543 21.3787 19.1555C21.5775 18.9567 21.6892 18.6871 21.6892 18.406V14.001L21.7192 12.165C21.7191 12.0438 21.7603 11.9262 21.8359 11.8316C21.9115 11.7369 22.017 11.6707 22.1352 11.644C23.0872 11.433 23.5352 10.51 23.3652 9.46295" fill="#333D4B"/>
    </svg>
  );
}

export default function StoreCardHome({ cafe, onTap, onFavoriteChange, variant = 'home' }: StoreCardHomeProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorited(cafe.id);

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
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 600, color: '#191F28',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 2,
          }}>
            {cafe.name}
          </p>
          <p style={{
            fontSize: 12, color: '#6B7684',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 0,
          }}>
            {cafe.address}
          </p>
          <span style={{ fontSize: 12, color: '#6B7684' }}>
            {fmtDist(cafe.distance)} · 리뷰 {cafe.reviewCount}
          </span>
          {variant === 'nearby' ? (
            (cafe.outletStatus || cafe.seatStatus) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                {cafe.outletStatus && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#4E5968' }}>
                    <IcOutletMini /> 콘센트 {cafe.outletStatus}
                  </span>
                )}
                {cafe.outletStatus && cafe.seatStatus && (
                  <span style={{ fontSize: 12, color: '#4E5968' }}>·</span>
                )}
                {cafe.seatStatus && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#4E5968' }}>
                    <IcSeatMini /> 좌석 {cafe.seatStatus}
                  </span>
                )}
              </div>
            )
          ) : (
            cafe.badges.length > 0 && (
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
                    {badge}
                  </span>
                ))}
              </div>
            )
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
