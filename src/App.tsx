import { useState } from 'react';
import type { ReactNode } from 'react';
import MapPage, { type MapPageState } from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import GuidebookPage from './pages/GuidebookPage';
import MyPage from './pages/MyPage';
import DetailPage from './pages/DetailPage';
import PhotoReviewPage from './pages/PhotoReviewPage';
import { FavoritesProvider } from './context/FavoritesContext';
import { useFavorites } from './context/FavoritesContext';

// ── 탭바 SVG 아이콘 ──────────────────────────────────────────
function TabHomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );
}
function TabGuideIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
  );
}
function TabCollectionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  );
}
function TabMypageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}

// 피그마 "홈 | 가이드북 | 모음집 | 마이페이지" 탭 구조와 동일
type TabId = 'home' | 'guidebook' | 'collection' | 'mypage';

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'home',       label: '홈',     icon: <TabHomeIcon /> },
  { id: 'guidebook',  label: '가이드북', icon: <TabGuideIcon /> },
  { id: 'collection', label: '모음집',  icon: <TabCollectionIcon /> },
  { id: 'mypage',     label: '마이',   icon: <TabMypageIcon /> },
];

export default function App() {
  return (
    <FavoritesProvider>
      <AppInner />
    </FavoritesProvider>
  );
}

// FavoritesProvider 안에서 렌더링 — useFavorites를 DetailPage에서 안전하게 사용 가능
function AppInner() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showSearch, setShowSearch] = useState(false);
  const [detailCafeId, setDetailCafeId] = useState<string | null>(null);
  const [collectionDetail, setCollectionDetail] = useState<{ id: string; name: string } | null>(null);
  const [photoReview, setPhotoReview] = useState<{ storeId: string; cafeName: string; photos: string[] } | null>(null);
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const [myPageSubPage, setMyPageSubPage] = useState<string | null>(null);
  const [mapState, setMapState] = useState<MapPageState | null>(null);
  const [guidebookView, setGuidebookView] = useState<string | null>(null);
  const [guidebookStoreIndex, setGuidebookStoreIndex] = useState(0);
  const [detailScrollToReview, setDetailScrollToReview] = useState(false);

  // 포토리뷰 전체보기
  if (photoReview) {
    const store = favorites.find(f => f.id === photoReview.storeId);
    return (
      <div style={{ height: '100%' }}>
        <PhotoReviewPage
          photos={photoReview.photos.map((bg, i) => ({
            bg, reviewId: `${photoReview.storeId}-${i}`,
            reviewAuthor: '', reviewAvatarColor: '#e8edf4',
            reviewDate: '', reviewContent: '', isReporter: false,
          }))}
          cafeName={photoReview.cafeName}
          isFavorite={isFavorited(photoReview.storeId)}
          onFavoriteToggle={() => {
            if (!store) return;
            isFavorited(photoReview.storeId) ? removeFavorite(photoReview.storeId) : addFavorite(store);
          }}
          onBack={() => setPhotoReview(null)}
          onClose={() => setPhotoReview(null)}
        />
      </div>
    );
  }

  // 카페 상세페이지 (자체 탭바 포함)
  if (detailCafeId) {
    return (
      <div style={{ height: '100%' }}>
        <DetailPage
          cafeId={detailCafeId}
          onBack={() => { setDetailCafeId(null); setDetailScrollToReview(false); }}
          onClose={() => { setDetailCafeId(null); setDetailScrollToReview(false); }}
          activeTab={activeTab}
          onTabChange={(tab) => { setDetailCafeId(null); setDetailScrollToReview(false); setActiveTab(tab as TabId); }}
          scrollToReview={detailScrollToReview}
        />
      </div>
    );
  }

  // 컬렉션 상세 (탭바 완전히 가림)
  if (collectionDetail) {
    return (
      <div style={{ height: '100%' }}>
        <CollectionDetailPage
          collectionId={collectionDetail.id}
          collectionName={collectionDetail.name}
          onBack={() => setCollectionDetail(null)}
          onClose={() => { setCollectionDetail(null); setActiveTab('collection'); }}
          onDetailOpen={(id) => setDetailCafeId(id)}
          onPhotoMore={(storeId, photos, cafeName) => setPhotoReview({ storeId, photos, cafeName })}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {showSearch ? (
        /* ── 검색 화면 (탭바 숨김) ── */
        <SearchPage onClose={() => setShowSearch(false)} />
      ) : (
        <>
          {/* ── 화면 영역 ── */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'home'       && (
              <MapPage
                onSearchOpen={() => setShowSearch(true)}
                onDetailOpen={(id) => setDetailCafeId(id)}
                initialState={mapState ?? undefined}
                onStateChange={(s) => setMapState(s)}
              />
            )}
            {activeTab === 'guidebook'  && (
              <GuidebookPage
                onDetailOpen={(id) => setDetailCafeId(id)}
                onDetailOpenToReview={(id) => { setDetailCafeId(id); setDetailScrollToReview(true); }}
                onBack={() => setActiveTab('home')}
                onClose={() => setActiveTab('home')}
                initialView={(guidebookView as any) ?? 'main'}
                onViewChange={(v) => setGuidebookView(v)}
                initialStoreIndex={guidebookStoreIndex}
                onStoreIndexChange={(i) => setGuidebookStoreIndex(i)}
              />
            )}
            {activeTab === 'collection' && (
              <CollectionPage
                onDetailOpen={(id) => setDetailCafeId(id)}
                onCollectionOpen={(id, name) => setCollectionDetail({ id, name })}
                onGoHome={() => setActiveTab('home')}
                onBack={() => setActiveTab('home')}
                onClose={() => setActiveTab('home')}
                onPhotoMore={(storeId, photos, cafeName) => setPhotoReview({ storeId, photos, cafeName })}
              />
            )}
            {activeTab === 'mypage'     && (
              <MyPage
                onDetailOpen={(id) => setDetailCafeId(id)}
                initialSubPage={myPageSubPage as any}
                onSubPageChange={setMyPageSubPage}
              />
            )}
          </div>

          {/* ── 탭 바 ── */}
          <nav
            style={{
              display: 'flex',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 0 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

