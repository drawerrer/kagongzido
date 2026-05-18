import { useFavorites, fmtDist } from '../../context/FavoritesContext';

export interface HomeCafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl?: string;
  badges: string[];
}

interface StoreCardHomeProps {
  cafe: HomeCafe;
  onTap: () => void;
  onFavoriteChange?: (type: 'added' | 'removed', cafe: HomeCafe) => void;
}

export default function StoreCardHome({ cafe, onTap, onFavoriteChange }: StoreCardHomeProps) {
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
        borderBottom: '1px solid #F2F4F6',
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
          <span style={{ fontSize: 28 }}>☕</span>
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
          {cafe.badges.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 1 }}>
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
          )}
        </div>

        {/* 하트 */}
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
      </div>
    </div>
  );
}
